import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JudgeService } from './judge.service';
import { SubmissionDto } from './dto/judge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { RequestWithUser } from '../interfaceFile/interface';

@Controller('judge')
export class JudgeController {
  constructor(private readonly judgeService: JudgeService) {}

  // GET http://localhost:3000/judge/languages
  @Get('languages')
  getLanguages() {
    return this.judgeService.getLanguages();
  }

  // POST http://localhost:3000/judge/run (Cải tiến để test linh hoạt hơn)
  // Endpoint này chỉ dùng để test nhanh, không có xác thực
  @Post('run')
  runTest(
    @Body()
    payload: {
      source_code: string;
      language_id: number;
      stdin?: string;
      expectedOutput?: string;
    },
  ) {
    // Chuyển source_code và stdin sang base64 trước khi gọi service
    payload.source_code = Buffer.from(payload.source_code || '').toString(
      'base64',
    );
    payload.stdin = Buffer.from(payload.stdin || '').toString('base64');
    payload.expectedOutput = Buffer.from(payload.expectedOutput || '').toString(
      'base64',
    );
    return this.judgeService.runCode(payload);
  }

  // POST http://localhost:3000/judge/submit
  @Post('submit')
  submit(@Body() payload: SubmissionDto) {
    return this.judgeService.submitCode(payload);
  }

  // GET http://localhost:3000/judge/submissions/:token
  @Get('submissions/:token')
  @UseGuards(JwtAuthGuard)
  getSubmission(
    @Request() req: RequestWithUser,
    @Param('token') token: string,
  ) {
    return this.judgeService.getSubmission(token);
  }
}
