import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GoogleGenAI } from '@google/genai';
import { Submission } from '../code-execution/schema/submission.schema';
import { AiMirrorChatDto } from './dto/ai-mirror-chat.dto';
import { ReflectionSession } from './schema/reflection-session.schema';
import { DSA_MIRROR_SYSTEM_PROMPT } from './prompts/dsa-mirror.prompt';
import { analyzeThinking } from './tools/thinking-tools';

@Injectable()
export class AiMirrorService {
  private readonly ai: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    @InjectModel(ReflectionSession.name)
    private readonly reflectionSessionModel: Model<ReflectionSession>,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.getOrThrow<string>('GEMINI_API_KEY'),
    });
  }

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return new Types.ObjectId(value);
  }

  private async getSubmissionContext(
    userId: string,
    dto: AiMirrorChatDto,
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

  private buildPrompt(message: string, submission: Submission | null): string {
    if (!submission) {
      return `
User question:
${message}

No submitted code is available yet. Ask the user to explain their approach or submit code first.
`;
    }

    const code = submission.code?.slice(0, 12000) || '';

    return `
User question:
${message}

Submitted code:
${code}

Language:
${submission.language || 'unknown'}

Input:
${submission.input || ''}

Output:
${submission.output || ''}

Error:
${submission.error || ''}

Status:
${submission.status || ''}

Status code:
${submission.statusCode ?? ''}

Runtime:
${submission.runtime ?? ''} ms
`;
  }

  async chat(userId: string, dto: AiMirrorChatDto) {
    const submission = await this.getSubmissionContext(userId, dto);
    const prompt = this.buildPrompt(dto.message, submission);

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: DSA_MIRROR_SYSTEM_PROMPT,
        temperature: 0.3,
      },
    });

    const reply = response.text?.trim() || 'I could not generate a response.';

    const thinkingAnalysis = analyzeThinking(
      dto.message,
      submission
        ? `Challenge ${submission.challengeId.toString()} with submitted ${submission.language} code`
        : 'No submission context',
    );

    const savedSession = await this.reflectionSessionModel.create({
      userId: this.toObjectId(userId, 'userId'),
      submissionId: submission?._id,
      challengeId: submission?.challengeId || dto.challengeId,
      userMessage: dto.message,
      aiReply: reply,
      thinkingScore: thinkingAnalysis.thinkingScore,
      strengths: thinkingAnalysis.strengths,
      weaknesses: thinkingAnalysis.weaknesses,
      followUpQuestions: thinkingAnalysis.followUpQuestions,
    });

    return {
      reply,
      analysis: thinkingAnalysis,
      sourceSubmissionId: submission?._id,
      reflectionSessionId: savedSession._id,
    };
  }
}
