import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import type { RequestWithUser } from 'src/interfaceFile/interface';
import { AddAiAnalysisDto } from './dto/add-ai-analysis.dto';
import { UpdateSkillProfileDto } from './dto/update-skill-profile.dto';
import { SkillsProfileService } from './skills-profile.service';

@Controller('skills-profile')
@UseGuards(JwtAuthGuard)
export class SkillsProfileController {
  constructor(private readonly skillsProfileService: SkillsProfileService) {}

  @Get('me')
  async getMyProfile(@Request() req: RequestWithUser) {
    return this.skillsProfileService.findOrCreateByUserId(req.user.userId);
  }

  @Post('ai-analysis')
  async addAiAnalysis(
    @Request() req: RequestWithUser,
    @Body() addAiAnalysisDto: AddAiAnalysisDto,
  ) {
    return this.skillsProfileService.addAiAnalysis(
      req.user.userId,
      addAiAnalysisDto,
    );
  }

  @Post('assessment')
  async updateFromAssessment(
    @Request() req: RequestWithUser,
    @Body() updateDto: UpdateSkillProfileDto,
  ) {
    return this.skillsProfileService.updateFromAssessment(
      req.user.userId,
      updateDto,
    );
  }
}
