import { Module } from '@nestjs/common';
import { GrievanceController } from './grievance.controller';
import { GrievanceService } from './grievance.service';
import { PrismaModule } from '../prisma/prisma.module'; // Imports your Prisma setup
@Module({
  controllers: [GrievanceController],
  providers: [GrievanceService],
  imports: [PrismaModule], // Injects PrismaService dependency into this module
  exports: [GrievanceService], // Optional: Exports the service if other modules need it
})
export class GrievanceModule {}
