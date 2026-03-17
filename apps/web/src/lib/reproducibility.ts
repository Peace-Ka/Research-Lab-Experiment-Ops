export type ReproducibilityChecklistState = {
  status: string;
  checklistItem: {
    isRequired: boolean;
    label: string;
  };
};

export type ReproducibilityInput = {
  codeRef?: string | null;
  randomSeed?: number | null;
  metrics: Array<unknown>;
  artifacts: Array<unknown>;
  checklistStates: ReproducibilityChecklistState[];
};

export type ReproducibilityLabel = 'Ready' | 'Almost ready' | 'Blocked';

export type ReproducibilityAssessment = {
  score: number;
  label: ReproducibilityLabel;
  tone: 'success' | 'warning' | 'danger';
  explanation: string;
  blockers: string[];
  passedChecks: number;
  totalChecks: number;
  blockingChecks: number;
};

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function assessReproducibility(run: ReproducibilityInput | null): ReproducibilityAssessment {
  if (!run) {
    return {
      score: 0,
      label: 'Blocked',
      tone: 'danger',
      explanation: 'Pick a run to see whether another researcher could realistically repeat it.',
      blockers: ['No run selected yet'],
      passedChecks: 0,
      totalChecks: 0,
      blockingChecks: 0,
    };
  }

  const requiredStates = run.checklistStates.filter((state) => state.checklistItem.isRequired);
  const passedRequired = requiredStates.filter(
    (state) => state.status === 'passed' || state.status === 'waived',
  ).length;
  const blockingRequired = requiredStates.filter(
    (state) => state.status !== 'passed' && state.status !== 'waived',
  );

  const blockers: string[] = [];

  if (!run.codeRef) {
    blockers.push('Missing code reference');
  }

  if (run.randomSeed == null) {
    blockers.push('Missing random seed');
  }

  if (blockingRequired.length > 0) {
    blockers.push('Required checklist items still incomplete');
  }

  if (run.metrics.length === 0) {
    blockers.push('No metrics logged yet');
  }

  if (run.artifacts.length === 0) {
    blockers.push('No artifacts uploaded yet');
  }

  const checklistScore = requiredStates.length === 0 ? 30 : Math.round((passedRequired / requiredStates.length) * 30);
  const score =
    (run.codeRef ? 20 : 0) +
    (run.randomSeed != null ? 20 : 0) +
    checklistScore +
    (run.metrics.length > 0 ? 15 : 0) +
    (run.artifacts.length > 0 ? 15 : 0);

  if (!run.codeRef || run.randomSeed == null || blockingRequired.length > 0) {
    return {
      score,
      label: 'Blocked',
      tone: 'danger',
      explanation:
        'This run still misses core setup details or required checklist work, so another researcher would struggle to repeat it confidently.',
      blockers: unique(blockers),
      passedChecks: run.checklistStates.filter((state) => state.status === 'passed').length,
      totalChecks: run.checklistStates.length,
      blockingChecks: blockingRequired.length,
    };
  }

  if (run.metrics.length === 0 || run.artifacts.length === 0) {
    return {
      score,
      label: 'Almost ready',
      tone: 'warning',
      explanation:
        'The run setup is documented well enough to follow, but it still needs stronger evidence like metrics or artifacts before it feels complete.',
      blockers: unique(blockers),
      passedChecks: run.checklistStates.filter((state) => state.status === 'passed').length,
      totalChecks: run.checklistStates.length,
      blockingChecks: 0,
    };
  }

  return {
    score,
    label: 'Ready',
    tone: 'success',
    explanation:
      'This run has the key setup details, required checklist coverage, and evidence another researcher would need to repeat and trust it.',
    blockers: [],
    passedChecks: run.checklistStates.filter((state) => state.status === 'passed').length,
    totalChecks: run.checklistStates.length,
    blockingChecks: 0,
  };
}