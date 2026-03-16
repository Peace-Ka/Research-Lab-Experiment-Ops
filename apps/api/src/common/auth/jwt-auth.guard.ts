import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.constants';
import { TokenService } from './token.service';

type AuthenticatedRequest = {
  headers?: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    email?: string;
    name?: string;
    transport: 'bearer' | 'x-user-id';
  };
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = this.getHeader(request, 'authorization');

    if (authorization?.startsWith('Bearer ')) {
      const token = authorization.slice('Bearer '.length).trim();
      const user = this.tokenService.verifyToken(token);
      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        transport: 'bearer',
      };
      return true;
    }

    const userId = this.getHeader(request, 'x-user-id');
    if (userId) {
      request.user = {
        id: userId.trim(),
        transport: 'x-user-id',
      };
      return true;
    }

    throw new UnauthorizedException('Missing bearer token');
  }

  private getHeader(request: AuthenticatedRequest, key: string): string | undefined {
    const rawHeader = request.headers?.[key];
    if (Array.isArray(rawHeader)) {
      return rawHeader[0];
    }
    return rawHeader;
  }
}
