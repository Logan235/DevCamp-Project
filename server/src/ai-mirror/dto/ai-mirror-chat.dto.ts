import {
  IsBoolean,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AiMirrorChatDto {
  @IsString()
  @MaxLength(5000)
  message!: string;

  @IsOptional()
  @IsMongoId()
  challengeId?: string;

  @IsOptional()
  @IsMongoId()
  submissionId?: string;

  @IsOptional()
  @IsBoolean()
  includeLatestSubmission?: boolean;
}
