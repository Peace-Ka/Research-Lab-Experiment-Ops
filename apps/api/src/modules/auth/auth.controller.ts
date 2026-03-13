import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUserId } from '../../common/auth/current-user-id.decorator';
import { Public } from '../../common/auth/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }

  @Post('login')
  @Public()
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Get('me')
  me(@CurrentUserId() userId: string) {
    return this.authService.me(userId);
  }
}
