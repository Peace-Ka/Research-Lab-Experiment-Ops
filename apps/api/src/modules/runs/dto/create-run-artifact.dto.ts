import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ArtifactType } from '@prisma/client';

export class CreateRunArtifactDto {
  @IsEnum(ArtifactType)
  type!: ArtifactType;

  @IsString()
  fileName!: string;

  @IsString()
  storageKey!: string;

  @IsString()
  checksumSha256!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sizeBytes?: number;
}
