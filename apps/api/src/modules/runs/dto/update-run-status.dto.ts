import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RunStatus } from '@prisma/client';

export class UpdateRunStatusDto {
  @IsEnum(RunStatus)
  status!: RunStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}