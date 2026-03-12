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
6. Run `npm run build`, `npm run test`, and `npm run test:integration`.
7. Start the API with `npm run dev`.
8. Start the web app with `npm run web:dev`.

## Auth Flow
- Register or log in from the frontend onboarding panel.
- The API currently returns a live `userId` and the frontend stores it locally.
- Workspace-scoped API routes require the `x-user-id` header.

## Frontend Pages
- `/`: dashboard shell with live workspace, project, experiment, and run summaries.
- `/projects`: live project inventory for the current workspace.
- `/experiments`: live experiment and run history view.

## Notes
- Use `docs/work-log.md`, `docs/build-log.md`, and `CHANGELOG.md` to keep history reproducible.
- The frontend defaults to `http://localhost:3001/v1` and can be pointed at another API base from the sidebar.
