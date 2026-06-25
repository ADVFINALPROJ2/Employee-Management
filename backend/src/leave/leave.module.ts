import { Module } from '@nestjs/common';
import { LeaveEmployeeController } from './employee/leave-employee.controller';
import { LeaveEmployeeService } from './employee/leave-employee.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LeaveEmployeeController],
  providers: [LeaveEmployeeService],
})
export class LeaveModule {}
