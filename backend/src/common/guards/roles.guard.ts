import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Reads metadata attached to the route handler or controller class
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified on the endpoint, allow access by default
    if (!requiredRoles) {
      return true;
    }

    // Access the request object to check the authenticated user's role
    const { user } = context.switchToHttp().getRequest();
    
    // Check if the user's role matches any of the required route roles
    return requiredRoles.includes(user?.role);
  }
}