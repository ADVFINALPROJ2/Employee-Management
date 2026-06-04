import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(loginDto: LoginDto) {
    const employee = await this.prisma.employee.findFirst({
      where: {
        email: {
          equals: loginDto.email.trim().toLowerCase(),
          mode: 'insensitive',
        },
      },
    });

    if (!employee || employee.status !== 'Active') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.verifyPassword(
      loginDto.password,
      employee.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const expiresAt = new Date(Date.now() + this.getExpiryMs());
    const token = this.createToken({
      sub: employee.employee_id,
      email: employee.email,
      role: employee.role,
      exp: Math.floor(expiresAt.getTime() / 1000),
    });

    await this.prisma.session.create({
      data: {
        employee_id: employee.employee_id,
        token,
        expiry_date: expiresAt,
      },
    });

    return {
      token,
      tokenType: 'Bearer',
      expiresAt: expiresAt.toISOString(),
      user: {
        id: employee.employee_id,
        fullName: employee.full_name,
        email: employee.email,
        role: employee.role,
        status: employee.status,
      },
    };
  }

  private createToken(payload: Record<string, string | number>) {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', this.getJwtSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    return `${header}.${body}.${signature}`;
  }

  private getJwtSecret() {
    return process.env.JWT_SECRET || 'development-secret';
  }

  private async verifyPassword(password: string, storedPassword: string) {
    if (!storedPassword.startsWith('scrypt:')) {
      return password === storedPassword;
    }

    const [, salt, hash] = storedPassword.split(':');
    if (!salt || !hash) {
      return false;
    }

    const storedHash = Buffer.from(hash, 'hex');
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

    return (
      storedHash.length === derivedKey.length &&
      timingSafeEqual(storedHash, derivedKey)
    );
  }

  private getExpiryMs() {
    const duration = process.env.JWT_EXPIRATION || '1d';
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 24 * 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2];

    if (unit === 's') return value * 1000;
    if (unit === 'm') return value * 60 * 1000;
    if (unit === 'h') return value * 60 * 60 * 1000;
    return value * 24 * 60 * 60 * 1000;
  }
}
