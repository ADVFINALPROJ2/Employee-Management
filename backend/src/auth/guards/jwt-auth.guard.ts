import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    const payload = this.verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedException('Token has expired');
    }

    const session = await this.prisma.session.findFirst({
      where: { token, employee_id: payload.sub },
      include: { employee: true },
    });

    if (!session) {
      throw new UnauthorizedException('Token not found or revoked');
    }

    if (new Date(session.expiry_date) < new Date()) {
      throw new UnauthorizedException('Session has expired');
    }

    request.user = {
      id: session.employee.employee_id,
      fullName: session.employee.full_name,
      email: session.employee.email,
      role: session.employee.role,
    };

    return true;
  }

  private verifyToken(token: string): Record<string, any> | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = createHmac('sha256', this.getJwtSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    try {
      return JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    } catch {
      return null;
    }
  }

  private getJwtSecret() {
    return process.env.JWT_SECRET || 'development-secret';
  }
}
