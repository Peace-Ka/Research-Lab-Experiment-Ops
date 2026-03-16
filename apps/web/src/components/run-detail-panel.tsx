'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import {
  addRunArtifact,
  addRunMetric,
  addRunParam,
  downloadRunArtifact,
  RunChecklistStateRecord,
  RunDetail,
  TokenResolver,
  updateRunChecklistState,
  updateRunStatus,
} from '../lib/api';

type RunDetailPanelProps = {
  workspaceId?: string;
  tokenResolver: TokenResolver;
  apiBase: string;
  runDetail: RunDetail | null;
  onRefresh: () => Promise<void>;
};

const RUN_STATUSES = ['queued', 'running', 'completed', 'failed', 'canceled'] as const;
const CHECKLIST_STATUSES = ['pending', 'passed', 'failed', 'waived'] as const;
const ARTIFACT_TYPES = ['plot', 'log', 'checkpoint', 'model', 'dataset_snapshot', 'other'] as const;
const EMPTY_CHECKLIST: RunChecklistStateRecord[] = [];

type ChecklistDraftMap = Record<string, string>;

function formatBytes(sizeBytes?: string | number | null) {
  if (sizeBytes === undefined || sizeBytes === null) {
    return 'unknown size';
  }

  const raw = typeof sizeBytes === 'string' ? Number(sizeBytes) : sizeBytes;
  if (!Number.isFinite(raw) || raw <= 0) {
    return '0 B';
  }

  if (raw >= 1024 * 1024) {
    return `${(raw / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (raw >= 1024) {
    return `${(raw / 1024).toFixed(1)} KB`;
  }

  return `${raw} B`;
}

export function RunDetailPanel({ workspaceId, tokenResolver, apiBase, runDetail, onRefresh }: RunDetailPanelProps) {
  const [paramKey, setParamKey] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [metricKey, setMetricKey] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [metricStep, setMetricStep] = useState('');
  const [artifactType, setArtifactType] = useState<(typeof ARTIFACT_TYPES)[number]>('plot');
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
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

    if (!workspaceId || !runDetail) {
      setError('Workspace, run, and authentication context is required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await updateRunStatus(workspaceId, runDetail.id, { status: selectedStatus }, tokenResolver, apiBase);
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update run status.');
    } finally {
      setPending(false);
    }
  }

  async function handleParamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workspaceId || !runDetail) {
      setError('Workspace, run, and authentication context is required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await addRunParam(workspaceId, runDetail.id, { key: paramKey, value: paramValue }, tokenResolver, apiBase);
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

    if (!workspaceId || !runDetail) {
      setError('Workspace, run, and authentication context is required.');
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
        }, tokenResolver, apiBase,
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

  async function handleArtifactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!workspaceId || !runDetail || !artifactFile) {
      setError('Workspace, run, active session, and artifact file are required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await addRunArtifact(
        workspaceId,
        runDetail.id,
        {
          type: artifactType,
          file: artifactFile,
        }, tokenResolver, apiBase,
      );
      setArtifactFile(null);
      const input = document.getElementById('artifact-upload-input') as HTMLInputElement | null;
      if (input) {
        input.value = '';
      }
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to upload artifact.');
    } finally {
      setPending(false);
    }
  }

  async function handleArtifactDownload(artifactId: string, fileName: string) {
    if (!workspaceId || !runDetail) {
      setError('Workspace, run, and authentication context is required.');
      return;
    }

    setPending(true);
    setError('');

    try {
      await downloadRunArtifact(workspaceId, runDetail.id, artifactId, fileName, tokenResolver, apiBase);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Failed to download artifact.');
    } finally {
      setPending(false);
    }
  }

  async function handleChecklistStatusChange(
    state: RunChecklistStateRecord,
    nextStatus: (typeof CHECKLIST_STATUSES)[number],
  ) {
    if (!workspaceId || !runDetail) {
      setError('Workspace, run, and authentication context is required.');
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
        }, tokenResolver, apiBase,
      );
      await onRefresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update checklist state.');
    } finally {
      setPending(false);
    }
  }

  async function handleChecklistNoteSave(state: RunChecklistStateRecord) {
    if (!workspaceId || !runDetail) {
      setError('Workspace, run, and authentication context is required.');
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
        }, tokenResolver, apiBase,
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
        <p className="muted">Select a run to inspect parameters, metrics, checklist state, artifacts, and notes.</p>
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
              <strong>{checklistSummary.passed}/{checklistSummary.total} checks passed</strong>
              <span className="muted">{checklistSummary.blocking} required checks still block this run.</span>
            </section>

            <section className="panel nested-panel">
              <p className="eyebrow">Evidence</p>
              <strong>{runDetail.artifacts.length}</strong>
              <span className="muted">artifacts attached to this run</span>
              <strong>{runDetail.metrics.length}</strong>
              <span className="muted">metrics logged for this run</span>
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

          <div className="two-column compact-two-column">
            <section>
              <p className="eyebrow">Artifacts</p>
              <form className="inline-form" onSubmit={handleArtifactSubmit}>
                <select value={artifactType} onChange={(event) => setArtifactType(event.target.value as (typeof ARTIFACT_TYPES)[number])}>
                  {ARTIFACT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  id="artifact-upload-input"
                  type="file"
                  onChange={(event) => setArtifactFile(event.target.files?.[0] ?? null)}
                />
                <button className="secondary-button" type="submit" disabled={pending || !artifactFile}>
                  Upload artifact
                </button>
              </form>
              <p className="hint">This now stores the file through the API and preserves a download path for the run.</p>
            </section>

            <section>
              <p className="eyebrow">Stored evidence</p>
              <div className="list">
                {runDetail.artifacts.length === 0 ? (
                  <div className="list-item"><span className="muted">No artifacts stored for this run.</span></div>
                ) : (
                  runDetail.artifacts.map((artifact) => (
                    <div key={artifact.id} className="list-item">
                      <strong>{artifact.fileName}</strong>
                      <div className="inline-stat"><span>Type</span><span>{artifact.type}</span></div>
                      <div className="inline-stat"><span>Size</span><span>{formatBytes(artifact.sizeBytes)}</span></div>
                      <div className="inline-stat"><span>Key</span><span>{artifact.storageKey}</span></div>
                      {workspaceId ? (
                        <button
                          className="secondary-button artifact-link"
                          type="button"
                          disabled={pending}
                          onClick={() => void handleArtifactDownload(artifact.id, artifact.fileName)}
                        >
                          Download
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>
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


