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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoadmapTemplate.name, schema: RoadmapTemplateSchema },
      { name: UserRoadmap.name, schema: UserRoadmapSchema },
      { name: Challenge.name, schema: ChallengeSchema },
    ]),
  ],
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
