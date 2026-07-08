import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoadmapTemplate, UserRoadmap } from './roadmap.schemas';
import { Challenge } from '../exercise/exercise.schemas';
import {
  GoogleGenerativeAI,
  SchemaType,
  FunctionDeclarationsTool,
} from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import type {
  AssessmentResult,
  CreateRoadmapArgs,
  UpdateRoadmapDto,
} from '../interfaceFile/interface';
import { Challenge, ChallengeDifficulty } from '../exercise/exercise.schemas';
import {
  AiRoadmapPlan,
  AiRoadmapService,
} from '../ai-mirror/ai-roadmap.service';

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
  assessmentId: string;
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
};

@Injectable()
export class RoadmapService {
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    @InjectModel(RoadmapTemplate.name)
    private templateModel: Model<RoadmapTemplate>,
    @InjectModel(UserRoadmap.name) private userRoadmapModel: Model<UserRoadmap>,
    @InjectModel(Challenge.name) private challengeModel: Model<Challenge>,
    private readonly configService: ConfigService,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    );
  }
    private readonly templateModel: Model<RoadmapTemplate>,

    @InjectModel(UserRoadmap.name)
    private readonly userRoadmapModel: Model<UserRoadmap>,

    @InjectModel(Challenge.name)
    private readonly challengeModel: Model<Challenge>,

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

  async generateRoadmap(userId: string, assessmentResult: AssessmentResult) {
    const tools: FunctionDeclarationsTool[] = [
      {
        functionDeclarations: [
          {
            name: 'get_available_challenges',
            description:
              'Lấy toàn bộ danh sách các bài tập lập trình (challenges) hiện có trong cơ sở dữ liệu để chọn đưa vào roadmap.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {},
            },
          },
          {
            name: 'create_custom_roadmap',
            description:
              'Tạo một lộ trình học tập (roadmap) tùy chỉnh và lưu vào hệ thống cho người dùng.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                title: {
                  type: SchemaType.STRING,
                  description:
                    'Tiêu đề của lộ trình học tập, bằng tiếng Việt (ví dụ: Lộ trình củng cố mảng và chuỗi cho Beginner).',
                },
                challengeIds: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description:
                    'Danh sách các ID của bài tập (challenges) được xếp theo thứ tự học hợp lý từ dễ đến khó.',
                },
                detectedLevel: {
                  type: SchemaType.STRING,
                  format: 'enum',
                  enum: [
                    'absolute_beginner',
                    'beginner',
                    'intermediate',
                    'advanced',
                  ],
                  description: 'Trình độ được xác định của người dùng.',
                },
                weakSkills: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description:
                    'Các kỹ năng hoặc mảng kiến thức yếu cần củng cố.',
                },
                strongSkills: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                  description:
                    'Các kỹ năng hoặc mảng kiến thức mạnh đã thành thạo.',
                },
                pacePreference: {
                  type: SchemaType.STRING,
                  format: 'enum',
                  enum: ['slow', 'medium', 'fast'],
                  description: 'Nhịp độ học tập đề xuất (ví dụ: medium).',
                },
              },
              required: [
                'title',
                'challengeIds',
                'detectedLevel',
                'weakSkills',
                'strongSkills',
                'pacePreference',
              ],
            },
          },
        ],
      },
    ];

    const systemInstruction = `You are an AI assistant (CodeQuest AI) specializing in designing personalized programming learning paths based on user assessments.
Your required workflow is as follows:
1. First, call the \`get_available_challenges\` function to retrieve a list of all challenges currently available in the database.
2. From the retrieved challenge list, select 4 to 8 of the most suitable challenges based on: the user's current skill level; the weak skills that need strengthening (prioritize challenges in this weak category); and sort the challenges in order of increasing difficulty (easy -> medium -> hard).
3. Call the \`create_custom_roadmap\` function with the corresponding parameters to create and save the new roadmap for the user.
4. Finally, provide feedback in Vietnamese, briefly and clearly explaining why you chose these exercises, highlighting strengths to be developed and how this approach helps improve weaknesses.`;

    // 1. Khởi tạo model với gemini-3.5-flash
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: systemInstruction.replace(/\n/g, ' '), // Loại bỏ xuống dòng để tránh lỗi khi gửi prompt
    });

    const chat = model.startChat({
      tools,
    });

    const userPrompt = `Hãy thiết kế lộ trình học tập cho tôi dựa trên kết quả đánh giá này:
- Điểm đánh giá: ${assessmentResult.score}/100
- Cấp độ xác định: ${assessmentResult.detectedLevel}
- Kỹ năng mạnh: ${JSON.stringify(assessmentResult.strongSkills)}
- Kỹ năng yếu: ${JSON.stringify(assessmentResult.weakSkills)}
- Chi tiết bài làm: ${JSON.stringify(assessmentResult.details || [])}

Vui lòng thực hiện việc lấy danh sách bài tập hiện có và tạo roadmap phù hợp cho tôi.`;

    let response = await chat.sendMessage(userPrompt);
    let loopCount = 0;
    let createdRoadmap: UserRoadmap | null = null;

    // Vòng lặp xử lý gọi hàm (function calling loop)
    while (loopCount < 5) {
      const functionCalls = response.response.functionCalls();
      if (!functionCalls || functionCalls.length === 0) {
        break;
      }

      const call = functionCalls[0];
      if (call.name === 'get_available_challenges') {
        const challenges = await this.challengeModel
          .find({ isActive: { $ne: false } })
          .exec();
        const challengeList = challenges.map((c) => ({
          id: c._id.toString(),
          title: c.title,
          difficulty: c.difficulty,
          slug: c.slug,
          skillSlug: c.skillSlug || [],
          challengeType: c.challengeType,
        }));

        const functionResponse = {
          functionResponse: {
            name: 'get_available_challenges',
            response: {
              challenges: challengeList,
            },
          },
        };

        response = await chat.sendMessage([functionResponse]);
      } else if (call.name === 'create_custom_roadmap') {
        const args = call.args as CreateRoadmapArgs;

        createdRoadmap = await this.saveCustomRoadmap(userId, args);

        const functionResponse = {
          functionResponse: {
            name: 'create_custom_roadmap',
            response: {
              success: true,
              roadmapId: createdRoadmap._id.toString(),
              message: 'Roadmap đã được tạo và lưu thành công.',
            },
          },
        };

        response = await chat.sendMessage([functionResponse]);
      } else {
        break;
      }

      loopCount++;
    }

    return {
      roadmap: createdRoadmap,
      explanation:
        response.response.text()?.trim() ||
        'Lộ trình học tập của bạn đã được thiết lập thành công.',
    };
  }

  private async saveCustomRoadmap(
    userId: string,
    args: CreateRoadmapArgs,
  ): Promise<UserRoadmap> {
    const userObjectId = this.toObjectId(userId, 'userId');
    const challengeIds = args.challengeIds || [];

    // Convert to ObjectIds and query challenges
    const objectIds = challengeIds
      .filter((id: string) => Types.ObjectId.isValid(id))
      .map((id: string) => new Types.ObjectId(id));

    const challenges = await this.challengeModel
      .find({ _id: { $in: objectIds } })
      .exec();

    // Sort challenges to match the order in challengeIds array
    // Dùng type predicate để loại bỏ undefined thay vì filter(Boolean)
    const sortedChallenges = challengeIds
      .map((id: string) => challenges.find((c) => c._id.toString() === id))
      .filter((c): c is (typeof challenges)[number] => c !== undefined);

    // Build the roadmap template nodes
    const nodes = sortedChallenges.map((challenge, index) => {
      const difficulty = String(challenge.difficulty || 'easy');
      const xpReward =
        difficulty === 'hard' ? 200 : difficulty === 'medium' ? 100 : 50;

      return {
        order: index + 1,
        challengeId: challenge._id,
        nodeType: 'challenge',
        challengesSnapshot: {
          title: challenge.title,
          slug: challenge.slug,
          difficulty: difficulty,
          skillSlugs: challenge.skillSlug || [],
          xpReward: xpReward,
        },
      };
    });

    // Create a new RoadmapTemplate for this specific user
    const roadmapTemplateSlug = `custom-roadmap-${userId}-${Date.now()}`;
    const newTemplate = new this.templateModel({
      title: args.title || 'Lộ trình học tập cá nhân hóa',
      slug: roadmapTemplateSlug,
      description: `Lộ trình học tập tùy chỉnh thiết kế riêng cho người dùng dựa trên điểm mạnh/yếu.`,
      targetLevel: args.detectedLevel || 'beginner',
      nodes: nodes,
      isActive: true,
    });
    const savedTemplate = await newTemplate.save();

    // Set any existing active roadmaps for this user to archived
    await this.userRoadmapModel
      .updateMany(
        { userId: userObjectId, status: 'active' },
        { status: 'archived' },
      )
      .exec();

    // Create and save UserRoadmap
    const newUserRoadmap = new this.userRoadmapModel({
      userId: userObjectId,
      templateId: savedTemplate._id,
      title: args.title || 'Lộ trình học tập cá nhân hóa',
      status: 'active',
      totalNodes: nodes.length,
      completedNodes: 0,
      generationParams: {
        detectedLevel: args.detectedLevel || 'beginner',
        weakSkills: args.weakSkills || [],
        strongSkills: args.strongSkills || [],
        pacePreference: args.pacePreference || 'medium',
      },
    });
    const savedUserRoadmap = await newUserRoadmap.save();

    // Return the populated roadmap
    const populatedRoadmap = await this.userRoadmapModel
      .findById(savedUserRoadmap._id)
      .populate('templateId')
      .exec();

    if (!populatedRoadmap) {
      throw new BadRequestException('Không thể tạo roadmap, vui lòng thử lại.');
    }

    return populatedRoadmap;
  async generateFromAssessment(
    userId: string,
    assessmentResult: AssessmentRoadmapResult,
  ) {
    const userObjectId = this.toObjectId(userId, 'userId');

    const plan = await this.aiRoadmapService.generatePlan({
      assessmentId: assessmentResult.assessmentId,
      detectedLevel: assessmentResult.detectedLevel,
      strongSkills: assessmentResult.strongSkills,
      weakSkills: assessmentResult.weakSkills,
      score: assessmentResult.score,
      details: assessmentResult.details,
    });

    const difficulties = plan.difficulties as ChallengeDifficulty[];

    const challenges = await this.challengeModel
      .find({
        isActive: true,
        skillSlug: { $in: plan.skillOrder },
        difficulty: { $in: difficulties },
      })
      .limit(plan.targetNodeCount * 5)
      .lean<LeanChallenge[]>();

    const sortedChallenges = this.sortChallengesByAiPlan(challenges, plan);
    const nodes = this.buildRoadmapNodes(sortedChallenges, plan);

    if (nodes.length === 0) {
      throw new BadRequestException(
        'Cannot generate roadmap because no matching challenges were found',
      );
    }

    const template = await this.templateModel.create({
      title: `Roadmap cá nhân hóa - ${assessmentResult.detectedLevel}`,
      slug: `personal-${userId}-${Date.now()}`,
      description: `Roadmap được tạo từ assessment ${assessmentResult.assessmentId}`,
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
        weakSkills: assessmentResult.weakSkills,
        strongSkills: assessmentResult.strongSkills,
        pacePreference: plan.pacePreference,
        skillOrder: plan.skillOrder,
        difficulties: plan.difficulties,
        reason: plan.reason,
        assessmentId: assessmentResult.assessmentId,
      },
    });
  }

  private buildRoadmapNodes(challenges: LeanChallenge[], plan: AiRoadmapPlan) {
    const usedChallengeIds = new Set<string>();
    const nodes: Array<{
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
    }> = [];

    for (const skillSlug of plan.skillOrder) {
      if (nodes.length >= plan.targetNodeCount) {
        break;
      }

      const nodeChallenges = challenges
        .filter((challenge) => {
          const challengeId = challenge._id.toString();

          return (
            !usedChallengeIds.has(challengeId) &&
            (challenge.skillSlug || []).includes(skillSlug)
          );
        })
        .slice(0, this.getExerciseCountPerNode(plan.pacePreference));

      if (nodeChallenges.length === 0) {
        continue;
      }

      nodeChallenges.forEach((challenge) => {
        usedChallengeIds.add(challenge._id.toString());
      });

      nodes.push({
        order: nodes.length + 1,
        title: `Luyện tập ${skillSlug}`,
        objective: `Củng cố kỹ năng ${skillSlug} dựa trên kết quả assessment`,
        skillSlug,
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

    return nodes;
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
