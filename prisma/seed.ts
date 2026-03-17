import { access, mkdir, rm, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { ArtifactType, ChecklistStatus, PrismaClient, RunStatus, WorkspaceMembershipStatus, WorkspaceRole } from '@prisma/client';

const prisma = new PrismaClient();
const artifactRoot = join(process.cwd(), 'storage', 'artifacts');
const DEMO_USER_EMAIL = 'seed-demo@labops.dev';
const DEMO_USER_EXTERNAL_ID = 'seed-demo-user';
const SEED_MODE = process.argv.includes('--mode=reset') ? 'reset' : 'safe';

async function resetArtifactStorage() {
  await rm(artifactRoot, { recursive: true, force: true });
  await mkdir(artifactRoot, { recursive: true });
}

async function writeArtifactFile(storageKey: string, content: string) {
  const targetPath = join(artifactRoot, storageKey);
  await mkdir(dirname(targetPath), { recursive: true });
  await writeFile(targetPath, content);
}

async function ensureArtifactFile(storageKey: string, content: string) {
  const targetPath = join(artifactRoot, storageKey);

  try {
    await access(targetPath);
  } catch {
    await writeArtifactFile(storageKey, content);
  }
}

async function resetAllData() {
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
}

async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });

  if (existing) {
    if (existing.externalAuthId !== DEMO_USER_EXTERNAL_ID) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          externalAuthId: existing.externalAuthId ?? DEMO_USER_EXTERNAL_ID,
          passwordHash: null,
        },
      });
    }

    return existing;
  }

  return prisma.user.create({
    data: {
      externalAuthId: DEMO_USER_EXTERNAL_ID,
      email: DEMO_USER_EMAIL,
      name: 'Seed Demo Researcher',
      passwordHash: null,
    },
  });
}

async function ensureDemoWorkspace() {
  return prisma.workspace.upsert({
    where: { slug: 'applied-ml-lab' },
    update: {},
    create: {
      name: 'Applied ML Lab',
      slug: 'applied-ml-lab',
      description: 'Demo workspace for live portfolio walkthroughs.',
    },
  });
}

async function ensureMembership(workspaceId: string, userId: string) {
  return prisma.workspaceMembership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    update: {
      role: WorkspaceRole.owner,
      status: WorkspaceMembershipStatus.active,
    },
    create: {
      workspaceId,
      userId,
      role: WorkspaceRole.owner,
      status: WorkspaceMembershipStatus.active,
    },
  });
}

async function ensureDemoProject(workspaceId: string, userId: string) {
  return prisma.project.upsert({
    where: {
      workspaceId_name: {
        workspaceId,
        name: 'Graph Reliability Study',
      },
    },
    update: {},
    create: {
      workspaceId,
      ownerUserId: userId,
      name: 'Graph Reliability Study',
      description: 'Baseline and ablation runs for graph model reproducibility.',
    },
  });
}

