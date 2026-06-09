import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {}
