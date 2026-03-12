'use client';

import { useEffect, useState } from 'react';

const USER_ID_KEY = 'labops.userId';
const API_BASE_KEY = 'labops.apiBase';
const PROJECT_ID_KEY = 'labops.projectId';
const EXPERIMENT_ID_KEY = 'labops.experimentId';

export function useLabOpsSession() {
  const [userId, setUserIdState] = useState('');
  const [apiBase, setApiBaseState] = useState(process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/v1');
  const [selectedProjectId, setSelectedProjectIdState] = useState('');
  const [selectedExperimentId, setSelectedExperimentIdState] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUserId = window.localStorage.getItem(USER_ID_KEY);
    const storedApiBase = window.localStorage.getItem(API_BASE_KEY);
    const storedProjectId = window.localStorage.getItem(PROJECT_ID_KEY);
    const storedExperimentId = window.localStorage.getItem(EXPERIMENT_ID_KEY);

    if (storedUserId) {
      setUserIdState(storedUserId);
    }

    if (storedApiBase) {
      setApiBaseState(storedApiBase);
    }

    if (storedProjectId) {
      setSelectedProjectIdState(storedProjectId);
    }

    if (storedExperimentId) {
      setSelectedExperimentIdState(storedExperimentId);
    }

    setReady(true);
  }, []);

  const setUserId = (nextUserId: string) => {
    setUserIdState(nextUserId);
    window.localStorage.setItem(USER_ID_KEY, nextUserId);
  };

  const setApiBase = (nextApiBase: string) => {
    setApiBaseState(nextApiBase);
    window.localStorage.setItem(API_BASE_KEY, nextApiBase);
  };

  const setSelectedProjectId = (projectId: string) => {
    setSelectedProjectIdState(projectId);
    window.localStorage.setItem(PROJECT_ID_KEY, projectId);
  };

  const setSelectedExperimentId = (experimentId: string) => {
    setSelectedExperimentIdState(experimentId);
    window.localStorage.setItem(EXPERIMENT_ID_KEY, experimentId);
  };

  return {
    ready,
    userId,
    setUserId,
    apiBase,
    setApiBase,
    selectedProjectId,
    setSelectedProjectId,
    selectedExperimentId,
    setSelectedExperimentId,
  };
}
