import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
