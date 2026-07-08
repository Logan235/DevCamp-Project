import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalysisSkillProfileDto } from './analysis-skill-profile.dto';

export class AddAiAnalysisDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => AnalysisSkillProfileDto)
  analysis!: AnalysisSkillProfileDto;
}
