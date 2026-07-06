import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { LearningController } from './learning.controller';
import { LearningService } from './learning.service';

import { User, UserSchema } from '../users/schema/user.schema';

import {
  RoadmapTemplate,
  RoadmapTemplateSchema,
  UserRoadmap,
  UserRoadmapSchema,
} from '../roadmap/roadmap.schemas';

import {
  Challenge,
  ChallengeSchema,
} from '../exercise/exercise.schemas';

import { Submission, SubmissionSchema } from 'src/code-execution/schema/submission.schema';
import { TestSubmission, TestSubmissionSchema } from '../test/test.schemas';

import { Milestone, MilestoneSchema } from './schemas/milestone.schema';
import {
  MilestoneSubmission,
  MilestoneSubmissionSchema,
} from './schemas/milestone-submission.schema';
import { Report, ReportSchema } from './schemas/report.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },

      { name: RoadmapTemplate.name, schema: RoadmapTemplateSchema },
      { name: UserRoadmap.name, schema: UserRoadmapSchema },

      { name: Challenge.name, schema: ChallengeSchema },
      { name: Submission.name, schema: SubmissionSchema },

      { name: TestSubmission.name, schema: TestSubmissionSchema },

      { name: Milestone.name, schema: MilestoneSchema },
      { name: MilestoneSubmission.name, schema: MilestoneSubmissionSchema },
      { name: Report.name, schema: ReportSchema },
    ]),
  ],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
