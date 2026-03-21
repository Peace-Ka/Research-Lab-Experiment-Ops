import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';

@Injectable()
export class ExperimentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async findAll(workspaceId: string, projectId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId);

    const items = await this.prisma.experiment.findMany({
      where: { workspaceId, projectId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      workspaceId,
      projectId,
      items,
      total: items.length,
    };
  }

  async findOne(workspaceId: string, experimentId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId);

    const experiment = await this.prisma.experiment.findFirst({
      where: { id: experimentId, workspaceId },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment ${experimentId} not found in workspace ${workspaceId}`);
    }

    return experiment;
  }

  async create(workspaceId: string, projectId: string, payload: CreateExperimentDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
    ]);
    await this.prisma.project.findFirstOrThrow({ where: { id: projectId, workspaceId } });

    const experiment = await this.prisma.experiment.create({
      data: {
        workspaceId,
        projectId,
        createdById: userId,
        ...payload,
      },
    });

    await this.auditService.log({ workspaceId, actorUserId: userId, action: 'experiment.create', entityType: 'experiment', entityId: experiment.id, afterJson: payload as unknown as import('@prisma/client').Prisma.InputJsonValue });
    return experiment;
  }

  async update(workspaceId: string, experimentId: string, payload: UpdateExperimentDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [
      WorkspaceRole.owner,
      WorkspaceRole.maintainer,
      WorkspaceRole.researcher,
    ]);
    await this.findOne(workspaceId, experimentId, userId);

    const experiment = await this.prisma.experiment.update({
      where: { id: experimentId },
      data: payload,
    });

    await this.auditService.log({ workspaceId, actorUserId: userId, action: 'experiment.update', entityType: 'experiment', entityId: experiment.id, afterJson: payload as unknown as import('@prisma/client').Prisma.InputJsonValue });
    return experiment;
  }
}