async function ensureDemoExperiment(workspaceId: string, projectId: string, userId: string) {
  const existing = await prisma.experiment.findFirst({
    where: {
      workspaceId,
      projectId,
      title: 'GCN stability ablation',
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.experiment.create({
    data: {
      workspaceId,
      projectId,
      title: 'GCN stability ablation',
      hypothesis: 'Smaller learning rates reduce variance across repeated graph training runs.',
      createdById: userId,
    },
  });
}

async function ensureChecklistItems(workspaceId: string) {
  const definitions = [
    {
      code: 'seed-recorded',
      label: 'Random seed recorded',
      description: 'A deterministic random seed is attached to the run.',
      isRequired: true,
    },
    {
      code: 'code-ref-recorded',
      label: 'Code reference captured',
      description: 'The exact commit or branch reference is recorded for replay.',
      isRequired: true,
    },
    {
      code: 'metrics-logged',
      label: 'Outcome metrics logged',
      description: 'At least one meaningful evaluation metric is attached to the run.',
      isRequired: true,
    },
    {
      code: 'notes-reviewed',
      label: 'Notes reviewed',
      description: 'The run carries enough notes for another researcher to understand context.',
      isRequired: false,
    },
  ] as const;

  const items = await Promise.all(
    definitions.map((item) =>
      prisma.reproChecklistItem.upsert({
        where: {
          workspaceId_code: {
            workspaceId,
            code: item.code,
          },
        },
        update: {},
        create: {
          workspaceId,
          code: item.code,
          label: item.label,
          description: item.description,
          isRequired: item.isRequired,
        },
      }),
    ),
  );

  return new Map(items.map((item) => [item.code, item.id]));
}

async function ensureRun(
  workspaceId: string,
  experimentId: string,
  userId: string,
  definition: {
    runNumber: number;
    status: RunStatus;
    codeRef: string;
    randomSeed: number;
    notes: string;
  },
) {
  const existing = await prisma.experimentRun.findFirst({
    where: {
      workspaceId,
      experimentId,
      runNumber: definition.runNumber,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.experimentRun.create({
    data: {
      workspaceId,
      experimentId,
      runNumber: definition.runNumber,
      status: definition.status,
      createdById: userId,
      codeRef: definition.codeRef,
      randomSeed: definition.randomSeed,
      notes: definition.notes,
    },
  });
}

async function ensureRunParam(runId: string, key: string, value: string) {
  const existing = await prisma.runParam.findUnique({
    where: {
      runId_key: {
        runId,
        key,
      },
    },
  });

  if (!existing) {
    await prisma.runParam.create({
      data: { runId, key, value },
    });
  }
}

async function ensureRunMetric(runId: string, key: string, value: number, step: number) {
  const existing = await prisma.runMetric.findFirst({
    where: { runId, key, value, step },
  });

  if (!existing) {
    await prisma.runMetric.create({
      data: { runId, key, value, step },
    });
  }
}

async function ensureArtifact(
  runId: string,
  artifact: {
    type: ArtifactType;
    fileName: string;
    storageKey: string;
    checksumSha256: string;
    sizeBytes: number;
    content: string;
  },
) {
  await ensureArtifactFile(artifact.storageKey, artifact.content);

  const existing = await prisma.artifact.findFirst({
    where: {
      runId,
      storageKey: artifact.storageKey,
    },
  });

  if (!existing) {
    await prisma.artifact.create({
      data: {
        runId,
        type: artifact.type,
        fileName: artifact.fileName,
        storageKey: artifact.storageKey,
        checksumSha256: artifact.checksumSha256,
        sizeBytes: BigInt(artifact.sizeBytes),
      },
    });
  }
}

async function ensureChecklistState(
  runId: string,
  checklistItemId: string,
  status: ChecklistStatus,
  note: string,
) {
  const existing = await prisma.runChecklistState.findUnique({
    where: {
      runId_checklistItemId: {
        runId,
        checklistItemId,
      },
    },
  });

  if (!existing) {
    await prisma.runChecklistState.create({
      data: {
        runId,
        checklistItemId,
        status,
        note,
      },
    });
  }
}

async function seed(): Promise<void> {
  if (SEED_MODE === 'reset') {
    await resetAllData();
  } else {
    await mkdir(artifactRoot, { recursive: true });
  }

  const user = await ensureDemoUser();
  const workspace = await ensureDemoWorkspace();
  await ensureMembership(workspace.id, user.id);
  const project = await ensureDemoProject(workspace.id, user.id);
  const experiment = await ensureDemoExperiment(workspace.id, project.id, user.id);
  const checklistByCode = await ensureChecklistItems(workspace.id);

  const runOne = await ensureRun(workspace.id, experiment.id, user.id, {
    runNumber: 1,
    status: RunStatus.completed,
    codeRef: 'main@a1b2c3d',
    randomSeed: 42,
    notes: 'Baseline configuration completed successfully.',
  });

  const runTwo = await ensureRun(workspace.id, experiment.id, user.id, {
    runNumber: 2,
    status: RunStatus.failed,
    codeRef: 'main@d4e5f6g',
    randomSeed: 43,
    notes: 'Ablation failed due to exploding gradients at epoch 12.',
  });

  await Promise.all([
    ensureRunParam(runOne.id, 'learning_rate', '0.001'),
    ensureRunParam(runOne.id, 'batch_size', '64'),
    ensureRunParam(runTwo.id, 'learning_rate', '0.01'),
    ensureRunParam(runTwo.id, 'batch_size', '64'),
  ]);

  await Promise.all([
    ensureRunMetric(runOne.id, 'accuracy', 0.821, 4),
    ensureRunMetric(runOne.id, 'accuracy', 0.887, 8),
    ensureRunMetric(runOne.id, 'accuracy', 0.914, 12),
    ensureRunMetric(runOne.id, 'loss', 0.641, 4),
    ensureRunMetric(runOne.id, 'loss', 0.332, 8),
    ensureRunMetric(runOne.id, 'loss', 0.214, 12),
    ensureRunMetric(runTwo.id, 'accuracy', 0.612, 4),
    ensureRunMetric(runTwo.id, 'accuracy', 0.688, 8),
    ensureRunMetric(runTwo.id, 'accuracy', 0.671, 12),
    ensureRunMetric(runTwo.id, 'loss', 1.204, 4),
    ensureRunMetric(runTwo.id, 'loss', 1.118, 8),
    ensureRunMetric(runTwo.id, 'loss', 1.402, 12),
  ]);

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
  ] as const;

  await Promise.all(seededArtifacts.map((artifact) => ensureArtifact(artifact.runId, artifact)));

  await Promise.all([
    ensureChecklistState(runOne.id, checklistByCode.get('seed-recorded')!, ChecklistStatus.passed, 'Seed 42 recorded in run metadata.'),
    ensureChecklistState(runOne.id, checklistByCode.get('code-ref-recorded')!, ChecklistStatus.passed, 'Pinned to main@a1b2c3d.'),
    ensureChecklistState(runOne.id, checklistByCode.get('metrics-logged')!, ChecklistStatus.passed, 'Accuracy and loss recorded across three checkpoints.'),
    ensureChecklistState(runOne.id, checklistByCode.get('notes-reviewed')!, ChecklistStatus.passed, 'Baseline notes reviewed by demo owner.'),
    ensureChecklistState(runTwo.id, checklistByCode.get('seed-recorded')!, ChecklistStatus.passed, 'Seed 43 recorded in run metadata.'),
    ensureChecklistState(runTwo.id, checklistByCode.get('code-ref-recorded')!, ChecklistStatus.passed, 'Pinned to main@d4e5f6g.'),
    ensureChecklistState(runTwo.id, checklistByCode.get('metrics-logged')!, ChecklistStatus.failed, 'Loss diverged by epoch 12 and final evaluation is incomplete.'),
    ensureChecklistState(runTwo.id, checklistByCode.get('notes-reviewed')!, ChecklistStatus.pending, 'Failure analysis still needs peer review.'),
  ]);

  console.log(`Seed mode: ${SEED_MODE}`);
  console.log('Demo seed ready');
  console.log(`Demo user email: ${user.email}`);
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