import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  register(payload: RegisterDto): { message: string; user: Pick<RegisterDto, 'email' | 'name'> } {
    return {
      message: 'Registration flow scaffolded',
      user: {
        email: payload.email,
        name: payload.name,
      },
    };
  }

  login(payload: LoginDto): { message: string; email: string } {
    return {
      message: 'Login flow scaffolded',
      email: payload.email,
    };
  }
}
