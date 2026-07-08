import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiMirrorController } from './ai-mirror.controller';
import { AiMirrorService } from './ai-mirror.service';
import {
  ReflectionSession,
  ReflectionSessionSchema,
} from './schema/reflection-session.schema';
import {
  MonthlyReport,
  MonthlyReportSchema,
} from './schema/monthly-report.schema';
import {
  Submission,
  SubmissionSchema,
} from '../code-execution/schema/submission.schema';
import { AiRoadmapService } from './ai-roadmap.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Submission.name,
        schema: SubmissionSchema,
      },
      {
        name: ReflectionSession.name,
        schema: ReflectionSessionSchema,
      },
      {
        name: MonthlyReport.name,
        schema: MonthlyReportSchema,
      },
    ]),
  ],
  controllers: [AiMirrorController],
  providers: [AiMirrorService, AiRoadmapService],
  exports: [AiMirrorService, AiRoadmapService],
})
export class AiMirrorModule {}
