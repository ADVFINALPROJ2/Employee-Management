import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }

  @Get('employee')
  getEmployeeDashboard(@Query('employeeId') employeeId: string) {
    return this.dashboardService.getEmployeeDashboard(employeeId);
  }
}