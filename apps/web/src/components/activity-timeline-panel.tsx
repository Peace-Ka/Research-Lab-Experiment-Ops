'use client';

import { useEffect, useMemo, useState } from 'react';
import { AuditLogRecord, RunSummary, TokenResolver, fetchAuditLogs } from '../lib/api';

type ActivityTimelinePanelProps = {
  workspaceId?: string;
  projectId?: string;
  experimentId?: string;
  runs: RunSummary[];
  apiBase: string;
  tokenResolver: TokenResolver;
  refreshKey?: string;
};

function formatAction(action: string) {
  return action
    .replace(/\./g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function summarizeEvent(event: AuditLogRecord) {
  const afterJson = event.afterJson as Record<string, unknown> | null | undefined;

  switch (event.action) {
    case 'experiment.create':
      return 'A new experiment was created under this project.';
    case 'run.create':
      return `Run ${typeof afterJson?.runNumber === 'number' ? `#${afterJson.runNumber}` : ''} was queued.`.trim();
    case 'run.update_status':
      return `Run status changed to ${String(afterJson?.status ?? 'unknown')}.`;
    case 'run.param_upsert':
      return `Parameter ${String(afterJson?.key ?? 'unknown')} was added or updated.`;
    case 'run.metric_create':
      return `Metric ${String(afterJson?.key ?? 'unknown')} was logged.`;
    case 'run.artifact_create':
      return `Artifact ${String(afterJson?.fileName ?? 'file')} was uploaded.`;
    case 'run.checklist_update':
      return `Checklist status changed to ${String(afterJson?.status ?? 'updated')}.`;
    default:
      return `${formatAction(event.action)} was recorded.`;
  }
}

export function ActivityTimelinePanel({
  workspaceId,
  projectId,
  experimentId,
  runs,
  apiBase,
  tokenResolver,
  refreshKey,
}: ActivityTimelinePanelProps) {
  const [items, setItems] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const token = await tokenResolver();

      if (!workspaceId || !token) {
        setItems([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const result = await fetchAuditLogs(workspaceId, tokenResolver, apiBase);
        setItems(result.items);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load activity timeline.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [workspaceId, apiBase, tokenResolver, refreshKey]);

  const filteredItems = useMemo(() => {
    const runIds = new Set(runs.map((run) => run.id));

    return items
      .filter((item) => {
        if (item.entityType === 'project') {
          return item.entityId === projectId;
        }

        if (item.entityType === 'experiment') {
          return item.entityId === experimentId;
        }

        if (item.entityType === 'run') {
          return runIds.has(item.entityId);
        }

        const afterJson = item.afterJson as Record<string, unknown> | null | undefined;
        if (item.entityType === 'run_param' || item.entityType === 'run_metric' || item.entityType === 'artifact' || item.entityType === 'run_checklist_state') {
          const entityPrefix = item.entityId.split(':')[0];
          return runIds.has(entityPrefix) || (typeof afterJson?.runId === 'string' && runIds.has(afterJson.runId));
        }

        return false;
      })
      .slice(0, 20);
  }, [items, projectId, experimentId, runs]);

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Activity timeline</p>
          <h3>What happened and when</h3>
        </div>
        <span className="muted">{filteredItems.length} recent events</span>
      </div>

      <p className="muted comparison-copy">
        This timeline makes the experiment workflow feel like an operations system instead of a static record. It shows
        the sequence of changes across the selected project, experiment, and its runs.
      </p>

      {loading ? <p className="muted">Loading timeline...</p> : null}
      {error ? <p className="error-text">{error}</p> : null}

      <div className="timeline-list">
        {filteredItems.length === 0 ? (
          <div className="list-item comparison-empty-state">
            <strong>No activity yet</strong>
            <span className="muted">Create or update runs to start building a timeline.</span>
          </div>
        ) : (
          filteredItems.map((item) => (
            <article key={item.id} className="timeline-item">
              <div className="timeline-marker" />
              <div className="timeline-content">
                <div className="list-item-title-row">
                  <strong>{formatAction(item.action)}</strong>
                  <span className="muted">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <p className="muted timeline-copy">{summarizeEvent(item)}</p>
                <div className="inline-stat-group">
                  <div className="inline-stat"><span>Entity</span><span>{item.entityType}</span></div>
                  <div className="inline-stat"><span>Actor</span><span>{item.actor?.name ?? item.actor?.email ?? 'System'}</span></div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
