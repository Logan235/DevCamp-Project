import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoadmapTemplate, UserRoadmap } from './roadmap.schemas';
import { Challenge, ChallengeDifficulty } from '../exercise/exercise.schemas';
import { TestCase } from '../test/test.schemas';
import {
  AiRoadmapPlan,
  AiRoadmapService,
} from '../ai-mirror/ai-roadmap.service';
import type { UpdateRoadmapDto } from '../interfaceFile/interface';

type AssessmentDetail = {
  questionOrder?: number;
  status?: string;
  category?: string;
  level?: string;
  input?: string;
  expected?: string;
  actual?: string;
};

type AssessmentRoadmapResult = {
  assessmentId?: string;
  score: number;
  detectedLevel: string;
  strongSkills: string[];
  weakSkills: string[];
  details?: AssessmentDetail[];
};

type LeanChallenge = {
  _id: Types.ObjectId;
  title?: string;
  slug?: string;
  difficulty?: ChallengeDifficulty;
  skillSlug?: string[];
  challengeType?: 'coding' | 'multiple_choice';
};

type RoadmapNodePayload = {
  order: number;
  title: string;
  objective: string;
  skillSlug: string;
  nodeType: 'practice';
  challengeIds: Types.ObjectId[];
  challengesSnapshot: Array<{
    challengeId: Types.ObjectId;
    title?: string;
    slug?: string;
    difficulty?: string;
    skillSlugs: string[];
    xpReward: number;
  }>;
};

@Injectable()
export class RoadmapService {
  constructor(
    @InjectModel(RoadmapTemplate.name)
    private readonly templateModel: Model<RoadmapTemplate>,

    @InjectModel(UserRoadmap.name)
    private readonly userRoadmapModel: Model<UserRoadmap>,

    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<Challenge>,

    @InjectModel(TestCase.name)
    private readonly testCaseModel: Model<TestCase>,

    private readonly aiRoadmapService: AiRoadmapService,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return new Types.ObjectId(value);
  }

  getRoadmaps(userId: string) {
    return this.userRoadmapModel
      .find({ userId: this.toObjectId(userId, 'userId') })
      .populate('templateId')
      .exec();
  }

  putRoadmaps(userId: string, updateData: UpdateRoadmapDto) {
    return this.userRoadmapModel
      .findOneAndUpdate(
        {
          userId: this.toObjectId(userId, 'userId'),
          status: 'active',
        },
        updateData,
        { new: true },
      )
      .exec();
  }

  generateRoadmap(userId: string, assessmentResult: AssessmentRoadmapResult) {
    return this.generateFromAssessment(userId, assessmentResult);
  }

  async generateFromAssessment(
    userId: string,
    assessmentResult: AssessmentRoadmapResult,
  ) {
    const userObjectId = this.toObjectId(userId, 'userId');

    const plan = await this.aiRoadmapService.generatePlan({
      assessmentId: assessmentResult.assessmentId,
      detectedLevel: assessmentResult.detectedLevel,
      strongSkills: assessmentResult.strongSkills || [],
      weakSkills: assessmentResult.weakSkills || [],
      score: assessmentResult.score,
      details: assessmentResult.details,
    });

    const challenges = await this.findCandidateChallenges(plan);

    if (challenges.length === 0) {
      throw new BadRequestException(
        'Cannot generate roadmap because no coding challenges with test cases were found',
      );
    }

    const sortedChallenges = this.sortChallengesByAiPlan(challenges, plan);
    const nodes = this.buildRoadmapNodes(sortedChallenges, plan);

    if (nodes.length === 0) {
      throw new BadRequestException(
        'Cannot generate roadmap because no matching challenges were found',
      );
    }

    const assessmentId = assessmentResult.assessmentId || 'manual';

    const template = await this.templateModel.create({
      title: `Roadmap cá nhân hóa - ${assessmentResult.detectedLevel}`,
      slug: `personal-${userId}-${Date.now()}`,
      description: `Roadmap được tạo từ assessment ${assessmentId}`,
      targetLevel: assessmentResult.detectedLevel,
      nodes,
      isActive: true,
    });

    await this.userRoadmapModel.updateMany(
      { userId: userObjectId, status: 'active' },
      { status: 'archived' },
    );

    return this.userRoadmapModel.create({
      userId: userObjectId,
      templateId: template._id,
      title: template.title,
      status: 'active',
      totalNodes: template.nodes.length,
      completedNodes: 0,
      generationParams: {
        detectedLevel: assessmentResult.detectedLevel,
        weakSkills: assessmentResult.weakSkills || [],
        strongSkills: assessmentResult.strongSkills || [],
        pacePreference: plan.pacePreference,
        skillOrder: plan.skillOrder,
        difficulties: plan.difficulties,
        reason: plan.reason,
        assessmentId,
      },
    });
  }

