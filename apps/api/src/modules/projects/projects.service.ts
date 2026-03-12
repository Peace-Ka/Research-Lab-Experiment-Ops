import { Injectable, NotFoundException } from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceAccessService } from '../workspaces/workspace-access.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async findAll(workspaceId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId);

    const items = await this.prisma.project.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      workspaceId,
      items,
      total: items.length,
    };
  }

  async findOne(workspaceId: string, projectId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId);

    const project = await this.prisma.project.findFirst({
      where: { id: projectId, workspaceId },
    });

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found in workspace ${workspaceId}`);
    }

    return project;
  }

  async create(workspaceId: string, payload: CreateProjectDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [WorkspaceRole.owner, WorkspaceRole.maintainer]);
    await this.prisma.workspace.findUniqueOrThrow({ where: { id: workspaceId } });

    const project = await this.prisma.project.create({
      data: {
        workspaceId,
        ownerUserId: userId,
        ...payload,
      },
    });

    this.auditService.log('project.create', 'project', project.id);
    return project;
  }

  async update(workspaceId: string, projectId: string, payload: UpdateProjectDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [WorkspaceRole.owner, WorkspaceRole.maintainer]);
    await this.findOne(workspaceId, projectId, userId);

    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: payload,
    });

    this.auditService.log('project.update', 'project', project.id);
    return project;
  }

  async remove(workspaceId: string, projectId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [WorkspaceRole.owner, WorkspaceRole.maintainer]);
    await this.findOne(workspaceId, projectId, userId);
    await this.prisma.project.delete({ where: { id: projectId } });
    this.auditService.log('project.delete', 'project', projectId);
    return { deleted: true, id: projectId, workspaceId };
  }
}
