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

## Week 1 Focus
See `docs/week-1-deliverables.md`.

## API Contract
See `docs/api-route-list.md`.

## Database Model
See `prisma/schema.prisma`.

## Local Setup (once toolchain is installed)
1. Install Node.js 22+ and pnpm.
2. Install PostgreSQL 16+.
3. Copy `.env.example` to `.env` and fill values.
4. Run `pnpm install`.
5. Run `pnpm prisma migrate dev`.
6. Run `pnpm dev`.

## Notes
- Folder name remains as-is for continuity, but project scope is now Lab Experiment Ops.
- Use `docs/work-log.md` and `CHANGELOG.md` to track all iterations.
