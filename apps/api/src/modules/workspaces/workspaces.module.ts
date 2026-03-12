import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspaceAccessService } from './workspace-access.service';
import { WorkspacesService } from './workspaces.service';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspaceAccessService],
  exports: [WorkspaceAccessService],
})
export class WorkspacesModule {}
