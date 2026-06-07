import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsUUID, MaxLength, IsIn } from 'class-validator';

export class CreateGrievanceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title!: string; // From document: VARCHAR(150), NOT NULL

  @IsString()
  @IsNotEmpty()
  description!: string; // From document: TEXT, NOT NULL

  @IsString()
  @IsNotEmpty()
  @IsIn(['Workplace issue', 'Harassment', 'Salary', 'Other'])
  category!: string; // From document: Categories dropdown options

  @IsBoolean()
  @IsOptional()
  is_anonymous?: boolean; // From document: Anonymous (checkbox), DEFAULT FALSE

  @IsUUID()
  @IsNotEmpty()
  employee_id!: string; // From document: Employee ID (UUID), NOT NULL
}
