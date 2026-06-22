import { IsString, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateLeaveStatusDto {
  @IsString()
  @IsNotEmpty()
  // Updated to match your frontend's 'APPROVED' and 'REJECTED' strings
  @IsIn(['APPROVED', 'REJECTED'], { 
    message: 'Status must be either APPROVED or REJECTED.' 
  })
  status!: string;

  @IsString()
  @IsOptional()
  remarks?: string;
}