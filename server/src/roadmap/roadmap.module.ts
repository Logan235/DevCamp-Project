import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import {
  RoadmapTemplate,
  RoadmapTemplateSchema,
  UserRoadmap,
  UserRoadmapSchema,
} from './roadmap.schemas';
import { Challenge, ChallengeSchema } from '../exercise/exercise.schemas';
import { AiMirrorModule } from '../ai-mirror/ai-mirror.module';
import { TestCase, TestCaseSchema } from '../test/test.schemas';

@Module({
  imports: [
    AiMirrorModule,
    MongooseModule.forFeature([
      { name: RoadmapTemplate.name, schema: RoadmapTemplateSchema },
      { name: UserRoadmap.name, schema: UserRoadmapSchema },

      { name: Challenge.name, schema: ChallengeSchema },

      { name: TestCase.name, schema: TestCaseSchema },
    ]),
  ],
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
