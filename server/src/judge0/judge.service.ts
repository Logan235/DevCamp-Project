import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import type {
  Judge0Submission,
  ExecException,
  Judge0Response,
  JudgeEngine,
} from '../interfaceFile/interface';
import { SubmissionDto } from './dto/judge.dto';

const execAsync = promisify(exec);

const COMPILE_FLAGS = '-std=c++17 -O2';
const DOCKER_COMPILE_TIMEOUT_MS = 10000;
/**
 * Host không có Docker thường là Render free tier (0.1 vCPU): compile
 * `bits/stdc++.h` mất hơn 10s khi chưa có precompiled header.
 */
const NATIVE_COMPILE_TIMEOUT_MS = 30000;
const PCH_BUILD_TIMEOUT_MS = 180000;
const RUN_TIMEOUT_MS = 2000;
/** Giới hạn bộ nhớ ảo cho engine native (KB). 512MB. */
const NATIVE_MEMORY_LIMIT_KB = 512 * 1024;
/** Giới hạn kích thước file program được phép ghi ra (KB) cho engine native. */
const NATIVE_FILE_LIMIT_KB = 10 * 1024;

@Injectable()
export class JudgeService implements OnModuleInit {
  private readonly logger = new Logger(JudgeService.name);
  private readonly tempDir = path.join(process.cwd(), 'local_compiler_tmp');
  private readonly isWindows = process.platform === 'win32';
  private enginePromise: Promise<JudgeEngine> | null = null;

