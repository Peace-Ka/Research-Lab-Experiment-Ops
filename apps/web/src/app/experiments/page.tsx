'use client';

import { AppShell } from '../../components/app-shell';
import { CreateRecordPanel } from '../../components/create-record-panel';
import { RunDetailPanel } from '../../components/run-detail-panel';
import { createExperiment, createRun } from '../../lib/api';
import { useLabOpsData } from '../../lib/use-labops-data';
import { useLabOpsSession } from '../../lib/use-labops-session';

export default function ExperimentsPage() {
  const { userId, setUserId, apiBase, setApiBase } = useLabOpsSession();
  const { workspaces, projects, experiments, runs, runDetail, loading, error, refresh } = useLabOpsData(userId, apiBase);
  const workspace = workspaces[0];
  const project = projects[0];
  const leadExperiment = experiments[0];

  return (
    <AppShell
      title="Experiments"
      subtitle="Experiment detail, run creation, and reproducibility context for the current workspace."
      userId={userId}
      setUserId={setUserId}
      apiBase={apiBase}
      setApiBase={setApiBase}
    >
      <div className="content-grid">
        <div className="three-column">
          <CreateRecordPanel
            title="Experiment"
            subtitle="Create a new hypothesis under the lead project."
            fields={[
              { name: 'title', label: 'Title', placeholder: 'GCN optimizer sweep', required: true },
              {
                name: 'hypothesis',
                label: 'Hypothesis',
                placeholder: 'What are you trying to prove or disprove?',
                multiline: true,
              },
            ]}
            submitLabel="Create experiment"
            onSubmit={async (values) => {
              if (!workspace || !project || !userId) {
                throw new Error('A workspace, project, and active user are required before creating an experiment.');
              }

              await createExperiment(
                workspace.id,
                project.id,
                {
                  title: values.title,
                  hypothesis: values.hypothesis,
                },
                userId,
                apiBase,
              );
              await refresh();
            }}
          />

          <CreateRecordPanel
            title="Run"
            subtitle="Queue the next execution for the lead experiment."
            fields={[
              { name: 'codeRef', label: 'Code reference', placeholder: 'main@abc123' },
              { name: 'randomSeed', label: 'Random seed', placeholder: '42', type: 'number' },
              {
                name: 'notes',
                label: 'Notes',
                placeholder: 'Why is this run different from the previous one?',
                multiline: true,
              },
            ]}
            submitLabel="Create run"
            onSubmit={async (values) => {
              if (!workspace || !leadExperiment || !userId) {
                throw new Error('A workspace, experiment, and active user are required before creating a run.');
              }

              await createRun(
                workspace.id,
                leadExperiment.id,
                {
                  codeRef: values.codeRef || undefined,
                  randomSeed: values.randomSeed ? Number(values.randomSeed) : undefined,
                  notes: values.notes || undefined,
                },
                userId,
                apiBase,
              );
              await refresh();
            }}
          />

          <section className="panel">
            <p className="eyebrow">Lead experiment</p>
            <h3>{leadExperiment?.title ?? 'No experiment available'}</h3>
            <p className="muted">
              {leadExperiment?.hypothesis ?? 'Once an experiment exists, this screen will show its narrative and downstream run history.'}
            </p>
            <div className="callout">
              {loading
                ? 'Refreshing experiment and run history from the live API.'
                : 'This page is connected to live create/read endpoints for experiments and runs.'}
            </div>
            {error ? <p className="error-text">{error}</p> : null}
          </section>
        </div>

        <div className="two-column">
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
                  <span className="muted">Create a run and then inspect its details on the right.</span>
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

          <RunDetailPanel runDetail={runDetail} />
        </div>
      </div>
    </AppShell>
  );
}