  private async findCandidateChallenges(
    plan: AiRoadmapPlan,
  ): Promise<LeanChallenge[]> {
    const difficulties = plan.difficulties as ChallengeDifficulty[];
    const queryLimit = Math.max(plan.targetNodeCount * 8, 24);

    let challenges = await this.challengeModel
      .find({
        isActive: { $ne: false },
        challengeType: 'coding',
        skillSlug: { $in: plan.skillOrder },
        difficulty: { $in: difficulties },
      })
      .limit(queryLimit)
      .lean<LeanChallenge[]>();

    challenges = await this.filterChallengesWithTestCases(challenges);

    if (challenges.length > 0) {
      return challenges;
    }

    challenges = await this.challengeModel
      .find({
        isActive: { $ne: false },
        challengeType: 'coding',
        difficulty: { $in: difficulties },
      })
      .limit(queryLimit)
      .lean<LeanChallenge[]>();

    challenges = await this.filterChallengesWithTestCases(challenges);

    if (challenges.length > 0) {
      return challenges;
    }

    challenges = await this.challengeModel
      .find({
        isActive: { $ne: false },
        challengeType: 'coding',
      })
      .limit(queryLimit)
      .lean<LeanChallenge[]>();

    return this.filterChallengesWithTestCases(challenges);
  }

  private async filterChallengesWithTestCases(
    challenges: LeanChallenge[],
  ): Promise<LeanChallenge[]> {
    if (challenges.length === 0) {
      return [];
    }

    const challengeIds = challenges.map((challenge) => challenge._id);

    const testCases = await this.testCaseModel
      .find({
        challengeId: { $in: challengeIds },
        isActive: { $ne: false },
      })
      .select('challengeId')
      .lean();

    const challengeIdsWithTestCases = new Set(
      testCases.map((testCase: any) => testCase.challengeId.toString()),
    );

    return challenges.filter((challenge) =>
      challengeIdsWithTestCases.has(challenge._id.toString()),
    );
  }

  private buildRoadmapNodes(
    challenges: LeanChallenge[],
    plan: AiRoadmapPlan,
  ): RoadmapNodePayload[] {
    const exerciseCountPerNode = this.getExerciseCountPerNode(
      plan.pacePreference,
    );
    const usedChallengeIds = new Set<string>();
    const nodes: RoadmapNodePayload[] = [];

    const pushNode = (
      objectivePrefix: string,
      skillSlug: string,
      nodeChallenges: LeanChallenge[],
    ) => {
      const uniqueChallenges = nodeChallenges.filter((challenge) => {
        const challengeId = challenge._id.toString();

        if (usedChallengeIds.has(challengeId)) {
          return false;
        }

        usedChallengeIds.add(challengeId);
        return true;
      });

      if (uniqueChallenges.length === 0) {
        return;
      }

      const firstChallenge = uniqueChallenges[0];
      const primarySkill =
        skillSlug || firstChallenge?.skillSlug?.[0] || 'general';
      const difficultyLabel = firstChallenge?.difficulty || 'mixed';
      const firstChallengeTitle = firstChallenge?.title || 'bài luyện tập';
      const nodeNumber = nodes.length + 1;
      const skillDisplayName = this.getSkillDisplayName(primarySkill);
      const difficultyDisplayName =
        this.getDifficultyDisplayName(difficultyLabel);

      nodes.push({
        order: nodeNumber,
        title: `${nodeNumber}. ${skillDisplayName} - ${difficultyDisplayName}`,
        objective:
          uniqueChallenges.length > 1
            ? `${objectivePrefix}. Node này gồm ${uniqueChallenges.length} bài, bắt đầu với "${firstChallengeTitle}".`
            : `${objectivePrefix}. Bắt đầu với bài "${firstChallengeTitle}".`,
        skillSlug: primarySkill,
        nodeType: 'practice',
        challengeIds: uniqueChallenges.map((challenge) => challenge._id),
        challengesSnapshot: uniqueChallenges.map((challenge) => ({
          challengeId: challenge._id,
          title: challenge.title,
          slug: challenge.slug,
          difficulty: challenge.difficulty,
          skillSlugs: challenge.skillSlug || [],
          xpReward: this.getXpReward(challenge.difficulty),
        })),
      });
    };

    for (const skillSlug of plan.skillOrder) {
      if (nodes.length >= plan.targetNodeCount) {
        break;
      }

      const skillChallenges = challenges.filter((challenge) =>
        (challenge.skillSlug || []).includes(skillSlug),
      );

      for (
        let index = 0;
        index < skillChallenges.length && nodes.length < plan.targetNodeCount;
        index += exerciseCountPerNode
      ) {
        const nodeChallenges = skillChallenges.slice(
          index,
          index + exerciseCountPerNode,
        );

        pushNode(
          `Củng cố kỹ năng ${this.getSkillDisplayName(skillSlug)} dựa trên kết quả assessment`,
          skillSlug,
          nodeChallenges,
        );
      }
    }

    if (nodes.length < plan.targetNodeCount) {
      const remainingChallenges = challenges.filter(
        (challenge) => !usedChallengeIds.has(challenge._id.toString()),
      );

      for (
        let index = 0;
        index < remainingChallenges.length &&
        nodes.length < plan.targetNodeCount;
        index += exerciseCountPerNode
      ) {
        const nodeChallenges = remainingChallenges.slice(
          index,
          index + exerciseCountPerNode,
        );

        const firstSkill =
          nodeChallenges[0]?.skillSlug?.[0] || plan.skillOrder[0] || 'general';

        pushNode(
          'Luyện tập bổ sung để củng cố kiến thức phù hợp với kết quả assessment',
          firstSkill,
          nodeChallenges,
        );
      }
    }

    return nodes.slice(0, plan.targetNodeCount);
  }

