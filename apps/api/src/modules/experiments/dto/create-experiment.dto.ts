import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateExperimentDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsOptional()
  @IsString()
  hypothesis?: string;

  @IsString()
  createdById!: string;
}