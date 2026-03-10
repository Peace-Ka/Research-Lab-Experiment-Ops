import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateRunMetricDto } from './dto/create-run-metric.dto';
import { CreateRunParamDto } from './dto/create-run-param.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunStatusDto } from './dto/update-run-status.dto';
import { RunsService } from './runs.service';

@Controller()
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Get('workspaces/:workspaceId/experiments/:experimentId/runs')
  findAll(@Param('workspaceId') workspaceId: string, @Param('experimentId') experimentId: string) {
    return this.runsService.findAll(workspaceId, experimentId);
  }

  @Get('workspaces/:workspaceId/runs/:runId')
  findOne(@Param('workspaceId') workspaceId: string, @Param('runId') runId: string) {
    return this.runsService.findOne(workspaceId, runId);
  }

  @Post('workspaces/:workspaceId/experiments/:experimentId/runs')
  create(
    @Param('workspaceId') workspaceId: string,
    @Param('experimentId') experimentId: string,
    @Body() payload: CreateRunDto,
  ) {
    return this.runsService.create(workspaceId, experimentId, payload);
  }

  @Patch('workspaces/:workspaceId/runs/:runId/status')
  updateStatus(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @Body() payload: UpdateRunStatusDto,
  ) {
    return this.runsService.updateStatus(workspaceId, runId, payload);
  }

  @Post('workspaces/:workspaceId/runs/:runId/params')
  upsertParam(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @Body() payload: CreateRunParamDto,
  ) {
    return this.runsService.upsertParam(workspaceId, runId, payload);
  }

  @Post('workspaces/:workspaceId/runs/:runId/metrics')
  addMetric(
    @Param('workspaceId') workspaceId: string,
    @Param('runId') runId: string,
    @Body() payload: CreateRunMetricDto,
  ) {
    return this.runsService.addMetric(workspaceId, runId, payload);
  }
}