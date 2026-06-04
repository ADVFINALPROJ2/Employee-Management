import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class EmployeeService {
  constructor(private prisma:PrismaService){}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const emp = await this.prisma.employee.findUnique({
      where:{email:createEmployeeDto.email}
    })
    if (emp){
      throw new BadRequestException('Email already exists')
    }

    const data = {
      full_name: createEmployeeDto.full_name,
        email: createEmployeeDto.email,
        password: createEmployeeDto.password, 
        phone: createEmployeeDto.phone,
        role: createEmployeeDto.role || 'Employee',
        status: 'Active',
        hire_date: createEmployeeDto.hire_date? new Date(createEmployeeDto.hire_date): new Date(),
        department_id: createEmployeeDto.department_id,
        position: createEmployeeDto.position,
    }
    return this.prisma.employee.create({data:data})
  }

  findAll(query:{department_id?:string, role?:string, status?:string, search?:string}) {
    const {department_id,role,status,search} = query;
    const where: any ={}
    
    if (department_id){
      where.department_id = department_id;
    }
    if (role){
      where.role = role;
    }
    if (status){
      where.status = status;
    }

    if (search){
      where.OR =[
        { employee_id: { contains: search, mode: 'insensitive' } },
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.employee.findMany({
      where,
      include:{department:true,},
      orderBy:{full_name:'asc'}
    });
  }

  findOne(id: string) {
    return this.prisma.employee.findUnique({
       where: { employee_id: id },
      include: {
        department: true,
        attendances: true,
        leave_requests: true,
      },
    });
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`;
  }

  remove(id: number) {
    return `This action removes a #${id} employee`;
  }
}
