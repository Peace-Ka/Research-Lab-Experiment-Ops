import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateRunDto {
  @IsString()
  createdById!: string;

  @IsOptional()
  @IsString()
  codeRef?: string;

  @IsOptional()
  envSnapshot?: Record<string, unknown>;

  @IsOptional()
  @IsInt()
  @Min(0)
  randomSeed?: number;

  @IsOptional()
  @IsString()
  datasetId?: string;

  @IsOptional()
  @IsString()
  datasetVersionId?: string;

  @IsOptional()
  @IsString()
  modelId?: string;

  @IsOptional()
  @IsString()
  modelVersionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}