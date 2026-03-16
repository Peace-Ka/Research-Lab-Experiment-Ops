export type AuthResponse = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  accessToken: string;
  authContext: {
    userId: string;
    accessToken: string;
    transport: string;
  };
  message: string;
};

export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  membership?: {
    role: string;
    status: string;
    createdAt: string;
  };
};

export type ProjectSummary = {
  id: string;
  workspaceId: string;
  name: string;
  description?: string | null;
  ownerUserId?: string | null;
};

export type ExperimentSummary = {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  hypothesis?: string | null;
  createdById: string;
};

export type RunSummary = {
  id: string;
  workspaceId: string;
  experimentId: string;
  runNumber: number;
  status: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
};

export type RunParamRecord = {
  id: string;
  key: string;
  value: string;
};

export type RunMetricRecord = {
  id: string;
  key: string;
  value: number;
  step?: number | null;
  loggedAt: string;
};

export type RunArtifactRecord = {
  id: string;
  type: 'model' | 'plot' | 'log' | 'checkpoint' | 'dataset_snapshot' | 'other';
  fileName: string;
  storageKey: string;
  checksumSha256: string;
  sizeBytes?: string | number | null;
  uploadedAt: string;
};

export type RunChecklistStateRecord = {
  id: string;
  status: 'pending' | 'passed' | 'failed' | 'waived';
  note?: string | null;
  checklistItem: {
    id: string;
    code: string;
    label: string;
    description?: string | null;
    isRequired: boolean;
  };
};

export type RunDetail = RunSummary & {
  codeRef?: string | null;
  randomSeed?: number | null;
  notes?: string | null;
  params: RunParamRecord[];
  metrics: RunMetricRecord[];
  artifacts: RunArtifactRecord[];
  checklistStates: RunChecklistStateRecord[];
};

function resolveApiBase(apiBase?: string) {
  return apiBase ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/v1';
}

async function request<T>(path: string, init?: RequestInit, accessToken?: string, apiBase?: string): Promise<T> {
  const headers = new Headers(init?.headers ?? {});

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${resolveApiBase(apiBase)}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function downloadRunArtifact(
  workspaceId: string,
  runId: string,
  artifactId: string,
  fileName: string,
  accessToken: string,
  apiBase?: string,
) {
  const response = await fetch(
    `${resolveApiBase(apiBase)}/workspaces/${workspaceId}/runs/${runId}/artifacts/${artifactId}/download`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export async function registerUser(payload: { email: string; name: string; password: string }, apiBase?: string) {
  return request<AuthResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    undefined,
    apiBase,
  );
}

export async function loginUser(payload: { email: string; password: string }, apiBase?: string) {
  return request<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    undefined,
    apiBase,
  );
}

export async function fetchWorkspaces(accessToken: string, apiBase?: string) {
  return request<{ items: WorkspaceSummary[]; total: number }>('/workspaces', undefined, accessToken, apiBase);
}

export async function createWorkspace(
  payload: { name: string; slug: string; description?: string },
  accessToken: string,
  apiBase?: string,
) {
  return request<WorkspaceSummary>(
    '/workspaces',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
    apiBase,
  );
}

export async function fetchProjects(workspaceId: string, accessToken: string, apiBase?: string) {
  return request<{ workspaceId: string; items: ProjectSummary[]; total: number }>(
    `/workspaces/${workspaceId}/projects`,
    undefined,
    accessToken,
    apiBase,
  );
}

export async function createProject(
  workspaceId: string,
  payload: { name: string; description?: string },
  accessToken: string,
  apiBase?: string,
) {
  return request<ProjectSummary>(
    `/workspaces/${workspaceId}/projects`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
    apiBase,
  );
}

export async function fetchExperiments(workspaceId: string, projectId: string, accessToken: string, apiBase?: string) {
  return request<{ workspaceId: string; projectId: string; items: ExperimentSummary[]; total: number }>(
    `/workspaces/${workspaceId}/projects/${projectId}/experiments`,
    undefined,
    accessToken,
    apiBase,
  );
}

export async function createExperiment(
  workspaceId: string,
  projectId: string,
  payload: { title: string; hypothesis?: string },
  accessToken: string,
  apiBase?: string,
) {
  return request<ExperimentSummary>(
    `/workspaces/${workspaceId}/projects/${projectId}/experiments`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
    apiBase,
  );
}

export async function fetchRuns(workspaceId: string, experimentId: string, accessToken: string, apiBase?: string) {
  return request<{ workspaceId: string; experimentId: string; items: RunSummary[]; total: number }>(
    `/workspaces/${workspaceId}/experiments/${experimentId}/runs`,
    undefined,
    accessToken,
    apiBase,
  );
}

export async function createRun(
  workspaceId: string,
  experimentId: string,
  payload: {
    codeRef?: string;
    randomSeed?: number;
    notes?: string;
  },
  accessToken: string,
  apiBase?: string,
) {
  return request<RunSummary>(
    `/workspaces/${workspaceId}/experiments/${experimentId}/runs`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
    apiBase,
  );
}

export async function fetchRunDetail(workspaceId: string, runId: string, accessToken: string, apiBase?: string) {
  return request<RunDetail>(`/workspaces/${workspaceId}/runs/${runId}`, undefined, accessToken, apiBase);
}

export async function updateRunStatus(
  workspaceId: string,
  runId: string,
  payload: { status: 'queued' | 'running' | 'completed' | 'failed' | 'canceled'; notes?: string },
  accessToken: string,
  apiBase?: string,
) {
  return request<RunSummary>(
    `/workspaces/${workspaceId}/runs/${runId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    accessToken,
    apiBase,
  );
}

export async function addRunParam(
  workspaceId: string,
  runId: string,
  payload: { key: string; value: string },
  accessToken: string,
  apiBase?: string,
) {
  return request<RunParamRecord>(
    `/workspaces/${workspaceId}/runs/${runId}/params`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
    apiBase,
  );
}

export async function addRunMetric(
  workspaceId: string,
  runId: string,
  payload: { key: string; value: number; step?: number },
  accessToken: string,
  apiBase?: string,
) {
  return request<RunMetricRecord>(
    `/workspaces/${workspaceId}/runs/${runId}/metrics`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    accessToken,
    apiBase,
  );
}

export async function addRunArtifact(
  workspaceId: string,
  runId: string,
  payload: {
    type: 'model' | 'plot' | 'log' | 'checkpoint' | 'dataset_snapshot' | 'other';
    file: File;
  },
  accessToken: string,
  apiBase?: string,
) {
  const formData = new FormData();
  formData.set('type', payload.type);
  formData.set('file', payload.file);

  return request<RunArtifactRecord>(
    `/workspaces/${workspaceId}/runs/${runId}/artifacts`,
    {
      method: 'POST',
      body: formData,
    },
    accessToken,
    apiBase,
  );
}

export async function updateRunChecklistState(
  workspaceId: string,
  runId: string,
  checklistItemId: string,
  payload: { status: 'pending' | 'passed' | 'failed' | 'waived'; note?: string },
  accessToken: string,
  apiBase?: string,
) {
  return request<RunChecklistStateRecord>(
    `/workspaces/${workspaceId}/runs/${runId}/checklist/${checklistItemId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    accessToken,
    apiBase,
  );
}
