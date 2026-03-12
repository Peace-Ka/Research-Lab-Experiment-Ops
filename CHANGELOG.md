# Changelog

## 2026-03-10
- Initialized production-ready monorepo scaffold for Research Lab Experiment Ops.
- Added baseline docs for architecture, API routes, folder structure, and Week 1 deliverables.
- Added Prisma schema for workspaces, projects, experiments, runs, datasets, models, lineage, reviews, audit logs, and exports.
- Added environment template, local Docker compose, and CI/CD workflow placeholders.
- Added root workspace package config and NestJS API source scaffold for health, auth, workspaces, and projects.
- Added Prisma seed and test placeholders for the first executable backend slice.
- Added reproducible `docs/build-log.md` and wired workspaces/projects services to Prisma CRUD.
- Added Prisma-backed experiment and run CRUD slices with unit test coverage.
- Applied initial Prisma migration to local Docker Postgres and executed seed placeholder.
- Documented branching workflow and aligned README local setup commands with npm + Docker usage.
- Implemented run parameter and metric endpoints with Prisma persistence and test coverage.
- Added live DB-backed integration coverage for run param and metric endpoints.

## 2026-03-12
- Replaced scaffold auth with persisted register/login and added `GET /auth/me`.
- Added request-level user context via `x-user-id` and enforced active workspace memberships across workspace, project, experiment, and run services.
- Removed client-controlled `createdById` from experiment and run creation payloads in favor of authenticated context.
- Added a Next.js frontend with a live dashboard shell, onboarding/auth panel, projects view, and experiments view.
- Added root web scripts and verified the frontend with a production build.
- Enabled local frontend-to-API CORS and added deterministic demo seed data for portfolio walkthroughs.
- Added live project/experiment/run creation flows to the frontend and exposed run detail with parameters and metrics.
- Reworked frontend selection so experiments are scoped to a selected project and runs are scoped to a selected experiment.
