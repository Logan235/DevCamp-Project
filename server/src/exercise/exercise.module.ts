import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import {
  Submission,
  SubmissionSchema,
} from '../code-execution/schema/submission.schema'; // <--- Sửa đường dẫn import
import { Challenge, ChallengeSchema } from './exercise.schemas'; // <--- Giữ lại Challenge
import {
  UserRoadmap,
  UserRoadmapSchema,
  RoadmapTemplate,
  RoadmapTemplateSchema,
} from '../roadmap/roadmap.schemas';
import { TestCase, TestCaseSchema } from '../test/test.schemas';
import { CodeExecutionModule } from '../code-execution/code-execution.module';
import { R2Service } from '../shared/r2.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Challenge.name, schema: ChallengeSchema },
      { name: Submission.name, schema: SubmissionSchema },

      { name: UserRoadmap.name, schema: UserRoadmapSchema },
      { name: RoadmapTemplate.name, schema: RoadmapTemplateSchema },
      { name: TestCase.name, schema: TestCaseSchema },
    ]),
    CodeExecutionModule,
  ],
  controllers: [ExerciseController],
  providers: [ExerciseService, R2Service],
  exports: [ExerciseService],
})
export class ExerciseModule {}
