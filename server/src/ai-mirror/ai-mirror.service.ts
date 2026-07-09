import {
  BadRequestException,
  BadGatewayException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { FunctionDeclarationsTool, Part } from '@google/generative-ai';
import { Model, Types } from 'mongoose';
import { Submission } from '../code-execution/schema/submission.schema';
import { AiMirrorChatDto } from './dto/ai-mirror-chat.dto';
import { ReflectionSession } from './schema/reflection-session.schema';
import { DSA_MIRROR_SYSTEM_PROMPT } from './prompts/dsa-mirror.prompt';
import { analyzeThinking, gradeExecutionResult } from './tools/thinking-tools';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
@Injectable()
export class AiMirrorService {
  private readonly genAI: GoogleGenerativeAI;
  private readonly logger = new Logger(AiMirrorService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    @InjectModel(ReflectionSession.name)
    private readonly reflectionSessionModel: Model<ReflectionSession>,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    );
  }

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return new Types.ObjectId(value);
  }

  private async getSubmissionContext(
    userId: string,
    dto: Partial<AiMirrorChatDto>,
  ): Promise<Submission | null> {
    const userObjectId = this.toObjectId(userId, 'userId');

    if (dto.submissionId) {
      const submission = await this.submissionModel.findOne({
        _id: this.toObjectId(dto.submissionId, 'submissionId'),
        userId: userObjectId,
      });

      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      return submission;
    }

    if (dto.challengeId && dto.includeLatestSubmission !== false) {
      return this.submissionModel
        .findOne({
          userId: userObjectId,
          challengeId: this.toObjectId(dto.challengeId, 'challengeId'),
        })
        .sort({ createdAt: -1 });
    }

    return null;
  }

  // Main method to handle the chat with AI, including function calls and analysis
  async chat(userId: string, dto: AiMirrorChatDto) {
    try {
      const submission = await this.getSubmissionContext(userId, dto);

      // 2. Khởi tạo model với system prompt và tools
      const modelName =
        this.configService.get<string>('GEMINI_MODEL') || 'gemini-flash-latest';

      const model = this.genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: DSA_MIRROR_SYSTEM_PROMPT,
      });

      const submissionContext = submission
        ? `
Submission context:
- Language: ${submission.language}
- Status: ${submission.status}
- Runtime: ${submission.runtime ?? 'N/A'}
- Output: ${submission.output ?? 'N/A'}
- Error: ${submission.error ?? 'N/A'}
- Code:
${submission.code}
`
        : `
No submission context is available yet.
Guide the user based on their question, but ask them to submit code if code-level analysis is needed.
`;

      const result = await model.generateContent(`
User question:
${dto.message}

${submissionContext}
`);

      const reply =
        result.response.text()?.trim() || 'Mình chưa nghĩ ra câu trả lời.';

      const thinkingAnalysis = analyzeThinking(
        dto.message,
        submission
          ? `Challenge ${submission.challengeId.toString()} with submitted ${submission.language} code`
          : 'No submission context',
      );

      const executionGrade = gradeExecutionResult(submission || undefined);
      const analysis = {
        ...thinkingAnalysis,
        ...executionGrade,
      };

      const fallbackChallengeId = dto.challengeId
        ? this.toObjectId(dto.challengeId, 'challengeId')
        : undefined;

      const savedSession = await this.reflectionSessionModel.create({
        userId: this.toObjectId(userId, 'userId'),
        submissionId: submission?._id,
        challengeId: submission?.challengeId || fallbackChallengeId,
        userMessage: dto.message,
        aiReply: reply,
        thinkingScore: thinkingAnalysis.thinkingScore,
        strengths: thinkingAnalysis.strengths,
        weaknesses: thinkingAnalysis.weaknesses,
        followUpQuestions: thinkingAnalysis.followUpQuestions,
      });

      return {
        reply,
        analysis,
        sourceSubmissionId: submission?._id,
        reflectionSessionId: savedSession._id,
      };
    } catch (error) {
      this.logger.error('AI Mirror chat failed', error);

      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Unknown AI error';
      throw new BadGatewayException(`AI Mirror request failed: ${message}`);
    }
  }
}
