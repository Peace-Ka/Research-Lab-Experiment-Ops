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
2. Create a Clerk application and copy the publishable/secret keys into `.env`.
3. Copy `.env.example` to `.env`.
4. Run `npm install`.
5. Start local services with `docker compose -f infra/docker/docker-compose.dev.yml up -d`.
6. Run `npm run prisma:generate`.
7. Run `npm run build`, `npm run test`, and `npm run test:integration`.
8. Seed the local database safely with `npm run prisma:seed`. This adds missing demo data without deleting your own projects.
9. If you explicitly want a full demo reset, run `npm run prisma:seed:reset`.
10. Start the API with `npm run dev`.
11. Start the web app with `npm run web:dev`.

## Demo Access
- Create a Clerk user through `/sign-up` or sign in with an existing Clerk account.
- After sign-in, create your first workspace from the overview page.

## Auth Flow
- Clerk manages sign-up, sign-in, session cookies, and sign-out.
- The Next.js frontend reads Clerk session tokens and passes them to the Nest API as bearer tokens.
- The Nest API verifies Clerk-issued tokens and maps each Clerk user to a local database user via `externalAuthId`.

## Frontend Pages
- `/`: dashboard shell with live workspace, project, experiment, and run summaries.
- `/projects`: live project inventory for the current workspace.
- `/experiments`: live experiment and run history view.

## Seed Safety
- `npm run prisma:seed` is safe by default and preserves existing user-created data.
- `npm run prisma:seed:reset` is destructive and recreates the demo workspace from scratch.

## Notes
- Use `docs/work-log.md`, `docs/build-log.md`, and `CHANGELOG.md` to keep history reproducible.
- The frontend defaults to `http://localhost:3001/v1` and can be pointed at another API base from the sidebar.