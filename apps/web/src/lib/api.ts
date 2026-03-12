export type AuthResponse = {
  user: {
    id: string;
    email: string;
    name: string;
  };
  authContext: {
    userId: string;
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

function resolveApiBase(apiBase?: string) {
  return apiBase ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/v1';
}

async function request<T>(path: string, init?: RequestInit, userId?: string, apiBase?: string): Promise<T> {
  const headers = new Headers(init?.headers ?? {});

  if (userId) {
    headers.set('x-user-id', userId);
  }

  if (init?.body && !headers.has('Content-Type')) {
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

export async function fetchWorkspaces(userId: string, apiBase?: string) {
  return request<{ items: WorkspaceSummary[]; total: number }>('/workspaces', undefined, userId, apiBase);
}

export async function fetchProjects(workspaceId: string, userId: string, apiBase?: string) {
  return request<{ workspaceId: string; items: ProjectSummary[]; total: number }>(
    `/workspaces/${workspaceId}/projects`,
    undefined,
    userId,
    apiBase,
  );
}

export async function fetchExperiments(workspaceId: string, projectId: string, userId: string, apiBase?: string) {
  return request<{ workspaceId: string; projectId: string; items: ExperimentSummary[]; total: number }>(
    `/workspaces/${workspaceId}/projects/${projectId}/experiments`,
    undefined,
    userId,
    apiBase,
  );
}

export async function fetchRuns(workspaceId: string, experimentId: string, userId: string, apiBase?: string) {
  return request<{ workspaceId: string; experimentId: string; items: RunSummary[]; total: number }>(
    `/workspaces/${workspaceId}/experiments/${experimentId}/runs`,
    undefined,
    userId,
    apiBase,
  );
}
