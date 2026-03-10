import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findAll() {
    return this.workspacesService.findAll();
  }

  @Post()
  create(@Body() payload: CreateWorkspaceDto) {
    return this.workspacesService.create(payload);
  }
}
