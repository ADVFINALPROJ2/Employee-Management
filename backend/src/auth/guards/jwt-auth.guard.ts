import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Regular Passport execution flow to validate the JWT token
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Throw an explicit HTTP unauthorized exception if token validation fails
    if (err || !user) {
      throw err || new UnauthorizedException('You must be logged in to access this resource.');
    }
    
    // Returns the validated user payload which becomes available as req.user
    return user;
  }
}