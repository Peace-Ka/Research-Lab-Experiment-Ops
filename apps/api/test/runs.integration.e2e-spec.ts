import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Run params and metrics integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.runMetric.deleteMany();
    await prisma.runParam.deleteMany();
    await prisma.experimentRun.deleteMany();
    await prisma.experiment.deleteMany();
    await prisma.project.deleteMany();
    await prisma.workspaceMembership.deleteMany();
    await prisma.workspace.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  async function seedRunGraph() {
    const user = await prisma.user.create({
      data: {
        email: `peace+${Date.now()}@example.com`,
        name: 'Peace',
        passwordHash: 'hashed-password',
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: 'Systems Lab',
        slug: `systems-lab-${Date.now()}`,
      },
    });

    await prisma.workspaceMembership.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'researcher',
      },
    });

    const project = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        ownerUserId: user.id,
        name: 'Graph Benchmark',
        description: 'Benchmarking graph experiments',
      },
    });

    const experiment = await prisma.experiment.create({
      data: {
        workspaceId: workspace.id,
        projectId: project.id,
        title: 'GCN ablation',
        createdById: user.id,
      },
    });

    const run = await prisma.experimentRun.create({
      data: {
        workspaceId: workspace.id,
        experimentId: experiment.id,
        runNumber: 1,
        status: 'queued',
        createdById: user.id,
      },
    });

    return { user, workspace, run };
  }

  it('upserts a run param through the HTTP API and persists it', async () => {
    const { user, workspace, run } = await seedRunGraph();

    await request(app.getHttpServer())
      .post(`/v1/workspaces/${workspace.id}/runs/${run.id}/params`)
      .set('x-user-id', user.id)
      .send({ key: 'learning_rate', value: '0.001' })
      .expect(201);

    const param = await prisma.runParam.findUnique({
      where: {
        runId_key: {
          runId: run.id,
          key: 'learning_rate',
        },
      },
    });

    expect(param?.value).toBe('0.001');

    await request(app.getHttpServer())
      .post(`/v1/workspaces/${workspace.id}/runs/${run.id}/params`)
      .set('x-user-id', user.id)
      .send({ key: 'learning_rate', value: '0.0005' })
      .expect(201);

    const updatedParam = await prisma.runParam.findUnique({
      where: {
        runId_key: {
          runId: run.id,
          key: 'learning_rate',
        },
      },
    });

    expect(updatedParam?.value).toBe('0.0005');
  });

  it('creates a run metric through the HTTP API and persists it', async () => {
    const { user, workspace, run } = await seedRunGraph();

    await request(app.getHttpServer())
      .post(`/v1/workspaces/${workspace.id}/runs/${run.id}/metrics`)
      .set('x-user-id', user.id)
      .send({ key: 'accuracy', value: 0.91, step: 3 })
      .expect(201);

    const metrics = await prisma.runMetric.findMany({
      where: { runId: run.id },
      orderBy: { loggedAt: 'asc' },
    });

    expect(metrics).toHaveLength(1);
    expect(metrics[0]?.key).toBe('accuracy');
    expect(metrics[0]?.value).toBe(0.91);
    expect(metrics[0]?.step).toBe(3);
  });
});
