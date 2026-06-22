import { Module } from '@nestjs/common';
import { LeaveAdminController } from './leave-admin.controller';
import { LeaveAdminService } from './leave-admin.service';

@Module({
  controllers: [LeaveAdminController],
  providers: [LeaveAdminService],
  exports: [LeaveAdminService], // Export if other modules need this service
})
export class AdminModule {}