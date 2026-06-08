import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminDashboard() {
    // existing code
  }

  async getEmployeeDashboard() {
    const totalEmployees = await this.prisma.employee.count({
      where: {
        status: 'Active',
      },
    });

    const pendingLeaves = await this.prisma.leaveRequest.count({
      where: {
        status: 'Pending',
      },
    });

    const openGrievances = await this.prisma.grievance.count({
      where: {
        status: 'Under Review',
      },
    });

    return {
      totalEmployees,
      pendingLeaves,
      openGrievances,
    };
  }
}