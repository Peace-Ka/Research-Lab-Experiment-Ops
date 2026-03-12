'use client';

import { FormEvent, useState } from 'react';
import { addRunMetric, addRunParam, RunDetail } from '../lib/api';

type RunDetailPanelProps = {
  workspaceId?: string;
  userId: string;
  apiBase: string;
  runDetail: RunDetail | null;
  onRefresh: () => Promise<void>;
};

export function RunDetailPanel({ workspaceId, userId, apiBase, runDetail, onRefresh }: RunDetailPanelProps) {
  const [paramKey, setParamKey] = useState('');
  const [paramValue, setParamValue] = useState('');
  const [metricKey, setMetricKey] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [metricStep, setMetricStep] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

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
        <p className="muted">Select a run to inspect parameters, metrics, and notes.</p>
      ) : (
        <div className="content-grid">
          <div className="callout">
            <strong>Code ref:</strong> {runDetail.codeRef ?? 'not recorded'}
            <br />
            <strong>Seed:</strong> {runDetail.randomSeed ?? 'not recorded'}
            <br />
            <strong>Notes:</strong> {runDetail.notes ?? 'none'}
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
          {error ? <p className="error-text">{error}</p> : null}
        </div>
      )}
    </section>
  );
}
