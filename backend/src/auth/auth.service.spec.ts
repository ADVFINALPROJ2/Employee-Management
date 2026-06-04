import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

describe('AuthService login', () => {
  const employee = {
    employee_id: '11111111-1111-1111-1111-111111111111',
    full_name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'Admin',
    status: 'Active',
  };

  const createService = (foundEmployee: typeof employee | null = employee) => {
    const prisma = {
      employee: {
        findFirst: jest.fn().mockResolvedValue(foundEmployee),
      },
      session: {
        create: jest.fn().mockResolvedValue({}),
      },
    };

    return new AuthService(prisma as never);
  };

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('logs in an active employee', async () => {
    const service = createService();

    const response = await service.login({
      email: 'admin@example.com',
      password: 'password123',
    });

    expect(response.tokenType).toBe('Bearer');
    expect(response.token).toBeTruthy();
    expect(response.user.email).toBe(employee.email);
  });

  it('rejects wrong credentials', async () => {
    const service = createService();

    await expect(
      service.login({
        email: 'admin@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
