import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUserId } from '../../common/auth/current-user-id.decorator';
import { CreateRunArtifactDto } from './dto/create-run-artifact.dto';
import { CreateRunMetricDto } from './dto/create-run-metric.dto';
import { CreateRunParamDto } from './dto/create-run-param.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunChecklistStateDto } from './dto/update-run-checklist-state.dto';
import { UpdateRunStatusDto } from './dto/update-run-status.dto';
import { RunsService } from './runs.service';

@Controller()
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Get('workspaces/:workspaceId/experiments/:experimentId/runs')
  findAll(
    @Param('workspaceId') workspaceId: string,
    @Param('experimentId') experimentId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.runsService.findAll(workspaceId, experimentId, userId);
  }

  @Get('workspaces/:workspaceId/runs/:runId')
  findOne(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @CurrentUserId() userId: string,
  ) {
    return this.runsService.findOne(workspaceId, runId, userId);
  }

  @Post('workspaces/:workspaceId/experiments/:experimentId/runs')
  create(
    @Param('workspaceId') workspaceId: string,
    @Param('experimentId') experimentId: string,
    @Body() payload: CreateRunDto,
    @CurrentUserId() userId: string,
  ) {
    return this.runsService.create(workspaceId, experimentId, payload, userId);
  }

  @Patch('workspaces/:workspaceId/runs/:runId/status')
  updateStatus(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @Body() payload: UpdateRunStatusDto,
    @CurrentUserId() userId: string,
  ) {
    return this.runsService.updateStatus(workspaceId, runId, payload, userId);
  }

  @Post('workspaces/:workspaceId/runs/:runId/params')
  upsertParam(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @Body() payload: CreateRunParamDto,
    @CurrentUserId() userId: string,
  ) {
    return this.runsService.upsertParam(workspaceId, runId, payload, userId);
  }

  @Post('workspaces/:workspaceId/runs/:runId/metrics')
  addMetric(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @Body() payload: CreateRunMetricDto,
    @CurrentUserId() userId: string,
  ) {
    return this.runsService.addMetric(workspaceId, runId, payload, userId);
  }

  @Post('workspaces/:workspaceId/runs/:runId/artifacts')
  addArtifact(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @Body() payload: CreateRunArtifactDto,
    @CurrentUserId() userId: string,
  ) {
    return this.runsService.addArtifact(workspaceId, runId, payload, userId);
  }

  @Patch('workspaces/:workspaceId/runs/:runId/checklist/:checklistItemId')
  updateChecklistState(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @Param('checklistItemId') checklistItemId: string,
    @Body() payload: UpdateRunChecklistStateDto,
    @CurrentUserId() userId: string,
  ) {
    return this.runsService.updateChecklistState(workspaceId, runId, checklistItemId, payload, userId);
  }
}
