import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async authenticateClerkToken(token: string) {
    const payload = await verifyToken(token, {
      secretKey: this.getClerkSecretKey(),
      jwtKey: this.configService.get<string>('CLERK_JWT_KEY') ?? undefined,
    });

    const clerkUserId = payload.sub;

    if (!clerkUserId || typeof clerkUserId !== 'string') {
      throw new UnauthorizedException('Clerk token did not include a subject');
    }

    let user = await this.prisma.user.findUnique({
      where: { externalAuthId: clerkUserId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      const clerkUser = await this.getClerkClient().users.getUser(clerkUserId);
      const email = clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim()
        || clerkUser.fullName
        || clerkUser.username
        || email
        || clerkUserId;

      if (!email) {
        throw new UnauthorizedException('Clerk user is missing an email address');
      }

      user = await this.prisma.user.create({
        data: {
          externalAuthId: clerkUserId,
          email,
          name,
          passwordHash: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      clerkUserId,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        externalAuthId: true,
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

  private getClerkClient() {
    return createClerkClient({
      secretKey: this.getClerkSecretKey(),
      publishableKey: this.configService.get<string>('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'),
    });
  }

  private getClerkSecretKey(): string {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    if (!secretKey) {
      throw new Error('CLERK_SECRET_KEY is not configured');
    }
    return secretKey;
  }
}
