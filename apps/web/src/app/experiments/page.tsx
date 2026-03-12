'use client';

import { AppShell } from '../../components/app-shell';
import { useLabOpsData } from '../../lib/use-labops-data';
import { useLabOpsSession } from '../../lib/use-labops-session';

export default function ExperimentsPage() {
  const { userId, setUserId, apiBase, setApiBase } = useLabOpsSession();
  const { experiments, runs, loading, error } = useLabOpsData(userId, apiBase);
  const leadExperiment = experiments[0];

  return (
    <AppShell
      title="Experiments"
      subtitle="Experiment detail and run history for the lead project in the current workspace."
      userId={userId}
      setUserId={setUserId}
      apiBase={apiBase}
      setApiBase={setApiBase}
    >
      <div className="two-column">
        <section className="panel">
          <p className="eyebrow">Lead experiment</p>
          <h3>{leadExperiment?.title ?? 'No experiment available'}</h3>
          <p className="muted">{leadExperiment?.hypothesis ?? 'Once an experiment exists, this screen will show its narrative and downstream run history.'}</p>
          <div className="callout">
            {loading
              ? 'Refreshing experiment and run history from the live API.'
              : 'This page is connected to `/projects/:projectId/experiments` and `/experiments/:experimentId/runs`.'}
          </div>
          {error ? <p className="error-text">{error}</p> : null}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Run history</p>
              <h3>Recent runs</h3>
            </div>
            <span className="muted">{runs.length} visible</span>
          </div>

          <div className="list">
            {runs.length === 0 ? (
              <div className="list-item">
                <strong>No runs yet</strong>
                <span className="muted">Create a run through the API and it will appear here with status and timestamps.</span>
              </div>
            ) : (
              runs.map((run) => (
                <div key={run.id} className="list-item">
                  <strong>Run #{run.runNumber}</strong>
                  <div className="inline-stat"><span>Status</span><span>{run.status}</span></div>
                  <div className="inline-stat"><span>Created by</span><span>{run.createdById}</span></div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
