import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.constants';
import { AuthService } from '../../modules/auth/auth.service';

type AuthenticatedRequest = {
  headers?: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    email?: string;
    name?: string;
    clerkUserId?: string;
    transport: 'clerk' | 'x-user-id';
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const userIdFallback = this.getHeader(request, 'x-user-id');
    if (process.env.NODE_ENV === 'test' && userIdFallback) {
      request.user = {
        id: userIdFallback.trim(),
        transport: 'x-user-id',
      };
      return true;
    }

    const authorization = this.getHeader(request, 'authorization');
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Clerk bearer token');
    }

    const token = authorization.slice('Bearer '.length).trim();
    const user = await this.authService.authenticateClerkToken(token);
    request.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      clerkUserId: user.clerkUserId,
      transport: 'clerk',
    };
    return true;
  }

  private getHeader(request: AuthenticatedRequest, key: string): string | undefined {
    const rawHeader = request.headers?.[key];
    if (Array.isArray(rawHeader)) {
      return rawHeader[0];
    }
    return rawHeader;
  }
}
