# Architecture Overview

## High-Level Components
- Web app (`apps/web`): experiment dashboards, run details, lineage views, review workflows.
- API service (`apps/api`): auth, RBAC, experiment operations domain logic.
- Worker (`apps/worker`): async ingestion, reminder jobs, export generation.
- PostgreSQL: source of truth for metadata and workflow state.
- Object storage (S3/MinIO): run artifacts, logs, and model files.
- Redis: queue backend and caching.

## Tenancy and Collaboration Model
- Workspaces partition all data.
- Users join workspaces with role-based permissions.
- Projects group experiments and data/model assets.

## Reproducibility Guarantees
- Every run stores code reference, environment snapshot, and seed.
- Dataset and model versions are immutable references.
- Checklist gate enforces required reproducibility items before review approval.
- Audit log captures all mutating operations.

## Reliability Baseline
- Health endpoints for API and worker.
- Idempotent worker jobs.
- Versioned Prisma migrations.
- CI gate for lint, test, and migration checks.
