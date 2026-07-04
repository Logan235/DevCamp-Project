import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Challenge } from './exercise.schemas';
import { Submission } from '../code-execution/schema/submission.schema'; // <--- Sửa đường dẫn import
import { UserRoadmap, RoadmapTemplate } from '../roadmap/roadmap.schemas';
import { CodeExecutionService } from '../code-execution/code-execution.service';
import { RunCodeDto, SubmitExerciseDto } from './dto/submit.dto';
import { R2Service } from '../shared/r2.service';
import { TestCase } from 'src/test/test.schemas';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Challenge.name) private challengeModel: Model<Challenge>,
    @InjectModel(Submission.name) private submissionModel: Model<Submission>,
    @InjectModel(UserRoadmap.name) private userRoadmapModel: Model<UserRoadmap>,
    @InjectModel(RoadmapTemplate.name)
    private templateModel: Model<RoadmapTemplate>,
    // 1. Sửa lỗi: Inject thêm TestCase model vào đây
    @InjectModel(TestCase.name)
    private readonly testCaseModel: Model<TestCase>,
    private readonly codeExecutionService: CodeExecutionService,
    private readonly r2Service: R2Service,
  ) {}

  // GET all the exercises for the active roadmap of the user
  async getExercises(userId: string) {
    const activeRoadmap = await this.userRoadmapModel
      .findOne({ userId: new Types.ObjectId(userId), status: 'active' })
      .exec();

    if (!activeRoadmap) {
      return this.challengeModel.find().exec();
    }

    const template = await this.templateModel
      .findById(activeRoadmap.templateId)
      .exec();

    if (!template || !template.nodes || template.nodes.length === 0) {
      return [];
    }

    const challengeIds = template.nodes.map((node) => node.challengeId);

    return this.challengeModel.find({ _id: { $in: challengeIds } }).exec();
  }

  // GET details of a specific exercise by its ID
  async getExerciseById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Định dạng ID bài tập không hợp lệ');
    }
    const exercise = await this.challengeModel.findById(id).exec();
    if (!exercise) {
      throw new NotFoundException('Không tìm thấy bài tập yêu cầu');
    }
    return exercise;
  }

  // Process "Run Code"
  async handleRun(userId: string, challengeId: string, runCodeDto: RunCodeDto) {
    if (!Types.ObjectId.isValid(challengeId)) {
      throw new BadRequestException('Định dạng ID bài tập không hợp lệ');
    }

    const challengeExists = await this.challengeModel
      .findById(challengeId)
      .exec();
    if (!challengeExists) {
      throw new NotFoundException('Bài tập không tồn tại trên hệ thống');
    }

    const { language, code, stdin } = runCodeDto;

    const job = await this.codeExecutionService.executeCode(userId, {
      challengeId,
      language,
      code,
      input: stdin,
    });

    return { submissionId: job._id };
  }

  // Process "Submit Code" - This method handles the submission of code for a specific challenge. It validates the user ID and challenge ID, checks if the challenge exists, retrieves the test cases for the challenge, and executes the code against each test case. The results are returned as an array of submission IDs.
  async handleSubmit(
    userId: string,
    challengeId: string,
    submitExerciseDto: SubmitExerciseDto,
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('userId is invalid');
    }

    if (!Types.ObjectId.isValid(challengeId)) {
      throw new BadRequestException('Challenge ID is invalid');
    }

    const challengeExists = await this.challengeModel
      .findById(challengeId)
      .exec();
    if (!challengeExists) {
      throw new NotFoundException('Challenge not found');
    }

    const { language, code } = submitExerciseDto;

    const testCases = await this.testCaseModel
      .find({ challengeId: new Types.ObjectId(challengeId) })
      .exec();
    if (!testCases || testCases.length === 0) {
      throw new NotFoundException('No test cases found for this challenge.');
    }

    // Luồng xử lý lấy dữ liệu và map sang promises song song
    const submissionPromises = testCases.map(async (testCase) => {
      // Sửa lại cho đúng với schema: testCase.storageRef.inputUrl
      const input = testCase.storageRef?.inputUrl
        ? await this.r2Service.getFileContent(testCase.storageRef.inputUrl)
        : testCase.input;

      if (input === undefined || input === null) {
        throw new Error(`Input for test case ${challengeId} is missing.`);
      }

      // Lấy expected output từ test case
      const expectedOutput = testCase.storageRef?.outputUrl
        ? await this.r2Service.getFileContent(testCase.storageRef.outputUrl)
        : testCase.expectedOutput || ''; // Đảm bảo không bao giờ là undefined

      const job = await this.codeExecutionService.executeCode(userId, {
        challengeId,
        language,
        code,
        input,
        expectedOutput: expectedOutput, // Send expected output to the code execution service
      });

      // Return the ID of the submission created for this test case
      return job._id;
    });

    // Wait for all submissions to be processed and collect their IDs
    const submissionIds = await Promise.all(submissionPromises);

    return {
      message: 'Submission received and is being processed.',
      testCaseSubmissionIds: submissionIds,
    };
  }
}
