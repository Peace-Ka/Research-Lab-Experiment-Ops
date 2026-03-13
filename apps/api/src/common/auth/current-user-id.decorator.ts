import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{
    headers?: Record<string, string | string[] | undefined>;
    user?: { id?: string };
  }>();

  if (request.user?.id && request.user.id.trim().length > 0) {
    return request.user.id.trim();
  }

  const rawHeader = request.headers?.['x-user-id'];
  const userId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new BadRequestException('Missing authenticated user context');
  }

  return userId.trim();
});
