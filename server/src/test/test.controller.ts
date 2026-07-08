import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TestService } from './test.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SubmitAssessmentDto } from './dto/submit.dto';
import type { RequestWithUser } from '../interfaceFile/interface';
@Controller('assessment')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('questions')
  getQuestions(
    @Query('assessmentId') assessmentId?: string,
    @Query('challengeId') challengeId?: string,
  ) {
    return this.testService.getQuestions(assessmentId || challengeId);
  }

  @Post('submissions')
  @UseGuards(JwtAuthGuard)
  postSubmissions(
    @Request() req: RequestWithUser,
    @Body() body: SubmitAssessmentDto,
  ) {
    return this.testService.postSubmissions({
      ...body,
      userId: req.user.userId,
    });
  }

  @Get('results') // GET /assessment/results?challengeId=...
  getResults(@Query('challengeId') challengeId: string) {
    return this.testService.getResults(challengeId);
  }
}
