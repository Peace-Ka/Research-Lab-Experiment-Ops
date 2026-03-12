'use client';

import { AppShell } from '../../components/app-shell';
import { useLabOpsData } from '../../lib/use-labops-data';
import { useLabOpsSession } from '../../lib/use-labops-session';

export default function ProjectsPage() {
  const { userId, setUserId, apiBase, setApiBase } = useLabOpsSession();
  const { workspaces, projects, loading, error } = useLabOpsData(userId, apiBase);

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
        <section className="panel">
          <p className="eyebrow">Workspace scope</p>
          <h3>{workspaces[0]?.name ?? 'No workspace available'}</h3>
          <p className="muted">{loading ? 'Refreshing project inventory...' : 'Projects are loaded live from the backend using the current `x-user-id`.'}</p>
          {error ? <p className="error-text">{error}</p> : null}
        </section>

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
                <span className="muted">Create a workspace and add a project from the API to populate this view.</span>
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
