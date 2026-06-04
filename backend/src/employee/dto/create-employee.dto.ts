import { IsDateString, isDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  full_name!: string;

  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  role?: string; 

  @IsOptional()
  department_id?: string;

  @IsOptional()
  position?: string;

  @IsOptional()
  @IsDateString()
  hire_date?: string;
}