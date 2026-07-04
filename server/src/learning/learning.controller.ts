import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { RequestWithUser } from '../interfaceFile/interface';
import { SubmitMilestoneDto } from './dto/submit-milestone.dto';

@Controller()
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('progress/me')
  @UseGuards(JwtAuthGuard)
  getProgressMe(@Request() req: RequestWithUser) {
    return this.learningService.getProgressMe(req.user.userId);
  }

  @Get('stats/me')
  @UseGuards(JwtAuthGuard)
  getStatsMe(@Request() req: RequestWithUser) {
    return this.learningService.getStatsMe(req.user.userId);
  }

  @Get('ranking')
  getRanking(@Query('limit') limit = '20') {
    return this.learningService.getRanking(Number(limit));
  }

  @Get('milestones')
  @UseGuards(JwtAuthGuard)
  getMilestones(@Request() req: RequestWithUser) {
    return this.learningService.getMilestones(req.user.userId);
  }

  @Post('milestones/:id/submit')
  @UseGuards(JwtAuthGuard)
  submitMilestone(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() body: SubmitMilestoneDto,
  ) {
    return this.learningService.submitMilestone(req.user.userId, id, body);
  }

  @Get('reports/me')
  @UseGuards(JwtAuthGuard)
  getReportsMe(@Request() req: RequestWithUser) {
    return this.learningService.getReportsMe(req.user.userId);
  }
}
