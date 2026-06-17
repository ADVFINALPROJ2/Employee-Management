import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Simplified mock auth: allow all requests for testing purposes
    // In a real environment, you would verify the JWT token here
    request.user = { userId: 'mock-user-id', role: 'ADMIN' };
    return true;
  }
}
