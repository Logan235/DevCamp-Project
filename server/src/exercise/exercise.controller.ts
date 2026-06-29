import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { SubmitExerciseDto } from './dto/submit.dto';
import { RoleGuard, Roles } from '../auth/guards/role.guard';
import type { RequestWithUser } from '../interfaceFile/interface';

@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

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

  @Post(':id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('user') //Chỉ có user mới có quyền nộp bài
  postExercise(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
    @Body() body: SubmitExerciseDto,
  ) {
    const userId = req.user.userId;
    return this.exerciseService.postExercise(userId, id, body);
  }
}
