'use client';

import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect, useState } from 'react';

const API_BASE_KEY = 'labops.apiBase';
const PROJECT_ID_KEY = 'labops.projectId';
const EXPERIMENT_ID_KEY = 'labops.experimentId';
const RUN_ID_KEY = 'labops.runId';

export function useLabOpsSession() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth();
  const [apiBase, setApiBaseState] = useState(process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/v1');
  const [selectedProjectId, setSelectedProjectIdState] = useState('');
  const [selectedExperimentId, setSelectedExperimentIdState] = useState('');
  const [selectedRunId, setSelectedRunIdState] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedApiBase = window.localStorage.getItem(API_BASE_KEY);
    const storedProjectId = window.localStorage.getItem(PROJECT_ID_KEY);
    const storedExperimentId = window.localStorage.getItem(EXPERIMENT_ID_KEY);
    const storedRunId = window.localStorage.getItem(RUN_ID_KEY);

    if (storedApiBase) {
      setApiBaseState(storedApiBase);
    }

    if (storedProjectId) {
      setSelectedProjectIdState(storedProjectId);
    }

    if (storedExperimentId) {
      setSelectedExperimentIdState(storedExperimentId);
    }

    if (storedRunId) {
      setSelectedRunIdState(storedRunId);
    }

    setReady(true);
  }, []);

  const resolveAccessToken = useCallback(async () => {
    if (!isSignedIn) {
      return null;
    }

    return getToken();
  }, [getToken, isSignedIn]);

  const setApiBase = useCallback((nextApiBase: string) => {
    setApiBaseState(nextApiBase);
    window.localStorage.setItem(API_BASE_KEY, nextApiBase);
  }, []);

  const setSelectedProjectId = useCallback((projectId: string) => {
    setSelectedProjectIdState(projectId);
    if (projectId) {
      window.localStorage.setItem(PROJECT_ID_KEY, projectId);
    } else {
      window.localStorage.removeItem(PROJECT_ID_KEY);
    }
  }, []);

  const setSelectedExperimentId = useCallback((experimentId: string) => {
    setSelectedExperimentIdState(experimentId);
    if (experimentId) {
      window.localStorage.setItem(EXPERIMENT_ID_KEY, experimentId);
    } else {
      window.localStorage.removeItem(EXPERIMENT_ID_KEY);
    }
  }, []);

  const setSelectedRunId = useCallback((runId: string) => {
    setSelectedRunIdState(runId);
    if (runId) {
      window.localStorage.setItem(RUN_ID_KEY, runId);
    } else {
      window.localStorage.removeItem(RUN_ID_KEY);
    }
  }, []);

  return {
    ready: ready && isLoaded,
    isSignedIn,
    userId: userId ?? '',
    getAccessToken: resolveAccessToken,
    apiBase,
    setApiBase,
    selectedProjectId,
    setSelectedProjectId,
    selectedExperimentId,
    setSelectedExperimentId,
    selectedRunId,
    setSelectedRunId,
  };
}
