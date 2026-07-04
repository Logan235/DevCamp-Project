import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitMilestoneDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsString()
  evidenceUrl?: string;
}
