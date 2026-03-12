import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUserId } from '../../common/auth/current-user-id.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller('workspaces/:workspaceId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll(@Param('workspaceId') workspaceId: string, @CurrentUserId() userId: string) {
    return this.projectsService.findAll(workspaceId, userId);
  }

  @Get(':projectId')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.projectsService.findOne(workspaceId, projectId, userId);
  }

  @Post()
  create(
    @Param('workspaceId') workspaceId: string,
    @Body() payload: CreateProjectDto,
    @CurrentUserId() userId: string,
  ) {
    return this.projectsService.create(workspaceId, payload, userId);
  }

  @Patch(':projectId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() payload: UpdateProjectDto,
    @CurrentUserId() userId: string,
  ) {
    return this.projectsService.update(workspaceId, projectId, payload, userId);
  }

  @Delete(':projectId')
  remove(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.projectsService.remove(workspaceId, projectId, userId);
  }
}
