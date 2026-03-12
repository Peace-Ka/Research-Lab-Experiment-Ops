import { NotFoundException } from '@nestjs/common';
import { ChecklistStatus, RunStatus } from '@prisma/client';
import { RunsService } from '../src/modules/runs/runs.service';

describe('RunsService', () => {
  const prisma = {
    experiment: {
      findFirstOrThrow: jest.fn(),
    },
    reproChecklistItem: {
      findMany: jest.fn(),
    },
    experimentRun: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    runParam: {
      upsert: jest.fn(),
    },
    runMetric: {
      create: jest.fn(),
    },
    runChecklistState: {
      upsert: jest.fn(),
    },
  };
  const audit = { log: jest.fn() };
  const workspaceAccess = {
    requireMembership: jest.fn(),
  };
  const service = new RunsService(prisma as any, audit as any, workspaceAccess as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates the next run number for an experiment and initializes checklist state', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'researcher' });
    prisma.experiment.findFirstOrThrow.mockResolvedValue({ id: 'exp_1' });
    prisma.experimentRun.findFirst.mockResolvedValue({ runNumber: 2 });
    prisma.reproChecklistItem.findMany.mockResolvedValue([{ id: 'check_1' }, { id: 'check_2' }]);
    prisma.experimentRun.create.mockResolvedValue({ id: 'run_3', runNumber: 3, workspaceId: 'ws_1', experimentId: 'exp_1' });

    const result = await service.create('ws_1', 'exp_1', {}, 'user_1');

    expect(prisma.experimentRun.create).toHaveBeenCalledWith({
      data: {
        workspaceId: 'ws_1',
        experimentId: 'exp_1',
        runNumber: 3,
        status: RunStatus.queued,
        createdById: 'user_1',
        codeRef: undefined,
        envSnapshot: undefined,
        randomSeed: undefined,
        datasetId: undefined,
        datasetVersionId: undefined,
        modelId: undefined,
        modelVersionId: undefined,
        notes: undefined,
        checklistStates: {
          create: [{ checklistItemId: 'check_1' }, { checklistItemId: 'check_2' }],
        },
      },
    });
    expect(audit.log).toHaveBeenCalledWith('run.create', 'run', 'run_3');
    expect(result.runNumber).toBe(3);
  });

  it('throws when the run is missing', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'researcher' });
    prisma.experimentRun.findFirst.mockResolvedValue(null);
    await expect(service.findOne('ws_1', 'missing', 'user_1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('upserts a run parameter', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'researcher' });
    prisma.experimentRun.findFirst.mockResolvedValue({ id: 'run_1', workspaceId: 'ws_1' });
    prisma.runParam.upsert.mockResolvedValue({ runId: 'run_1', key: 'lr', value: '0.001' });

    const result = await service.upsertParam('ws_1', 'run_1', { key: 'lr', value: '0.001' }, 'user_1');

    expect(prisma.runParam.upsert).toHaveBeenCalledWith({
      where: { runId_key: { runId: 'run_1', key: 'lr' } },
      update: { value: '0.001' },
      create: { runId: 'run_1', key: 'lr', value: '0.001' },
    });
    expect(audit.log).toHaveBeenCalledWith('run.param_upsert', 'run_param', 'run_1:lr');
    expect(result.key).toBe('lr');
  });

  it('creates a run metric', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'researcher' });
    prisma.experimentRun.findFirst.mockResolvedValue({ id: 'run_1', workspaceId: 'ws_1' });
    prisma.runMetric.create.mockResolvedValue({ id: 'metric_1', runId: 'run_1', key: 'accuracy', value: 0.93 });

    const result = await service.addMetric('ws_1', 'run_1', { key: 'accuracy', value: 0.93, step: 10 }, 'user_1');

    expect(prisma.runMetric.create).toHaveBeenCalledWith({
      data: { runId: 'run_1', key: 'accuracy', value: 0.93, step: 10 },
    });
    expect(audit.log).toHaveBeenCalledWith('run.metric_create', 'run_metric', 'metric_1');
    expect(result.id).toBe('metric_1');
  });

  it('upserts a checklist state', async () => {
    workspaceAccess.requireMembership.mockResolvedValue({ role: 'reviewer' });
    prisma.experimentRun.findFirst.mockResolvedValue({ id: 'run_1', workspaceId: 'ws_1' });
    prisma.runChecklistState.upsert.mockResolvedValue({
      id: 'state_1',
      status: ChecklistStatus.passed,
      checklistItem: { id: 'check_1', code: 'seed-recorded' },
    });

    const result = await service.updateChecklistState(
      'ws_1',
      'run_1',
      'check_1',
      { status: ChecklistStatus.passed, note: 'Recorded in metadata.' },
      'user_1',
    );

    expect(prisma.runChecklistState.upsert).toHaveBeenCalledWith({
      where: {
        runId_checklistItemId: {
          runId: 'run_1',
          checklistItemId: 'check_1',
        },
      },
      update: {
        status: ChecklistStatus.passed,
        note: 'Recorded in metadata.',
      },
      create: {
        runId: 'run_1',
        checklistItemId: 'check_1',
        status: ChecklistStatus.passed,
        note: 'Recorded in metadata.',
      },
      include: {
        checklistItem: true,
      },
    });
    expect(audit.log).toHaveBeenCalledWith('run.checklist_update', 'run_checklist_state', 'state_1');
    expect(result.id).toBe('state_1');
  });
});