  private sortChallengesByAiPlan(
    challenges: LeanChallenge[],
    plan: AiRoadmapPlan,
  ): LeanChallenge[] {
    const skillRank = new Map(
      plan.skillOrder.map((skill, index) => [skill, index]),
    );

    const difficultyRank = new Map<ChallengeDifficulty, number>(
      (plan.difficulties as ChallengeDifficulty[]).map((difficulty, index) => [
        difficulty,
        index,
      ]),
    );

    return [...challenges].sort((left, right) => {
      const leftSkillRank = this.getBestSkillRank(
        left.skillSlug || [],
        skillRank,
      );
      const rightSkillRank = this.getBestSkillRank(
        right.skillSlug || [],
        skillRank,
      );

      if (leftSkillRank !== rightSkillRank) {
        return leftSkillRank - rightSkillRank;
      }

      const leftDifficultyRank = left.difficulty
        ? (difficultyRank.get(left.difficulty) ?? Number.MAX_SAFE_INTEGER)
        : Number.MAX_SAFE_INTEGER;

      const rightDifficultyRank = right.difficulty
        ? (difficultyRank.get(right.difficulty) ?? Number.MAX_SAFE_INTEGER)
        : Number.MAX_SAFE_INTEGER;

      return leftDifficultyRank - rightDifficultyRank;
    });
  }

  private getBestSkillRank(
    skillSlugs: string[],
    skillRank: Map<string, number>,
  ): number {
    return skillSlugs.reduce((bestRank, skill) => {
      const rank = skillRank.get(skill);

      if (rank === undefined) {
        return bestRank;
      }

      return Math.min(bestRank, rank);
    }, Number.MAX_SAFE_INTEGER);
  }

  private getExerciseCountPerNode(
    pacePreference: 'slow' | 'medium' | 'fast',
  ): number {
    if (pacePreference === 'fast') {
      return 2;
    }

    if (pacePreference === 'slow') {
      return 4;
    }

    return 3;
  }

  private getSkillDisplayName(skillSlug?: string): string {
    if (!skillSlug) {
      return 'Nền tảng';
    }

    const skillMap: Record<string, string> = {
      array: 'Mảng',
      arrays: 'Mảng',
      string: 'Chuỗi',
      strings: 'Chuỗi',
      loop: 'Vòng lặp',
      loops: 'Vòng lặp',
      function: 'Hàm',
      functions: 'Hàm',
      recursion: 'Đệ quy',
      sorting: 'Sắp xếp',
      search: 'Tìm kiếm',
      binary_search: 'Tìm kiếm nhị phân',
      binarySearch: 'Tìm kiếm nhị phân',
      math: 'Toán học',
      implementation: 'Cài đặt thuật toán',
      general: 'Nền tảng',
    };

    return (
      skillMap[skillSlug] ||
      skillSlug
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    );
  }

  private getDifficultyDisplayName(difficulty?: string): string {
    if (difficulty === 'easy') {
      return 'Dễ';
    }

    if (difficulty === 'medium') {
      return 'Trung bình';
    }

    if (difficulty === 'hard') {
      return 'Khó';
    }

    return 'Tổng hợp';
  }

  private getXpReward(difficulty?: string): number {
    if (difficulty === 'hard') {
      return 200;
    }

    if (difficulty === 'medium') {
      return 150;
    }

    return 100;
  }
}
