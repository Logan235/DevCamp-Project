import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { JUDGE0_LANGUAGE_MAP } from '../judge0/constants/languageMap';
import { JudgeService } from '../judge0/judge.service';
import { CodeExecutionJob } from '../interfaceFile/interface';
import { Submission } from './schema/submission.schema';

type InternalSubmissionStatus =
  | 'pending'
  | 'success'
  | 'wrong_answer'
  | 'compile_error'
  | 'runtime_error'
  | 'time_limit_exceeded'
  | 'error';

type NormalizedExecutionResult = {
  output: string;
  error: string;
  statusCode: number;
  status: InternalSubmissionStatus;
  runtime?: number;
  memory?: number;
};

@Injectable()
@Processor('code-execution')
export class CodeExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(CodeExecutionProcessor.name);

  constructor(
    @InjectModel(Submission.name)
    private readonly submissionModel: Model<Submission>,
    private readonly judgeService: JudgeService,
  ) {
    super();
    this.logger.log('[CodeExecution] Processor initialized');
  }

  async process(job: Job<CodeExecutionJob>): Promise<void> {
    const { submissionId, code, language, input, expectedOutput } = job.data;

    this.logger.log(
      `[CodeExecution] Processing submission ${submissionId} with language ${language}`,
    );

    const submission = await this.submissionModel.findById(submissionId);

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    try {
      const languageId = this.resolveLanguageId(language);

      const base64Code = this.encodeBase64(code || '');
      const base64Input = this.encodeBase64(input || '');

      const base64ExpectedOutput =
        expectedOutput === undefined
          ? undefined
          : this.encodeBase64(expectedOutput);

      if (expectedOutput !== undefined) {
        submission.expectedOutput = expectedOutput;
      }

      const result = await this.judgeService.runCode({
        source_code: base64Code,
        language_id: languageId,
        stdin: base64Input,
        expected_output: base64ExpectedOutput,
      });

      const normalizedResult = this.normalizeExecutionResult(
        result,
        submission.expectedOutput,
      );

      submission.output = normalizedResult.output;
      submission.error = normalizedResult.error;
      submission.statusCode = normalizedResult.statusCode;
      submission.status = normalizedResult.status;
      submission.runtime = normalizedResult.runtime;
      submission.memory = normalizedResult.memory;

      await submission.save();

      this.logger.log(
        `[CodeExecution] Submission ${submissionId} finished with status ${submission.status}`,
      );
    } catch (error) {
      submission.status = 'error';
      submission.error =
        error instanceof Error ? error.message : 'Unknown execution error';

      await submission.save();

      this.logger.error(
        `[CodeExecution] Error processing submission ${submissionId}: ${submission.error}`,
      );

      throw error;
    }
  }

  private resolveLanguageId(language: string): number {
    const normalizedLanguage = language?.trim().toLowerCase();
    if (
      normalizedLanguage !== 'cpp' &&
      normalizedLanguage !== 'c++ (local engine)'
    ) {
      throw new Error(
        `Local engine currently supports C++ only. Received: "${language}"`,
      );
    }
    const targetKey = 'cpp';
    const languageId = JUDGE0_LANGUAGE_MAP[targetKey];
    if (!languageId) {
      throw new Error(
        `Language '${targetKey}' is not configured in JUDGE0_LANGUAGE_MAP`,
      );
    }
    return languageId;
  }

  private normalizeExecutionResult(
    result: {
      stdout?: string | null;
      stderr?: string | null;
      compile_output?: string | null;
      message?: string | null;
      time?: string | null;
      memory?: number | null;
      status?: {
        id: number;
        description: string;
      };
    },
    expectedOutput?: string,
  ): NormalizedExecutionResult {
    const output = this.decodeBase64(result.stdout || '');
    const stderr = this.decodeBase64(result.stderr || '');
    const compileOutput = this.decodeBase64(result.compile_output || '');
    const message = result.message || '';

    const statusCode = result.status?.id || 11;
    const status = this.mapStatusCodeToInternalStatus(statusCode);

    const runtime = result.time ? parseFloat(result.time) * 1000 : undefined;
    const memory = result.memory ?? undefined;

    let error = [stderr, compileOutput, message].filter(Boolean).join('\n');

    if (status === 'wrong_answer') {
      error = this.buildWrongAnswerMessage(output, expectedOutput);
    }

    if (!error && status !== 'success') {
      error = result.status?.description || 'Execution failed';
    }

    return {
      output,
      error,
      statusCode,
      status,
      runtime,
      memory,
    };
  }

  private mapStatusCodeToInternalStatus(
    statusCode: number,
  ): InternalSubmissionStatus {
    switch (statusCode) {
      case 3:
        return 'success';
      case 4:
        return 'wrong_answer';
      case 5:
        return 'time_limit_exceeded';
      case 6:
        return 'compile_error';
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
        return 'runtime_error';
      default:
        return 'error';
    }
  }

  private buildWrongAnswerMessage(
    actualOutput: string,
    expectedOutput?: string,
  ): string {
    return [
      'Wrong Answer',
      '',
      'Output:',
      actualOutput || '(empty)',
      '',
      'Expected output:',
      expectedOutput || '(empty)',
    ].join('\n');
  }

  private encodeBase64(value: string): string {
    return Buffer.from(value || '', 'utf-8').toString('base64');
  }

  private decodeBase64(value: string): string {
    return Buffer.from(value || '', 'base64').toString('utf-8');
  }
}
