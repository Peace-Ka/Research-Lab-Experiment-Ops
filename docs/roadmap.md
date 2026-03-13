# Delivery Roadmap

## Phase 1: Portfolio-Strong
Target: 10-15 focused working days
Goal: a strong demoable product with clear research workflow, visible results, and credible engineering depth.

### Week 1
- Metric visualization for selected runs and experiment health
- Run comparison basics
- Tighten experiment page usability

### Week 2
- True object storage upload with MinIO/S3
- Artifact download/preview support
- Better evidence visibility in run detail

### Week 3
- Replace `x-user-id` transport with JWT/session auth
- Protected frontend session handling
- Auth-related integration coverage

### Week 4
- Reproducibility score on overview and project pages
- Run comparison view (params, metrics, checklist, artifacts)
- Case-study-grade walkthrough polish

## Phase 2: Robust
Target: 8-15 more working days
Goal: move from strong student project to clearly robust engineering project.

### Week 5
- Run lineage UI and parent/child relationships
- Better navigation across runs and experiments
- More seeded lineage examples

### Week 6
- Audit/event history surfaced in product UX
- Reviewer workflow scaffolding
- More complete workspace/project management

### Week 7
- End-to-end workflow tests
- Integration coverage for auth, runs, artifacts, and checklist flow
- Error/loading/empty-state hardening

### Week 8
- Deployment hardening
- Runbook, rollback notes, env documentation
- Architecture tradeoff write-up and demo script

## Phase 3: Optional Polish
Target: 5-10 additional working days
Goal: extra differentiation after core value is already strong.

- Artifact previews
- Richer dashboards
- Notifications/reminders
- Reviewer approval workflow
- UI refinement and responsiveness polish

## Current Priority Order
1. Metric visualization
2. Object storage upload
3. JWT/session auth
4. Run comparison
5. Deployment docs and runbook

## Completion Standard
The project is "done enough" for portfolio use when it has:
- real auth
- project -> experiment -> run workflow
- metric charts
- artifact upload
- reproducibility checklist and score
- comparison view
- deployment/docs

Anything beyond that is polish, not a blocker.
