import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../src/modules/auth/auth.service';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const tokenService = {
    issueToken: jest.fn().mockReturnValue('jwt-token'),
  };

  const service = new AuthService(prisma as never, tokenService as never);

  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.issueToken.mockReturnValue('jwt-token');
  });

  it('registers a persisted user with a hashed password', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user_1',
      email: data.email,
      name: data.name,
      createdAt: new Date('2026-03-12T00:00:00.000Z'),
    }));

    const result = await service.register({
      email: 'Peace@example.com',
      name: 'Peace',
      password: 'password123',
    });

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'peace@example.com',
          name: 'Peace',
          passwordHash: expect.stringMatching(/^[0-9a-f]+:[0-9a-f]+$/),
        }),
      }),
    );
    expect(tokenService.issueToken).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'user_1', email: 'peace@example.com', name: 'Peace' }),
    );
    expect(result.user.id).toBe('user_1');
    expect(result.authContext.userId).toBe('user_1');
    expect(result.authContext.transport).toBe('bearer');
    expect(result.accessToken).toBe('jwt-token');
  });

  it('rejects duplicate registration', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user_1' });

    await expect(
      service.register({
        email: 'peace@example.com',
        name: 'Peace',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('authenticates a valid login', async () => {
    prisma.user.findUnique.mockResolvedValueOnce(null);
    prisma.user.create.mockImplementation(async ({ data }) => ({
      id: 'user_1',
      email: data.email,
      name: data.name,
      createdAt: new Date('2026-03-12T00:00:00.000Z'),
    }));

    await service.register({
      email: 'researcher@example.com',
      name: 'Researcher',
      password: 'password123',
    });

    const createCall = prisma.user.create.mock.calls[0][0];
    prisma.user.findUnique.mockResolvedValue({
      id: 'user_2',
      email: 'researcher@example.com',
      name: 'Researcher',
      passwordHash: createCall.data.passwordHash,
    });

    const result = await service.login({
      email: 'researcher@example.com',
      password: 'password123',
    });

    expect(result.user.id).toBe('user_2');
    expect(result.authContext.transport).toBe('bearer');
    expect(result.accessToken).toBe('jwt-token');
  });

  it('rejects an invalid login', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user_2',
      email: 'researcher@example.com',
      name: 'Researcher',
      passwordHash: 'bad:hash',
    });

    await expect(
      service.login({
        email: 'researcher@example.com',
        password: 'password123',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
