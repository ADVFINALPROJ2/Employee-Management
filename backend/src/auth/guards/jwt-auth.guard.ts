import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

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
    const employee = await this.authService.validateSession(
      payload.sub as string,
      token,
    );

    request.user = employee;
    return true;
  }

  private verifyToken(token: string): Record<string, unknown> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [header, body, signature] = parts;
    const expectedSig = createHmac('sha256', this.getJwtSecret())
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSig) {
      throw new UnauthorizedException('Invalid token signature');
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token has expired');
    }

    return payload;
  }

  private getJwtSecret() {
    return process.env.JWT_SECRET || 'development-secret';
  }
}
