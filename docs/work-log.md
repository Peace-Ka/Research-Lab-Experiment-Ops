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