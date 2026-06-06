import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateLeaveStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsIn(['Approved', 'Rejected', 'APPROVED', 'REJECTED'])
  status!: 'Approved' | 'Rejected' | 'APPROVED' | 'REJECTED'; // Added ! here

  @IsNotEmpty()
  @IsString()
  approverId!: string; // Added ! here
}