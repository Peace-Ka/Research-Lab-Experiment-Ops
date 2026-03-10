import { NotFoundException } from '@nestjs/common';
import { WorkspacesService } from '../src/modules/workspaces/workspaces.service';

describe('WorkspacesService', () => {
  const prisma = {
    workspace: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const audit = { log: jest.fn() };
  const service = new WorkspacesService(prisma as never, audit as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a workspace through Prisma', async () => {
    prisma.workspace.create.mockResolvedValue({ id: 'ws_1', name: 'Lab Ops', slug: 'lab-ops' });

    const result = await service.create({ name: 'Lab Ops', slug: 'lab-ops' });

    expect(prisma.workspace.create).toHaveBeenCalledWith({
      data: { name: 'Lab Ops', slug: 'lab-ops' },
    });
    expect(audit.log).toHaveBeenCalledWith('workspace.create', 'workspace', 'ws_1');
    expect(result.id).toBe('ws_1');
  });

  it('throws when the workspace does not exist', async () => {
    prisma.workspace.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});