import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async createRequest(dto: CreateLeaveRequestDto) {
    const { employeeId, leaveTypeId, startDate, endDate, reason } = dto;

    // 1. Calculate total calendar days requested
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 2. Look up the employee's remaining leave balance
    const balance = await this.prisma.leaveBalance.findFirst({
      where: {
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
      },
    });

    if (!balance) {
      throw new BadRequestException('No leave balance profile found for this employee.');
    }

    if (balance.remaining_days < totalDays) {
      throw new BadRequestException(`Insufficient balance. Requested: ${totalDays} days, Available: ${balance.remaining_days} days.`);
    }

    // 3. Run database transaction: Save the request AND deduct the balance safely
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.leaveRequest.create({
        data: {
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          start_date: start,
          end_date: end,
          reason,
          status: 'Pending', // Matches the exact "Pending" casing in your schema
        },
      });

      await tx.leaveBalance.update({
        where: {
          employee_id_leave_type_id: {
            employee_id: employeeId,
            leave_type_id: leaveTypeId,
          },
        },
        data: { 
          remaining_days: balance.remaining_days - totalDays,
          used_days: balance.used_days + totalDays,
        },
      });

      return request;
    });
  }

  async findAllRequests() {
    return this.prisma.leaveRequest.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  // 👑 NEW: Handle Manager Approvals or Rejections with automated balance refunds
  async updateStatus(leaveId: string, status: 'Approved' | 'Rejected', approverId: string) {
    // 1. Find the target leave request
    const request = await this.prisma.leaveRequest.findUnique({
      where: { leave_id: leaveId },
    });

    if (!request) {
      throw new BadRequestException('Leave request not found.');
    }

    if (request.status.toUpperCase() !== 'PENDING') {
      throw new BadRequestException('This leave request has already been processed.');
    }

    // 2. Process status update inside an atomic transaction block
    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.leaveRequest.update({
        where: { leave_id: leaveId },
        data: {
          status: status.toUpperCase(),
          approved_by: approverId,
        },
      });

      // 3. IF REJECTED: Calculate time slice and fully refund their balance
      if (status.toUpperCase() === 'REJECTED') {
        const start = new Date(request.start_date);
        const end = new Date(request.end_date);
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        await tx.leaveBalance.update({
          where: {
            employee_id_leave_type_id: {
              employee_id: request.employee_id,
              leave_type_id: request.leave_type_id,
            },
          },
          data: {
            remaining_days: { increment: totalDays },
            used_days: { decrement: totalDays },
          },
        });
      }

      return updatedRequest;
    });
  }
}