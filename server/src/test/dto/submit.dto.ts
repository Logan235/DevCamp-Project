import { IsArray, IsMongoId, IsString } from 'class-validator';

export class SubmitAssessmentDto {
  @IsMongoId()
  assessmentId: string;

  @IsArray()
  @IsString({ each: true })
  userCodeOutput: string[];
}
