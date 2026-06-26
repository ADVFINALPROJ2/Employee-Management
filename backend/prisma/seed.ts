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
  const adminEmail = 'admin@company.com';
  const existing = await prisma.employee.findFirst({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log('Admin user already exists, skipping seed.');
    return;
  }

  const department = await prisma.department.upsert({
    where: { name: 'Management' },
    update: {},
    create: { name: 'Management', description: 'Company management team' },
  });

  const address = await prisma.address.create({
    data: {
      country: 'US',
      city: 'New York',
      state: 'NY',
    },
  });

  await prisma.employee.create({
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

  console.log(`Seeded admin user: ${adminEmail} / Admin@123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());