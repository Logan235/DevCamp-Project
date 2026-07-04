import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class SubmissionDto {
  @IsString()
  @IsNotEmpty()
  source_code: string;

  @IsNumber()
  language_id: number;

  @IsOptional()
  @IsString()
  stdin?: string;

  @IsOptional()
  @IsString()
  expected_output?: string;

  @IsOptional()
  @IsNumber()
  cpu_time_limit?: number;

  @IsOptional()
  @IsNumber()
  memory_limit?: number;
}
