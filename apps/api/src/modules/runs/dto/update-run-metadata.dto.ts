import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRunMetadataDto {
  @IsOptional()
  @IsString()
  codeRef?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  randomSeed?: number | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}
