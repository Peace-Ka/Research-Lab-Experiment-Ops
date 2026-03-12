import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ChecklistStatus } from '@prisma/client';

export class UpdateRunChecklistStateDto {
  @IsEnum(ChecklistStatus)
  status!: ChecklistStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
