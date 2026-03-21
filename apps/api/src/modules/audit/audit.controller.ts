import { Controller, Get, Param } from '@nestjs/common';
import { CurrentUserId } from '../../common/auth/current-user-id.decorator';
import { AuditService } from './audit.service';

@Controller()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('workspaces/:workspaceId/audit-logs')
  findAll(@Param('workspaceId') workspaceId: string, @CurrentUserId() userId: string) {
    return this.auditService.findAll(workspaceId, userId);
  }
}
