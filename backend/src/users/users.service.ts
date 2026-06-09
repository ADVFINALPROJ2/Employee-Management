import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';

const scryptAsync = promisify(scrypt);

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: { full_name: string; email: string; password: string; role: string; phone?: string; position?: string; department_id?: string; address_id?: string }) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(createUserDto.password, salt, 64)) as Buffer;
    const hashedPassword = `scrypt:${salt}:${derivedKey.toString('hex')}`;

    return this.prisma.employee.create({
      data: {
        full_name: createUserDto.full_name,
        email: createUserDto.email.toLowerCase().trim(),
        password: hashedPassword,
        role: createUserDto.role,
        phone: createUserDto.phone,
        position: createUserDto.position,
        department_id: createUserDto.department_id,
        address_id: createUserDto.address_id,
        hire_date: new Date(),
        status: 'Active',
      },
      select: {
        employee_id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        position: true,
        created_at: true,
      },
    });
  }

  async findAll() {
    return this.prisma.employee.findMany({
      select: {
        employee_id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        position: true,
        hire_date: true,
        created_at: true,
        department: { select: { name: true } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.employee.findUnique({
      where: { employee_id: id },
      select: {
        employee_id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        position: true,
        hire_date: true,
        created_at: true,
        department: { select: { name: true } },
        address: true,
      },
    });
  }

  async update(id: string, updateUserDto: { full_name?: string; email?: string; phone?: string; position?: string; status?: string; department_id?: string }) {
    return this.prisma.employee.update({
      where: { employee_id: id },
      data: updateUserDto,
      select: {
        employee_id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.employee.delete({ where: { employee_id: id } });
    return { message: 'Employee deleted successfully' };
  }
}
