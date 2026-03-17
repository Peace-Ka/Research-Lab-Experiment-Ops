import { Controller, Get } from '@nestjs/common';
import { CurrentUserId } from '../../common/auth/current-user-id.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  me(@CurrentUserId() userId: string) {
    return this.authService.me(userId);
  }
}
