import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async submitLeave(@Body() dto: CreateLeaveRequestDto, @Request() req: any) {
    dto.employeeId = req.user.employee_id;
    return this.leaveService.createLeaveRequest(dto);
  }

  @Get('balance')
  async getBalances(@Request() req: any) {
    return this.leaveService.getLeaveBalances(req.user.employee_id);
  }
}
