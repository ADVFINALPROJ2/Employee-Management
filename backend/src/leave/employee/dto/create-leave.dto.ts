import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateLeaveDto {
  @IsNotEmpty()
  @IsString()
  leaveTypeId!: string;

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;

  @IsNotEmpty()
  @IsString()
  reason!: string;

  employeeId?: string;
}
