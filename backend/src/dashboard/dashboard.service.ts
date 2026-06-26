import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getEmployeeDashboard(employee_id: string) {
    const pendingLeaves = await this.prisma.leaveRequest.count({
      where: {
        employee_id: employee_id,
        status: 'Pending',
      },
    });

    const approvedLeaves = await this.prisma.leaveRequest.count({
      where: {
        employee_id: employee_id,
        status: 'Approved',
      },
    });

    const openGrievances = await this.prisma.grievance.count({
      where: {
        employee_id: employee_id,
        status: 'Under Review',
      },
    });

    const leaveBalance = await this.prisma.leaveBalance.findMany({
      where: {
        employee_id: employee_id,
      },
      select: {
        leave_type: {
          select: { name: true },
        },
        remaining_days: true,
      },
    });

    return {
      pendingLeaves,
      approvedLeaves,
      openGrievances,
      leaveBalance
    };
  }

  async getAdminDashboard() {
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