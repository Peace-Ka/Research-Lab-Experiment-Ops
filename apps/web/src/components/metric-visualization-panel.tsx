'use client';

import { RunDetail, RunSummary } from '../lib/api';

type MetricVisualizationPanelProps = {
  runs: RunSummary[];
  runDetail: RunDetail | null;
};

type MetricSeries = {
  key: string;
  points: Array<{ step: number; value: number }>;
};

const STATUS_COLORS: Record<string, string> = {
  completed: '#7ce0a5',
  failed: '#ff8d8d',
  running: '#9fe3c5',
  queued: '#f4c97a',
  canceled: '#7f95a1',
};

function buildMetricSeries(runDetail: RunDetail | null): MetricSeries[] {
  if (!runDetail) {
    return [];
  }

  const grouped = new Map<string, Array<{ step: number; value: number }>>();

  for (const metric of runDetail.metrics) {
    const step = metric.step ?? 0;
    const current = grouped.get(metric.key) ?? [];
    current.push({ step, value: metric.value });
    grouped.set(metric.key, current);
  }

  return Array.from(grouped.entries())
    .map(([key, points]) => ({
      key,
      points: points.sort((left, right) => left.step - right.step),
    }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function buildPolyline(points: Array<{ step: number; value: number }>) {
  if (points.length === 0) {
    return '';
  }

  const width = 260;
  const height = 110;
  const minStep = Math.min(...points.map((point) => point.step));
  const maxStep = Math.max(...points.map((point) => point.step));
  const minValue = Math.min(...points.map((point) => point.value));
  const maxValue = Math.max(...points.map((point) => point.value));

  return points
    .map((point) => {
      const x = maxStep === minStep ? width / 2 : ((point.step - minStep) / (maxStep - minStep)) * width;
      const y = maxValue === minValue ? height / 2 : height - ((point.value - minValue) / (maxValue - minValue)) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

export function MetricVisualizationPanel({ runs, runDetail }: MetricVisualizationPanelProps) {
  const statusCounts = runs.reduce<Record<string, number>>((accumulator, run) => {
    accumulator[run.status] = (accumulator[run.status] ?? 0) + 1;
    return accumulator;
  }, {});
  const metricSeries = buildMetricSeries(runDetail);
  const totalRuns = runs.length || 1;

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Analytics</p>
          <h3>{runDetail ? `Run #${runDetail.runNumber} metric trends` : 'Experiment health snapshot'}</h3>
        </div>
        <span className="muted">{runs.length} runs in current experiment</span>
      </div>

      <div className="two-column compact-two-column analytics-layout">
        <section>
          <p className="eyebrow">Run status distribution</p>
          <div className="list">
            {Object.keys(statusCounts).length === 0 ? (
              <div className="list-item"><span className="muted">No run history yet.</span></div>
            ) : (
              Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="list-item metric-bar-item">
                  <div className="inline-stat"><strong>{status}</strong><span>{count}</span></div>
                  <div className="metric-bar-track">
                    <div
                      className="metric-bar-fill"
                      style={{
                        width: `${(count / totalRuns) * 100}%`,
                        background: STATUS_COLORS[status] ?? '#9fe3c5',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <p className="eyebrow">Selected run metric curves</p>
          <div className="list">
            {!runDetail ? (
              <div className="list-item"><span className="muted">Select a run to visualize metric progression.</span></div>
            ) : metricSeries.length === 0 ? (
              <div className="list-item"><span className="muted">This run has no metric points yet.</span></div>
            ) : (
              metricSeries.map((series) => {
                const latest = series.points[series.points.length - 1];
                return (
                  <div key={series.key} className="list-item">
                    <div className="inline-stat">
                      <strong>{series.key}</strong>
                      <span>{latest.value}</span>
                    </div>
                    <svg className="metric-chart" viewBox="0 0 260 110" role="img" aria-label={`${series.key} over steps`}>
                      <line x1="0" y1="109" x2="260" y2="109" className="chart-axis" />
                      <polyline points={buildPolyline(series.points)} className="chart-line" />
                      {series.points.map((point) => {
                        const polyline = buildPolyline(series.points).split(' ');
                        const [x, y] = polyline[series.points.indexOf(point)].split(',');
                        return <circle key={`${series.key}-${point.step}`} cx={x} cy={y} r="3.5" className="chart-point" />;
                      })}
                    </svg>
                    <div className="inline-stat"><span>Steps</span><span>{series.points.map((point) => point.step).join(' / ')}</span></div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
