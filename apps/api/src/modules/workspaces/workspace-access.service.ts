import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { WorkspaceMembershipStatus, WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspaceAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserOrThrow(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException(`User ${userId} was not found`);
    }

    return user;
  }

  async requireMembership(
    workspaceId: string,
    userId: string,
    allowedRoles?: WorkspaceRole[],
  ) {
    await this.getUserOrThrow(userId);

    const membership = await this.prisma.workspaceMembership.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership || membership.status !== WorkspaceMembershipStatus.active) {
      throw new ForbiddenException(`User ${userId} is not an active member of workspace ${workspaceId}`);
    }

    if (allowedRoles && !allowedRoles.includes(membership.role)) {
      throw new ForbiddenException(
        `User ${userId} does not have one of the required roles for workspace ${workspaceId}`,
      );
    }

    return membership;
  }
}
