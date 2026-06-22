import { IsUUID, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class AdjustBalanceDto {
  @IsUUID('4', { message: 'A valid employee resource UUID string is required.' })
  @IsNotEmpty()
  employee_id!: string;

  @IsUUID('4', { message: 'A valid leave classification category UUID string is required.' })
  @IsNotEmpty()
  leave_type_id!: string;

  @IsInt({ message: 'Day increment modification balance differential value must be an integer.' })
  @IsNotEmpty()
  amount!: number; // e.g., 5 to add days, -3 to deduct days

  @IsString()
  @IsNotEmpty({ message: 'Audit explanation reasoning log is required.' })
  reason!: string;
}