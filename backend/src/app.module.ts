import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { GrievanceModule } from './grievance/grievance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AttendanceModule, LeaveModule, GrievanceModule, DashboardModule, EmployeeModule],
})
export class AppModule {}
