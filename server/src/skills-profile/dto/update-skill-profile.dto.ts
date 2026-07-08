import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class PerformanceByCategoryDto {
  @IsString()
  @IsNotEmpty()
  category!: string;
}

class AssessmentDetailDto {
  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  status!: string;
}

export class UpdateSkillProfileDto {
  @IsArray()
  @IsOptional()
  aiAnalyses?: any[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AssessmentDetailDto)
  details?: AssessmentDetailDto[];
}

