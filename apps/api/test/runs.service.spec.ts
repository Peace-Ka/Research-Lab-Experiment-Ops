import { NotFoundException } from '@nestjs/common';
import { RunStatus } from '@prisma/client';
import { RunsService } from '../src/modules/runs/runs.service';

describe('RunsService', () => {
  const prisma = {
    experiment: {
      findFirstOrThrow: jest.fn(),
    },
    experimentRun: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
  const audit = { log: jest.fn() };
  const service = new RunsService(prisma as any, audit as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates the next run number for an experiment', async () => {
    prisma.experiment.findFirstOrThrow.mockResolvedValue({ id: 'exp_1' });
    prisma.experimentRun.findFirst.mockResolvedValue({ runNumber: 2 });
    prisma.experimentRun.create.mockResolvedValue({ id: 'run_3', runNumber: 3, workspaceId: 'ws_1', experimentId: 'exp_1' });

    const result = await service.create('ws_1', 'exp_1', { createdById: 'user_1' });

    expect(prisma.experimentRun.create).toHaveBeenCalledWith({
      data: {
        workspaceId: 'ws_1',
        experimentId: 'exp_1',
        runNumber: 3,
        status: RunStatus.queued,
        createdById: 'user_1',
      },
    });
    expect(audit.log).toHaveBeenCalledWith('run.create', 'run', 'run_3');
    expect(result.runNumber).toBe(3);
  });

  it('throws when the run is missing', async () => {
    prisma.experimentRun.findFirst.mockResolvedValue(null);
    await expect(service.findOne('ws_1', 'missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});