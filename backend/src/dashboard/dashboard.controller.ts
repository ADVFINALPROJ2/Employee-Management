import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  getAdminDashboard() {
    return this.dashboardService.getAdminDashboard();
  }
  @Get('employee')
  getEmployeeDashboard() {
    return this.dashboardService.getEmployeeDashboard();
  }
}