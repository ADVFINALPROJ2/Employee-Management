import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path based on your exact layout
import { CreateGrievanceDto } from './dto/create-grievance.dto';[cite: 1]
import { UpdateGrievanceStatusDto } from './dto/update-grievance-status.dto';[cite: 1]

@Injectable()
export class GrievanceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Task [US-15: Submit Grievance]
   * Creates a new grievance entry in the database.
   */
  async create(createGrievanceDto: CreateGrievanceDto, currentEmployeeId: string) {
    const { title, description, category, is_anonymous } = createGrievanceDto;

    // From document: If anonymous checkbox is true, employee_id must be NULL
    const employeeIdToSave = is_anonymous ? null : currentEmployeeId;

    return this.prisma.grievance.create({
      data: {
        title,
        description,
        category,
        is_anonymous: is_anonymous ?? false, // Defaults to false if not provided
        status: 'Under Review', // From document: DEFAULT 'Under Review'
        // Connect the employee relation only if it's not anonymous[cite: 1]
        ...(employeeIdToSave && {
          employee: {
            connect: { employee_id: employeeIdToSave },
          },
        }),
      },
    });
  }

  /**
   * Task [US-16: View Grievances (Admin)]
   * Retrieves all grievances for the admin view table.[cite: 1]
   */
  async findAll() {
    return this.prisma.grievance.findMany({
      include: {
        employee: {
          select: {
            full_name: true, // Included so admin can see the employee's name if not anonymous[cite: 1]
          },
        },
      },
      orderBy: {
        created_at: 'desc', // Orders by the newest submissions first[cite: 1]
      },
    });
  }

  /**
   * Task [US-17: Update Grievance Status]
   * Updates the status of a grievance (Under Review, Resolved, Rejected).[cite: 1]
   */
  async updateStatus(id: string, updateGrievanceStatusDto: UpdateGrievanceStatusDto) {
    const { status } = updateGrievanceStatusDto;

    // Verify the grievance exists before attempting an update
    const grievanceExists = await this.prisma.grievance.findUnique({
      where: { grievance_id: id },
    });

    if (!grievanceExists) {
      throw new NotFoundException(`Grievance with ID "${id}" not found.`);
    }

    return this.prisma.grievance.update({
      where: { grievance_id: id },
      data: { status },
    });
  }
}