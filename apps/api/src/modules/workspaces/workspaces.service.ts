import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, WorkspaceRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspaceAccessService } from './workspace-access.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly workspaceAccess: WorkspaceAccessService,
  ) {}

  async findAll(userId: string) {
    await this.workspaceAccess.getUserOrThrow(userId);

    const memberships = await this.prisma.workspaceMembership.findMany({
      where: {
        userId,
        status: 'active',
      },
      include: {
        workspace: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = memberships.map((membership) => ({
      ...membership.workspace,
      membership: {
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt,
      },
    }));

    return {
      items,
      total: items.length,
    };
  }

  async findOne(workspaceId: string, userId: string) {
    const membership = await this.workspaceAccess.requireMembership(workspaceId, userId);

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    return {
      ...workspace,
      membership: {
        role: membership.role,
        status: membership.status,
        createdAt: membership.createdAt,
      },
    };
  }

  async create(payload: CreateWorkspaceDto, userId: string) {
    await this.workspaceAccess.getUserOrThrow(userId);

    const workspace = await this.prisma.$transaction(async (tx) => {
      const createdWorkspace = await tx.workspace.create({
        data: payload,
      });

      await tx.workspaceMembership.create({
        data: {
          workspaceId: createdWorkspace.id,
          userId,
          role: WorkspaceRole.owner,
        },
      });

      return createdWorkspace;
    });

    await this.auditService.log({ workspaceId: workspace.id, actorUserId: userId, action: 'workspace.create', entityType: 'workspace', entityId: workspace.id, afterJson: payload as unknown as Prisma.InputJsonValue });
    return workspace;
  }

  async update(workspaceId: string, payload: UpdateWorkspaceDto, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [WorkspaceRole.owner, WorkspaceRole.maintainer]);
    await this.findOne(workspaceId, userId);

    const workspace = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: payload,
    });

    await this.auditService.log({ workspaceId, actorUserId: userId, action: 'workspace.update', entityType: 'workspace', entityId: workspace.id, afterJson: payload as unknown as Prisma.InputJsonValue });
    return workspace;
  }

  async remove(workspaceId: string, userId: string) {
    await this.workspaceAccess.requireMembership(workspaceId, userId, [WorkspaceRole.owner]);
    await this.findOne(workspaceId, userId);
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
    await this.auditService.log({ workspaceId, actorUserId: userId, action: 'workspace.delete', entityType: 'workspace', entityId: workspaceId });
    return { deleted: true, id: workspaceId };
  }
}

