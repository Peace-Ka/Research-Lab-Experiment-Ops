'use client';

import { AppShell } from '../../components/app-shell';
import { CreateRecordPanel } from '../../components/create-record-panel';
import { RunDetailPanel } from '../../components/run-detail-panel';
import { createExperiment, createRun } from '../../lib/api';
import { useLabOpsData } from '../../lib/use-labops-data';
import { useLabOpsSession } from '../../lib/use-labops-session';

export default function ExperimentsPage() {
  const {
    userId,
    setUserId,
    apiBase,
    setApiBase,
    selectedProjectId,
    setSelectedProjectId,
    selectedExperimentId,
    setSelectedExperimentId,
    selectedRunId,
    setSelectedRunId,
  } = useLabOpsSession();
  const { workspaces, projects, experiments, runs, runDetail, loading, error, refresh } = useLabOpsData(userId, apiBase, {
    selectedProjectId,
    selectedExperimentId,
    selectedRunId,
    onProjectResolved: setSelectedProjectId,
    onExperimentResolved: setSelectedExperimentId,
    onRunResolved: setSelectedRunId,
  });
  const workspace = workspaces[0];
  const project = projects.find((item) => item.id === selectedProjectId) ?? projects[0];
  const experiment = experiments.find((item) => item.id === selectedExperimentId) ?? experiments[0];

  return (
    <AppShell
      title="Experiments"
      subtitle="Experiments are scoped to the selected project, runs are scoped to the selected experiment, and run detail follows the selected run."
      userId={userId}
      setUserId={setUserId}
      apiBase={apiBase}
      setApiBase={setApiBase}
    >
      <div className="content-grid">
        <div className="three-column">
          <section className="panel">
            <p className="eyebrow">Selected project</p>
            <h3>{project?.name ?? 'No project selected'}</h3>
            <p className="muted">{project?.description ?? 'Select a project from the Projects page first.'}</p>
            {error ? <p className="error-text">{error}</p> : null}
          </section>

          <CreateRecordPanel
            title="Experiment"
            subtitle="Create a new hypothesis under the selected project."
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
                throw new Error('A workspace, selected project, and active user are required before creating an experiment.');
              }

              const createdExperiment = await createExperiment(
                workspace.id,
                project.id,
                {
                  title: values.title,
                  hypothesis: values.hypothesis,
                },
                userId,
                apiBase,
              );
              setSelectedExperimentId(createdExperiment.id);
              setSelectedRunId('');
              await refresh();
            }}
          />

          <CreateRecordPanel
            title="Run"
            subtitle="Queue the next execution for the selected experiment."
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
              if (!workspace || !experiment || !userId) {
                throw new Error('A workspace, selected experiment, and active user are required before creating a run.');
              }

              const createdRun = await createRun(
                workspace.id,
                experiment.id,
                {
                  codeRef: values.codeRef || undefined,
                  randomSeed: values.randomSeed ? Number(values.randomSeed) : undefined,
                  notes: values.notes || undefined,
                },
                userId,
                apiBase,
              );
              setSelectedRunId(createdRun.id);
              await refresh();
            }}
          />
        </div>

        <div className="two-column">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Experiment list</p>
                <h3>{project ? `Experiments in ${project.name}` : 'No project selected'}</h3>
              </div>
              <span className="muted">{experiments.length} visible</span>
            </div>

            <div className="list">
              {experiments.length === 0 ? (
                <div className="list-item">
                  <strong>No experiments yet</strong>
                  <span className="muted">Create an experiment under the selected project to begin tracking runs.</span>
                </div>
              ) : (
                experiments.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={selectedExperimentId === item.id ? 'list-item selectable-item active-item' : 'list-item selectable-item'}
                    onClick={() => {
                      setSelectedExperimentId(item.id);
                      setSelectedRunId('');
                    }}
                  >
                    <strong>{item.title}</strong>
                    <span className="muted">{item.hypothesis ?? 'No hypothesis recorded.'}</span>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Run history</p>
                <h3>{experiment ? `Runs for ${experiment.title}` : 'No experiment selected'}</h3>
              </div>
              <span className="muted">{runs.length} visible</span>
            </div>

            <div className="list">
              {runs.length === 0 ? (
                <div className="list-item">
                  <strong>No runs yet</strong>
                  <span className="muted">Create a run and then inspect its details below.</span>
                </div>
              ) : (
                runs.map((run) => (
                  <button
                    key={run.id}
                    type="button"
                    className={selectedRunId === run.id ? 'list-item selectable-item active-item' : 'list-item selectable-item'}
                    onClick={() => setSelectedRunId(run.id)}
                  >
                    <strong>Run #{run.runNumber}</strong>
                    <div className="inline-stat"><span>Status</span><span>{run.status}</span></div>
                    <div className="inline-stat"><span>Created by</span><span>{run.createdById}</span></div>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>

        <RunDetailPanel
          workspaceId={workspace?.id}
          userId={userId}
          apiBase={apiBase}
          runDetail={runDetail}
          onRefresh={refresh}
        />
      </div>
    </AppShell>
  );
}
