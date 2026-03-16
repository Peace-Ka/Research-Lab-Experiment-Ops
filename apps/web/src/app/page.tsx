'use client';

import Link from 'next/link';
import { AppShell } from '../components/app-shell';
import { CreateRecordPanel } from '../components/create-record-panel';
import { createWorkspace } from '../lib/api';
import { useLabOpsData } from '../lib/use-labops-data';
import { useLabOpsSession } from '../lib/use-labops-session';

function slugifyWorkspaceName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export default function HomePage() {
  const {
    ready,
    userId,
    getAccessToken,
    apiBase,
    setApiBase,
    selectedProjectId,
    setSelectedProjectId,
    selectedExperimentId,
    setSelectedExperimentId,
  } = useLabOpsSession();
  const { workspaces, projects, experiments, runs, runDetail, loading, error, refresh } = useLabOpsData(getAccessToken, apiBase, {
    selectedProjectId,
    selectedExperimentId,
    onProjectResolved: setSelectedProjectId,
    onExperimentResolved: setSelectedExperimentId,
  });

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0];
  const selectedExperiment = experiments.find((experiment) => experiment.id === selectedExperimentId) ?? experiments[0];
  const completedRuns = runs.filter((run) => run.status === 'completed').length;
  const failedRuns = runs.filter((run) => run.status === 'failed').length;

  return (
    <AppShell
      title="Lab command center"
      subtitle="A live view across the selected workspace, project, experiment, and its recent run history."
      userId={userId}
      apiBase={apiBase}
      setApiBase={setApiBase}
    >
      <div className="content-grid">
        <div className="metrics-grid">
          <div className="metric-card">
            <span className="kicker">Workspaces</span>
            <strong>{workspaces.length}</strong>
            <span className="muted">Active memberships visible to the current user.</span>
          </div>
          <div className="metric-card">
            <span className="kicker">Projects</span>
            <strong>{projects.length}</strong>
            <span className="muted">Projects inside the current workspace.</span>
          </div>
          <div className="metric-card">
            <span className="kicker">Experiments</span>
            <strong>{experiments.length}</strong>
            <span className="muted">Experiments under the selected project.</span>
          </div>
          <div className="metric-card">
            <span className="kicker">Runs</span>
            <strong>{runs.length}</strong>
            <span className="muted">Runs under the selected experiment.</span>
          </div>
        </div>

        <div className="two-column">
          <CreateRecordPanel
            title="Workspace"
            subtitle="Start by creating your lab workspace. This replaces the old demo-login onboarding flow."
            fields={[
              { name: 'name', label: 'Name', placeholder: 'Graph Learning Lab', required: true },
              {
                name: 'slug',
                label: 'Slug',
                placeholder: 'graph-learning-lab',
              },
              {
                name: 'description',
                label: 'Description',
                placeholder: 'What research area does this workspace own?',
                multiline: true,
              },
            ]}
            submitLabel="Create workspace"
            onSubmit={async (values) => {
              const slug = values.slug?.trim() || slugifyWorkspaceName(values.name);

              if (!slug) {
                throw new Error('A workspace slug is required.');
              }

              await createWorkspace(
                {
                  name: values.name,
                  slug,
                  description: values.description,
                },
                getAccessToken,
                apiBase,
              );
              setSelectedProjectId('');
              setSelectedExperimentId('');
              await refresh();
            }}
          />

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Health</p>
                <h3>Current status</h3>
              </div>
            </div>
            <div className="list">
              <div className="list-item">
                <strong>{ready ? 'Frontend session ready' : 'Initializing Clerk session'}</strong>
                <span className="muted">The shell stores API base and navigation context locally. Authentication comes from Clerk.</span>
              </div>
              <div className="list-item">
                <strong>{loading ? 'Refreshing live backend data' : 'Backend sync idle'}</strong>
                <span className="muted">The dashboard follows the selected project and experiment context instead of using arbitrary first records.</span>
              </div>
              <div className="list-item">
                <strong>Run health snapshot</strong>
                <div className="inline-stat"><span>Completed</span><span>{completedRuns}</span></div>
                <div className="inline-stat"><span>Failed</span><span>{failedRuns}</span></div>
              </div>
            </div>
            {error ? <p className="error-text">{error}</p> : null}
          </section>
        </div>

        <div className="three-column">
          <section className="panel">
            <p className="eyebrow">Workspace</p>
            <h3>{workspaces[0]?.name ?? 'No workspace yet'}</h3>
            <p className="muted">{workspaces[0]?.description ?? 'Create your first workspace to start organizing projects and experiments.'}</p>
            {workspaces[0]?.membership ? (
              <div className="callout">Role: {workspaces[0].membership.role} | Status: {workspaces[0].membership.status}</div>
            ) : null}
          </section>

          <section className="panel">
            <p className="eyebrow">Selected project</p>
            <h3>{selectedProject?.name ?? 'No project selected'}</h3>
            <p className="muted">{selectedProject?.description ?? 'Choose or create a project on the Projects page to scope experiments correctly.'}</p>
            <Link className="secondary-button" href="/projects">Manage projects</Link>
          </section>

          <section className="panel">
            <p className="eyebrow">Selected experiment</p>
            <h3>{selectedExperiment?.title ?? 'No experiment selected'}</h3>
            <p className="muted">{runDetail?.notes ?? selectedExperiment?.hypothesis ?? 'Go to Experiments to pick an experiment and inspect its runs.'}</p>
            <Link className="secondary-button" href="/experiments">Open experiment workflow</Link>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
