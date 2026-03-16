import { mkdir, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ArtifactType, ChecklistStatus, PrismaClient, RunStatus, WorkspaceRole } from '@prisma/client';

const prisma = new PrismaClient();
const artifactRoot = join(process.cwd(), 'storage', 'artifacts');

async function resetArtifactStorage() {
  await rm(artifactRoot, { recursive: true, force: true });
  await mkdir(artifactRoot, { recursive: true });
}

async function writeArtifactFile(storageKey: string, content: string) {
  const targetPath = join(artifactRoot, storageKey);
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content);
}

async function seed(): Promise<void> {
  await resetArtifactStorage();
  await prisma.runChecklistState.deleteMany();
  await prisma.reproChecklistItem.deleteMany();
  await prisma.artifact.deleteMany();
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
      externalAuthId: 'seed-demo-user',
      email: 'seed-demo@labops.dev',
      name: 'Seed Demo Researcher',
      passwordHash: null,
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

  const checklistItems = await prisma.reproChecklistItem.createManyAndReturn({
    data: [
      {
        workspaceId: workspace.id,
        code: 'seed-recorded',
        label: 'Random seed recorded',
        description: 'A deterministic random seed is attached to the run.',
      },
      {
        workspaceId: workspace.id,
        code: 'code-ref-recorded',
        label: 'Code reference captured',
        description: 'The exact commit or branch reference is recorded for replay.',
      },
      {
        workspaceId: workspace.id,
        code: 'metrics-logged',
        label: 'Outcome metrics logged',
        description: 'At least one meaningful evaluation metric is attached to the run.',
      },
      {
        workspaceId: workspace.id,
        code: 'notes-reviewed',
        label: 'Notes reviewed',
        description: 'The run carries enough notes for another researcher to understand context.',
        isRequired: false,
      },
    ],
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
      { runId: runOne.id, key: 'accuracy', value: 0.821, step: 4 },
      { runId: runOne.id, key: 'accuracy', value: 0.887, step: 8 },
      { runId: runOne.id, key: 'accuracy', value: 0.914, step: 12 },
      { runId: runOne.id, key: 'loss', value: 0.641, step: 4 },
      { runId: runOne.id, key: 'loss', value: 0.332, step: 8 },
      { runId: runOne.id, key: 'loss', value: 0.214, step: 12 },
      { runId: runTwo.id, key: 'accuracy', value: 0.612, step: 4 },
      { runId: runTwo.id, key: 'accuracy', value: 0.688, step: 8 },
      { runId: runTwo.id, key: 'accuracy', value: 0.671, step: 12 },
      { runId: runTwo.id, key: 'loss', value: 1.204, step: 4 },
      { runId: runTwo.id, key: 'loss', value: 1.118, step: 8 },
      { runId: runTwo.id, key: 'loss', value: 1.402, step: 12 },
    ],
  });

  const seededArtifacts = [
    {
      runId: runOne.id,
      type: ArtifactType.plot,
      fileName: 'loss-curve.png',
      storageKey: `${runOne.id}/loss-curve.png`,
      checksumSha256: '8d2668f302f8b3f4d4f733889f65ef1111111111111111111111111111111111',
      sizeBytes: 245760,
      content: 'seeded plot placeholder for loss curve',
    },
    {
      runId: runOne.id,
      type: ArtifactType.log,
      fileName: 'train.log',
      storageKey: `${runOne.id}/train.log`,
      checksumSha256: '7a65540470686d3669d4e92940c2222222222222222222222222222222222222',
      sizeBytes: 98304,
      content: 'epoch 12 complete\naccuracy=0.914\nloss=0.214',
    },
    {
      runId: runTwo.id,
      type: ArtifactType.checkpoint,
      fileName: 'failed-epoch-12.ckpt',
      storageKey: `${runTwo.id}/failed-epoch-12.ckpt`,
      checksumSha256: '25bb0df655ec1c21e2cf838213c3333333333333333333333333333333333333',
      sizeBytes: 6291456,
      content: 'seeded checkpoint placeholder for failed run',
    },
  ];

  await Promise.all(seededArtifacts.map((artifact) => writeArtifactFile(artifact.storageKey, artifact.content)));

  await prisma.artifact.createMany({
    data: seededArtifacts.map(({ content, ...artifact }) => artifact),
  });

  const checklistByCode = new Map(checklistItems.map((item) => [item.code, item.id]));

  await prisma.runChecklistState.createMany({
    data: [
      {
        runId: runOne.id,
        checklistItemId: checklistByCode.get('seed-recorded')!,
        status: ChecklistStatus.passed,
        note: 'Seed 42 recorded in run metadata.',
      },
      {
        runId: runOne.id,
        checklistItemId: checklistByCode.get('code-ref-recorded')!,
        status: ChecklistStatus.passed,
        note: 'Pinned to main@a1b2c3d.',
      },
      {
        runId: runOne.id,
        checklistItemId: checklistByCode.get('metrics-logged')!,
        status: ChecklistStatus.passed,
        note: 'Accuracy and loss recorded across three checkpoints.',
      },
      {
        runId: runOne.id,
        checklistItemId: checklistByCode.get('notes-reviewed')!,
        status: ChecklistStatus.passed,
        note: 'Baseline notes reviewed by demo owner.',
      },
      {
        runId: runTwo.id,
        checklistItemId: checklistByCode.get('seed-recorded')!,
        status: ChecklistStatus.passed,
        note: 'Seed 43 recorded in run metadata.',
      },
      {
        runId: runTwo.id,
        checklistItemId: checklistByCode.get('code-ref-recorded')!,
        status: ChecklistStatus.passed,
        note: 'Pinned to main@d4e5f6g.',
      },
      {
        runId: runTwo.id,
        checklistItemId: checklistByCode.get('metrics-logged')!,
        status: ChecklistStatus.failed,
        note: 'Loss diverged by epoch 12 and final evaluation is incomplete.',
      },
      {
        runId: runTwo.id,
        checklistItemId: checklistByCode.get('notes-reviewed')!,
        status: ChecklistStatus.pending,
        note: 'Failure analysis still needs peer review.',
      },
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


