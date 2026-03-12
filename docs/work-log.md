# Work Log

## 2026-03-10
- Created monorepo production folder structure in the fresh `Research Lab Experiment Ops` directory.
- Added root docs, local environment template, Docker compose, and CI/CD placeholders.
- Added architecture, API route list, folder structure, and Week 1 deliverables docs.
- Added Prisma schema for the lab experiment operations domain.
- Added root workspace config and NestJS API scaffolding for health, auth, workspaces, and projects.
- Added Prisma seed placeholder and e2e test scaffold.
- Added `docs/build-log.md` as the reproducible implementation log for all future changes.
- Wired `workspaces` and `projects` services to Prisma-backed CRUD and added unit coverage for both services.
- Implemented Prisma-backed experiment and run service layers with controllers and unit coverage.

## Notes
- Node.js is installed locally and dependencies are installed in the repo.
- Health e2e is kept database-light; Prisma-backed services are validated through client generation and unit tests.
- Applied initial Prisma migration to live local Postgres via Docker and ran seed placeholder script.
- Added documented branching workflow in docs/branching.md and aligned README commands with npm + Docker local setup.
- Implemented run parameter and metric endpoints with Prisma persistence and added service-level unit tests for both.
- Added live DB-backed integration coverage for run param and metric endpoints using Docker Postgres and Prisma.
- Hardened Jest unit/e2e execution to run in-band so validation is stable on Windows and in constrained environments.
- Replaced scaffold auth with persisted register/login and added lightweight request-user context via the x-user-id header.
- Added workspace membership enforcement across workspace, project, experiment, and run services.
- Scaffolded a Next.js frontend with a live dashboard shell, projects view, experiment view, and onboarding panel connected to the API.
