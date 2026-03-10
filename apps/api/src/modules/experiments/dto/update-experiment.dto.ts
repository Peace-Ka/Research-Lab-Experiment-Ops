import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateExperimentDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @IsOptional()
  @IsString()
  hypothesis?: string;
}