import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(payload: RegisterDto) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      throw new ConflictException(`User with email ${normalizedEmail} already exists`);
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: payload.name.trim(),
        passwordHash: this.hashPassword(payload.password),
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return {
      message: 'Registration successful',
      user,
      authContext: {
        userId: user.id,
        transport: 'x-user-id',
      },
    };
  }

  async login(payload: LoginDto) {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !this.verifyPassword(payload.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      authContext: {
        userId: user.id,
        transport: 'x-user-id',
      },
    };
  }

  async me(userId: string) {
    if (!userId) {
      throw new BadRequestException('Missing x-user-id header');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        mfaEnabled: true,
        createdAt: true,
        memberships: {
          where: { status: 'active' },
          select: {
            workspaceId: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException(`User ${userId} was not found`);
    }

    return user;
  }

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string): boolean {
    const [salt, hash] = storedHash.split(':');

    if (!salt || !hash) {
      return false;
    }

    const incomingHash = scryptSync(password, salt, 64);
    const storedHashBuffer = Buffer.from(hash, 'hex');

    if (incomingHash.length !== storedHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(incomingHash, storedHashBuffer);
  }
}
