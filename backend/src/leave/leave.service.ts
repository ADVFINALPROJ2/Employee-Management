import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveDto } from './dto/create-leave.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeaveRequest(dto: CreateLeaveDto) {
    const employeeId = dto.employeeId!;
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: employeeId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const leaveType = await this.prisma.leaveType.findUnique({
      where: { leave_type_id: dto.leaveTypeId },
    });
    if (!leaveType) throw new NotFoundException('Leave type not found');

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('End date cant be before start date');
    }

    // calculate how many days they're requesting
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRequested = Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;

    const balance = await this.prisma.leaveBalance.findUnique({
      where: {
        employee_id_leave_type_id: {
          employee_id: employeeId,
          leave_type_id: dto.leaveTypeId,
        },
      },
    });

    if (!balance) {
      throw new BadRequestException('No balance found for this leave type');
    }

    if (daysRequested > balance.remaining_days) {
      throw new BadRequestException(
        `Not enough leave days. You requested ${daysRequested} but only have ${balance.remaining_days} remaining`,
      );
    }

    const leaveRequest = await this.prisma.leaveRequest.create({
      data: {
        employee_id: employeeId,
        leave_type_id: dto.leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        reason: dto.reason,
        status: 'Pending',
      },
      include: {
        employee: {
          select: {
            employee_id: true,
            full_name: true,
            email: true,
          },
        },
        leave_type: {
          select: {
            name: true,
            is_paid: true,
          },
        },
      },
    });

    return {
      message: 'Leave request submitted',
      data: leaveRequest,
    };
  }

  async getLeaveBalances(employeeId: string) {
    let balances = await this.prisma.leaveBalance.findMany({
      where: { employee_id: employeeId },
      include: {
        leave_type: {
          select: { name: true, description: true },
        },
      },
    });

    if (!balances.length) {
      const leaveTypes = await this.prisma.leaveType.findMany();
      for (const lt of leaveTypes) {
        await this.prisma.leaveBalance.create({
          data: {
            employee_id: employeeId,
            leave_type_id: lt.leave_type_id,
            total_days: lt.is_paid ? 20 : 10,
            used_days: 0,
            remaining_days: lt.is_paid ? 20 : 10,
          },
        });
      }
      balances = await this.prisma.leaveBalance.findMany({
        where: { employee_id: employeeId },
        include: {
          leave_type: {
            select: { name: true, description: true },
          },
        },
      });
    }

    return balances.map((b) => ({
      leaveTypeId: b.leave_type_id,
      leaveType: b.leave_type.name,
      description: b.leave_type.description,
      total: b.total_days,
      used: b.used_days,
      remaining: b.remaining_days,
    }));
  }

  async getLeaveTypes() {
    return this.prisma.leaveType.findMany();
  }

  async findAllRequests() {
    return this.prisma.leaveRequest.findMany({
      include: {
        employee: { select: { full_name: true, email: true } },
        leave_type: { select: { name: true } },
      },
    });
  }

  async getMyHistory(employeeId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { employee_id: employeeId },
      include: { leave_type: { select: { name: true } } },
      orderBy: { start_date: 'desc' },
    });
  }

  async getMyRequest(leaveId: string, employeeId: string) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { leave_id: leaveId },
      include: { leave_type: { select: { name: true } } },
    });
    if (!request || request.employee_id !== employeeId) {
      throw new NotFoundException('Request not found or access denied');
    }
    return request;
  }

  async updateMyRequest(leaveId: string, employeeId: string, dto: { start_date?: string; end_date?: string; reason?: string }) {
    const request = await this.prisma.leaveRequest.findFirst({
      where: { leave_id: leaveId, employee_id: employeeId },
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'Pending') throw new BadRequestException('Only pending requests can be edited');

    return this.prisma.leaveRequest.update({
      where: { leave_id: leaveId },
      data: {
        ...(dto.start_date && { start_date: new Date(dto.start_date) }),
        ...(dto.end_date && { end_date: new Date(dto.end_date) }),
        ...(dto.reason && { reason: dto.reason }),
      },
    });
  }

  async deleteMyRequest(leaveId: string, employeeId: string) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { leave_id: leaveId },
    });
    if (!request || request.employee_id !== employeeId) {
      throw new NotFoundException('Request not found or access denied');
    }
    if (request.status !== 'Pending') {
      throw new BadRequestException('Only pending requests can be deleted');
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRequested = Math.floor((new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / msPerDay) + 1;

    return this.prisma.$transaction([
      this.prisma.leaveRequest.delete({ where: { leave_id: leaveId } }),
      this.prisma.leaveBalance.update({
        where: {
          employee_id_leave_type_id: {
            employee_id: request.employee_id,
            leave_type_id: request.leave_type_id,
          },
        },
        data: {
          used_days: { decrement: daysRequested },
          remaining_days: { increment: daysRequested },
        },
      }),
    ]);
  }

  async getAllBalances() {
    return this.prisma.leaveBalance.findMany({
      include: {
        employee: { select: { full_name: true, email: true } },
        leave_type: { select: { name: true } },
      },
      orderBy: [{ employee: { full_name: 'asc' } }, { leave_type: { name: 'asc' } }],
    });
  }

  async createBalance(data: { leave_type_id: string; total_days: number }) {
    const employees = await this.prisma.employee.findMany({ where: { status: 'Active' } });
    const created = [];

    for (const emp of employees) {
      const existing = await this.prisma.leaveBalance.findUnique({
        where: {
          employee_id_leave_type_id: {
            employee_id: emp.employee_id,
            leave_type_id: data.leave_type_id,
          },
        },
      });
      if (!existing) {
        const balance = await this.prisma.leaveBalance.create({
          data: {
            employee_id: emp.employee_id,
            leave_type_id: data.leave_type_id,
            total_days: data.total_days,
            used_days: 0,
            remaining_days: data.total_days,
          },
        });
        created.push(balance);
      }
    }

    return { message: `Created ${created.length} balances`, count: created.length };
  }

  async updateBalance(balanceId: string, data: { total_days?: number; used_days?: number }) {
    const balance = await this.prisma.leaveBalance.findUnique({ where: { balance_id: balanceId } });
    if (!balance) throw new NotFoundException('Balance not found');

    const updateData: any = {};
    if (data.total_days !== undefined) updateData.total_days = data.total_days;
    if (data.used_days !== undefined) updateData.used_days = data.used_days;
    if (data.total_days !== undefined || data.used_days !== undefined) {
      updateData.remaining_days = (data.total_days ?? balance.total_days) - (data.used_days ?? balance.used_days);
    }

    return this.prisma.leaveBalance.update({
      where: { balance_id: balanceId },
      data: updateData,
      include: {
        employee: { select: { full_name: true, email: true } },
        leave_type: { select: { name: true } },
      },
    });
  }

  async deleteBalance(balanceId: string) {
    const balance = await this.prisma.leaveBalance.findUnique({ where: { balance_id: balanceId } });
    if (!balance) throw new NotFoundException('Balance not found');
    return this.prisma.leaveBalance.delete({ where: { balance_id: balanceId } });
  }

  async updateStatus(leaveId: string, status: 'Approved' | 'Rejected', adminId: string) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { leave_id: leaveId },
    });

    if (!request) {
      throw new BadRequestException('The requested leave application could not be found.');
    }

    if (request.status !== 'Pending') {
      throw new BadRequestException('This leave request has already been processed.');
    }

    if (status === 'Approved') {
      const timeDiff = new Date(request.end_date).getTime() - new Date(request.start_date).getTime();
      const requestedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

      const balance = await this.prisma.leaveBalance.findFirst({
        where: {
          employee_id: request.employee_id,
          leave_type_id: request.leave_type_id,
        },
      });

      if (balance) {
        await this.prisma.leaveBalance.update({
          where: { balance_id: balance.balance_id },
          data: {
            used_days: balance.used_days + requestedDays,
            remaining_days: balance.remaining_days - requestedDays,
          },
        });
      }
    }

    return this.prisma.leaveRequest.update({
      where: { leave_id: leaveId },
      data: {
        status,
        approved_by: adminId,
      },
    });
  }
}
