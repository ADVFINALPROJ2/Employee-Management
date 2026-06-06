import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting clean terminal database setup...');

  // 1. Wipe old test data to prevent duplicate key conflicts
  await prisma.leaveBalance.deleteMany({});
  await prisma.leaveRequest.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.leaveType.deleteMany({});
  console.log('🧹 Cleaned existing records from target tables.');

  // 2. Insert a pristine Employee record with a valid UUID
  const employee = await prisma.employee.create({
    data: {
      full_name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securepassword123', // Raw text placeholder for testing
      role: 'Employee',
      status: 'Active',
      hire_date: new Date('2026-01-01'),
      position: 'Software Engineer',
    },
  });
  console.log(`👤 Created Employee with UUID: ${employee.employee_id}`);

  // 3. Insert a pristine LeaveType record
  const leaveType = await prisma.leaveType.create({
    data: {
      name: 'Annual Leave',
      description: 'Standard paid yearly vacation allowance',
      is_paid: true,
    },
  });
  console.log(`🌴 Created LeaveType with UUID: ${leaveType.leave_type_id}`);

  // 4. Link them together with a starting LeaveBalance profile
  const balance = await prisma.leaveBalance.create({
    data: {
      employee_id: employee.employee_id,
      leave_type_id: leaveType.leave_type_id,
      total_days: 20,
      remaining_days: 20,
      used_days: 0,
    },
  });
  console.log(`💰 Created LeaveBalance configuration profile!`);
  console.log('\n================================================================');
  console.log('🎉 SUCCESS! Use these IDs for your API POST network testing:');
  console.log(`EMPLOYEE_ID:  ${employee.employee_id}`);
  console.log(`LEAVE_TYPE_ID: ${leaveType.leave_type_id}`);
  console.log('================================================================');
}

main()
  .catch((error) => {
    console.error('❌ DATABASE CONFIGURATION ERROR CAUGHT IN TERMINAL:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });