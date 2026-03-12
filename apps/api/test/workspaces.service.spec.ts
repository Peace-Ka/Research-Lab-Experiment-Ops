import { NotFoundException } from '@nestjs/common';
import { WorkspacesService } from '../src/modules/workspaces/workspaces.service';

describe('WorkspacesService', () => {
  const prisma = {
    workspace: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspaceMembership: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };
  const audit = { log: jest.fn() };
  const workspaceAccess = {
    getUserOrThrow: jest.fn(),
    requireMembership: jest.fn(),
  };
  const service = new WorkspacesService(prisma as never, audit as never, workspaceAccess as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a workspace and owner membership through Prisma', async () => {
    workspaceAccess.getUserOrThrow.mockResolvedValue({ id: 'user_1' });
    prisma.$transaction.mockImplementation(async (cb) =>
      cb({
        workspace: {
          create: jest.fn().mockResolvedValue({ id: 'ws_1', name: 'Lab Ops', slug: 'lab-ops' }),
        },
        workspaceMembership: {
          create: jest.fn().mockResolvedValue({ id: 'membership_1' }),
        },
      }),
    );

    const result = await service.create({ name: 'Lab Ops', slug: 'lab-ops' }, 'user_1');

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(audit.log).toHaveBeenCalledWith('workspace.create', 'workspace', 'ws_1');
    expect(result.id).toBe('ws_1');
  });

  it('throws when the workspace does not exist', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'owner', status: 'active', createdAt: new Date() });
    prisma.workspace.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing', 'user_1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
