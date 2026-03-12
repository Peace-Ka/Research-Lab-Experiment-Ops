'use client';

import { useEffect, useState } from 'react';
import {
  ExperimentSummary,
  ProjectSummary,
  RunSummary,
  WorkspaceSummary,
  fetchExperiments,
  fetchProjects,
  fetchRuns,
  fetchWorkspaces,
} from './api';

export function useLabOpsData(userId: string, apiBase: string) {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!userId) {
        setWorkspaces([]);
        setProjects([]);
        setExperiments([]);
        setRuns([]);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const workspaceResult = await fetchWorkspaces(userId, apiBase);
        if (cancelled) return;
        setWorkspaces(workspaceResult.items);

        const firstWorkspace = workspaceResult.items[0];
        if (!firstWorkspace) {
          setProjects([]);
          setExperiments([]);
          setRuns([]);
          return;
        }

        const projectResult = await fetchProjects(firstWorkspace.id, userId, apiBase);
        if (cancelled) return;
        setProjects(projectResult.items);

        const firstProject = projectResult.items[0];
        if (!firstProject) {
          setExperiments([]);
          setRuns([]);
          return;
        }

        const experimentResult = await fetchExperiments(firstWorkspace.id, firstProject.id, userId, apiBase);
        if (cancelled) return;
        setExperiments(experimentResult.items);

        const firstExperiment = experimentResult.items[0];
        if (!firstExperiment) {
          setRuns([]);
          return;
        }

        const runResult = await fetchRuns(firstWorkspace.id, firstExperiment.id, userId, apiBase);
        if (cancelled) return;
        setRuns(runResult.items);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Unknown API error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [apiBase, userId]);

  return {
    workspaces,
    projects,
    experiments,
    runs,
    loading,
    error,
  };
}
