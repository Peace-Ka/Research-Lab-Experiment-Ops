import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findAll() {
    return this.workspacesService.findAll();
  }

  @Get(':workspaceId')
  findOne(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.findOne(workspaceId);
  }

  @Post()
  create(@Body() payload: CreateWorkspaceDto) {
    return this.workspacesService.create(payload);
  }

  @Patch(':workspaceId')
  update(@Param('workspaceId') workspaceId: string, @Body() payload: UpdateWorkspaceDto) {
    return this.workspacesService.update(workspaceId, payload);
  }

  @Delete(':workspaceId')
  remove(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.remove(workspaceId);
  }
}