'use client';

import { AppShell } from '../../components/app-shell';
import { CreateRecordPanel } from '../../components/create-record-panel';
import { createProject } from '../../lib/api';
import { useLabOpsData } from '../../lib/use-labops-data';
import { useLabOpsSession } from '../../lib/use-labops-session';

export default function ProjectsPage() {
  const {
    userId,
    getAccessToken,
    apiBase,
    setApiBase,
    selectedProjectId,
    setSelectedProjectId,
    selectedExperimentId,
    setSelectedExperimentId,
  } = useLabOpsSession();
  const { workspaces, projects, loading, error, refresh } = useLabOpsData(getAccessToken, apiBase, {
    selectedProjectId,
    selectedExperimentId,
    onProjectResolved: setSelectedProjectId,
    onExperimentResolved: setSelectedExperimentId,
  });
  const workspace = workspaces[0];

  return (
    <AppShell
      title="Projects"
      subtitle="Select a project first. Everything on the experiments page will scope to that selection."
      userId={userId}
      apiBase={apiBase}
      setApiBase={setApiBase}
    >
      <div className="content-grid">
        <div className="two-column">
          <section className="panel">
            <p className="eyebrow">Workspace scope</p>
            <h3>{workspace?.name ?? 'No workspace available'}</h3>
            <p className="muted">
              {loading
                ? 'Refreshing project inventory...'
                : 'Projects are loaded live from the backend using the current Clerk session.'}
            </p>
            {workspace?.description ? <div className="callout">{workspace.description}</div> : null}
            {error ? <p className="error-text">{error}</p> : null}
          </section>

          <CreateRecordPanel
            title="Project"
            subtitle="Create the next study container inside the active workspace."
            fields={[
              { name: 'name', label: 'Name', placeholder: 'Transformer robustness audit', required: true },
              {
                name: 'description',
                label: 'Description',
                placeholder: 'What research problem does this project own?',
                multiline: true,
              },
            ]}
            submitLabel="Create project"
            onSubmit={async (values) => {
              if (!workspace) {
                throw new Error('Create a workspace first before creating a project.');
              }

              const createdProject = await createProject(
                workspace.id,
                {
                  name: values.name,
                  description: values.description,
                },
                getAccessToken,
                apiBase,
              );
              setSelectedProjectId(createdProject.id);
              setSelectedExperimentId('');
              await refresh();
            }}
          />
        </div>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Inventory</p>
              <h3>Project list</h3>
            </div>
            <span className="muted">{projects.length} total</span>
          </div>

          <div className="list">
            {projects.length === 0 ? (
              <div className="list-item">
                <strong>No projects found</strong>
                <span className="muted">Use the create panel to add the next project.</span>
              </div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={selectedProjectId === project.id ? 'list-item selectable-item active-item' : 'list-item selectable-item'}
                  onClick={() => {
                    setSelectedProjectId(project.id);
                    setSelectedExperimentId('');
                  }}
                >
                  <strong>{project.name}</strong>
                  <span className="muted">{project.description ?? 'No project description yet.'}</span>
                  <div className="inline-stat"><span>Owner</span><span>{project.ownerUserId ?? 'unassigned'}</span></div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
