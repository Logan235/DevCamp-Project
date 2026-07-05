import { IsString, MinLength } from 'class-validator';

export class SubmitExerciseDto {
  @IsString()
  language: string;

  @IsString()
  @MinLength(1)
  code: string;
}

export class RunCodeDto {
  @IsString()
  language: string;

  @IsString()
  code: string;

  @IsString()
  stdin: string;
}
