import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Request,
  UseGuards,
  Param,
} from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateRoadmapDto } from './dto/update.dto';
import { GenerateRoadmapDto } from './dto/generate.dto';
import type { RequestWithUser } from '../interfaceFile/interface';

@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get('me')
  getRoadmaps(@Request() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.roadmapService.getRoadmaps(userId);
  }

  @Put('me')
  putRoadmaps(@Request() req: RequestWithUser, @Body() body: UpdateRoadmapDto) {
    const userId = req.user.userId;
    return this.roadmapService.putRoadmaps(userId, body);
  }

  @Post('generate')
  generateRoadmap(
    @Request() req: RequestWithUser,
    @Body() body: GenerateRoadmapDto,
  ) {
    const userId = req.user.userId;
    return this.roadmapService.generateFromAssessment(
      userId,
      body.assessmentResult,
    );
  }

  @Post('me/challenges/:challengeId/complete')
  completeChallenge(
    @Request() req: RequestWithUser,
    @Param('challengeId') challengeId: string,
    @Body() body: { submissionIds?: string[] },
  ) {
    const userId = req.user.userId;
    return this.roadmapService.completeChallenge(
      userId,
      challengeId,
      body.submissionIds,
    );
  }
}
