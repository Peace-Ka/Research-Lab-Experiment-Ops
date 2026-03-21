import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from '../src/modules/projects/projects.service';

describe('ProjectsService', () => {
  const prisma = {
    workspace: {
      findUniqueOrThrow: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const audit = { log: jest.fn() };
  const workspaceAccess = {
    requireMembership: jest.fn(),
  };
  const service = new ProjectsService(prisma as never, audit as never, workspaceAccess as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a project inside a workspace through Prisma', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'owner' });
    prisma.workspace.findUniqueOrThrow.mockResolvedValue({ id: 'ws_1' });
    prisma.project.create.mockResolvedValue({ id: 'proj_1', workspaceId: 'ws_1', name: 'Benchmarking' });

    const result = await service.create('ws_1', { name: 'Benchmarking' }, 'user_1');

    expect(prisma.project.create).toHaveBeenCalledWith({
      data: { workspaceId: 'ws_1', ownerUserId: 'user_1', name: 'Benchmarking' },
    });
    expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'project.create', entityType: 'project', entityId: 'proj_1', workspaceId: 'ws_1', actorUserId: 'user_1' }));
    expect(result.id).toBe('proj_1');
  });

  it('throws when the project does not exist in the workspace', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'owner' });
    prisma.project.findFirst.mockResolvedValue(null);

    await expect(service.findOne('ws_1', 'missing', 'user_1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
