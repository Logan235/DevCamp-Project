import { IsMongoId, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class AnalysisSkillProfileDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  userId!: string;

  @IsObject()
  analysis!: Record<string, any>;
}
