'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  addRunMetric,
  addRunParam,
  RunChecklistStateRecord,
  RunDetail,
  updateRunChecklistState,
  updateRunStatus,
} from '../lib/api';

type RunDetailPanelProps = {
  workspaceId?: string;
  userId: string;
  apiBase: string;
  runDetail: RunDetail | null;
  onRefresh: () => Promise<void>;
};

const RUN_STATUSES = ['queued', 'running', 'completed', 'failed', 'canceled'] as const;
const CHECKLIST_STATUSES = ['pending', 'passed', 'failed', 'waived'] as const;
const EMPTY_CHECKLIST: RunChecklistStateRecord[] = [];

type ChecklistDraftMap = Record<string, string>;

export function RunDetailPanel({ workspaceId, userId, apiBase, runDetail, onRefresh }: RunDetailPanelProps) {
  const [paramKey, setParamKey] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [metricKey, setMetricKey] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [metricStep, setMetricStep] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<(typeof RUN_STATUSES)[number]>('queued');
  const [checklistNotes, setChecklistNotes] = useState<ChecklistDraftMap>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const checklistStates = runDetail?.checklistStates ?? EMPTY_CHECKLIST;
  const checklistSignature = runDetail
    ? `${runDetail.id}:${runDetail.status}:${checklistStates
        .map((state) => `${state.id}:${state.status}:${state.note ?? ''}`)
        .join('|')}`
    : 'empty';

  useEffect(() => {
    if (!runDetail) {
      setSelectedStatus('queued');
      setChecklistNotes({});
      return;
    }

    setSelectedStatus(runDetail.status as (typeof RUN_STATUSES)[number]);
    setChecklistNotes(Object.fromEntries(checklistStates.map((state) => [state.checklistItem.id, state.note ?? ''])));
  }, [checklistSignature, checklistStates, runDetail]);

  const checklistSummary = useMemo(() => {
    if (!runDetail) {
      return { passed: 0, total: 0, blocking: 0 };
    }

    const total = checklistStates.length;
    const passed = checklistStates.filter((state) => state.status === 'passed').length;
    const blocking = checklistStates.filter(
      (state) => state.checklistItem.isRequired && state.status !== 'passed' && state.status !== 'waived',
    ).length;

    return { passed, total, blocking };
  }, [checklistStates, runDetail]);

  async function handleStatusSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workspaceId || !runDetail || !userId) {
      setError('Workspace, run, and user context are required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await updateRunStatus(
        workspaceId,
        runDetail.id,
        {
          status: selectedStatus,
        },
        userId,
        apiBase,
      );
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update run status.');
    } finally {
      setPending(false);
    }
  }

  async function handleParamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workspaceId || !runDetail || !userId) {
      setError('Workspace, run, and user context are required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await addRunParam(
        workspaceId,
        runDetail.id,
        {
          key: paramKey,
          value: paramValue,
        },
        userId,
        apiBase,
      );
      setParamKey('');
      setParamValue('');
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save parameter.');
    } finally {
      setPending(false);
    }
  }

  async function handleMetricSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workspaceId || !runDetail || !userId) {
      setError('Workspace, run, and user context are required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await addRunMetric(
        workspaceId,
        runDetail.id,
        {
          key: metricKey,
          value: Number(metricValue),
          step: metricStep ? Number(metricStep) : undefined,
        },
        userId,
        apiBase,
      );
      setMetricKey('');
      setMetricValue('');
      setMetricStep('');
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save metric.');
    } finally {
      setPending(false);
    }
  }

  async function handleChecklistStatusChange(
    state: RunChecklistStateRecord,
    nextStatus: (typeof CHECKLIST_STATUSES)[number],
  ) {
    if (!workspaceId || !runDetail || !userId) {
      setError('Workspace, run, and user context are required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await updateRunChecklistState(
        workspaceId,
        runDetail.id,
        state.checklistItem.id,
        {
          status: nextStatus,
          note: checklistNotes[state.checklistItem.id] || undefined,
        },
        userId,
        apiBase,
      );
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update checklist state.');
    } finally {
      setPending(false);
    }
  }

  async function handleChecklistNoteSave(state: RunChecklistStateRecord) {
    if (!workspaceId || !runDetail || !userId) {
      setError('Workspace, run, and user context are required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await updateRunChecklistState(
        workspaceId,
        runDetail.id,
        state.checklistItem.id,
        {
          status: state.status as (typeof CHECKLIST_STATUSES)[number],
          note: checklistNotes[state.checklistItem.id] || undefined,
        },
        userId,
        apiBase,
      );
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save checklist note.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Run detail</p>
          <h3>{runDetail ? `Run #${runDetail.runNumber}` : 'No run selected'}</h3>
        </div>
        <span className="muted">{runDetail?.status ?? 'waiting'}</span>
      </div>

      {!runDetail ? (
        <p className="muted">Select a run to inspect parameters, metrics, checklist state, and notes.</p>
      ) : (
        <div className="content-grid">
          <div className="callout">
            <strong>Code ref:</strong> {runDetail.codeRef ?? 'not recorded'}
            <br />
            <strong>Seed:</strong> {runDetail.randomSeed ?? 'not recorded'}
            <br />
            <strong>Notes:</strong> {runDetail.notes ?? 'none'}
          </div>

          <div className="three-column">
            <section className="panel nested-panel">
              <p className="eyebrow">Lifecycle</p>
              <form className="inline-form" onSubmit={handleStatusSubmit}>
                <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as (typeof RUN_STATUSES)[number])}>
                  {RUN_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className="secondary-button" type="submit" disabled={pending}>
                  Save status
                </button>
              </form>
            </section>

            <section className="panel nested-panel">
              <p className="eyebrow">Reproducibility</p>
              <strong>
                {checklistSummary.passed}/{checklistSummary.total} checks passed
              </strong>
              <span className="muted">{checklistSummary.blocking} required checks still block this run.</span>
            </section>

            <section className="panel nested-panel">
              <p className="eyebrow">Traceability</p>
              <strong>{runDetail.metrics.length}</strong>
              <span className="muted">metrics logged for this run</span>
              <strong>{runDetail.params.length}</strong>
              <span className="muted">parameters currently recorded</span>
            </section>
          </div>

          <div className="two-column compact-two-column">
            <div>
              <p className="eyebrow">Parameters</p>
              <form className="inline-form" onSubmit={handleParamSubmit}>
                <input value={paramKey} onChange={(event) => setParamKey(event.target.value)} placeholder="learning_rate" required />
                <input value={paramValue} onChange={(event) => setParamValue(event.target.value)} placeholder="0.001" required />
                <button className="secondary-button" type="submit" disabled={pending}>Add param</button>
              </form>
              <div className="list">
                {runDetail.params.length === 0 ? (
                  <div className="list-item"><span className="muted">No parameters recorded.</span></div>
                ) : (
                  runDetail.params.map((param) => (
                    <div key={param.id} className="list-item">
                      <strong>{param.key}</strong>
                      <span className="muted">{param.value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="eyebrow">Metrics</p>
              <form className="inline-form" onSubmit={handleMetricSubmit}>
                <input value={metricKey} onChange={(event) => setMetricKey(event.target.value)} placeholder="accuracy" required />
                <input value={metricValue} onChange={(event) => setMetricValue(event.target.value)} placeholder="0.92" required />
                <input value={metricStep} onChange={(event) => setMetricStep(event.target.value)} placeholder="12" />
                <button className="secondary-button" type="submit" disabled={pending}>Add metric</button>
              </form>
              <div className="list">
                {runDetail.metrics.length === 0 ? (
                  <div className="list-item"><span className="muted">No metrics recorded.</span></div>
                ) : (
                  runDetail.metrics.map((metric) => (
                    <div key={metric.id} className="list-item">
                      <strong>{metric.key}</strong>
                      <div className="inline-stat"><span>Value</span><span>{metric.value}</span></div>
                      <div className="inline-stat"><span>Step</span><span>{metric.step ?? 'n/a'}</span></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Checklist</p>
            <div className="list">
              {checklistStates.length === 0 ? (
                <div className="list-item"><span className="muted">No checklist items configured for this workspace.</span></div>
              ) : (
                checklistStates.map((state) => (
                  <div key={state.id} className="list-item">
                    <strong>
                      {state.checklistItem.label}
                      {!state.checklistItem.isRequired ? ' (optional)' : ''}
                    </strong>
                    <span className="muted">{state.checklistItem.description ?? 'No checklist guidance recorded.'}</span>
                    <div className="inline-form">
                      <select
                        value={state.status}
                        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                          void handleChecklistStatusChange(
                            state,
                            event.target.value as (typeof CHECKLIST_STATUSES)[number],
                          )
                        }
                        disabled={pending}
                      >
                        {CHECKLIST_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                      <input
                        value={checklistNotes[state.checklistItem.id] ?? ''}
                        onChange={(event) =>
                          setChecklistNotes((current) => ({
                            ...current,
                            [state.checklistItem.id]: event.target.value,
                          }))
                        }
                        placeholder="Add reviewer note"
                      />
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={pending}
                        onClick={() => void handleChecklistNoteSave(state)}
                      >
                        Save note
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {error ? <p className="error-text">{error}</p> : null}
        </div>
      )}
    </section>
  );
}
