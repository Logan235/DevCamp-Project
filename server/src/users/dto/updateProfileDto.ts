import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfile {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'displayName should not be empty' })
  displayName?: string;
}
