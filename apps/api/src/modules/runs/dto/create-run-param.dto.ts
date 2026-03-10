import { IsString, MinLength } from 'class-validator';

export class CreateRunParamDto {
  @IsString()
  @MinLength(1)
  key!: string;

  @IsString()
  value!: string;
}