import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Submission } from './schema/submission.schema';
import { ExecuteCodeDto } from './dto/execute-code.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CodeExecutionService {
  constructor(
    @InjectModel(Submission.name)
    private submissionModel: Model<Submission>,

    @InjectQueue('code-execution')
    private codeExecutionQueue: Queue,
  ) {}

  private toObjectId(value: string, fieldName: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`${fieldName} is invalid`);
    }

    return new Types.ObjectId(value);
  }

  /**
   * Execute code asynchronously via Job Queue
   */
  async executeCode(
    userId: string,
    executeCodeDto: ExecuteCodeDto,
  ): Promise<Submission> {
    const {
      code,
      input,
      expectedOutput, // add expectedOutput to job payload
      challengeId,
      language = 'cpp',
      timeout = 5,
    } = executeCodeDto;

    // Create submission record with pending status
    const submission = new this.submissionModel({
      userId: this.toObjectId(userId, 'userId'),
      challengeId: this.toObjectId(challengeId, 'challengeId'),
      code,
      input,
      language,
      status: 'pending',
    });
    await submission.save();

    try {
      // Add job to the queue
      const job = await this.codeExecutionQueue.add('execute', {
        submissionId: submission._id.toString(),
        code,
        input,
        expectedOutput,
        language,
        timeout,
      });

      this.logger.log(
        `[CodeExecution] Queued job ${job.id} for submission ${submission._id.toString()}`,
      );

      return submission;
    } catch {
      submission.status = 'error';
      submission.error = 'Failed to queue execution job';
      await submission.save();

      throw new HttpException(
        'Failed to process code execution request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private readonly logger = new Logger(CodeExecutionService.name);

  /**
   * Get user submissions for a challenge
   */
  async getSubmissions(
    userId: string,
    challengeId?: string,
    limit: number = 10,
    skip: number = 0,
  ): Promise<Submission[]> {
    const query: Record<string, Types.ObjectId> = {
      userId: this.toObjectId(userId, 'userId'),
    };
    if (challengeId) {
      query.challengeId = this.toObjectId(challengeId, 'challengeId');
    }

    return this.submissionModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  /**
   * Get single submission
   */
  async getSubmissionDetail(
    userId: string,
    submissionId: string,
  ): Promise<Submission> {
    // First, find if the submission exists at all
    const submission = await this.submissionModel.findOne({
      _id: this.toObjectId(submissionId, 'submissionId'),
      userId: this.toObjectId(userId, 'userId'),
    });

    // If it doesn't exist, throw 404
    if (!submission) {
      throw new HttpException('Submission not found', HttpStatus.NOT_FOUND);
    }
    return submission;
  }
}
