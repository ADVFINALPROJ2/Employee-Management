import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { UpdateLeaveStatusDto } from './dto/update-leave-status.dto'; // Import your new DTO

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('request')
  async create(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.leaveService.createRequest(createLeaveRequestDto);
  }

  @Get('requests')
  async findAll() {
    return this.leaveService.findAllRequests();
  }

  @Put('request/:id/status')
  async updateStatus(
    @Param('id') leaveId: string,
    @Body() updateLeaveStatusDto: UpdateLeaveStatusDto // Enforce the DTO validation here
  ) {
    return this.leaveService.updateStatus(
      leaveId, 
      updateLeaveStatusDto.status as 'Approved' | 'Rejected', 
      updateLeaveStatusDto.approverId
    );
  }
}
