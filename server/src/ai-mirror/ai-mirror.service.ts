import {
  BadRequestException,
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
    // 1. Định nghĩa các "công cụ" (tools) mà AI có thể gọi
    const tools: FunctionDeclarationsTool[] = [
      {
        functionDeclarations: [
          {
            name: 'get_submission_details',
            description:
              'Lấy thông tin chi tiết về một bài nộp code của người dùng, bao gồm code, output, lỗi, trạng thái, v.v. để phân tích.',
            parameters: {
              type: SchemaType.OBJECT,
              properties: {
                submissionId: {
                  type: SchemaType.STRING,
                  description: 'ID của bài nộp code.',
                },
                challengeId: {
                  type: SchemaType.STRING,
                  description:
                    'ID của bài tập, dùng để lấy bài nộp gần nhất nếu không có submissionId.',
                },
              },
              required: [],
            },
          },
        ],
      },
    ];

    // 2. Khởi tạo model với system prompt và tools
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: DSA_MIRROR_SYSTEM_PROMPT,
      tools,
    });

    // 3. Bắt đầu một phiên chat
    const chat = model.startChat();

    // 4. Gửi tin nhắn của người dùng
    const userMessage = dto.message;
    const result = await chat.sendMessage(userMessage);
    let response = result.response;

    // 5. Xử lý nếu AI yêu cầu gọi hàm
    const functionCalls = response.functionCalls();
    let submission: Submission | null = null;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0]; // Chỉ xử lý function call đầu tiên cho đơn giản
      if (call.name === 'get_submission_details') {
        this.logger.log('AI requested to call get_submission_details');
        const args = call.args as {
          submissionId?: string;
          challengeId?: string;
        };
        // Thực thi hàm: lấy submission từ DB
        submission = await this.getSubmissionContext(userId, {
          submissionId: args.submissionId,
          challengeId: args.challengeId,
          // Nếu user không cung cấp ID, ta sẽ dùng ID từ DTO gốc
          ...(!args.submissionId && { submissionId: dto.submissionId }),
          ...(!args.challengeId && { challengeId: dto.challengeId }),
        });

        // Tạo một FunctionResponse Part để gửi lại cho AI
        const functionResponse: Part = {
          functionResponse: {
            name: 'get_submission_details',
            response: {
              submissionDetails: submission
                ? {
                    code: submission.code,
                    language: submission.language,
                    status: submission.status,
                    output: submission.output,
                    error: submission.error,
                    runtime: submission.runtime,
                  }
                : {
                    error:
                      'Không tìm thấy bài nộp nào. Hãy yêu cầu người dùng submit code trước.',
                  },
            },
          },
        };

        // Gửi kết quả của hàm lại cho AI
        const resultWithFunctionResponse = await chat.sendMessage([
          functionResponse,
        ]);
        response = resultWithFunctionResponse.response;
      }
    }

    // Nếu chưa có submission ở bước trên, thử lấy lại một lần nữa phòng trường hợp AI không gọi hàm
    if (!submission) {
      submission = await this.getSubmissionContext(userId, dto);
    }

    // 6. Lấy câu trả lời cuối cùng từ AI
    const reply = response.text()?.trim() || 'Mình chưa nghĩ ra câu trả lời.';

    const thinkingAnalysis = analyzeThinking(
      userMessage,
      submission
        ? `Challenge ${submission.challengeId.toString()} with submitted ${submission.language} code`
        : 'No submission context',
    );

    const executionGrade = gradeExecutionResult(submission || undefined);
    const analysis = {
      ...thinkingAnalysis,
      ...executionGrade,
    };

    const savedSession = await this.reflectionSessionModel.create({
      userId: this.toObjectId(userId, 'userId'),
      submissionId: submission?._id,
      challengeId: submission?.challengeId || dto.challengeId,
      userMessage,
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
  }
}
