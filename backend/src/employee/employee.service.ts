import { Injectable, BadRequestException, NotFoundException,InternalServerErrorException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { Prisma } from '@prisma/client';

const scryptAsync = promisify(scrypt);


@Injectable()
export class EmployeeService {
  constructor(private prisma:PrismaService){}
  

  async getDepartments() {
    return this.prisma.department.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(createEmployeeDto: CreateEmployeeDto) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(createEmployeeDto.password, salt, 64)) as Buffer;
    const hashedPassword = `scrypt:${salt}:${derivedKey.toString('hex')}`;
    const emp = await this.prisma.employee.findUnique({
      where:{email:createEmployeeDto.email}
    })
    if (emp){
      throw new BadRequestException('Email already exists')
    }

    const leaveTypes = await this.prisma.leaveType.findMany();

    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: {
          full_name: createEmployeeDto.full_name,
          email: createEmployeeDto.email,
          password: hashedPassword,
          phone: createEmployeeDto.phone,
          role: createEmployeeDto.role || 'Employee',
          status: 'Active',
          hire_date: createEmployeeDto.hire_date? new Date(createEmployeeDto.hire_date): new Date(),
          position: createEmployeeDto.position,
          department: createEmployeeDto.department_id
            ? { connect: { department_id: createEmployeeDto.department_id } }
            : undefined,
          address: createEmployeeDto.address ? {
            create: {
              country: createEmployeeDto.address.country,
              city: createEmployeeDto.address.city,
              state: createEmployeeDto.address.state,
            },
          } : undefined,
        },
        include: { address: true, department: true },
      });

      for (const lt of leaveTypes) {
        await tx.leaveBalance.create({
          data: {
            employee_id: employee.employee_id,
            leave_type_id: lt.leave_type_id,
            total_days: lt.is_paid ? 20 : 10,
            used_days: 0,
            remaining_days: lt.is_paid ? 20 : 10,
          },
        });
      }

      return employee;
    });
  }

  async findAll(query: { department_id?: string; role?: string; status?: string; search?: string; employee_id?: string }) {
    const { department_id, role, status, search, employee_id } = query;
    const where: any = {};

    if (department_id) where.department_id = department_id;
    if (role) where.role = role;
    if (status) where.status = status;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employee_id || '');
    if (employee_id && isUuid) {
      where.employee_id = employee_id;
    }

    if (search) {
      where.AND = [
        ...(where.status ? [{ status: where.status }] : []),
        {
          OR: [
            { full_name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { position: { contains: search, mode: 'insensitive' } },
          ],
        },
      ];
      delete where.status;
    }

    try {
      const employees = await this.prisma.employee.findMany({
        where,
        include: { department: true, address: true },
        orderBy: { full_name: 'asc' }
      });

      return employees.map(({ password, ...employeeWithoutPassword }) => employeeWithoutPassword);
    } catch (error) {
      console.error("Prisma Error:", error);
      throw new InternalServerErrorException("Database query failed");
    }
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: id },
      include: {
        department: true,
        attendances: true,
        leave_requests: true,
        address:true
      },
    });
    if (!employee) return null;

    const { password, ...employeeWithoutPassword } = employee;
    return employeeWithoutPassword;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: id },
      include: { address: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (dto.password) {
      const salt = randomBytes(16).toString('hex');
      const derivedKey = (await scryptAsync(dto.password, salt, 64)) as Buffer;
      dto.password = `scrypt:${salt}:${derivedKey.toString('hex')}`;
    }

    const { address, department_id, ...rest } = dto;

    return this.prisma.employee.update({
      where: { employee_id: id },
      data: {
        ...rest,
        department: department_id
          ? { connect: { department_id } }
          : undefined,

        ...(address && {
          address: employee.address
            ? {
                update: {
                  country: address.country,
                  city: address.city,
                  state: address.state,
                },
              }
            : {
                create: {
                  country: address.country,
                  city: address.city,
                  state: address.state,
                },
              },
        }),
      },
      include: {
        address: true,
        department: true,
      },
    });
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { employee_id: id },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (employee.status === 'Inactive') {
      throw new NotFoundException('Employee already deleted');
    }

    return this.prisma.employee.update({
      where: { employee_id: id },
      data: {
        status: 'Inactive', 
      },
    });
  }
}
