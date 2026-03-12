'use client';

import { useEffect, useState } from 'react';

const USER_ID_KEY = 'labops.userId';
const API_BASE_KEY = 'labops.apiBase';

export function useLabOpsSession() {
  const [userId, setUserIdState] = useState('');
  const [apiBase, setApiBaseState] = useState(process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001/v1');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const storedUserId = window.localStorage.getItem(USER_ID_KEY);
    const storedApiBase = window.localStorage.getItem(API_BASE_KEY);

    if (storedUserId) {
      setUserIdState(storedUserId);
    }

    if (storedApiBase) {
      setApiBaseState(storedApiBase);
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

  return {
    ready,
    userId,
    setUserId,
    apiBase,
    setApiBase,
  };
}
