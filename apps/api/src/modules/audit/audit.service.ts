import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type AuditLogInput = {
  workspaceId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: Prisma.InputJsonValue;
  afterJson?: Prisma.InputJsonValue;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        workspaceId: entry.workspaceId,
        actorUserId: entry.actorUserId ?? null,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        beforeJson: entry.beforeJson,
        afterJson: entry.afterJson,
      },
    });

    this.logger.log(`${entry.action}:${entry.entityType}:${entry.entityId}`);
  }

  async findAll(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership || membership.status !== 'active') {
      throw new ForbiddenException(`User ${userId} is not an active member of workspace ${workspaceId}`);
    }

    const items = await this.prisma.auditLog.findMany({
      where: { workspaceId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      workspaceId,
      items,
      total: items.length,
    };
  }
}
