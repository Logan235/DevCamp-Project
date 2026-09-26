import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import type {
  Judge0Submission,
  ExecException,
  Judge0Response,
} from '../interfaceFile/interface';
import { SubmissionDto } from './dto/judge.dto';

const execAsync = promisify(exec);

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);
  private readonly tempDir = path.join(process.cwd(), 'local_compiler_tmp');

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  getLanguages(): Promise<Array<{ id: number; name: string }>> {
    return Promise.resolve([{ id: 54, name: 'C++ (Local G++)' }]);
  }

  // Endpoint submit hiện chỉ giữ để tương thích controller cũ.
  // Luồng chính nên đi qua CodeExecutionService + BullMQ.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submitCode(_payload: SubmissionDto): Promise<{ token: string }> {
    return Promise.resolve({ token: `local-token-${Date.now()}` });
  }
  async runCode(payload: Judge0Submission): Promise<Judge0Response> {
    const rawCode = this.decodeBase64(payload.source_code);
    const rawInput = this.decodeBase64(payload.stdin || '');

    const rawExpectedOutput =
      payload.expected_output !== undefined
        ? this.decodeBase64(payload.expected_output)
        : undefined;

    const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const sourceFilePath = path.join(this.tempDir, `main_${uniqueId}.cpp`);
    const outputExePath = path.join(this.tempDir, `program_${uniqueId}`);
    const inputFilePath = path.join(this.tempDir, `input_${uniqueId}.txt`);
    const dockerVolumePath = this.tempDir.replace(/\\/g, '/');
    const dockerCommand = `docker run --rm -v "${dockerVolumePath}:/app" -w /app`;

    const engineStart = performance.now();
    let compileMs = 0;
    let runMs = 0;

    try {
      fs.writeFileSync(sourceFilePath, rawCode, 'utf-8');
      fs.writeFileSync(inputFilePath, rawInput, 'utf-8');

      this.logger.log(
        `[Local Engine] Compiling source file: main_${uniqueId}.cpp`,
      );
      // Measure compile time
      const compileStart = performance.now();

      await execAsync(
        `${dockerCommand} gcc:latest g++ main_${uniqueId}.cpp -std=c++17 -O2 -o program_${uniqueId}`,
        {
          timeout: 10000,
          maxBuffer: 1024 * 1024,
        },
      );

      compileMs = Math.round(performance.now() - compileStart);

      this.logger.log(
        `[Local Engine] Compile success in ${compileMs}ms. Running program...`,
      );

      const runStart = performance.now();

      const { stdout, stderr } = await execAsync(
        `${dockerCommand} --network=none gcc:latest sh -c "./program_${uniqueId} < input_${uniqueId}.txt"`,
        {
          timeout: 2000,
          maxBuffer: 1024 * 1024,
        },
      );

      runMs = Math.round(performance.now() - runStart);
      const executionTime = (runMs / 1000).toFixed(3);

      this.logger.log(`[Local Engine] Run finished in ${runMs}ms`);

      const normalizedStdout = this.normalizeOutput(stdout || '');
      const normalizedExpectedOutput =
        rawExpectedOutput === undefined
          ? undefined
          : this.normalizeOutput(rawExpectedOutput);

      const isAccepted =
        normalizedExpectedOutput === undefined ||
        normalizedStdout === normalizedExpectedOutput;

      return {
        stdout: this.encodeBase64(stdout || ''),
        stderr: stderr ? this.encodeBase64(stderr) : null,
        time: executionTime,
        memory: 2048,
        token: `local-${uniqueId}`,
        compile_output: null,
        message: null,
        status: {
          id: isAccepted ? 3 : 4,
          description: isAccepted ? 'Accepted' : 'Wrong Answer',
        },
        timings: {
          compileMs,
          runMs,
          engineTotalMs: Math.round(performance.now() - engineStart),
        },
      };
    } catch (error: unknown) {
      const execError = error as ExecException;
      const errorMsg = execError.stderr || execError.message || 'Unknown Error';

      this.logger.error(`[Local Engine] Execution failed: ${errorMsg}`);

      const isCompileError = !!(execError.cmd && execError.cmd.includes('g++'));

      const isTimeout = /timed out|timeout/i.test(errorMsg);

      return {
        stdout: null,
        time: null,
        memory: null,
        stderr: this.encodeBase64(errorMsg),
        token: `local-${uniqueId}`,
        compile_output: isCompileError ? this.encodeBase64(errorMsg) : null,
        message: isTimeout
          ? 'Time Limit Exceeded'
          : isCompileError
            ? 'Compilation Error'
            : 'Runtime Error',
        status: {
          id: isCompileError ? 6 : 11,
          description: isTimeout
            ? 'Time Limit Exceeded'
            : isCompileError
              ? 'Compilation Error'
              : 'Runtime Error',
        },
      };
    } finally {
      this.cleanFiles([sourceFilePath, outputExePath, inputFilePath]);
    }
  }

  // Endpoint getSubmission hiện chỉ giữ để tương thích controller cũ.
  // Kết quả thật nên lấy từ MongoDB Submission qua /code-execution/:submissionId.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSubmission(_token: string): Promise<{
    status: { id: number; description: string };
  }> {
    return Promise.resolve({ status: { id: 3, description: 'Accepted' } });
  }

  private decodeBase64(value: string): string {
    return Buffer.from(value || '', 'base64').toString('utf-8');
  }

  private encodeBase64(value: string): string {
    return Buffer.from(value || '', 'utf-8').toString('base64');
  }

  private normalizeOutput(value: string): string {
    return value.replace(/\r\n/g, '\n').trim();
  }

  private cleanFiles(files: string[]): void {
    files.forEach((file) => {
      if (!fs.existsSync(file)) {
        return;
      }

      try {
        fs.unlinkSync(file);
      } catch {
        // Intentionally ignore temp cleanup errors.
      }
    });
  }
}
