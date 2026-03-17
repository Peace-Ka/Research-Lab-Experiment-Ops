'use client';

import { useEffect, useMemo, useState } from 'react';
import { RunSummary, TokenResolver, fetchRunDetail } from '../lib/api';
import { assessReproducibility } from '../lib/reproducibility';

type ReproducibilityDashboardPanelProps = {
  workspaceId?: string;
  apiBase: string;
  tokenResolver: TokenResolver;
  runs: RunSummary[];
};

type BlockerSummary = {
  label: string;
  count: number;
};

export function ReproducibilityDashboardPanel({
  workspaceId,
  apiBase,
  tokenResolver,
  runs,
}: ReproducibilityDashboardPanelProps) {
  const [details, setDetails] = useState<import('../lib/api').RunDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const token = await tokenResolver();

      if (!workspaceId || !token || runs.length === 0) {
        setDetails([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const items = await Promise.all(
          runs.map((run) => fetchRunDetail(workspaceId, run.id, tokenResolver, apiBase)),
        );
        setDetails(items);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load reproducibility dashboard.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [workspaceId, apiBase, runs, tokenResolver]);

  const assessments = useMemo(() => details.map((detail) => ({ detail, assessment: assessReproducibility(detail) })), [details]);

  const averageScore = useMemo(() => {
    if (assessments.length === 0) {
      return 0;
    }

    return Math.round(
      assessments.reduce((sum, item) => sum + item.assessment.score, 0) / assessments.length,
    );
  }, [assessments]);

  const readyCount = assessments.filter((item) => item.assessment.label === 'Ready').length;
  const almostReadyCount = assessments.filter((item) => item.assessment.label === 'Almost ready').length;
  const blockedCount = assessments.filter((item) => item.assessment.label === 'Blocked').length;

  const topBlockers = useMemo(() => {
    const counts = new Map<string, number>();

    for (const item of assessments) {
      for (const blocker of item.assessment.blockers) {
        counts.set(blocker, (counts.get(blocker) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map<BlockerSummary>(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4);
  }, [assessments]);

  const strongestRun = useMemo(() => {
    return assessments
      .slice()
      .sort((left, right) => right.assessment.score - left.assessment.score)[0];
  }, [assessments]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Reproducibility dashboard</p>
          <h3>What needs attention first</h3>
        </div>
        <span className="muted">{runs.length} runs in this experiment</span>
      </div>

      <p className="muted comparison-copy">
        This turns reproducibility into a practical signal: which runs are trustworthy already, which ones are close,
        and what missing details are blocking the rest.
      </p>

      {loading ? <p className="muted">Loading reproducibility scores...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="metrics-grid reproducibility-metrics-grid">
        <div className="metric-card score-card">
          <span className="kicker">Average score</span>
          <strong>{averageScore}</strong>
          <span className="muted">Out of 100 across the currently visible runs.</span>
        </div>
        <div className="metric-card status-card ready">
          <span className="kicker">Ready</span>
          <strong>{readyCount}</strong>
          <span className="muted">Runs that have metadata, evidence, and required checklist coverage.</span>
        </div>
        <div className="metric-card status-card almost-ready">
          <span className="kicker">Almost ready</span>
          <strong>{almostReadyCount}</strong>
          <span className="muted">Runs that are documented but still need stronger evidence.</span>
        </div>
        <div className="metric-card status-card blocked">
          <span className="kicker">Blocked</span>
          <strong>{blockedCount}</strong>
          <span className="muted">Runs missing core setup details or required checklist items.</span>
        </div>
      </div>

      <div className="two-column compact-two-column">
        <section className="panel nested-panel">
          <p className="eyebrow">Top blockers</p>
          <div className="list compact-list">
            {topBlockers.length === 0 ? (
              <div className="list-item compact-item">
                <strong>No major blockers</strong>
                <span className="muted">The current runs are in good shape.</span>
              </div>
            ) : (
              topBlockers.map((blocker) => (
                <div key={blocker.label} className="list-item compact-item">
                  <strong>{blocker.label}</strong>
                  <span className="muted">Affects {blocker.count} run{blocker.count === 1 ? '' : 's'}.</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel nested-panel">
          <p className="eyebrow">Best candidate</p>
          {strongestRun ? (
            <div className="list compact-list">
              <div className="list-item compact-item">
                <strong>Run #{strongestRun.detail.runNumber}</strong>
                <span className="muted">{strongestRun.assessment.label} | score {strongestRun.assessment.score}/100</span>
              </div>
              <div className="list-item compact-item">
                <strong>Why it stands out</strong>
                <span className="muted">{strongestRun.assessment.explanation}</span>
              </div>
            </div>
          ) : (
            <div className="list-item compact-item">
              <strong>No runs to evaluate</strong>
              <span className="muted">Create runs in this experiment to start scoring reproducibility.</span>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
