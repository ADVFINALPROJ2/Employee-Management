import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LeaveEmployeeService } from './leave-employee.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveEmployeeController {
  constructor(private readonly leaveEmployeeService: LeaveEmployeeService) {}

  @Post()
  async submitLeave(@Body() dto: CreateLeaveDto, @Request() req: any) {
    dto.employeeId = req.user.employee_id;
    return this.leaveEmployeeService.submitLeave(dto);
  }

  @Get('balance')
  async getBalances(@Request() req: any) {
    return this.leaveEmployeeService.getBalances(req.user.employee_id);
  }
}
