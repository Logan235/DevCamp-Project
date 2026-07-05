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

// Định nghĩa interface cho lỗi trả về từ exec để tránh dùng kiểu `any` gây lỗi unsafe của ESLint

@Injectable()
export class JudgeService {
  private readonly logger = new Logger(JudgeService.name);
  // Thư mục tạm ngay trong dự án để build code
  private readonly tempDir = path.join(process.cwd(), 'local_compiler_tmp');

  constructor() {
    // Tự động tạo thư mục tạm nếu chưa có
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Xóa `async` vì hàm này chỉ return đồng bộ một mảng tĩnh
  getLanguages(): Promise<any[]> {
    return Promise.resolve([{ id: 54, name: 'C++ (Local MinGW/GCC)' }]);
  }

  // Sửa kiểu dữ liệu của payload thành SubmissionDto để khớp với controller
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submitCode(_payload: SubmissionDto): Promise<any> {
    return Promise.resolve({ token: 'local-token-' + Date.now() });
  }

  async runCode(payload: Judge0Submission): Promise<Judge0Response> {
    // 1. Giải mã Base64 từ Frontend truyền lên
    const rawCode = payload.source_code
      ? Buffer.from(payload.source_code, 'base64').toString('utf-8')
      : '';
    const rawInput = payload.stdin
      ? Buffer.from(payload.stdin, 'base64').toString('utf-8')
      : '';

    const uniqueId = Date.now();
    const sourceFilePath = path.join(this.tempDir, `main_${uniqueId}.cpp`);
    const outputExePath = path.join(this.tempDir, `program_${uniqueId}.exe`);
    const inputFilePath = path.join(this.tempDir, `input_${uniqueId}.txt`);

    try {
      // 2. Ghi code và input ra file vật lý tạm thời trên Windows
      fs.writeFileSync(sourceFilePath, rawCode);
      fs.writeFileSync(inputFilePath, rawInput);

      this.logger.log(
        `[Local Engine] Đang biên dịch file: main_${uniqueId}.cpp`,
      );

      // 3. Gọi lệnh g++ của Windows để biên dịch code C++
      await execAsync(`g++ "${sourceFilePath}" -o "${outputExePath}"`);

      this.logger.log(`[Local Engine] Biên dịch thành công. Đang thực thi...`);

      // 4. Chạy file .exe vừa tạo kèm truyền dữ liệu đầu vào (stdin)
      const startTime = process.hrtime();
      const { stdout, stderr } = await execAsync(
        `"${outputExePath}" < "${inputFilePath}"`,
        {
          timeout: 2000, // Giới hạn thời gian chạy là 2 giây (Time Limit)
        },
      );
      const endTime = process.hrtime(startTime);
      const executionTime = (endTime[0] + endTime[1] / 1e9).toFixed(3); // Tính bằng giây

      // Dọn dẹp file tạm ngay lập tức sau khi chạy xong
      this.cleanFiles([sourceFilePath, outputExePath, inputFilePath]);

      // Trả về kết quả thô, không so sánh
      return {
        stdout: Buffer.from(stdout || '').toString('base64'),
        stderr: stderr ? Buffer.from(stderr).toString('base64') : null,
        time: executionTime,
        memory: 2048,
        token: `local-${uniqueId}`,
        compile_output: null,
        message: null,
        status: { id: 3, description: 'Finished' }, // Chỉ báo hiệu đã chạy xong
      };
    } catch (error: unknown) {
      // Xử lý khi lỗi Biên dịch (Compile Error) hoặc lỗi thực thi (Runtime Error)
      this.cleanFiles([sourceFilePath, outputExePath, inputFilePath]);

      // Ép kiểu an toàn từ unknown sang ExecException để không bị lỗi `@typescript-eslint/no-unsafe-*`
      const execError = error as ExecException;
      const errorMsg = execError.stderr || execError.message || 'Unknown Error';
      this.logger.error(`[Local Engine] Lỗi thực thi code: ${errorMsg}`);

      const isGppError = !!(execError.cmd && execError.cmd.includes('g++'));

      return {
        stdout: null,
        time: null,
        memory: null,
        stderr: Buffer.from(errorMsg).toString('base64'),
        token: `local-${uniqueId}`,
        compile_output: Buffer.from(errorMsg).toString('base64'),
        message: 'Runtime/Compile Error',
        status: {
          id: isGppError ? 6 : 11, // 6 = Compile Error, 11 = Runtime Error
          description: isGppError ? 'Compilation Error' : 'Runtime Error',
        },
      };
    }
  }

  // Sửa kiểu dữ liệu của payload thành SubmissionDto để khớp với controller
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getSubmission(_token: string): Promise<any> {
    return Promise.resolve({ status: { id: 3, description: 'Accepted' } });
  }

  // Hàm phụ trách xóa file rác
  private cleanFiles(files: string[]) {
    files.forEach((file) => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch {
          // Bỏ biến `e` không dùng và thêm comment giải thích để vượt qua quy tắc `no-empty` của ESLint
          // Cố tình nuốt lỗi nếu không xóa được file tạm
        }
      }
    });
  }
}
