import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
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

  @Get('history')
  async getMyHistory(@Request() req: any) {
    return this.leaveService.getMyHistory(req.user.employee_id);
  }

  @Get(':id')
  async getMyRequest(@Param('id') leaveId: string, @Request() req: any) {
    return this.leaveService.getMyRequest(leaveId, req.user.employee_id);
  }

  @Patch(':id')
  async updateMyRequest(@Param('id') leaveId: string, @Body() dto: any, @Request() req: any) {
    return this.leaveService.updateMyRequest(leaveId, req.user.employee_id, dto);
  }

  @Delete(':id')
  async deleteMyRequest(@Param('id') leaveId: string, @Request() req: any) {
    return this.leaveService.deleteMyRequest(leaveId, req.user.employee_id);
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
