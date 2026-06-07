import { IsNotEmpty, IsString, IsIn } from 'class-validation';

export class UpdateGrievanceStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['Under Review', 'Resolved', 'Rejected'])
  status: string; // From document: Status (Under review, Resolved, Rejected)[cite: 1]
}