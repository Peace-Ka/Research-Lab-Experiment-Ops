'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ExperimentSummary,
  ProjectSummary,
  RunDetail,
  RunSummary,
  WorkspaceSummary,
  fetchExperiments,
  fetchProjects,
  fetchRunDetail,
  fetchRuns,
  fetchWorkspaces,
} from './api';

export function useLabOpsData(userId: string, apiBase: string) {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [runDetail, setRunDetail] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) {
      setWorkspaces([]);
      setProjects([]);
      setExperiments([]);
      setRuns([]);
      setRunDetail(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const workspaceResult = await fetchWorkspaces(userId, apiBase);
      setWorkspaces(workspaceResult.items);

      const firstWorkspace = workspaceResult.items[0];
      if (!firstWorkspace) {
        setProjects([]);
        setExperiments([]);
        setRuns([]);
        setRunDetail(null);
        return;
      }

      const projectResult = await fetchProjects(firstWorkspace.id, userId, apiBase);
      setProjects(projectResult.items);

      const firstProject = projectResult.items[0];
      if (!firstProject) {
        setExperiments([]);
        setRuns([]);
        setRunDetail(null);
        return;
      }

      const experimentResult = await fetchExperiments(firstWorkspace.id, firstProject.id, userId, apiBase);
      setExperiments(experimentResult.items);

      const firstExperiment = experimentResult.items[0];
      if (!firstExperiment) {
        setRuns([]);
        setRunDetail(null);
        return;
      }

      const runResult = await fetchRuns(firstWorkspace.id, firstExperiment.id, userId, apiBase);
      setRuns(runResult.items);

      const firstRun = runResult.items[0];
      if (!firstRun) {
        setRunDetail(null);
        return;
      }

      const detail = await fetchRunDetail(firstWorkspace.id, firstRun.id, userId, apiBase);
      setRunDetail(detail);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unknown API error');
    } finally {
      setLoading(false);
    }
  }, [apiBase, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    workspaces,
    projects,
    experiments,
    runs,
    runDetail,
    loading,
    error,
    refresh,
  };
}
