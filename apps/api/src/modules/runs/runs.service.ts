import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RunStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRunMetricDto } from './dto/create-run-metric.dto';
import { CreateRunParamDto } from './dto/create-run-param.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunStatusDto } from './dto/update-run-status.dto';

@Injectable()
export class RunsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(workspaceId: string, experimentId: string) {
    const items = await this.prisma.experimentRun.findMany({
      where: { workspaceId, experimentId },
      orderBy: { runNumber: 'desc' },
    });

    return {
      workspaceId,
      experimentId,
      items,
      total: items.length,
    };
  }

  async findOne(workspaceId: string, runId: string) {
    const run = await this.prisma.experimentRun.findFirst({
      where: { id: runId, workspaceId },
    });

    if (!run) {
      throw new NotFoundException(`Run ${runId} not found in workspace ${workspaceId}`);
    }

    return run;
  }

  async create(workspaceId: string, experimentId: string, payload: CreateRunDto) {
    await this.prisma.experiment.findFirstOrThrow({ where: { id: experimentId, workspaceId } });

    const latestRun = await this.prisma.experimentRun.findFirst({
      where: { experimentId, workspaceId },
      orderBy: { runNumber: 'desc' },
      select: { runNumber: true },
    });

    const run = await this.prisma.experimentRun.create({
      data: {
        workspaceId,
        experimentId,
        runNumber: (latestRun?.runNumber ?? 0) + 1,
        status: RunStatus.queued,
        createdById: payload.createdById,
        codeRef: payload.codeRef,
        envSnapshot: payload.envSnapshot as Prisma.InputJsonValue | undefined,
        randomSeed: payload.randomSeed,
        datasetId: payload.datasetId,
        datasetVersionId: payload.datasetVersionId,
        modelId: payload.modelId,
        modelVersionId: payload.modelVersionId,
        notes: payload.notes,
      },
    });

    this.auditService.log('run.create', 'run', run.id);
    return run;
  }

  async updateStatus(workspaceId: string, runId: string, payload: UpdateRunStatusDto) {
    await this.findOne(workspaceId, runId);

    const run = await this.prisma.experimentRun.update({
      where: { id: runId },
      data: payload,
    });

    this.auditService.log('run.update_status', 'run', run.id);
    return run;
  }

  async upsertParam(workspaceId: string, runId: string, payload: CreateRunParamDto) {
    await this.findOne(workspaceId, runId);

    const param = await this.prisma.runParam.upsert({
      where: {
        runId_key: {
          runId,
          key: payload.key,
        },
      },
      update: {
        value: payload.value,
      },
      create: {
        runId,
        key: payload.key,
        value: payload.value,
      },
    });

    this.auditService.log('run.param_upsert', 'run_param', `${runId}:${payload.key}`);
    return param;
  }

  async addMetric(workspaceId: string, runId: string, payload: CreateRunMetricDto) {
    await this.findOne(workspaceId, runId);

    const metric = await this.prisma.runMetric.create({
      data: {
        runId,
        key: payload.key,
        value: payload.value,
        step: payload.step,
      },
    });

    this.auditService.log('run.metric_create', 'run_metric', metric.id);
    return metric;
  }
}