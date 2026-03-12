'use client';

import { RunDetail } from '../lib/api';

type RunDetailPanelProps = {
  runDetail: RunDetail | null;
};

export function RunDetailPanel({ runDetail }: RunDetailPanelProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Run detail</p>
          <h3>{runDetail ? `Run #${runDetail.runNumber}` : 'No run selected'}</h3>
        </div>
        <span className="muted">{runDetail?.status ?? 'waiting'}</span>
      </div>

      {!runDetail ? (
        <p className="muted">Create or select a run to inspect parameters, metrics, and notes.</p>
      ) : (
        <div className="content-grid">
          <div className="callout">
            <strong>Code ref:</strong> {runDetail.codeRef ?? 'not recorded'}
            <br />
            <strong>Seed:</strong> {runDetail.randomSeed ?? 'not recorded'}
            <br />
            <strong>Notes:</strong> {runDetail.notes ?? 'none'}
          </div>

          <div className="two-column compact-two-column">
            <div>
              <p className="eyebrow">Parameters</p>
              <div className="list">
                {runDetail.params.length === 0 ? (
                  <div className="list-item"><span className="muted">No parameters recorded.</span></div>
                ) : (
                  runDetail.params.map((param) => (
                    <div key={param.id} className="list-item">
                      <strong>{param.key}</strong>
                      <span className="muted">{param.value}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="eyebrow">Metrics</p>
              <div className="list">
                {runDetail.metrics.length === 0 ? (
                  <div className="list-item"><span className="muted">No metrics recorded.</span></div>
                ) : (
                  runDetail.metrics.map((metric) => (
                    <div key={metric.id} className="list-item">
                      <strong>{metric.key}</strong>
                      <div className="inline-stat"><span>Value</span><span>{metric.value}</span></div>
                      <div className="inline-stat"><span>Step</span><span>{metric.step ?? 'n/a'}</span></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
