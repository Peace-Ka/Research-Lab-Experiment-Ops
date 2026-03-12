import { scryptSync } from 'crypto';
import { PrismaClient, RunStatus, WorkspaceRole } from '@prisma/client';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = 'labops-demo-salt';
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function seed(): Promise<void> {
  await prisma.runMetric.deleteMany();
  await prisma.runParam.deleteMany();
  await prisma.experimentRun.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMembership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: 'demo@labops.dev',
      name: 'Demo Researcher',
      passwordHash: hashPassword('demo12345'),
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Applied ML Lab',
      slug: 'applied-ml-lab',
      description: 'Demo workspace for live portfolio walkthroughs.',
    },
  });

  await prisma.workspaceMembership.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: WorkspaceRole.owner,
    },
  });

  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      ownerUserId: user.id,
      name: 'Graph Reliability Study',
      description: 'Baseline and ablation runs for graph model reproducibility.',
    },
  });

  const experiment = await prisma.experiment.create({
    data: {
      workspaceId: workspace.id,
      projectId: project.id,
      title: 'GCN stability ablation',
      hypothesis: 'Smaller learning rates reduce variance across repeated graph training runs.',
      createdById: user.id,
    },
  });

  const runOne = await prisma.experimentRun.create({
    data: {
      workspaceId: workspace.id,
      experimentId: experiment.id,
      runNumber: 1,
      status: RunStatus.completed,
      createdById: user.id,
      codeRef: 'main@a1b2c3d',
      randomSeed: 42,
      notes: 'Baseline configuration completed successfully.',
    },
  });

  const runTwo = await prisma.experimentRun.create({
    data: {
      workspaceId: workspace.id,
      experimentId: experiment.id,
      runNumber: 2,
      status: RunStatus.failed,
      createdById: user.id,
      codeRef: 'main@d4e5f6g',
      randomSeed: 43,
      notes: 'Ablation failed due to exploding gradients at epoch 12.',
    },
  });

  await prisma.runParam.createMany({
    data: [
      { runId: runOne.id, key: 'learning_rate', value: '0.001' },
      { runId: runOne.id, key: 'batch_size', value: '64' },
      { runId: runTwo.id, key: 'learning_rate', value: '0.01' },
      { runId: runTwo.id, key: 'batch_size', value: '64' },
    ],
  });

  await prisma.runMetric.createMany({
    data: [
      { runId: runOne.id, key: 'accuracy', value: 0.914, step: 12 },
      { runId: runOne.id, key: 'loss', value: 0.214, step: 12 },
      { runId: runTwo.id, key: 'accuracy', value: 0.671, step: 12 },
      { runId: runTwo.id, key: 'loss', value: 1.402, step: 12 },
    ],
  });

  console.log('Demo seed complete');
  console.log(`User email: ${user.email}`);
  console.log('User password: demo12345');
  console.log(`User ID: ${user.id}`);
  console.log(`Workspace ID: ${workspace.id}`);
  console.log(`Project ID: ${project.id}`);
  console.log(`Experiment ID: ${experiment.id}`);
}

void seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
