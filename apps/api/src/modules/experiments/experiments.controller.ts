import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUserId } from '../../common/auth/current-user-id.decorator';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';
import { ExperimentsService } from './experiments.service';

@Controller()
export class ExperimentsController {
  constructor(private readonly experimentsService: ExperimentsService) {}

  @Get('workspaces/:workspaceId/projects/:projectId/experiments')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.experimentsService.findAll(workspaceId, projectId, userId);
  }

  @Get('workspaces/:workspaceId/experiments/:experimentId')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('experimentId') experimentId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.experimentsService.findOne(workspaceId, experimentId, userId);
  }

  @Post('workspaces/:workspaceId/projects/:projectId/experiments')
  create(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() payload: CreateExperimentDto,
    @CurrentUserId() userId: string,
  ) {
    return this.experimentsService.create(workspaceId, projectId, payload, userId);
  }

  @Patch('workspaces/:workspaceId/experiments/:experimentId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Param('experimentId') experimentId: string,
    @Body() payload: UpdateExperimentDto,
    @CurrentUserId() userId: string,
  ) {
    return this.experimentsService.update(workspaceId, experimentId, payload, userId);
  }
}
