import { IsNotEmpty, IsObject } from 'class-validator';

export class GenerateRoadmapDto {
  @IsNotEmpty()
  @IsObject()
  assessmentResult: any;
}
