import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('grievance')
@UseGuards(JwtAuthGuard)
export class GrievanceController {}
