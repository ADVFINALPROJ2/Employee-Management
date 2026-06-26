import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('leave')
@UseGuards(JwtAuthGuard)
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async submitLeave(@Body() dto: CreateLeaveDto, @Request() req: any) {
    dto.employeeId = req.user.employee_id;
    return this.leaveService.createLeaveRequest(dto);
  }

  @Get('balance')
  async getBalances(@Request() req: any) {
    return this.leaveService.getLeaveBalances(req.user.employee_id);
  }

  @Get('requests')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async findAllRequests() {
    return this.leaveService.findAllRequests();
  }

  @Patch('status/:id')
  @UseGuards(RolesGuard)
  @Roles('Admin')
  async updateStatus(
    @Param('id') leaveId: string,
    @Body('status') status: 'Approved' | 'Rejected',
    @Request() req: any,
  ) {
    return this.leaveService.updateStatus(leaveId, status, req.user.employee_id);
  }
}
