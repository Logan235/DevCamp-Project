import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  TestCase,
  TestSubmission,
  Assessment,
  AssessmentSubmission,
} from './test.schemas';
import { RoadmapService } from '../roadmap/roadmap.service';

@Injectable()
export class TestService {
  constructor(
    @InjectModel(TestCase.name)
    private readonly testCaseModel: Model<TestCase>,

    @InjectModel(TestSubmission.name)
    private readonly testSubmissionModel: Model<TestSubmission>,

    @InjectModel(Assessment.name)
    private readonly assessmentModel: Model<Assessment>,

    @InjectModel(AssessmentSubmission.name)
    private readonly assessmentSubmissionModel: Model<AssessmentSubmission>,

    private readonly roadmapService: RoadmapService,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return new Types.ObjectId(value);
  }

  async getQuestions(assessmentId?: string) {
    let assessment;

    if (assessmentId && Types.ObjectId.isValid(assessmentId)) {
      assessment = await this.assessmentModel.findById(assessmentId).lean();
    } else {
      assessment = await this.assessmentModel
        .findOne({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return {
      assessmentId: assessment._id,
      title: assessment.title,
      totalQuestions: assessment.questions?.length || 0,
      questions: assessment.questions || [],
    };
  }

  private normalizeAssessmentAnswer(value?: string): string {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  private isAssessmentAnswerCorrect(
    question: any,
    userAnswer: string,
  ): boolean {
    const normalizedUserAnswer = this.normalizeAssessmentAnswer(userAnswer);
    const normalizedExpectedAnswer = this.normalizeAssessmentAnswer(
      question.answer,
    );

    if (!normalizedUserAnswer || !normalizedExpectedAnswer) {
      return false;
    }

    if (normalizedUserAnswer === normalizedExpectedAnswer) {
      return true;
    }

    const selectedOption = Array.isArray(question.options)
      ? question.options.find(
          (option: any) =>
            this.normalizeAssessmentAnswer(option.id) === normalizedUserAnswer,
        )
      : null;

    if (!selectedOption) {
      return false;
    }

    const normalizedSelectedText = this.normalizeAssessmentAnswer(
      selectedOption.text,
    );

    return normalizedSelectedText === normalizedExpectedAnswer;
  }

  private getDetectedLevel(scorePercentage: number): string {
    if (scorePercentage >= 80) {
      return 'advanced';
    }

    if (scorePercentage >= 50) {
      return 'intermediate';
    }

    return 'beginner';
  }

  private getUniqueSkills(values: Array<string | undefined>): string[] {
    return Array.from(
      new Set(
        values
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    );
  }

  private async getExistingUserRoadmap(userId: string) {
    const roadmaps = await this.roadmapService.getRoadmaps(userId);

    return (
      roadmaps.find((roadmap: any) => roadmap.status === 'active') ||
      roadmaps.find((roadmap: any) => roadmap.status === 'completed') ||
      null
    );
  }

  async postSubmissions(body: {
    assessmentId?: string;
    challengeId?: string;
    userId?: string;
    userCodeOutput: string[];
    forceRegenerateRoadmap?: boolean;
  }) {
    const assessmentId = body.assessmentId || body.challengeId;
    const { userId, userCodeOutput, forceRegenerateRoadmap } = body;

    if (!userCodeOutput || !Array.isArray(userCodeOutput)) {
      throw new BadRequestException(
        'Invalid request body. Required: { userCodeOutput: string[] }',
      );
    }

    let assessment;

    if (assessmentId && Types.ObjectId.isValid(assessmentId)) {
      assessment = await this.assessmentModel.findById(assessmentId).lean();
    } else {
      assessment = await this.assessmentModel
        .findOne({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();
    }

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const questions = assessment.questions || [];

    let passedCount = 0;
    let scoreableQuestionsCount = 0;

    const details = questions.map((question: any, index: number) => {
      const userAnswer = userCodeOutput[index]?.trim() || '';
      const expectedAnswer = question.answer?.trim() || '';

      let isCorrect = false;
      let status = 'Failed';

      if (question.type === 'essay') {
        isCorrect = true;
        status = 'Submitted';
      } else {
        isCorrect = this.isAssessmentAnswerCorrect(question, userAnswer);
        status = isCorrect ? 'Passed' : 'Failed';
        scoreableQuestionsCount += 1;

        if (isCorrect) {
          passedCount += 1;
        }
      }

      return {
        questionOrder: question.order || index + 1,
        type: question.type,
        status,
        input: question.title,
        expected: expectedAnswer,
        actual: userAnswer,
        category: question.category,
        level: question.level,
      };
    });

    const totalToDivide =
      scoreableQuestionsCount > 0 ? scoreableQuestionsCount : questions.length;

    const scorePercentage =
      totalToDivide > 0 ? Math.round((passedCount / totalToDivide) * 100) : 0;

    const uniqueWeakSkills = this.getUniqueSkills(
      details
        .filter((item) => item.status === 'Failed')
        .map((item) => item.category),
    );

    const uniqueStrongSkills = this.getUniqueSkills(
      details
        .filter((item) => item.status === 'Passed')
        .map((item) => item.category),
    );

    const detectedLevel = this.getDetectedLevel(scorePercentage);

    const assessmentSubmission = await this.assessmentSubmissionModel.create({
      userId: userId ? this.toObjectId(userId, 'userId') : undefined,
      assessmentId: assessment._id,
      userAnswers: userCodeOutput,
      score: scorePercentage,
      detectedLevel,
      strongSkills: uniqueStrongSkills,
      weakSkills: uniqueWeakSkills,
      status: 'Completed',
    });

    const assessmentResult = {
      assessmentId: assessment._id.toString(),
      assessmentSubmissionId: assessmentSubmission._id.toString(),
      status: scorePercentage === 100 ? 'Accepted' : 'Completed',
      score: scorePercentage,
      detectedLevel,
      strongSkills: uniqueStrongSkills,
      weakSkills: uniqueWeakSkills,
      passed: `${passedCount}/${questions.length}`,
      details,
    };

    let roadmap: Awaited<
      ReturnType<RoadmapService['generateFromAssessment']>
    > | null = null;

    if (userId) {
      try {
        const existingRoadmap = forceRegenerateRoadmap
          ? null
          : await this.getExistingUserRoadmap(userId);

        roadmap =
          existingRoadmap ||
          (await this.roadmapService.generateFromAssessment(
            userId,
            assessmentResult,
          ));
      } catch (error) {
        console.warn(
          'Failed to get or generate roadmap from assessment:',
          error,
        );
      }
    }

    return {
      ...assessmentResult,
      roadmap,
      hasExistingRoadmap: roadmap !== null && !forceRegenerateRoadmap,
    };
  }

  async getResults(challengeId: string) {
    if (!Types.ObjectId.isValid(challengeId)) {
      throw new BadRequestException('Invalid challengeId format');
    }

    const summary = await this.testCaseModel.aggregate([
      {
        $match: {
          challengeId: new Types.ObjectId(challengeId),
          isActive: true,
        },
      },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    return {
      challengeId,
      message: 'Test case summary by type for the given challengeId',
      summary,
    };
  }
}
