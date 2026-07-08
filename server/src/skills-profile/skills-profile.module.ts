import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkillsProfileController } from './skills-profile.controller';
import { SkillsProfileService } from './skills-profile.service';
import {
  UserSkillProfile,
  UserSkillProfileSchema,
} from './schema/skillsProfile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserSkillProfile.name, schema: UserSkillProfileSchema },
    ]),
  ],
  controllers: [SkillsProfileController],
  providers: [SkillsProfileService],
  exports: [SkillsProfileService],
})
export class SkillsProfileModule {}
