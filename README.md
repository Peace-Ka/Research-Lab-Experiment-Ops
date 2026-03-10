# Lab Experiment Ops Platform

Production-oriented monorepo scaffold for a research lab experiment operations platform.

## Objectives
- Make experiments reproducible and auditable.
- Track datasets, models, runs, and artifacts end-to-end.
- Improve collaboration with review workflows and clear ownership.

## Monorepo Layout
- `apps/web`: Next.js frontend.
- `apps/api`: NestJS backend.
- `apps/worker`: background jobs (run ingestion, reminders, report generation).
- `packages/*`: shared UI, types, config, SDK.
- `prisma`: database schema and migrations.
- `docs`: architecture, API routes, deliverables, runbooks.
- `infra`: docker and infrastructure definitions.

## Folder Structure
See `docs/folder-structure.md`.

## Build Log
See `docs/build-log.md`.

## Branching Workflow
See `docs/branching.md`.

## Week 1 Focus
See `docs/week-1-deliverables.md`.

## API Contract
See `docs/api-route-list.md`.

## Database Model
See `prisma/schema.prisma`.

## Local Setup
1. Install Node.js 22+ and Docker Desktop.
2. Copy `.env.example` to `.env`.
3. Run `npm install`.
4. Start local services with `docker compose -f infra/docker/docker-compose.dev.yml up -d`.
5. Run `npm run prisma:generate`.
6. Run `npm run build` and `npm run test`.

## Notes
- Use `docs/work-log.md`, `docs/build-log.md`, and `CHANGELOG.md` to keep history reproducible.