  /**
   * Precompiled header cho `bits/stdc++.h` (engine native). Thư mục `pch`
   * được thêm vào -I nên `#include <bits/stdc++.h>` của người dùng sẽ
   * trúng `pch/bits/stdc++.h.gch` trước header hệ thống.
   */
  private readonly pchDir = path.join(this.tempDir, 'pch');
  private readonly pchHeader = path.join(this.pchDir, 'bits', 'stdc++.h');
  private pchReady = false;
  private pchBuilding: Promise<void> | null = null;

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /** Phát hiện engine ngay khi khởi động để PCH (nếu cần) sẵn sàng trước submission đầu tiên. */
  onModuleInit(): void {
    this.resolveEngine().catch((error: unknown) => {
      this.logger.warn(
        `[Judge] Engine detection at startup failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
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

  /**
   * Chọn engine chấm bài, chỉ kiểm tra một lần rồi cache.
   *
   * - JUDGE_ENGINE=docker | native : ép dùng engine chỉ định.
   * - Mặc định: có Docker CLI + daemon thì dùng docker (sandbox),
   *   không thì fallback sang g++ cài trên host (Render, VPS không có Docker).
   */
  private resolveEngine(): Promise<JudgeEngine> {
    if (!this.enginePromise) {
      this.enginePromise = this.detectEngine().catch((error: unknown) => {
        // Cho phép thử lại ở lần submit sau thay vì cache lỗi vĩnh viễn.
        this.enginePromise = null;
        throw error;
      });
    }
    return this.enginePromise;
  }

  private async detectEngine(): Promise<JudgeEngine> {
    const forced = (process.env.JUDGE_ENGINE || '').trim().toLowerCase();
    if (forced === 'docker' || forced === 'native') {
      this.logger.log(`[Judge] Engine forced by JUDGE_ENGINE=${forced}`);
      return forced;
    }
    if (forced) {
      this.logger.warn(
        `[Judge] Unknown JUDGE_ENGINE="${forced}", falling back to auto-detect`,
      );
    }

    if (
      await this.commandWorks('docker version --format "{{.Server.Version}}"')
    ) {
      this.logger.log('[Judge] Docker daemon detected, using docker engine');
      return 'docker';
    }

    if (await this.commandWorks('g++ --version')) {
      this.logger.warn(
        '[Judge] Docker not available, using native g++ on host (no container isolation)',
      );
      // Build PCH trong nền; submission đến trước khi xong vẫn compile được (chậm hơn).
      this.ensurePrecompiledHeader();
      return 'native';
    }

    throw new Error(
      'No judge engine available: neither Docker nor g++ was found on this host',
    );
  }

  private async commandWorks(command: string): Promise<boolean> {
    try {
      await execAsync(command, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Build PCH một lần (idempotent). Không await ở nơi gọi, lỗi chỉ log warn. */
  private ensurePrecompiledHeader(): void {
    if (this.pchReady || this.pchBuilding) {
      return;
    }
    this.pchBuilding = this.buildPrecompiledHeader()
      .catch((error: unknown) => {
        this.logger.warn(
          `[Judge:native] PCH build failed, compiling without it: ${error instanceof Error ? error.message : String(error)}`,
        );
      })
      .finally(() => {
        this.pchBuilding = null;
      });
  }

  private async buildPrecompiledHeader(): Promise<void> {
    const gchPath = `${this.pchHeader}.gch`;

    if (fs.existsSync(gchPath)) {
      this.pchReady = true;
      this.logger.log('[Judge:native] Reusing existing precompiled header');
      return;
    }

    fs.mkdirSync(path.dirname(this.pchHeader), { recursive: true });
    // #include_next: trỏ tới bits/stdc++.h thật của hệ thống. Nếu .gch không
    // dùng được (flags lệch), g++ vẫn fallback sang header này nên không hỏng.
    fs.writeFileSync(
      this.pchHeader,
      '#include_next <bits/stdc++.h>\n',
      'utf-8',
    );

    const start = performance.now();
    this.logger.log(
      '[Judge:native] Building precompiled header for bits/stdc++.h...',
    );

    // Flags phải trùng với lúc compile bài nộp, nếu không g++ sẽ bỏ qua .gch.
    await execAsync(
      `g++ ${COMPILE_FLAGS} -x c++-header pch/bits/stdc++.h -o pch/bits/stdc++.h.gch`,
      {
        cwd: this.tempDir,
        timeout: PCH_BUILD_TIMEOUT_MS,
        maxBuffer: 1024 * 1024,
      },
    );

    this.pchReady = true;
    this.logger.log(
      `[Judge:native] Precompiled header ready in ${Math.round(performance.now() - start)}ms`,
    );
  }

  async runCode(payload: Judge0Submission): Promise<Judge0Response> {
    const rawCode = this.decodeBase64(payload.source_code);
    const rawInput = this.decodeBase64(payload.stdin || '');

    const rawExpectedOutput =
      payload.expected_output !== undefined
        ? this.decodeBase64(payload.expected_output)
        : undefined;

    const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const sourceName = `main_${uniqueId}.cpp`;
    const inputName = `input_${uniqueId}.txt`;
    const programName = `program_${uniqueId}`;

    const sourceFilePath = path.join(this.tempDir, sourceName);
    const inputFilePath = path.join(this.tempDir, inputName);
    const outputExePath = path.join(this.tempDir, programName);
    const outputExePathWin = `${outputExePath}.exe`;

    const engineStart = performance.now();
    let compileMs = 0;
    let runMs = 0;
    let engine: JudgeEngine | undefined;

    try {
      engine = await this.resolveEngine();
      const { compileCommand, runCommand } = this.buildCommands(engine, {
        sourceName,
        inputName,
        programName,
      });

      fs.writeFileSync(sourceFilePath, rawCode, 'utf-8');
      fs.writeFileSync(inputFilePath, rawInput, 'utf-8');

      this.logger.log(`[Judge:${engine}] Compiling source file: ${sourceName}`);
      const compileStart = performance.now();

      await execAsync(compileCommand, {
        cwd: this.tempDir,
        timeout:
          engine === 'docker'
            ? DOCKER_COMPILE_TIMEOUT_MS
            : NATIVE_COMPILE_TIMEOUT_MS,
        maxBuffer: 1024 * 1024,
      });

      compileMs = Math.round(performance.now() - compileStart);

      this.logger.log(
        `[Judge:${engine}] Compile success in ${compileMs}ms. Running program...`,
      );

      const runStart = performance.now();

      const { stdout, stderr } = await execAsync(runCommand, {
        cwd: this.tempDir,
        // Cho engine native, `timeout` bên trong shell là lớp chặn chính;
        // timeout của execAsync chỉ là lưới an toàn thứ hai.
        timeout: RUN_TIMEOUT_MS + (engine === 'docker' ? 0 : 500),
        maxBuffer: 1024 * 1024,
      });

      runMs = Math.round(performance.now() - runStart);
      const executionTime = (runMs / 1000).toFixed(3);

      this.logger.log(`[Judge:${engine}] Run finished in ${runMs}ms`);

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
          engine,
          compileMs,
          runMs,
          engineTotalMs: Math.round(performance.now() - engineStart),
        },
      };
    } catch (error: unknown) {
      const execError = error as ExecException;
      const isCompileError = !!(execError.cmd && execError.cmd.includes('g++'));

      let errorMsg = execError.stderr || execError.message || 'Unknown Error';
      if (isCompileError && execError.killed === true) {
        // execAsync kill g++ vì quá timeout: stderr rỗng, message chỉ có lệnh.
        errorMsg = `Compilation timed out after ${Math.round((engine === 'docker' ? DOCKER_COMPILE_TIMEOUT_MS : NATIVE_COMPILE_TIMEOUT_MS) / 1000)}s`;
      }

      this.logger.error(
        `[Judge:${engine ?? 'none'}] Execution failed: ${errorMsg}`,
      );

      if (this.isWindows && engine === 'native' && !isCompileError) {
        // Trên Windows, timeout của execAsync chỉ kill cmd.exe, program.exe con
        // vẫn chạy tiếp (vd vòng lặp vô hạn). Kill theo tên file, tên là duy nhất.
        await this.killWindowsProcess(`${programName}.exe`);
      }

      const isTimeout =
        !isCompileError &&
        (execError.killed === true ||
          execError.signal === 'SIGKILL' ||
          execError.signal === 'SIGTERM' ||
          execError.code === 124 || // GNU timeout: hết giờ (SIGTERM)
          execError.code === 137 || // GNU timeout -s KILL / OOM
          /timed out/i.test(errorMsg));

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
        timings: engine
          ? {
              engine,
              compileMs,
              runMs,
              engineTotalMs: Math.round(performance.now() - engineStart),
            }
          : undefined,
      };
    } finally {
      this.cleanFiles([
        sourceFilePath,
        outputExePath,
        outputExePathWin,
        inputFilePath,
      ]);
    }
  }

  /**
   * Sinh lệnh compile / run cho từng engine. Mọi lệnh chạy với cwd = tempDir
   * nên chỉ dùng tên file tương đối.
   */
  private buildCommands(
    engine: JudgeEngine,
    files: { sourceName: string; inputName: string; programName: string },
  ): { compileCommand: string; runCommand: string } {
    const { sourceName, inputName, programName } = files;

    if (engine === 'docker') {
      const dockerVolumePath = this.tempDir.replace(/\\/g, '/');
      const dockerCommand = `docker run --rm -v "${dockerVolumePath}:/app" -w /app`;
      return {
        compileCommand: `${dockerCommand} gcc:latest g++ ${sourceName} ${COMPILE_FLAGS} -o ${programName}`,
        runCommand: `${dockerCommand} --network=none gcc:latest sh -c "./${programName} < ${inputName}"`,
      };
    }

    // native: g++ cài sẵn trên host (Render, VPS, CI...).
    // -I pch chỉ thêm khi .gch đã sẵn sàng; thư mục pch nằm trong cwd = tempDir.
    const pchFlag = this.pchReady ? ' -I pch' : '';
    const compileCommand = `g++ ${sourceName} ${COMPILE_FLAGS}${pchFlag} -o ${programName}`;

    if (this.isWindows) {
      // Windows không có ulimit/timeout của coreutils; dựa vào timeout của execAsync.
      // Không bọc tên file trong dấu nháy: cmd.exe sẽ bóc cặp nháy đầu/cuối của cả dòng.
      return {
        compileCommand,
        runCommand: `.\\${programName}.exe < ${inputName}`,
      };
    }

    const timeoutSec = Math.ceil(RUN_TIMEOUT_MS / 1000);
    // ulimit -v: chặn cấp phát bộ nhớ quá mức; ulimit -f: chặn ghi file lớn.
    // timeout -s KILL: kill hẳn tiến trình khi hết giờ (exit code 137).
    return {
      compileCommand,
      runCommand:
        `sh -c "ulimit -v ${NATIVE_MEMORY_LIMIT_KB} -f ${NATIVE_FILE_LIMIT_KB}; ` +
        `timeout -s KILL ${timeoutSec} ./${programName} < ${inputName}"`,
    };
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

  private async killWindowsProcess(imageName: string): Promise<void> {
    try {
      await execAsync(`taskkill /F /T /IM "${imageName}"`, { timeout: 5000 });
      this.logger.warn(`[Judge:native] Killed leftover process ${imageName}`);
    } catch {
      // Không có tiến trình nào đang chạy với tên này, bỏ qua.
    }
  }

  /**
   * Xoá file tạm. Nếu file còn bị khoá (tiến trình vừa bị kill chưa nhả handle,
   * thường gặp trên Windows) thì thử lại vài lần trong nền, không chặn kết quả.
   */
  private cleanFiles(files: string[], attempt = 0): void {
    const remaining = files.filter((file) => {
      if (!fs.existsSync(file)) {
        return false;
      }

      try {
        fs.unlinkSync(file);
        return false;
      } catch {
        return true;
      }
    });

    if (remaining.length > 0 && attempt < 5) {
      setTimeout(() => this.cleanFiles(remaining, attempt + 1), 500);
    } else if (remaining.length > 0) {
      this.logger.warn(
        `[Judge] Could not remove temp files: ${remaining
          .map((f) => path.basename(f))
          .join(', ')}`,
      );
    }
  }
}
