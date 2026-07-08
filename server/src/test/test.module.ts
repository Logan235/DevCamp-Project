import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import {
  TestCase,
  TestCaseSchema,
  TestSubmission,
  TestSubmissionSchema,
  Assessment,
  AssessmentSchema,
  AssessmentSubmission,
  AssessmentSubmissionSchema,
} from './test.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TestCase.name, schema: TestCaseSchema },
      { name: TestSubmission.name, schema: TestSubmissionSchema },
      { name: Assessment.name, schema: AssessmentSchema },
      { name: AssessmentSubmission.name, schema: AssessmentSubmissionSchema },
    ]),
  ],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}
