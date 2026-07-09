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
import { Submission } from '../code-execution/schema/submission.schema';

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
  patternGroup?: string;
  challengeType?: 'coding' | 'multiple_choice';
};

type RoadmapNodePayload = {
  order: number;
  title: string;
  objective: string;
  skillSlug: string;
  patternGroup: string;
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

    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
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
      .sort({ updatedAt: -1, createdAt: -1 })
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

  async completeChallenge(
    userId: string,
    challengeId: string,
    submissionIds?: string[],
  ) {
    const userObjectId = this.toObjectId(userId, 'userId');
    const challengeObjectId = this.toObjectId(challengeId, 'challengeId');

    const activeTestCaseCount = await this.testCaseModel.countDocuments({
      challengeId: challengeObjectId,
      isActive: { $ne: false },
    });

    const submissionObjectIds = (submissionIds || []).map((submissionId) =>
      this.toObjectId(submissionId, 'submissionId'),
    );

    const successfulSubmissionCount = submissionObjectIds.length
      ? await this.submissionModel.countDocuments({
          _id: { $in: submissionObjectIds },
          userId: userObjectId,
          challengeId: challengeObjectId,
          status: 'success',
        })
      : await this.submissionModel.countDocuments({
          userId: userObjectId,
          challengeId: challengeObjectId,
          status: 'success',
        });

    if (
      activeTestCaseCount === 0 ||
      (submissionObjectIds.length > 0 &&
        submissionObjectIds.length !== activeTestCaseCount) ||
      successfulSubmissionCount < activeTestCaseCount
    ) {
      throw new BadRequestException(
        'Challenge is not fully passed yet. Submit code and pass all active test cases first.',
      );
    }

    const roadmap = await this.userRoadmapModel
      .findOne({ userId: userObjectId, status: 'active' })
      .populate('templateId')
      .exec();

    if (!roadmap) {
      throw new BadRequestException('Active roadmap not found');
    }

    const template = roadmap.templateId as any;
    const nodes = [...(template.nodes || [])].sort(
      (left, right) => (left.order || 0) - (right.order || 0),
    );

    const nodeIndex = nodes.findIndex((node) =>
      (node.challengeIds || []).some((id) => id.equals(challengeObjectId)),
    );

    if (nodeIndex === -1) {
      throw new BadRequestException(
        'Challenge is not part of the active roadmap',
      );
    }

    const completedChallengeIds = new Set(
      (roadmap.completedChallengeIds || []).map((id) => id.toString()),
    );

    completedChallengeIds.add(challengeObjectId.toString());

    let completedNodes = 0;

    for (const node of nodes) {
      const nodeChallengeIds = (node.challengeIds || []).map((id) =>
        id.toString(),
      );

      if (
        nodeChallengeIds.length > 0 &&
        nodeChallengeIds.every((id) => completedChallengeIds.has(id))
      ) {
        completedNodes += 1;
        continue;
      }

      break;
    }

    const currentNode = nodes[nodeIndex];
    const currentNodeChallengeIds = (currentNode.challengeIds || []).map((id) =>
      id.toString(),
    );

    const nextChallengeInNodeId = currentNodeChallengeIds.find(
      (id) => !completedChallengeIds.has(id),
    );

    const nextNode = nodes[completedNodes];
    const nextNodeChallengeId = nextNode?.challengeIds?.[0]?.toString();

    const totalNodes = roadmap.totalNodes || nodes.length;
    const status = completedNodes >= totalNodes ? 'completed' : roadmap.status;

    roadmap.completedChallengeIds = Array.from(completedChallengeIds).map(
      (id) => new Types.ObjectId(id),
    );
    roadmap.completedNodes = completedNodes;
    roadmap.totalNodes = totalNodes;
    roadmap.status = status;

    await roadmap.save();

    return {
      roadmapId: roadmap._id,
      completedChallengeId: challengeObjectId,
      completedChallengeIds: roadmap.completedChallengeIds,
      completedNodes,
      totalNodes,
      isRoadmapCompleted: status === 'completed',
      currentNode: {
        order: currentNode.order,
        title: currentNode.title,
        isCompleted: currentNodeChallengeIds.every((id) =>
          completedChallengeIds.has(id),
        ),
      },
      nextChallengeInNodeId,
      nextNodeChallengeId,
    };
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
    const maxExercisesPerNode = this.getExerciseCountPerNode(
      plan.pacePreference,
    );
    const usedChallengeIds = new Set<string>();
    const nodes: RoadmapNodePayload[] = [];

    const groupedChallenges = this.groupChallengesByPattern(challenges, plan);

    for (const group of groupedChallenges) {
      if (nodes.length >= plan.targetNodeCount) {
        break;
      }

      const nodeChallenges = group.challenges
        .filter((challenge) => {
          const challengeId = challenge._id.toString();

          if (usedChallengeIds.has(challengeId)) {
            return false;
          }

          usedChallengeIds.add(challengeId);
          return true;
        })
        .slice(0, maxExercisesPerNode);

      if (nodeChallenges.length === 0) {
        continue;
      }

      const firstChallenge = nodeChallenges[0];
      const primarySkill =
        group.skillSlug || firstChallenge.skillSlug?.[0] || 'general';
      const nodeNumber = nodes.length + 1;

      nodes.push({
        order: nodeNumber,
        title: `${nodeNumber}. ${this.getPatternDisplayName(group.patternGroup)}`,
        objective: this.buildNodeObjective(
          group.patternGroup,
          primarySkill,
          nodeChallenges,
        ),
        skillSlug: primarySkill,
        patternGroup: group.patternGroup,
        nodeType: 'practice',
        challengeIds: nodeChallenges.map((challenge) => challenge._id),
        challengesSnapshot: nodeChallenges.map((challenge) => ({
          challengeId: challenge._id,
          title: challenge.title,
          slug: challenge.slug,
          difficulty: challenge.difficulty,
          skillSlugs: challenge.skillSlug || [],
          xpReward: this.getXpReward(challenge.difficulty),
        })),
      });
    }

    return nodes.slice(0, plan.targetNodeCount);
  }

  private groupChallengesByPattern(
    challenges: LeanChallenge[],
    plan: AiRoadmapPlan,
  ): Array<{
    patternGroup: string;
    skillSlug: string;
    challenges: LeanChallenge[];
  }> {
    const skillRank = new Map(
      plan.skillOrder.map((skill, index) => [skill, index]),
    );

    const difficultyRank = new Map<ChallengeDifficulty, number>(
      (plan.difficulties as ChallengeDifficulty[]).map((difficulty, index) => [
        difficulty,
        index,
      ]),
    );

    const groups = new Map<
      string,
      {
        patternGroup: string;
        skillSlug: string;
        challenges: LeanChallenge[];
        bestSkillRank: number;
        bestDifficultyRank: number;
      }
    >();

    for (const challenge of challenges) {
      const skillSlug = this.getBestChallengeSkill(challenge, skillRank);
      const patternGroup =
        challenge.patternGroup ||
        skillSlug ||
        challenge.skillSlug?.[0] ||
        'general';

      const groupKey = skillSlug || challenge.skillSlug?.[0] || 'general';

      const challengeSkillRank = this.getBestSkillRank(
        challenge.skillSlug || [],
        skillRank,
      );

      const challengeDifficultyRank = challenge.difficulty
        ? (difficultyRank.get(challenge.difficulty) ?? Number.MAX_SAFE_INTEGER)
        : Number.MAX_SAFE_INTEGER;

      const existingGroup = groups.get(groupKey);

      if (!existingGroup) {
        groups.set(groupKey, {
          patternGroup,
          skillSlug: skillSlug || challenge.skillSlug?.[0] || 'general',
          challenges: [challenge],
          bestSkillRank: challengeSkillRank,
          bestDifficultyRank: challengeDifficultyRank,
        });

        continue;
      }

      existingGroup.challenges.push(challenge);
      existingGroup.bestSkillRank = Math.min(
        existingGroup.bestSkillRank,
        challengeSkillRank,
      );
      existingGroup.bestDifficultyRank = Math.min(
        existingGroup.bestDifficultyRank,
        challengeDifficultyRank,
      );
    }

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        challenges: this.sortChallengesByAiPlan(group.challenges, plan),
      }))
      .sort((left, right) => {
        if (left.bestSkillRank !== right.bestSkillRank) {
          return left.bestSkillRank - right.bestSkillRank;
        }

        return left.bestDifficultyRank - right.bestDifficultyRank;
      });
  }

  private getBestChallengeSkill(
    challenge: LeanChallenge,
    skillRank: Map<string, number>,
  ): string {
    const skillSlugs = challenge.skillSlug || [];

    if (skillSlugs.length === 0) {
      return '';
    }

    return skillSlugs.reduce((bestSkill, skill) => {
      const currentRank = skillRank.get(skill) ?? Number.MAX_SAFE_INTEGER;
      const bestRank = skillRank.get(bestSkill) ?? Number.MAX_SAFE_INTEGER;

      return currentRank < bestRank ? skill : bestSkill;
    }, skillSlugs[0]);
  }

  private getPatternDisplayName(patternGroup?: string): string {
    if (!patternGroup) {
      return 'Luyện tập nền tảng';
    }

    const patternMap: Record<string, string> = {
      two_pointers: 'Two Pointers',
      'two-pointers': 'Two Pointers',
      sliding_window: 'Sliding Window',
      'sliding-window': 'Sliding Window',
      binary_search: 'Binary Search',
      'binary-search': 'Binary Search',
      prefix_sum: 'Prefix Sum',
      'prefix-sum': 'Prefix Sum',
      recursion: 'Đệ quy',
      sorting: 'Sắp xếp',
      hash_map: 'Hash Map',
      'hash-map': 'Hash Map',
      stack: 'Stack',
      queue: 'Queue',
      graph: 'Graph',
      dynamic_programming: 'Dynamic Programming',
      'dynamic-programming': 'Dynamic Programming',
      general: 'Luyện tập nền tảng',
    };

    return (
      patternMap[patternGroup] ||
      patternGroup
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    );
  }

  private buildNodeObjective(
    patternGroup: string,
    skillSlug: string,
    challenges: LeanChallenge[],
  ): string {
    const patternName = this.getPatternDisplayName(patternGroup);
    const skillName = this.getSkillDisplayName(skillSlug);
    const firstChallengeTitle =
      challenges[0]?.title || 'bài luyện tập đầu tiên';

    if (challenges.length === 1) {
      return `Củng cố ${skillName} thông qua chủ đề ${patternName}, bắt đầu với bài "${firstChallengeTitle}".`;
    }

    return `Củng cố ${skillName} thông qua chủ đề ${patternName} với ${challenges.length} bài luyện tập, bắt đầu với "${firstChallengeTitle}".`;
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
      return 3;
    }

    if (pacePreference === 'slow') {
      return 5;
    }

    return 4;
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
