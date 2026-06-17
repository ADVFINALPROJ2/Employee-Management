import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, AttendanceModule, LeaveModule, GrievanceModule, DashboardModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}