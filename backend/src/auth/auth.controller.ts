import { Body, Controller, Headers, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RateLimiterGuard } from './guards/rate-limiter.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(new RateLimiterGuard(10, 60 * 1000))
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  logout(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.authService.logout(token);
  }

  @Post('refresh')
  refresh(@Headers('authorization') authHeader: string) {
    const token = this.extractToken(authHeader);
    return this.authService.refresh(token);
  }

  @UseGuards(new RateLimiterGuard(5, 60 * 1000))
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  private extractToken(authHeader: string): string {
    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format');
    }
    return token;
  }
}
