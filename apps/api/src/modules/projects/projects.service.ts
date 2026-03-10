import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly auditService: AuditService) {}

  findAll(workspaceId: string) {
    return {
      workspaceId,
      items: [],
      total: 0,
    };
  }

  create(workspaceId: string, payload: CreateProjectDto) {
    const project = {
      id: 'project_scaffold',
      workspaceId,
      ...payload,
    };
    this.auditService.log('project.create', 'project', project.id);
    return project;
  }
}
