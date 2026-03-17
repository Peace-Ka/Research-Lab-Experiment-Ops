'use client';

import { useEffect, useMemo, useState } from 'react';
import { RunDetail, RunSummary, TokenResolver, fetchRunDetail } from '../lib/api';

type RunComparisonPanelProps = {
  workspaceId?: string;
  apiBase: string;
  tokenResolver: TokenResolver;
  runs: RunSummary[];
  selectedRunIds: string[];
  onToggleRun: (runId: string) => void;
};

type MetricMap = Record<string, { value: number; step?: number | null }>;
type ParamMap = Record<string, string>;

function buildMetricMap(run: RunDetail): MetricMap {
  return run.metrics.reduce<MetricMap>((acc, metric) => {
    const current = acc[metric.key];
    const currentStep = current?.step ?? -1;
    const nextStep = metric.step ?? -1;

    if (!current || nextStep >= currentStep) {
      acc[metric.key] = { value: metric.value, step: metric.step };
    }

    return acc;
  }, {});
}

function buildParamMap(run: RunDetail): ParamMap {
  return run.params.reduce<ParamMap>((acc, param) => {
    acc[param.key] = param.value;
    return acc;
  }, {});
}

function checklistScore(run: RunDetail) {
  const total = run.checklistStates.length;
  const passed = run.checklistStates.filter((state) => state.status === 'passed').length;
  const blocking = run.checklistStates.filter(
    (state) => state.checklistItem.isRequired && state.status !== 'passed' && state.status !== 'waived',
  ).length;

  return { total, passed, blocking };
}

export function RunComparisonPanel({
  workspaceId,
  apiBase,
  tokenResolver,
  runs,
  selectedRunIds,
  onToggleRun,
}: RunComparisonPanelProps) {
  const [details, setDetails] = useState<RunDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const token = await tokenResolver();

      if (!workspaceId || !token || selectedRunIds.length === 0) {
        setDetails([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const items = await Promise.all(
          selectedRunIds.map((runId) => fetchRunDetail(workspaceId, runId, tokenResolver, apiBase)),
        );
        setDetails(items);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load comparison data.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [workspaceId, apiBase, tokenResolver, selectedRunIds]);

  const metricKeys = useMemo(() => {
    return Array.from(new Set(details.flatMap((run) => Object.keys(buildMetricMap(run))))).sort();
  }, [details]);

  const paramKeys = useMemo(() => {
    return Array.from(new Set(details.flatMap((run) => Object.keys(buildParamMap(run))))).sort();
  }, [details]);

  const runLookup = useMemo(() => new Map(runs.map((run) => [run.id, run])), [runs]);

  return (
    <section className="panel comparison-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Run comparison</p>
          <h3>Compare runs side by side</h3>
        </div>
        <span className="muted">{selectedRunIds.length} selected</span>
      </div>

      <p className="muted comparison-copy">
        Compare runs across lifecycle, reproducibility, parameters, metrics, and evidence. Select up to three runs
        from the history panel.
      </p>

      <div className="comparison-chip-row">
        {runs.length === 0 ? (
          <span className="muted">Create a run before starting comparisons.</span>
        ) : (
          runs.map((run) => {
            const selected = selectedRunIds.includes(run.id);

            return (
              <button
                key={run.id}
                type="button"
                className={selected ? 'comparison-chip selected' : 'comparison-chip'}
                onClick={() => onToggleRun(run.id)}
              >
                <strong>Run #{run.runNumber}</strong>
                <span>{run.status}</span>
              </button>
            );
          })
        )}
      </div>

      {loading ? <p className="muted">Loading comparison data...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      {selectedRunIds.length === 0 ? (
        <div className="list-item comparison-empty-state">
          <strong>No runs selected</strong>
          <span className="muted">Use the run chips above or the run history panel to add runs into the comparison workspace.</span>
        </div>
      ) : (
        <div className="comparison-grid">
          {details.map((run) => {
            const score = checklistScore(run);
            const runSummary = runLookup.get(run.id);
            const params = buildParamMap(run);
            const metrics = buildMetricMap(run);

            return (
              <article key={run.id} className="comparison-card">
                <div className="comparison-card-header">
                  <div>
                    <p className="eyebrow">Run #{run.runNumber}</p>
                    <h4>{run.codeRef ?? 'No code ref'}</h4>
                  </div>
                  <button className="secondary-button" type="button" onClick={() => onToggleRun(run.id)}>
                    Remove
                  </button>
                </div>

                <div className="comparison-stats">
                  <div className="inline-stat"><span>Status</span><span>{run.status}</span></div>
                  <div className="inline-stat"><span>Seed</span><span>{run.randomSeed ?? 'n/a'}</span></div>
                  <div className="inline-stat"><span>Artifacts</span><span>{run.artifacts.length}</span></div>
                  <div className="inline-stat"><span>Checks</span><span>{score.passed}/{score.total}</span></div>
                  <div className="inline-stat"><span>Blocking</span><span>{score.blocking}</span></div>
                  <div className="inline-stat">
                    <span>Created</span>
                    <span>{runSummary ? new Date(runSummary.createdAt).toLocaleDateString() : 'n/a'}</span>
                  </div>
                </div>

                <div className="comparison-section">
                  <p className="eyebrow">Parameters</p>
                  <div className="comparison-table">
                    {paramKeys.length === 0 ? (
                      <span className="muted">No parameters logged.</span>
                    ) : (
                      paramKeys.map((key) => (
                        <div key={key} className="comparison-row">
                          <span>{key}</span>
                          <strong>{params[key] ?? '—'}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="comparison-section">
                  <p className="eyebrow">Latest metrics</p>
                  <div className="comparison-table">
                    {metricKeys.length === 0 ? (
                      <span className="muted">No metrics logged.</span>
                    ) : (
                      metricKeys.map((key) => {
                        const metric = metrics[key];

                        return (
                          <div key={key} className="comparison-row">
                            <span>{key}</span>
                            <strong>{metric ? `${metric.value}${metric.step != null ? ` @ step ${metric.step}` : ''}` : '—'}</strong>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="comparison-section">
                  <p className="eyebrow">Reproducibility notes</p>
                  <div className="comparison-table">
                    {run.checklistStates.length === 0 ? (
                      <span className="muted">No checklist items configured.</span>
                    ) : (
                      run.checklistStates.map((state) => (
                        <div key={state.id} className="comparison-row checklist-row">
                          <span>{state.checklistItem.label}</span>
                          <strong>{state.status}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
