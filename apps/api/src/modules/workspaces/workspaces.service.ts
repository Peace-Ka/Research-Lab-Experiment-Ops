import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly auditService: AuditService) {}

  findAll() {
    return {
      items: [],
      total: 0,
    };
  }

  create(payload: CreateWorkspaceDto) {
    const workspace = {
      id: 'workspace_scaffold',
      ...payload,
    };
    this.auditService.log('workspace.create', 'workspace', workspace.id);
    return workspace;
  }
}
