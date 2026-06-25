import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async createLeaveRequest(dto: CreateLeaveRequestDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: dto.employeeId },
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
          employee_id: dto.employeeId!,
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
        employee_id: dto.employeeId!,
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

  async getLeaveHistory(employeeId: string) {
    const history = await this.prisma.leaveRequest.findMany({
      where: { employee_id: employeeId },
      include: {
        leave_type: {
          select: { name: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!history.length) {
      return { message: 'No leave requests found' };
    }

    return history;
  }

  async getLeaveBalances(employeeId: string) {
    const balances = await this.prisma.leaveBalance.findMany({
      where: { employee_id: employeeId },
      include: {
        leave_type: {
          select: { name: true, description: true },
        },
      },
    });

    if (!balances.length) {
      throw new NotFoundException('No leave balances found');
    }

    return balances.map((b) => ({
      leaveType: b.leave_type.name,
      description: b.leave_type.description,
      total: b.total_days,
      used: b.used_days,
      remaining: b.remaining_days,
    }));
  }
}
