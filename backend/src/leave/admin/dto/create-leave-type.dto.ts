import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'Classification label identifier name is required.' })
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  is_paid?: boolean;

  @IsInt({ message: 'Maximum day allocation must be a whole number.' })
  @Min(0, { message: 'Maximum day allocation cannot be negative.' })
  max_days!: number;
}