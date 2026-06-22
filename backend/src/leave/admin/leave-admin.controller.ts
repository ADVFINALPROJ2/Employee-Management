import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { LeaveAdminService } from './leave-admin.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { UpdateLeaveStatusDto } from './dto/update-status.dto';
// import { AdminAuthGuard } from '../auth/Fadmin-auth.guard'; // Uncomment and adjust path

@Controller('leave/admin')
export class LeaveAdminController {

  constructor(private readonly leaveAdminService: LeaveAdminService) {}

  @Get('types')
  async getAllLeaveTypes() {
    return await this.leaveAdminService.findAllLeaveTypes();
  }

  @Get('dashboard-summary')
  async getDashboardSummary() {
    return this.leaveAdminService.getSummaryCounters();
  }

  @Get('manage')
  async manageRequests(@Query() query: any) {
    return this.leaveAdminService.getFilteredApplications(
      query.status, 
      query.leave_type_id, 
      query.department_id, 
      query.search
    );
  }

  @Get('request/:id')
  async getDetailedView(@Param('id') leave_id: string) {
    return this.leaveAdminService.getApplicationContext(leave_id);
  }

  @Patch('request/:id/process')
  async processApplication(
    @Param('id') leave_id: string, 
    @Body() dto: UpdateLeaveStatusDto, 
    @Req() req: any
  ) {
    const admin_id = req.user?.employee_id || '00000000-0000-0000-0000-000000000001';
    return this.leaveAdminService.evaluateRequestState(leave_id, admin_id, dto);
  }

  @Post('types')
  async configureNewLeaveType(@Body() dto: CreateLeaveTypeDto) {
    return this.leaveAdminService.provisionLeaveType(dto);
  }
  @Patch('types/:id')
  async updateLeaveType(@Param('id') id: string, @Body() dto: CreateLeaveTypeDto) {
    return this.leaveAdminService.updateLeaveType(id, dto);
  }

  @Delete('types/:id')
  async deleteLeaveType(@Param('id') id: string) {
    return this.leaveAdminService.deleteLeaveType(id);
  }

  @Post('balances/override')
  async executeManualAdjustment(@Body() dto: AdjustBalanceDto, @Req() req: any) {
    const admin_id = req.user?.employee_id || '00000000-0000-0000-0000-000000000001';
    return this.leaveAdminService.overrideEmployeeBalance(admin_id, dto);
  }

  @Get('reports/summary')
  async runExtractionPipeline() {
    return this.leaveAdminService.generateExtractionReport();
  }

@Get('reports')
  async getReport(@Query() query: any) {
    const filters = {
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      departmentId: query.departmentId,
      leaveTypeId: query.leaveTypeId,
    };
    return this.leaveAdminService.getReportData(filters);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.leaveAdminService.getAuditLogs(Number(page), Number(limit));
  }
}