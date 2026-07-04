import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job } from 'bullmq';
import { JUDGE0_LANGUAGE_MAP } from '../judge0/constants/languageMap';
import { Submission } from './schema/submission.schema';
import { JudgeService } from '../judge0/judge.service';
import { CodeExecutionJob, Judge0Response } from '../interfaceFile/interface';

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
  }

  async process(job: Job<CodeExecutionJob>): Promise<void> {
    const { submissionId, code, language, input, expectedOutput } = job.data;
    const base64Code = Buffer.from(code || '').toString('base64');
    const base64Input = Buffer.from(input || '').toString('base64');
    this.logger.log(
      `Processing submission ${submissionId} with language ${language}`,
    );
    const submission = await this.submissionModel.findById(submissionId);
    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    // Update the submission with the expectedOutput from the job
    // This is the critical step to ensure the data is available for comparison
    if (expectedOutput !== undefined) {
      submission.expectedOutput = expectedOutput;
      // We will save it once later with all the other results
    }

    try {
      const languageId = JUDGE0_LANGUAGE_MAP[language];
      if (!languageId) {
        throw new Error(`Language ${language} not supported`);
      }

      const result = await this.judgeService.runCode({
        source_code: base64Code,
        language_id: languageId,
        stdin: base64Input,
      });

      const actualOutput = result.stdout
        ? Buffer.from(result.stdout, 'base64').toString('utf-8')
        : '';

      // Logic so sánh được chuyển về đây
      const normalize = (str: string | undefined) =>
        (str || '') // str có thể là undefined, || '' sẽ xử lý nó thành chuỗi rỗng
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line)
          .join('\n');

      const isAccepted =
        normalize(actualOutput) === normalize(submission.expectedOutput);

      // Cập nhật submission với kết quả
      submission.output = actualOutput;
      const rawError =
        result.stderr || result.compile_output || result.message || '';
      submission.error = rawError
        ? Buffer.from(rawError, 'base64').toString('utf-8')
        : '';
      submission.runtime = result.time
        ? parseFloat(result.time) * 1000
        : undefined;

      if (isAccepted) {
        submission.status = 'success'; // Accepted
        submission.statusCode = 3; // Accepted
      } else {
        submission.status = 'Wrong Answer';
        submission.statusCode = 4; // Wrong Answer
        submission.error = `Output:\n${actualOutput}\n\nExpected output:\n${submission.expectedOutput}`;
      }

      await submission.save();

      // Log the result
      this.logger.log(`Submission ${submissionId} processed successfully`);
    } catch (error) {
      // Xử lý lỗi biên dịch/runtime từ JudgeService một cách an toàn
      if (typeof error === 'object' && error !== null && 'status' in error) {
        const execError = error as Judge0Response; // Ép kiểu an toàn sang Judge0Response
        if (execError.status) {
          submission.status = execError.status.description || 'error';
          submission.statusCode = execError.status.id || 11; // Runtime Error
        }
        if (execError.stderr) {
          submission.error = Buffer.from(execError.stderr, 'base64').toString(
            'utf-8',
          );
        } else {
          submission.error = 'Execution Error';
        }
      } else {
        submission.status = 'error';
        submission.error =
          error instanceof Error ? error.message : 'Unknown error';
      }
      this.logger.error(
        `Error processing submission ${submissionId}: ${submission.error}`,
      );
      await submission.save();
      throw error; // Re-throw the error to let BullMQ handle retries if configured
    }
  }
}
