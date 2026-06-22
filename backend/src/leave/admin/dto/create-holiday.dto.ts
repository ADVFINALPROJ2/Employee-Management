import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateHolidayDto {
  @IsString()
  @IsNotEmpty({ message: 'Holiday designation name label is required.' })
  name!: string;

  @IsDateString({}, { message: 'Holiday calendar execution target must be a valid ISO date.' })
  @IsNotEmpty()
  date!: string;
}