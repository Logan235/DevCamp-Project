import {
  Controller,
  Get,
  Param,
  Request,
  UseGuards,
  Post,
  Body,
  HttpCode,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard, Roles } from '../auth/guards/role.guard';
import type { RequestWithUser } from '../interfaceFile/interface';
import {
  RunCodeDto,
  SubmitExerciseDto,
  CreateChallengeDto,
} from './dto/submit.dto';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  // @Roles('admin') import role.guard.ts later
  // @UseGuards(JwtAuthGuard)
  @HttpCode(201)
  async createChallenge(@Body() createChallengeDto: CreateChallengeDto) {
    return await this.exerciseService.createChallengeWithTestCases(
      createChallengeDto,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getExercises(@Request() req: RequestWithUser) {
    const userId = req.user.userId;
    return this.exerciseService.getExercises(userId);
  }

  @Get(':id')
  getExerciseById(@Param('id') id: string) {
    return this.exerciseService.getExerciseById(id);
  }

  // id is the challengeId
  @Post(':id/run')
  @UseGuards(JwtAuthGuard)
  runCode(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() runCodeDto: RunCodeDto,
  ) {
    const userId = req.user.userId;
    return this.exerciseService.handleRun(userId, id, runCodeDto);
  }

  // id is the challengeId
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user')
  submitCode(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() submitCodeDto: SubmitExerciseDto,
  ) {
    const userId = req.user.userId;
    return this.exerciseService.handleSubmit(userId, id, submitCodeDto);
  }
}
