import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
  const departments = [
    { name: 'Management', description: 'Company management team' },
    { name: 'Engineering', description: 'Software engineering department' },
    { name: 'Sales', description: 'Sales and marketing department' },
    { name: 'HR', description: 'Human resources department' },
    { name: 'Design', description: 'Design and UX department' },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }
  console.log(`Seeded ${departments.length} departments`);

  const leaveTypes = [
    { name: 'Annual', description: 'Annual leave', is_paid: true },
    { name: 'Sick', description: 'Sick leave', is_paid: true },
    { name: 'Maternity', description: 'Maternity leave', is_paid: true },
    { name: 'Unpaid', description: 'Unpaid leave', is_paid: false },
  ];

  for (const lt of leaveTypes) {
    await prisma.leaveType.upsert({
      where: { name: lt.name },
      update: {},
      create: lt,
    });
  }
  console.log(`Seeded ${leaveTypes.length} leave types`);

  const adminEmail = 'admin@company.com';
  const existing = await prisma.employee.findFirst({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log('Admin user already exists, skipping admin seed.');
    return;
  }

  const department = await prisma.department.findUniqueOrThrow({
    where: { name: 'Management' },
  });

  const address = await prisma.address.create({
    data: {
      country: 'US',
      city: 'New York',
      state: 'NY',
    },
  });

  const employee = await prisma.employee.create({
    data: {
      full_name: 'Admin User',
      email: adminEmail,
      password: await hashPassword('Admin@123'),
      phone: '+1-555-0001',
      role: 'Admin',
      status: 'Active',
      hire_date: new Date('2024-01-01'),
      position: 'System Administrator',
      department_id: department.department_id,
      address_id: address.address_id,
    },
  });

  for (const lt of leaveTypes) {
    const leaveType = await prisma.leaveType.findUniqueOrThrow({
      where: { name: lt.name },
    });
    await prisma.leaveBalance.upsert({
      where: {
        employee_id_leave_type_id: {
          employee_id: employee.employee_id,
          leave_type_id: leaveType.leave_type_id,
        },
      },
      update: {},
      create: {
        employee_id: employee.employee_id,
        leave_type_id: leaveType.leave_type_id,
        total_days: lt.is_paid ? 20 : 10,
        used_days: 0,
        remaining_days: lt.is_paid ? 20 : 10,
      },
    });
  }

  console.log(`Seeded admin user: ${adminEmail} / Admin@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
