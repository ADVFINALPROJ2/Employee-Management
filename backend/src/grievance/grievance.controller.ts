import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { GrievanceService } from './grievance.service';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { UpdateGrievanceStatusDto } from './dto/update-grievance-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
@Controller('grievance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GrievanceController {
  constructor(private readonly grievanceService: GrievanceService) {}

  /**
   * Task [US-15: Submit Grievance]
   * POST /grievance
   * Allows any authenticated employee to submit a grievance.
   */
  @Post()
  async create(
    @Body() createGrievanceDto: CreateGrievanceDto, 
    @Request() req: any
  ) {
    // Extracts the verified employee ID from the JWT token attached to the request
    const currentEmployeeId = req.user.employee_id; 
    return this.grievanceService.create(createGrievanceDto, currentEmployeeId);
  }

  /**
   * Task [US-16: View Grievances (Admin)]
   * GET /grievance
   * Exposes endpoint to retrieve all grievances for the admin view.
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('Admin') // Restricts access strictly to Admin accounts
  async findAll() {
    return this.grievanceService.findAll();
  }

  /**
   * Task [US-17: Update Grievance Status]
   * PATCH /grievance/:id
   * Exposes endpoint for an admin to change a grievance's status.
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('Admin') // Restricts access strictly to Admin accounts
  async updateStatus(
    @Param('id') id: string, 
    @Body() updateGrievanceDto: UpdateGrievanceStatusDto
  ) {
    return this.grievanceService.updateStatus(id, updateGrievanceDto);
  }
}
