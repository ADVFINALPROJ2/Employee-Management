import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeaveTypeDto } from './dto/create-leave-type.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { UpdateLeaveStatusDto } from './dto/update-status.dto';

@Injectable()
export class LeaveAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummaryCounters() {
    const totalRequests = await this.prisma.leaveRequest.count();
    const pending = await this.prisma.leaveRequest.count({ where: { status: 'PENDING' } });
    const approved = await this.prisma.leaveRequest.count({ where: { status: 'APPROVED' } });
    const rejected = await this.prisma.leaveRequest.count({ where: { status: 'REJECTED' } });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentlyOnLeave = await this.prisma.leaveRequest.count({
      where: {
        status: 'APPROVED',
        start_date: { lte: today },
        end_date: { gte: today },
      },
    });

    return { totalRequests, pending, approved, rejected, currentlyOnLeave };
  }

  async getFilteredApplications(status?: string, leave_type_id?: string, department_id?: string, search?: string) {
    const filters: any = {};
    
    // Updated: Case-insensitive filter for robustness
    if (status && status !== 'ALL') {
      filters.status = { equals: status, mode: 'insensitive' };
    }
    
    if (leave_type_id) filters.leave_type_id = leave_type_id;
    if (search) {
      filters.employee = {
        full_name: { contains: search, mode: 'insensitive' },
      };
    }

    return this.prisma.leaveRequest.findMany({
      where: filters,
      include: { employee: true, leave_type: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async getApplicationContext(leave_id: string) {
    const context = await this.prisma.leaveRequest.findUnique({
      where: { leave_id },
      include: { employee: true, leave_type: true },
    });
    if (!context) throw new NotFoundException('The requested leave record could not be mapped.');
    return context;
  }

  async evaluateRequestState(leave_id: string, admin_id: string, dto: UpdateLeaveStatusDto) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { leave_id },
    });

    if (!request) throw new NotFoundException('Target application record missing.');
    if (request.status.toUpperCase() !== 'PENDING') {
      throw new BadRequestException('This application has already been processed.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.leaveRequest.update({
        where: { leave_id },
        data: { 
          status: dto.status, 
          remarks: dto.remarks, 
          approved_by: admin_id 
        },
      });

      await tx.auditLog.create({
        data: {
          action: dto.status === 'APPROVED' ? 'APPROVE_LEAVE' : 'REJECT_LEAVE',
          entity_id: leave_id,
          admin_id: admin_id,
          details: `Admin processed leave request ${leave_id} to ${dto.status}. Remarks: ${dto.remarks || 'None'}`,
        },
      });

      if (dto.status === 'APPROVED') {
        const spanDays = Math.ceil(Math.abs(new Date(request.end_date).getTime() - new Date(request.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const currentBalance = await tx.leaveBalance.findFirst({
          where: { employee_id: request.employee_id, leave_type_id: request.leave_type_id },
        });

        if (!currentBalance) throw new BadRequestException('Employee balance profile not initialized.');

        const usedDays = Number(currentBalance.used_days ?? 0);
        const remainingDays = Number(currentBalance.remaining_days ?? 0);

        if (remainingDays < spanDays) throw new BadRequestException('Insufficient leave balance.');

        await tx.leaveBalance.update({
          where: { balance_id: currentBalance.balance_id },
          data: { used_days: usedDays + spanDays, remaining_days: remainingDays - spanDays },
        });
      }
      return updatedRequest;
    });
  }

  async provisionLeaveType(dto: CreateLeaveTypeDto) {
    return this.prisma.leaveType.create({
    data: { 
    name: dto.name,
    description: dto.description,
    is_paid: dto.is_paid ?? true,
    max_days: dto.max_days
         },
    });
  }

  async updateLeaveType(id: string, dto: CreateLeaveTypeDto) {
    return this.prisma.leaveType.update({
      where: { leave_type_id: id },
      data: {
        name: dto.name,
        description: dto.description,
        is_paid: dto.is_paid ?? true,
        max_days: dto.max_days,
      },
    });
  }

  async deleteLeaveType(id: string) {
    return this.prisma.leaveType.delete({
      where: { leave_type_id: id },
    });
  }

  async findAllLeaveTypes() {
    return await this.prisma.leaveType.findMany();
  }

  async overrideEmployeeBalance(admin_id: string, dto: AdjustBalanceDto) {
    return this.prisma.$transaction(async (tx) => {
      const balanceRecord = await tx.leaveBalance.findFirst({
        where: { employee_id: dto.employee_id, leave_type_id: dto.leave_type_id },
      });

      let updatedBalance;
      if (!balanceRecord) {
        if (dto.amount < 0) throw new BadRequestException('Cannot set negative balance.');
        updatedBalance = await tx.leaveBalance.create({
          data: {
            employee_id: dto.employee_id,
            leave_type_id: dto.leave_type_id,
            total_days: dto.amount,
            remaining_days: dto.amount,
          },
        });
      } else {
        const modifiedTotal = balanceRecord.total_days + dto.amount;
        const modifiedRemaining = balanceRecord.remaining_days + dto.amount;
        if (modifiedRemaining < 0 || modifiedTotal < 0) throw new BadRequestException('Invalid balance result.');
        updatedBalance = await tx.leaveBalance.update({
          where: { balance_id: balanceRecord.balance_id },
          data: { total_days: modifiedTotal, remaining_days: modifiedRemaining },
        });
      }

      await tx.auditLog.create({
        data: {
          action: 'MANUAL_BALANCE_ADJUST',
          entity_id: updatedBalance.balance_id,
          admin_id: admin_id,
          details: `Admin adjusted balance by ${dto.amount} for employee ${dto.employee_id}`,
        },
      });

      return updatedBalance;
    });
  }

  async generateExtractionReport() {
    return this.prisma.leaveRequest.findMany({
      include: { employee: true, leave_type: true },
      orderBy: { start_date: 'asc' },
    });
  }

  async getReportData(filters: { 
    startDate?: Date, 
    endDate?: Date, 
    departmentId?: string, 
    leaveTypeId?: string 
  }) {
    return this.prisma.leaveRequest.findMany({
      where: {
        AND: [
          filters.startDate ? { start_date: { gte: filters.startDate } } : {},
          filters.endDate ? { end_date: { lte: filters.endDate } } : {},
          filters.departmentId ? { employee: { department_id: filters.departmentId } } : {},
          filters.leaveTypeId ? { leave_type_id: filters.leaveTypeId } : {},
        ]
      },
      include: { employee: true, leave_type: true },
      orderBy: { start_date: 'desc' }
    });
  }

  async getAuditLogs(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.prisma.auditLog.findMany({
      take: limit,
      skip: skip,
      orderBy: { created_at: 'desc' },
    });
  }
}