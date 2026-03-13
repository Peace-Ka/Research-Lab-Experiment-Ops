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
- Enabled CORS for the local web frontend and added deterministic demo seed data for one user, workspace, project, experiment, and runs.
- Adjusted the API dev/start scripts to avoid the broken watch-mode startup path on Windows.
- Added project, experiment, and run creation forms in the web app and wired them to live backend POST endpoints.
- Added run detail retrieval with parameter and metric display so runs can be inspected beyond status-only summaries.
- Refactored the frontend to persist selected project and selected experiment so the UI now respects the workspace > project > experiment > run hierarchy.
- Fixed a frontend refetch/render loop by stabilizing the selection dependencies in the main data hook.
- Added explicit run selection and wired parameter/metric creation forms to the selected run detail panel.
- Added seeded reproducibility checklist items/states so demo runs now show readiness rather than empty checklist scaffolding.
- Added run status editing and checklist state editing in the run detail panel to support an actual run-governance workflow.
- Added artifact registration to the run workflow so runs now carry evidence records with type, checksum, size, and storage key.
- Seeded demo artifacts and surfaced them in the run detail panel alongside metrics, params, and checklist state.
- Added a dedicated analytics panel on the experiments page with run-status distribution and selected-run metric trend charts.
- Added an 8-week delivery roadmap to keep the remaining scope controlled through the next two months.
- Replaced artifact metadata-only registration with actual backend-managed file persistence and download support.
- Seeded demo artifact files on disk so download behavior works in the local walkthrough, not just the database records.
