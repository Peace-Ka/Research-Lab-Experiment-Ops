import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUserId } from '../../common/auth/current-user-id.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  findAll(@CurrentUserId() userId: string) {
    return this.workspacesService.findAll(userId);
  }

  @Get(':workspaceId')
  findOne(@Param('workspaceId') workspaceId: string, @CurrentUserId() userId: string) {
    return this.workspacesService.findOne(workspaceId, userId);
  }

  @Post()
  create(@Body() payload: CreateWorkspaceDto, @CurrentUserId() userId: string) {
    return this.workspacesService.create(payload, userId);
  }

  @Patch(':workspaceId')
  update(
    @Param('workspaceId') workspaceId: string,
    @Body() payload: UpdateWorkspaceDto,
    @CurrentUserId() userId: string,
  ) {
    return this.workspacesService.update(workspaceId, payload, userId);
  }

  @Delete(':workspaceId')
  remove(@Param('workspaceId') workspaceId: string, @CurrentUserId() userId: string) {
    return this.workspacesService.remove(workspaceId, userId);
  }
}
