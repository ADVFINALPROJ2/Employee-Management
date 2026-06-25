import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { PrismaService } from '../prisma/prisma.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

const scryptAsync = promisify(scrypt);

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.cleanupExpiredSessions();
    setInterval(() => this.cleanupExpiredSessions(), 60 * 60 * 1000);
  }

  async validateSession(employeeId: string, token: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        employee_id: employeeId,
        token,
        expiry_date: { gt: new Date() },
      },
      include: {
        employee: {
          select: {
            employee_id: true,
            full_name: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!session || session.employee.status !== 'Active') {
      throw new UnauthorizedException('Invalid or expired session');
    }

    return session.employee;
  }

  async logout(token: string) {
    await this.prisma.session.deleteMany({ where: { token } });
    return { message: 'Logged out successfully' };
  }

  async refresh(token: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        token,
        expiry_date: { gt: new Date() },
      },
      include: { employee: true },
    });

    if (!session || session.employee.status !== 'Active') {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const expiresAt = new Date(Date.now() + this.getExpiryMs());
    const newToken = this.createToken({
      sub: session.employee.employee_id,
      email: session.employee.email,
      role: session.employee.role,
      exp: Math.floor(expiresAt.getTime() / 1000),
    });

    await this.prisma.$transaction([
      this.prisma.session.delete({ where: { token_id: session.token_id } }),
      this.prisma.session.create({
        data: {
          employee_id: session.employee.employee_id,
          token: newToken,
          expiry_date: expiresAt,
        },
      }),
    ]);

    return {
      token: newToken,
      tokenType: 'Bearer',
      expiresAt: expiresAt.toISOString(),
    };
  }

  async cleanupExpiredSessions() {
    await this.prisma.session.deleteMany({
      where: { expiry_date: { lte: new Date() } },
    });
  }

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

    this.cleanupExpiredSessions();

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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.trim().toLowerCase();

    const employee = await this.prisma.employee.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (employee) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(rawToken).digest('hex');

      await this.prisma.passwordResetToken.create({
        data: {
          employee_id: employee.employee_id,
          token_hash: tokenHash,
          expires_at: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      console.log(`[DEV] Password reset link: http://localhost:3000/reset-password?token=${rawToken}`);
    }

    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(resetPasswordDto.token).digest('hex');

    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: {
        token_hash: tokenHash,
        used_at: null,
        expires_at: { gt: new Date() },
      },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const salt = randomBytes(16).toString('hex');
    const hashedPassword = (await scryptAsync(resetPasswordDto.newPassword, salt, 64)) as Buffer;
    const storedPassword = `scrypt:${salt}:${hashedPassword.toString('hex')}`;

    await this.prisma.$transaction([
      this.prisma.employee.update({
        where: { employee_id: resetToken.employee_id },
        data: { password: storedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used_at: new Date() },
      }),
      this.prisma.session.deleteMany({
        where: { employee_id: resetToken.employee_id },
      }),
    ]);

    return { message: 'Password has been reset successfully.' };
  }

  verifyToken(token: string): { sub: string; email: string; role: string; exp: number } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [header, body, signature] = parts;

    const expectedSignature = createHmac('sha256', this.getJwtSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = JSON.parse(
      Buffer.from(body, 'base64url').toString(),
    ) as { sub: string; email: string; role: string; exp: number };

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedException('Token has expired');
    }

    return payload;
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
