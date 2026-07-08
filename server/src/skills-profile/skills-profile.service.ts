import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AddAiAnalysisDto } from './dto/add-ai-analysis.dto';
import { UpdateSkillProfileDto } from './dto/update-skill-profile.dto';
import { UserSkillProfile } from './schema/skillsProfile.schema';

@Injectable()
export class SkillsProfileService {
  constructor(
    @InjectModel(UserSkillProfile.name)
    private readonly skillProfileModel: Model<UserSkillProfile>,
  ) {}

  async findOrCreateByUserId(userId: string): Promise<UserSkillProfile> {
    const existingProfile = await this.skillProfileModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (existingProfile) {
      return existingProfile;
    }

    const newProfile = new this.skillProfileModel({
      userId: new Types.ObjectId(userId),
      performance: [],
      aiAnalyses: [],
    });

    return newProfile.save();
  }

  async addAiAnalysis(
    userId: string,
    addAiAnalysisDto: AddAiAnalysisDto,
  ): Promise<UserSkillProfile> {
    const profile = await this.findOrCreateByUserId(userId);

    profile.aiAnalyses.push({
      ...addAiAnalysisDto.analysis,
      recordedAt: new Date(),
    });

    return profile.save();
  }

  async updateFromAssessment(
    userId: string,
    updateDto: UpdateSkillProfileDto,
  ): Promise<UserSkillProfile> {
    const profile = await this.findOrCreateByUserId(userId);

    updateDto.details?.forEach((detail) => {
      let categoryPerf = profile.performance.find(
        (p) => p.category === detail.category,
      );

      if (!categoryPerf) {
        categoryPerf = {
          category: detail.category,
          assessmentCorrect: 0,
          assessmentTotal: 0,
          challengeAccepted: 0,
          challengeTotal: 0,
          errorTypes: new Map(),
        };
        profile.performance.push(categoryPerf);
      }

      categoryPerf.assessmentTotal += 1;
      if (detail.status === 'Passed') {
        categoryPerf.assessmentCorrect += 1;
      }
    });

    return profile.save();
  }
}
