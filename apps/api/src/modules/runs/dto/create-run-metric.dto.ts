import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRunMetricDto {
  @IsString()
  key!: string;

  @IsNumber()
  value!: number;

  @IsOptional()
  @IsInt()
  step?: number;
}