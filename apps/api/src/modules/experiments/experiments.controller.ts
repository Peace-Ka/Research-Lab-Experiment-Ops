import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { ExperimentsService } from './experiments.service';

@Controller()
export class ExperimentsController {
  constructor(private readonly experimentsService: ExperimentsService) {}

  @Get('workspaces/:workspaceId/projects/:projectId/experiments')
  findAll(@Param('workspaceId') workspaceId: string, @Param('projectId') projectId: string) {
    return this.experimentsService.findAll(workspaceId, projectId);
  }

  @Get('workspaces/:workspaceId/experiments/:experimentId')
  findOne(@Param('workspaceId') workspaceId: string, @Param('experimentId') experimentId: string) {
    return this.experimentsService.findOne(workspaceId, experimentId);
  }

  @Post('workspaces/:workspaceId/projects/:projectId/experiments')
  create(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() payload: CreateExperimentDto,
  ) {
    return this.experimentsService.create(workspaceId, projectId, payload);
  }

  @Patch('workspaces/:workspaceId/experiments/:experimentId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('experimentId') experimentId: string,
    @Body() payload: UpdateExperimentDto,
  ) {
    return this.experimentsService.update(workspaceId, experimentId, payload);
  }
}