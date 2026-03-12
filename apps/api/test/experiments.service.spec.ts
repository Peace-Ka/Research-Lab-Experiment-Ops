import { NotFoundException } from '@nestjs/common';
import { ExperimentsService } from '../src/modules/experiments/experiments.service';

describe('ExperimentsService', () => {
  const prisma = {
    project: {
      findFirstOrThrow: jest.fn(),
    },
    experiment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const audit = { log: jest.fn() };
  const workspaceAccess = {
    requireMembership: jest.fn(),
  };
  const service = new ExperimentsService(prisma as any, audit as any, workspaceAccess as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an experiment for a project', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'researcher' });
    prisma.project.findFirstOrThrow.mockResolvedValue({ id: 'proj_1' });
    prisma.experiment.create.mockResolvedValue({ id: 'exp_1', workspaceId: 'ws_1', projectId: 'proj_1', title: 'Ablation 1' });

    const result = await service.create('ws_1', 'proj_1', {
      title: 'Ablation 1',
    }, 'user_1');

    expect(prisma.experiment.create).toHaveBeenCalledWith({
      data: {
        workspaceId: 'ws_1',
        projectId: 'proj_1',
        title: 'Ablation 1',
        createdById: 'user_1',
      },
    });
    expect(audit.log).toHaveBeenCalledWith('experiment.create', 'experiment', 'exp_1');
    expect(result.id).toBe('exp_1');
  });

  it('throws when the experiment is missing', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'researcher' });
    prisma.experiment.findFirst.mockResolvedValue(null);
    await expect(service.findOne('ws_1', 'missing', 'user_1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
