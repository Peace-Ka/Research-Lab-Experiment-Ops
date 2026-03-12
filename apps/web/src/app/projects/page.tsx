'use client';

import { AppShell } from '../../components/app-shell';
import { CreateRecordPanel } from '../../components/create-record-panel';
import { createProject } from '../../lib/api';
import { useLabOpsData } from '../../lib/use-labops-data';
import { useLabOpsSession } from '../../lib/use-labops-session';

export default function ProjectsPage() {
  const { userId, setUserId, apiBase, setApiBase } = useLabOpsSession();
  const { workspaces, projects, loading, error, refresh } = useLabOpsData(userId, apiBase);
  const workspace = workspaces[0];

  return (
    <AppShell
      title="Projects"
      subtitle="A direct view of the first reachable workspace and every project currently visible to the active user."
      userId={userId}
      setUserId={setUserId}
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
                : 'Projects are loaded live from the backend using the current x-user-id.'}
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
              if (!workspace || !userId) {
                throw new Error('A workspace and active user are required before creating a project.');
              }

              await createProject(
                workspace.id,
                {
                  name: values.name,
                  description: values.description,
                },
                userId,
                apiBase,
              );
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
                <div key={project.id} className="list-item">
                  <strong>{project.name}</strong>
                  <span className="muted">{project.description ?? 'No project description yet.'}</span>
                  <div className="inline-stat"><span>Owner</span><span>{project.ownerUserId ?? 'unassigned'}</span></div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
