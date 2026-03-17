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
- Fixed frontend selection loading so the UI no longer refetches continuously when project/experiment scope is active.
- Added explicit run selection plus live param and metric entry from the run detail panel.
- Added seeded reproducibility checklist data and surfaced checklist state in the run detail UI.
- Added run lifecycle status editing and checklist status updates from the frontend.
- Added run artifact registration with backend metadata persistence and UI evidence listing.
- Seeded demo artifacts and exposed artifact registration from the run detail panel.
- Added experiment analytics with run-status distribution and selected-run metric trend charts.
- Added an 8-week delivery roadmap covering portfolio-strong, robust, and optional polish phases.
- Replaced artifact metadata-only registration with backend-managed file upload and download support.
- Seeded real local demo artifact files so evidence downloads work in the local walkthrough.
- Fixed artifact downloads so they use authenticated client-side fetch instead of unauthenticated direct links.
- Replaced the temporary custom auth flow with Clerk-managed authentication across the API and frontend shell.
- Added a global auth guard with public-route exceptions for health and Clerk sign-in/up surfaces.
- Updated the frontend session model so live API calls, artifact downloads, and workflow actions use Clerk session tokens.

- Replaced the custom auth flow with Clerk-managed sign-in/sign-up and backend token verification.
- Added local user mapping via `externalAuthId` and a Prisma migration for Clerk-backed identities.
- Added Clerk-protected app routes plus overview-page workspace creation so new authenticated users can bootstrap the system without seeded login credentials.
- Added a run comparison workspace on the experiments page with side-by-side views for params, latest metrics, checklist readiness, and artifact presence.
- Reconciled the comparison branch with the finalized Clerk auth migration so run comparison builds on the provider-managed auth baseline.
