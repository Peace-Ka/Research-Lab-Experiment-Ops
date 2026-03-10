import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Param('workspaceId') workspaceId: string) {
    return this.projectsService.findAll(workspaceId);
  }

  @Get(':projectId')
  findOne(@Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.projectsService.findOne(workspaceId, projectId);
  }

  @Post()
  create(@Param('workspaceId') workspaceId: string, @Body() payload: CreateProjectDto) {
    return this.projectsService.create(workspaceId, payload);
  }

  @Patch(':projectId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() payload: UpdateProjectDto,
  ) {
    return this.projectsService.update(workspaceId, projectId, payload);
  }

  @Delete(':projectId')
  remove(@Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.projectsService.remove(workspaceId, projectId);
  }
}