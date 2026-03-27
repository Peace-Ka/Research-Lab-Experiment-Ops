import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { access, mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RunStatus, WorkspaceRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { CreateRunArtifactDto } from './dto/create-run-artifact.dto';
import { CreateRunMetricDto } from './dto/create-run-metric.dto';
import { CreateRunParamDto } from './dto/create-run-param.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunChecklistStateDto } from './dto/update-run-checklist-state.dto';
import { UpdateRunMetadataDto } from './dto/update-run-metadata.dto';
import { UpdateRunStatusDto } from './dto/update-run-status.dto';

@Injectable()
export class RunsService {
  private readonly artifactRoot = join(process.cwd(), 'storage', 'artifacts');

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  private normalizeArtifact<T extends { sizeBytes: bigint | null }>(artifact: T) {
    return {
      ...artifact,
      sizeBytes: artifact.sizeBytes == null ? null : artifact.sizeBytes.toString(),
    };
  }

  private normalizeRun<T extends { artifacts?: Array<{ sizeBytes: bigint | null }> }>(run: T) {
    return {
      ...run,
      artifacts: (run.artifacts ?? []).map((artifact) => this.normalizeArtifact(artifact)),
    };
  }

  private async ensureArtifactRoot() {
    await mkdir(this.artifactRoot, { recursive: true });
  }

  private buildStorageKey(runId: string, fileName: string) {
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '-');
    return join(runId, `${Date.now()}${extname(safeName) ? `-${safeName}` : `-${safeName}.bin`}`);
  }

  async findAll(workspaceId: string, experimentId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId);

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

  async findOne(workspaceId: string, runId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId);

    const run = await this.prisma.experimentRun.findFirst({
      where: { id: runId, workspaceId },
      include: {
        params: {
          orderBy: { key: 'asc' },
        },
        metrics: {
          orderBy: [{ key: 'asc' }, { loggedAt: 'desc' }],
        },
        artifacts: {
          orderBy: [{ uploadedAt: 'desc' }, { fileName: 'asc' }],
        },
        checklistStates: {
          include: {
            checklistItem: true,
          },
          orderBy: {
            checklistItem: {
              code: 'asc',
            },
          },
        },
      },
    });

    if (!run) {
      throw new NotFoundException(`Run ${runId} not found in workspace ${workspaceId}`);
    }

    return this.normalizeRun(run);
  }

  async getArtifactFile(workspaceId: string, runId: string, artifactId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId);

    const artifact = await this.prisma.artifact.findFirst({
      where: {
        id: artifactId,
        runId,
        run: {
          workspaceId,
        },
      },
    });

    if (!artifact) {
      throw new NotFoundException(`Artifact ${artifactId} not found for run ${runId}`);
    }

    const filePath = join(this.artifactRoot, artifact.storageKey);
    await access(filePath);

    return {
      fileName: artifact.fileName,
      stream: createReadStream(filePath),
    };
  }

  async create(workspaceId: string, experimentId: string, payload: CreateRunDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
    ]);
    await this.prisma.experiment.findFirstOrThrow({ where: { id: experimentId, workspaceId } });

    const latestRun = await this.prisma.experimentRun.findFirst({
      where: { experimentId, workspaceId },
      orderBy: { runNumber: 'desc' },
      select: { runNumber: true },
    });

    const checklistItems = await this.prisma.reproChecklistItem.findMany({
      where: { workspaceId },
      orderBy: { code: 'asc' },
      select: { id: true },
    });

    const run = await this.prisma.experimentRun.create({
      data: {
        workspaceId,
        experimentId,
        runNumber: (latestRun?.runNumber ?? 0) + 1,
        status: RunStatus.queued,
        createdById: userId,
        codeRef: payload.codeRef,
        envSnapshot: payload.envSnapshot as Prisma.InputJsonValue | undefined,
        randomSeed: payload.randomSeed,
        datasetId: payload.datasetId,
        datasetVersionId: payload.datasetVersionId,
        modelId: payload.modelId,
        modelVersionId: payload.modelVersionId,
        notes: payload.notes,
        checklistStates: checklistItems.length
          ? {
              create: checklistItems.map((item) => ({
                checklistItemId: item.id,
              })),
            }
          : undefined,
      },
    });

    await this.auditService.log({
      workspaceId,
      actorUserId: userId,
      action: 'run.create',
      entityType: 'run',
      entityId: run.id,
      afterJson: {
        runNumber: run.runNumber,
        experimentId,
        codeRef: payload.codeRef ?? null,
        randomSeed: payload.randomSeed ?? null,
      },
    });
    return run;
  }

  async updateMetadata(workspaceId: string, runId: string, payload: UpdateRunMetadataDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
    ]);
    const existingRun = await this.findOne(workspaceId, runId, userId);

    const updateData = {
      codeRef: payload.codeRef ?? null,
      randomSeed: payload.randomSeed ?? null,
      notes: payload.notes ?? null,
    };

    const run = await this.prisma.experimentRun.update({
      where: { id: runId },
      data: updateData,
    });

    await this.auditService.log({
      workspaceId,
      actorUserId: userId,
      action: 'run.update_metadata',
      entityType: 'run',
      entityId: run.id,
      beforeJson: {
        codeRef: existingRun.codeRef ?? null,
        randomSeed: existingRun.randomSeed ?? null,
        notes: existingRun.notes ?? null,
      },
      afterJson: {
        runId,
        ...updateData,
      },
    });
    return run;
  }
  async updateStatus(workspaceId: string, runId: string, payload: UpdateRunStatusDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
    ]);
    await this.findOne(workspaceId, runId, userId);

    const run = await this.prisma.experimentRun.update({
      where: { id: runId },
      data: payload,
    });

    await this.auditService.log({
      workspaceId,
      actorUserId: userId,
      action: 'run.update_status',
      entityType: 'run',
      entityId: run.id,
      afterJson: { runId, ...payload },
    });
    return run;
  }

  async upsertParam(workspaceId: string, runId: string, payload: CreateRunParamDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
    ]);
    await this.findOne(workspaceId, runId, userId);

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

    await this.auditService.log({
      workspaceId,
      actorUserId: userId,
      action: 'run.param_upsert',
      entityType: 'run_param',
      entityId: `${runId}:${payload.key}`,
      afterJson: { runId, ...payload },
    });
    return param;
  }

  async addMetric(workspaceId: string, runId: string, payload: CreateRunMetricDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
    ]);
    await this.findOne(workspaceId, runId, userId);

    const metric = await this.prisma.runMetric.create({
      data: {
        runId,
        key: payload.key,
        value: payload.value,
        step: payload.step,
      },
    });

    await this.auditService.log({
      workspaceId,
      actorUserId: userId,
      action: 'run.metric_create',
      entityType: 'run_metric',
      entityId: metric.id,
      afterJson: { runId, ...payload },
    });
    return metric;
  }

  async addArtifact(
    workspaceId: string,
    runId: string,
    payload: CreateRunArtifactDto,
    file: { originalname: string; buffer: Buffer; size: number } | undefined,
    userId: string,
  ) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
    ]);
    await this.findOne(workspaceId, runId, userId);

    if (!file) {
      throw new NotFoundException('Artifact upload file was not provided.');
    }

    await this.ensureArtifactRoot();
    const storageKey = this.buildStorageKey(runId, file.originalname);
    const checksumSha256 = createHash('sha256').update(file.buffer).digest('hex');
    const filePath = join(this.artifactRoot, storageKey);
    await mkdir(join(this.artifactRoot, runId), { recursive: true });
    await writeFile(filePath, file.buffer);

    const artifact = await this.prisma.artifact.create({
      data: {
        runId,
        type: payload.type,
        fileName: file.originalname,
        storageKey,
        checksumSha256,
        sizeBytes: BigInt(file.size),
      },
    });

    await this.auditService.log({
      workspaceId,
      actorUserId: userId,
      action: 'run.artifact_create',
      entityType: 'artifact',
      entityId: artifact.id,
      afterJson: {
        runId,
        type: payload.type,
        fileName: file.originalname,
        sizeBytes: file.size,
      },
    });
    return this.normalizeArtifact(artifact);
  }

  async updateChecklistState(
    workspaceId: string,
    runId: string,
    checklistItemId: string,
    payload: UpdateRunChecklistStateDto,
    userId: string,
  ) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
      WorkspaceRole.reviewer,
    ]);
    await this.findOne(workspaceId, runId, userId);

    const checklistState = await this.prisma.runChecklistState.upsert({
      where: {
        runId_checklistItemId: {
          runId,
          checklistItemId,
        },
      },
      update: {
        status: payload.status,
        note: payload.note,
      },
      create: {
        runId,
        checklistItemId,
        status: payload.status,
        note: payload.note,
      },
      include: {
        checklistItem: true,
      },
    });

    await this.auditService.log({
      workspaceId,
      actorUserId: userId,
      action: 'run.checklist_update',
      entityType: 'run_checklist_state',
      entityId: checklistState.id,
      afterJson: {
        checklistItemId,
        status: payload.status,
        note: payload.note ?? null,
      },
    });
    return checklistState;
  }
}

