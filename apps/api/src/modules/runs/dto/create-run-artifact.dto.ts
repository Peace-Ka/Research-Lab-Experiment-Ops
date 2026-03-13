import { IsEnum } from 'class-validator';
import { ArtifactType } from '@prisma/client';

export class CreateRunArtifactDto {
  @IsEnum(ArtifactType)
  type!: ArtifactType;
}
