# Changelog

## 2026-03-10
- Refactored scaffold from NIS2 compliance domain to Lab Experiment Ops domain.
- Replaced API route catalog with experiment operations routes.
- Replaced architecture documentation with reproducibility-focused architecture.
- Replaced week 1 deliverables to match lab operations scope.
- Replaced Prisma schema with lab entities (workspaces, projects, experiments, runs, lineage, reviews, audit).
- Updated docker compose for PostgreSQL, Redis, and MinIO artifact storage.

## 2026-03-09
- Initialized production-ready monorepo folder scaffold.
- Added baseline docs for architecture, API routes, week 1 deliverables, and repository bootstrap.
- Added Prisma schema for multi-tenant orgs, controls, evidence, incidents, and audit logs.
- Added environment template and minimal CI/docker placeholders.
