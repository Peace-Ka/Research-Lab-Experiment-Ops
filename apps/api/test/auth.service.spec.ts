import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
  };
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'CLERK_SECRET_KEY') {
        return 'sk_test_demo';
      }
      return undefined;
    }),
  };

  const service = new AuthService(prisma as never, configService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the current local user profile', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user_1',
      externalAuthId: 'user_clerk_1',
      email: 'peace@example.com',
      name: 'Peace',
      mfaEnabled: false,
      createdAt: new Date('2026-03-12T00:00:00.000Z'),
      memberships: [],
    });

    const result = await service.me('user_1');

    expect(result.id).toBe('user_1');
    expect(result.externalAuthId).toBe('user_clerk_1');
  });

  it('rejects missing users', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.me('missing')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
