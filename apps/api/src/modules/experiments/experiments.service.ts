import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentDto } from './dto/update-experiment.dto';

@Injectable()
export class ExperimentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(workspaceId: string, projectId: string) {
    const items = await this.prisma.experiment.findMany({
      where: { workspaceId, projectId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      workspaceId,
      projectId,
      items,
      total: items.length,
    };
  }

  async findOne(workspaceId: string, experimentId: string) {
    const experiment = await this.prisma.experiment.findFirst({
      where: { id: experimentId, workspaceId },
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment ${experimentId} not found in workspace ${workspaceId}`);
    }

    return experiment;
  }

  async create(workspaceId: string, projectId: string, payload: CreateExperimentDto) {
    await this.prisma.project.findFirstOrThrow({ where: { id: projectId, workspaceId } });

    const experiment = await this.prisma.experiment.create({
      data: {
        workspaceId,
        projectId,
        ...payload,
      },
    });

    this.auditService.log('experiment.create', 'experiment', experiment.id);
    return experiment;
  }

  async update(workspaceId: string, experimentId: string, payload: UpdateExperimentDto) {
    await this.findOne(workspaceId, experimentId);

    const experiment = await this.prisma.experiment.update({
      where: { id: experimentId },
      data: payload,
    });

    this.auditService.log('experiment.update', 'experiment', experiment.id);
    return experiment;
  }
}