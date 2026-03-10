import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectsService } from './projects.service';

@Controller('workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.projectsService.findAll(workspaceId);
  }

  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body() payload: CreateProjectDto) {
    return this.projectsService.create(workspaceId, payload);
  }
}
