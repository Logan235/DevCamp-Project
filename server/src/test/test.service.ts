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
    @InjectModel(TestCase.name) private readonly testCaseModel: Model<TestCase>,

    @InjectModel(TestSubmission.name)
    private readonly testSubmissionModel: Model<TestSubmission>,

    @InjectModel(Assessment.name)
    private readonly assessmentModel: Model<Assessment>,

    @InjectModel(AssessmentSubmission.name)
    private readonly assessmentSubmissionModel: Model<AssessmentSubmission>,

    private readonly roadmapService: RoadmapService,
  ) {}

  // Return list of questions for a given challengeId, only including those that are active and of displayable types (sample, multiple-choice, essay)
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

  // Process user submissions for a given challengeId, compare with expected outputs, calculate score, and save the submission record
  async postSubmissions(body: {
    assessmentId?: string;
    challengeId?: string;
    userId?: string;
    userCodeOutput: string[];
  }) {
    const assessmentId = body.assessmentId || body.challengeId;
    const { userId, userCodeOutput } = body;

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
        isCorrect = userAnswer === expectedAnswer;
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

    const weakSkills: string[] = details
      .filter(
        (item) => item.status === 'Failed' && typeof item.category === 'string',
      )
      .map((item) => item.category as string);

    const strongSkills: string[] = details
      .filter(
        (item) => item.status === 'Passed' && typeof item.category === 'string',
      )
      .map((item) => item.category as string);

    const uniqueStrongSkills: string[] = [...new Set<string>(strongSkills)];
    const uniqueWeakSkills: string[] = [...new Set<string>(weakSkills)];

    const detectedLevel =
      scorePercentage >= 80
        ? 'advanced'
        : scorePercentage >= 50
          ? 'intermediate'
          : 'beginner';

    await this.assessmentSubmissionModel.create({
      userId: userId ? new Types.ObjectId(userId) : undefined,
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
      status: scorePercentage === 100 ? 'Accepted' : 'Completed',
      score: scorePercentage,
      detectedLevel,
      strongSkills: uniqueStrongSkills,
      weakSkills: uniqueWeakSkills,
      passed: `${passedCount}/${questions.length}`,
      details,
    };

    const roadmap = userId
      ? await this.roadmapService.generateFromAssessment(
          userId,
          assessmentResult,
        )
      : null;

    return {
      assessment: assessmentResult,
      roadmap,
    };
  }

  // Return summary of test cases for a given challengeId, grouped by type (sample, hidden, stress, generated, multiple-choice, essay) and count of each type
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
