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

type UseLabOpsDataOptions = {
  selectedProjectId?: string;
  selectedExperimentId?: string;
  selectedRunId?: string;
  onProjectResolved?: (projectId: string) => void;
  onExperimentResolved?: (experimentId: string) => void;
  onRunResolved?: (runId: string) => void;
};

export function useLabOpsData(accessToken: string, apiBase: string, options: UseLabOpsDataOptions = {}) {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [runDetail, setRunDetail] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProjectId = options.selectedProjectId ?? '';
  const selectedExperimentId = options.selectedExperimentId ?? '';
  const selectedRunId = options.selectedRunId ?? '';
  const onProjectResolved = options.onProjectResolved;
  const onExperimentResolved = options.onExperimentResolved;
  const onRunResolved = options.onRunResolved;

  const refresh = useCallback(async () => {
    if (!accessToken) {
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
      const workspaceResult = await fetchWorkspaces(accessToken, apiBase);
      setWorkspaces(workspaceResult.items);

      const firstWorkspace = workspaceResult.items[0];
      if (!firstWorkspace) {
        setProjects([]);
        setExperiments([]);
        setRuns([]);
        setRunDetail(null);
        return;
      }

      const projectResult = await fetchProjects(firstWorkspace.id, accessToken, apiBase);
      setProjects(projectResult.items);

      const scopedProject = projectResult.items.find((project) => project.id === selectedProjectId) ?? projectResult.items[0];

      if (scopedProject?.id && scopedProject.id !== selectedProjectId) {
        onProjectResolved?.(scopedProject.id);
      }

      if (!scopedProject) {
        setExperiments([]);
        setRuns([]);
        setRunDetail(null);
        return;
      }

      const experimentResult = await fetchExperiments(firstWorkspace.id, scopedProject.id, accessToken, apiBase);
      setExperiments(experimentResult.items);

      const scopedExperiment = experimentResult.items.find((experiment) => experiment.id === selectedExperimentId) ?? experimentResult.items[0];

      if (scopedExperiment?.id && scopedExperiment.id !== selectedExperimentId) {
        onExperimentResolved?.(scopedExperiment.id);
      }

      if (!scopedExperiment) {
        setRuns([]);
        setRunDetail(null);
        return;
      }

      const runResult = await fetchRuns(firstWorkspace.id, scopedExperiment.id, accessToken, apiBase);
      setRuns(runResult.items);

      const scopedRun = runResult.items.find((run) => run.id === selectedRunId) ?? runResult.items[0];
      if (scopedRun?.id && scopedRun.id !== selectedRunId) {
        onRunResolved?.(scopedRun.id);
      }

      if (!scopedRun) {
        setRunDetail(null);
        return;
      }

      const detail = await fetchRunDetail(firstWorkspace.id, scopedRun.id, accessToken, apiBase);
      setRunDetail(detail);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unknown API error');
    } finally {
      setLoading(false);
    }
  }, [
    accessToken,
    apiBase,
    onExperimentResolved,
    onProjectResolved,
    onRunResolved,
    selectedExperimentId,
    selectedProjectId,
    selectedRunId,
  ]);

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
