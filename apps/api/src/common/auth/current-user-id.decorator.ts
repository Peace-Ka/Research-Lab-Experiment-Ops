import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserId = createParamDecorator((_: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest<{ headers?: Record<string, string | string[] | undefined> }>();
  const rawHeader = request.headers?.['x-user-id'];
  const userId = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    throw new BadRequestException('Missing x-user-id header');
  }

  return userId.trim();
});
