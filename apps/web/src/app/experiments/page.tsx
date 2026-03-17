'use client';

import { useEffect, useMemo, useState } from 'react';
import { AppShell } from '../../components/app-shell';
import { CreateRecordPanel } from '../../components/create-record-panel';
import { MetricVisualizationPanel } from '../../components/metric-visualization-panel';
import { ReproducibilityDashboardPanel } from '../../components/reproducibility-dashboard-panel';
import { RunComparisonPanel } from '../../components/run-comparison-panel';
import { RunDetailPanel } from '../../components/run-detail-panel';
import { createExperiment, createRun } from '../../lib/api';
import { useLabOpsData } from '../../lib/use-labops-data';
import { useLabOpsSession } from '../../lib/use-labops-session';

const MAX_COMPARE_RUNS = 3;

export default function ExperimentsPage() {
  const {
    userId,
    getAccessToken,
    apiBase,
    setApiBase,
    selectedProjectId,
    setSelectedProjectId,
    selectedExperimentId,
    setSelectedExperimentId,
    selectedRunId,
    setSelectedRunId,
  } = useLabOpsSession();
  const { workspaces, projects, experiments, runs, runDetail, loading, error, refresh } = useLabOpsData(getAccessToken, apiBase, {
    selectedProjectId,
    selectedExperimentId,
    selectedRunId,
    onProjectResolved: setSelectedProjectId,
    onExperimentResolved: setSelectedExperimentId,
    onRunResolved: setSelectedRunId,
  });
  const [comparisonRunIds, setComparisonRunIds] = useState<string[]>([]);

  useEffect(() => {
    setComparisonRunIds((current) => current.filter((runId) => runs.some((run) => run.id === runId)));
  }, [runs]);

  useEffect(() => {
    if (!selectedRunId) {
      return;
    }

    setComparisonRunIds((current) => {
      if (current.includes(selectedRunId)) {
        return current;
      }

      const next = [selectedRunId, ...current];
      return next.slice(0, MAX_COMPARE_RUNS);
    });
  }, [selectedRunId]);

  const comparisonLabel = useMemo(() => {
    if (comparisonRunIds.length === 0) {
      return 'No runs selected';
    }

    return `${comparisonRunIds.length} of ${MAX_COMPARE_RUNS} comparison slots used`;
  }, [comparisonRunIds]);

  function toggleComparisonRun(runId: string) {
    setComparisonRunIds((current) => {
      if (current.includes(runId)) {
        return current.filter((id) => id !== runId);
      }

      return [runId, ...current].slice(0, MAX_COMPARE_RUNS);
    });
  }

  const workspace = workspaces[0];
  const project = projects.find((item) => item.id === selectedProjectId) ?? projects[0];
  const experiment = experiments.find((item) => item.id === selectedExperimentId) ?? experiments[0];

  return (
    <AppShell
      title="Experiments"
      subtitle="Experiments are scoped to the selected project, runs are scoped to the selected experiment, and run detail follows the selected run."
      userId={userId}
      apiBase={apiBase}
      setApiBase={setApiBase}
    >
      <div className="content-grid">
        <div className="three-column">
          <section className="panel">
            <p className="eyebrow">Selected project</p>
            <h3>{project?.name ?? 'No project selected'}</h3>
            <p className="muted">{project?.description ?? 'Select a project from the Projects page first.'}</p>
            {loading ? <p className="muted">Refreshing experiment scope...</p> : null}
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
              if (!workspace || !project) {
                throw new Error('Create a workspace and select a project before creating an experiment.');
              }

              const createdExperiment = await createExperiment(
                workspace.id,
                project.id,
                {
                  title: values.title,
                  hypothesis: values.hypothesis,
                },
                getAccessToken,
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
              if (!workspace || !experiment) {
                throw new Error('Create a workspace and select an experiment before creating a run.');
              }

              const createdRun = await createRun(
                workspace.id,
                experiment.id,
                {
                  codeRef: values.codeRef || undefined,
                  randomSeed: values.randomSeed ? Number(values.randomSeed) : undefined,
                  notes: values.notes || undefined,
                },
                getAccessToken,
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
              <span className="muted">{comparisonLabel}</span>
            </div>

            <div className="list">
              {runs.length === 0 ? (
                <div className="list-item">
                  <strong>No runs yet</strong>
                  <span className="muted">Create a run and then inspect its details below.</span>
                </div>
              ) : (
                runs.map((run) => (
                  <div
                    key={run.id}
                    className={selectedRunId === run.id ? 'list-item selectable-shell active-item' : 'list-item selectable-shell'}
                  >
                    <div className="list-item-title-row">
                      <strong>Run #{run.runNumber}</strong>
                      <button
                        className={comparisonRunIds.includes(run.id) ? 'compare-toggle selected' : 'compare-toggle'}
                        type="button"
                        onClick={() => toggleComparisonRun(run.id)}
                      >
                        {comparisonRunIds.includes(run.id) ? 'Comparing' : 'Compare'}
                      </button>
                    </div>
                    <button className="list-item-body-button" type="button" onClick={() => setSelectedRunId(run.id)}>
                      <div className="inline-stat"><span>Status</span><span>{run.status}</span></div>
                      <div className="inline-stat"><span>Created by</span><span>{run.createdById}</span></div>
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <ReproducibilityDashboardPanel
          workspaceId={workspace?.id}
          tokenResolver={getAccessToken}
          apiBase={apiBase}
          runs={runs}
        />

        <MetricVisualizationPanel runs={runs} runDetail={runDetail} />

        <RunComparisonPanel
          workspaceId={workspace?.id}
          tokenResolver={getAccessToken}
          apiBase={apiBase}
          runs={runs}
          selectedRunIds={comparisonRunIds}
          onToggleRun={toggleComparisonRun}
        />

        <RunDetailPanel
          workspaceId={workspace?.id}
          tokenResolver={getAccessToken}
          apiBase={apiBase}
          runDetail={runDetail}
          onRefresh={refresh}
        />
      </div>
    </AppShell>
  );
}
