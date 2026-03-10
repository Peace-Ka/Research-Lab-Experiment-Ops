import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll() {
    const items = await this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      items,
      total: items.length,
    };
  }

  async findOne(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${workspaceId} not found`);
    }

    return workspace;
  }

  async create(payload: CreateWorkspaceDto) {
    const workspace = await this.prisma.workspace.create({
      data: payload,
    });

    this.auditService.log('workspace.create', 'workspace', workspace.id);
    return workspace;
  }

  async update(workspaceId: string, payload: UpdateWorkspaceDto) {
    await this.findOne(workspaceId);

    const workspace = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: payload,
    });

    this.auditService.log('workspace.update', 'workspace', workspace.id);
    return workspace;
  }

  async remove(workspaceId: string) {
    await this.findOne(workspaceId);
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
    this.auditService.log('workspace.delete', 'workspace', workspaceId);
    return { deleted: true, id: workspaceId };
  }
}