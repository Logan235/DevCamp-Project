import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Challenge } from './exercise.schemas';
import { UserRoadmap, RoadmapTemplate } from '../roadmap/roadmap.schemas';
import { CodeExecutionService } from '../code-execution/code-execution.service';
import {
  RunCodeDto,
  SubmitExerciseDto,
  CreateChallengeDto,
} from './dto/submit.dto';
import { R2Service } from '../shared/r2.service';
import { TestCase } from 'src/test/test.schemas';
import { Category } from '../categories/categories.schemas';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectModel(Challenge.name)
    private challengeModel: Model<Challenge>,

    @InjectModel(UserRoadmap.name)
    private userRoadmapModel: Model<UserRoadmap>,

    @InjectModel(RoadmapTemplate.name)
    private templateModel: Model<RoadmapTemplate>,
    @InjectModel(TestCase.name)
    private readonly testCaseModel: Model<TestCase>,

    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,

    private readonly codeExecutionService: CodeExecutionService,
    private readonly r2Service: R2Service,
  ) {}

  /**
   * Creates a new challenge and its associated test cases.
   * Test cases are saved as individual documents in the 'testcases' collection.
   * The original full DTO is also backed up to R2.
   */
  async createChallengeWithTestCases(dto: CreateChallengeDto) {
    // Define slug from problem_name for consistency
    const slug = dto.problem_name
      .toLowerCase()
      .normalize('NFD') // Remove Vietnamese diacritics
      .replace(/[\u0300-\u036f]/g, '') // Remove Unicode characters
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .trim()
      .replace(/[\s_]+/g, '_'); // Replace spaces with hyphens

    // Proactively check for a duplicate slug to provide a clear error.
    const existingChallenge = await this.challengeModel
      .findOne({ slug })
      .exec();
    if (existingChallenge) {
      throw new ConflictException(`Bài tập với slug "${slug}" đã tồn tại.`);
    }

    // Define create name file in R2
    const fileName = `challenge/${slug}.json`;
    // Package the entire JSON object (including the test_cases array) into a text Buffer to push to R2
    const jsonBuffer = Buffer.from(JSON.stringify(dto, null, 2), 'utf-8');
    // auto upload to R2
    const r2Path = await this.r2Service.uploadFile(
      jsonBuffer,
      fileName,
      'application/json',
    );

    const examples = dto.test_cases
      ? dto.test_cases
          .filter((tc) => tc.type == 'sample') // get type = 'sample'
          .map((tc) => ({
            input: tc.input,
            output: tc.expected_output,
            explanation: tc.explanation || '',
          }))
      : [];

    const newChallenge = new this.challengeModel({
      title: dto.problem_name,
      slug: slug,
      categoryId: dto.categoryId,
      difficulty: dto.difficulty,
      description: dto.description,
      challengeType: dto.challengeType,
      patternGroup: dto.patternGroup,
      examples: examples,
      testcasePath: r2Path,
    });

    await newChallenge.save();

    // CRITICAL FIX: Create individual TestCase documents so handleSubmit can find them.
    if (dto.test_cases && dto.test_cases.length > 0) {
      const testCaseDocs = dto.test_cases.map((tc) => ({
        challengeId: newChallenge._id,
        type: tc.type,
        input: tc.input,
        expectedOutput: tc.expected_output,
        explanation: tc.explanation,
        // Assuming small testcases are stored directly.
        // Logic for uploading large files to R2 and getting storageRef would go here.
        storageRef: {
          inputUrl: '',
          outputUrl: '',
        },
      }));
      await this.testCaseModel.insertMany(testCaseDocs);
    }

    return newChallenge;
  }

  private async filterChallengesWithTestCases<
    T extends { _id: Types.ObjectId },
  >(challenges: T[]): Promise<T[]> {
    if (challenges.length === 0) {
      return [];
    }

    const challengeIds = challenges.map((challenge) => challenge._id);

    const testCases = await this.testCaseModel
      .find({
        challengeId: { $in: challengeIds },
        isActive: { $ne: false },
      })
      .select('challengeId')
      .lean();

    const challengeIdsWithTestCases = new Set(
      testCases.map((testCase: any) => testCase.challengeId.toString()),
    );

    return challenges.filter((challenge) =>
      challengeIdsWithTestCases.has(challenge._id.toString()),
    );
  }

  // GET all the exercises for the active roadmap of the user
  async getExercises(userId: string) {
    const activeRoadmap = await this.userRoadmapModel
      .findOne({ userId: new Types.ObjectId(userId), status: 'active' })
      .exec();

    if (!activeRoadmap) {
      const challenges = await this.challengeModel
        .find({
          isActive: { $ne: false },
          challengeType: 'coding',
        })
        .lean();

      return this.filterChallengesWithTestCases(challenges);
    }

    const template = await this.templateModel
      .findById(activeRoadmap.templateId)
      .exec();

    if (!template || !template.nodes || template.nodes.length === 0) {
      return [];
    }

    const challengeIds = template.nodes.flatMap(
      (node) => node.challengeIds || [],
    );

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
  async updateChallenge(id: string, dto: CreateChallengeDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Định dạng ID bài tập không hợp lệ');
    }

    const challenge = await this.challengeModel.findById(id).exec();
    if (!challenge) {
      throw new NotFoundException('Không tìm thấy bài tập cần cập nhật');
    }

    const shouldUpdateDbTestcases = dto.test_cases !== undefined;

    if (!shouldUpdateDbTestcases) {
      // Load existing test cases to keep R2 file complete
      const existingTestCases = await this.testCaseModel
        .find({ challengeId: challenge._id })
        .exec();
      dto.test_cases = existingTestCases.map((tc, index) => ({
        id: index + 1,
        type: tc.type,
        input: tc.input || '',
        expected_output: tc.expectedOutput || '',
        explanation: tc.explanation || '',
      }));
    }

    try {
      const fileName = `challenge/${challenge.slug}.json`;
      const jsonBuffer = Buffer.from(JSON.stringify(dto, null, 2), 'utf-8');
      await this.r2Service.uploadFile(jsonBuffer, fileName, 'application/json');
    } catch (error) {
      console.error('Lỗi cập nhật R2 backup:', error);
    }

    const examples = dto.test_cases
      ? dto.test_cases
          .filter((tc) => tc.type === 'sample')
          .map((tc) => ({
            input: tc.input,
            output: tc.expected_output,
            explanation: tc.explanation || '',
          }))
      : [];

    challenge.title = dto.problem_name;
    challenge.categoryId = new Types.ObjectId(dto.categoryId);
    challenge.difficulty = dto.difficulty as Challenge['difficulty'];
    challenge.description = dto.description;
    challenge.challengeType = dto.challengeType;
    challenge.patternGroup = dto.patternGroup;
    challenge.examples = examples;
    await challenge.save();

    if (shouldUpdateDbTestcases) {
      await this.testCaseModel
        .deleteMany({ challengeId: challenge._id })
        .exec();

      if (dto.test_cases && dto.test_cases.length > 0) {
        const testCaseDocs = dto.test_cases.map((tc) => ({
          challengeId: challenge._id,
          type: tc.type,
          input: tc.input,
          expectedOutput: tc.expected_output,
          explanation: tc.explanation,
          storageRef: {
            inputUrl: '',
            outputUrl: '',
          },
        }));
        await this.testCaseModel.insertMany(testCaseDocs);
      }
    }

    return challenge;
  }

  async deleteChallenge(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Định dạng ID bài tập không hợp lệ');
    }

    const deletedChallenge = await this.challengeModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedChallenge) {
      throw new NotFoundException('Không tìm thấy bài tập để xóa');
    }

    await this.testCaseModel
      .deleteMany({ challengeId: new Types.ObjectId(id) })
      .exec();

    return {
      success: true,
      message: `Đã xóa thành công bài tập "${deletedChallenge.title}" cùng các testcases liên quan.`,
    };
  }

  async getTestCasesByChallenge(challengeId: string) {
    if (!Types.ObjectId.isValid(challengeId)) {
      throw new BadRequestException('Định dạng ID bài tập không hợp lệ');
    }
    return this.testCaseModel
      .find({ challengeId: new Types.ObjectId(challengeId) })
      .exec();
  }

  async getAllCategories() {
    return await this.categoryModel.find({}, '_id name').exec();
  }
}
