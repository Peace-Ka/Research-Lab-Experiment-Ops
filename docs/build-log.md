# Build Log

Use this log for reproducible implementation history. Each entry should capture exactly what changed, how it was verified, and what remains.

## Entry Template
- Timestamp:
- Summary:
- Files changed:
- Commands run:
- Result:
- Follow-up:

## 2026-03-10 02:45 CST
- Summary: Added initial executable API baseline with NestJS app shell, Prisma client generation, and first passing health e2e test.
- Files changed: `package.json`, `package-lock.json`, `apps/api/*`, `prisma/schema.prisma`, `prisma/seed.ts`, `docs/work-log.md`, `docs/week-1-deliverables.md`, `CHANGELOG.md`
- Commands run:
  - `npm install`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm run test`
  - `npm run test:e2e --workspace @labops/api`
- Result: Build passed, Prisma client generated, health endpoint e2e passed.
- Follow-up: Wire `workspaces` and `projects` to Prisma and create the first migration.

## 2026-03-10 03:05 CST
- Summary: Replaced scaffold-only workspace/project services with Prisma-backed CRUD and added unit tests.
- Files changed: `apps/api/src/app.module.ts`, `apps/api/src/modules/prisma/prisma.service.ts`, `apps/api/src/modules/workspaces/*`, `apps/api/src/modules/projects/*`, `apps/api/test/*`, `docs/*`, `CHANGELOG.md`
- Commands run:
  - `npm run prisma:generate`
  - `npm run build`
  - `npm run test`
  - `npm run test:e2e --workspace @labops/api`
  - `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`
- Result: Prisma schema stays valid, CRUD services compile, tests cover service behavior, and initial migration SQL is generated.
- Follow-up: Run `prisma migrate dev` against a live Postgres instance to apply the migration and start wiring auth persistence.

## 2026-03-10 03:25 CST
- Summary: Added experiment and run modules with Prisma-backed CRUD service logic and unit tests.
- Files changed: `apps/api/src/app.module.ts`, `apps/api/src/modules/experiments/*`, `apps/api/src/modules/runs/*`, `apps/api/test/*`, `docs/*`, `CHANGELOG.md`
- Commands run:
  - `npm run build`
  - `npm run test`
  - `npm run test:e2e --workspace @labops/api`
- Result: Experiment and run modules compile and unit tests validate creation, lookup, and run-number sequencing behavior.
- Follow-up: Add param/metric logging endpoints and start persisting auth/users.

## 2026-03-10 07:15 CST
- Summary: Started live local infrastructure and applied first Prisma migration to real Postgres.
- Files changed: `.env`, `prisma/migrations/20260310_init/migration.sql`
- Commands run:
  - `docker compose -f infra/docker/docker-compose.dev.yml up -d`
  - `docker ps`
  - `prisma migrate dev --name init --schema prisma/schema.prisma`
  - `npm run prisma:seed`
- Result: Postgres/Redis/MinIO running, migration applied successfully, Prisma client regenerated, seed script executed.
- Follow-up: Add real seed data and run API against live DB-backed endpoints.

## 2026-03-10 07:35 CST
- Summary: Added branching policy documentation and corrected local setup instructions.
- Files changed: `README.md`, `docs/branching.md`, `docs/work-log.md`
- Commands run:
  - documentation update only
- Result: Branching rules are explicit and setup instructions now match actual npm + Docker workflow.
- Follow-up: Create `feat/run-params-metrics` and implement run param/metric endpoints.

## 2026-03-10 07:55 CST
- Summary: Implemented run parameter and metric endpoints in the runs module.
- Files changed: `apps/api/src/modules/runs/*`, `apps/api/test/runs.service.spec.ts`
- Commands run:
  - `npm run build`
  - `npm run test`
- Result: Build passed and test suites passed (11 tests total), including new coverage for param upsert and metric creation.
- Follow-up: Add integration tests that exercise params/metrics against a live migrated database.

## 2026-03-11 08:05 CST
- Summary: Added live DB-backed integration coverage for run param and metric endpoints and hardened Jest execution for Windows/local sandbox reliability.
- Files changed: `apps/api/test/runs.integration.e2e-spec.ts`, `apps/api/package.json`, `apps/api/test/jest-unit.json`, `apps/api/test/jest-e2e.json`, `package.json`, `README.md`, `docs/build-log.md`, `docs/work-log.md`, `CHANGELOG.md`
- Commands run:
  - `npm run build`
  - `npm run test`
  - `npm run test:integration`
- Result: Unit tests pass in-band, integration tests pass against live Docker-backed Postgres, and the root workflow now separates unit and integration execution cleanly.
- Follow-up: Seed richer demo data and add auth/user persistence to eliminate synthetic IDs.

## 2026-03-12 07:20 CST
- Summary: Added persisted auth, workspace membership enforcement, and the first visible Next.js frontend connected to live backend endpoints.
- Files changed: `apps/api/src/common/auth/*`, `apps/api/src/modules/auth/*`, `apps/api/src/modules/workspaces/*`, `apps/api/src/modules/projects/*`, `apps/api/src/modules/experiments/*`, `apps/api/src/modules/runs/*`, `apps/api/test/*`, `apps/web/*`, `package.json`, `package-lock.json`, `README.md`, `docs/work-log.md`, `CHANGELOG.md`
- Commands run:
  - `npm run build`
  - `npm run test`
  - `npm run test:integration`
  - `npm run web:build`
- Result: Register/login now persist real users, workspace-scoped endpoints enforce active membership through `x-user-id`, and the web app builds with live dashboard, projects, and experiments views.
- Follow-up: Seed demo data for the frontend and replace the temporary `x-user-id` transport with JWT or session auth.

## 2026-03-12 08:15 CST
- Summary: Enabled local CORS, fixed API dev startup, and added deterministic demo seed data for the frontend walkthrough.
- Files changed: pps/api/src/main.ts, pps/api/package.json, pps/api/tsconfig.json, pps/api/tsconfig.build.json, prisma/seed.ts, docs/work-log.md, docs/build-log.md, CHANGELOG.md`n- Commands run:
  - 
pm run build`n  - 
pm run test`n  - 
pm run prisma:seed`n- Result: Local frontend requests can reach the API, the API starts without the broken watch-mode path assumption, and the database contains a known demo user/workspace/project/experiment/run graph.
- Follow-up: Replace the temporary x-user-id transport with JWT/session auth and add richer seeded metrics/artifacts.

## 2026-03-12 09:05 CST
- Summary: Added live create workflows for projects, experiments, and runs plus run detail display with parameters and metrics.
- Files changed: pps/api/src/modules/runs/runs.service.ts, pps/web/src/lib/api.ts, pps/web/src/lib/use-labops-data.ts, pps/web/src/components/*, pps/web/src/app/*, pps/web/src/app/globals.css, docs/work-log.md, docs/build-log.md, CHANGELOG.md`n- Commands run:
  - 
pm run build`n  - 
pm run test`n  - 
pm run web:build`n- Result: The frontend now supports core create-and-inspect workflow loops instead of read-only summaries, and run detail surfaces params and metrics pulled from the API.
- Follow-up: Add artifact upload, metric charts, and reproducibility checklist interactions.

## 2026-03-12 09:35 CST
- Summary: Fixed frontend hierarchy by persisting selected project and experiment context across pages.
- Files changed: pps/web/src/lib/use-labops-session.ts, pps/web/src/lib/use-labops-data.ts, pps/web/src/app/page.tsx, pps/web/src/app/projects/page.tsx, pps/web/src/app/experiments/page.tsx, pps/web/src/app/globals.css, docs/work-log.md, docs/build-log.md, CHANGELOG.md`n- Commands run:
  - 
pm run web:build`n- Result: The UI now matches the backend hierarchy: project selection drives experiment scope, and experiment selection drives run scope.
- Follow-up: Add explicit run selection, artifact upload, and reproducibility checklist interactions.

## 2026-03-12 10:00 CST
- Summary: Fixed frontend render jitter by stabilizing selection-based hook dependencies.
- Files changed: pps/web/src/lib/use-labops-data.ts, docs/work-log.md, docs/build-log.md, CHANGELOG.md`n- Commands run:
  - 
pm run web:build`n- Result: The client-side data hook no longer re-executes because of a freshly created options object on every render, eliminating the visible jitter/refetch loop.
- Follow-up: Add explicit run selection so the detail pane is no longer tied to the first run in the list.

## 2026-03-12 10:35 CST
- Summary: Added explicit run selection and live parameter/metric entry for the selected run.
- Files changed: pps/web/src/lib/api.ts, pps/web/src/lib/use-labops-session.ts, pps/web/src/lib/use-labops-data.ts, pps/web/src/components/run-detail-panel.tsx, pps/web/src/app/experiments/page.tsx, pps/web/src/app/globals.css, docs/work-log.md, docs/build-log.md, CHANGELOG.md`n- Commands run:
  - 
pm run web:build`n- Result: The experiments page now lets the user choose a specific run and record its parameters and metrics directly from the UI.
- Follow-up: Add run status editing, artifact upload, and reproducibility checklist interactions.

## 2026-03-12 10:55 CST
- Summary: Added seeded reproducibility checklist data plus run status and checklist editing in the web app.
- Files changed: `prisma/seed.ts`, `apps/api/test/runs.service.spec.ts`, `apps/web/src/lib/api.ts`, `apps/web/src/components/run-detail-panel.tsx`
- Commands run:
  - `npm.cmd run test`
  - `npm.cmd run prisma:seed`
  - `npm.cmd run web:build`
- Result: Demo runs now carry meaningful checklist state, the run detail panel can update lifecycle status and checklist items, unit tests pass, seed succeeds, and the frontend production build is clean.
- Follow-up: Add artifact upload and metric visualizations so evidence and outcomes are not text-only.

## 2026-03-12 11:35 CST
- Summary: Added run artifact registration, seeded artifact evidence, and surfaced artifact management in the run detail UI.
- Files changed: `apps/api/src/modules/runs/*`, `apps/api/test/runs.service.spec.ts`, `apps/web/src/lib/api.ts`, `apps/web/src/components/run-detail-panel.tsx`, `apps/web/src/app/globals.css`, `prisma/seed.ts`
- Commands run:
  - `npm.cmd run test`
  - `npm.cmd run prisma:seed`
  - `npm.cmd run web:build`
- Result: Runs can now register artifact metadata with type, storage key, checksum, and size; demo data includes evidence artifacts; backend tests pass; frontend production build is clean.
- Follow-up: Add true object storage upload (MinIO/S3) and artifact preview/download behavior.

## 2026-03-13 01:40 CST
- Summary: Added metric visualization for experiment runs and documented the 8-week delivery roadmap.
- Files changed: `apps/web/src/components/metric-visualization-panel.tsx`, `apps/web/src/app/experiments/page.tsx`, `apps/web/src/app/globals.css`, `prisma/seed.ts`, `docs/roadmap.md`
- Commands run:
  - `npm.cmd run test`
  - `npm.cmd run web:build`
  - `npm.cmd run prisma:seed` (blocked because local Docker/Postgres was not running after restart)
- Result: Frontend analytics panel compiles cleanly, unit tests pass, and the delivery plan is documented. Local reseeding will succeed once Docker Desktop is running again.
- Follow-up: Start Docker Desktop, rerun `npm.cmd run prisma:seed`, then move to true object storage upload.

## 2026-03-13 02:05 CST
- Summary: Replaced artifact metadata-only registration with backend-managed file upload and download handling.
- Files changed: `apps/api/src/modules/runs/*`, `apps/api/test/runs.service.spec.ts`, `apps/web/src/lib/api.ts`, `apps/web/src/components/run-detail-panel.tsx`, `.gitignore`, `prisma/seed.ts`
- Commands run:
  - `npm.cmd run test`
  - `npm.cmd run prisma:seed`
  - `npm.cmd run web:build`
- Result: Artifacts are now uploaded through the API, persisted to local storage, downloadable from run detail, and represented in seeded demo data with actual files on disk.
- Follow-up: Replace local storage with MinIO/S3-backed object storage and add preview support for images/logs.
- Update: switched artifact downloads from plain anchor links to authenticated blob fetches because browser links cannot send the required `x-user-id` header.

## 2026-03-13 07:05 CST
- Summary: Replaced the temporary x-user-id shell transport with bearer-token authentication across the API and web client.
- Files changed: `apps/api/src/common/auth/*`, `apps/api/src/modules/auth/*`, `apps/api/src/modules/health/health.controller.ts`, `apps/api/src/app.module.ts`, `apps/api/src/main.ts`, `apps/api/test/auth.service.spec.ts`, `apps/web/src/lib/*`, `apps/web/src/components/*`, `apps/web/src/app/*`, `.env.example`, `.gitignore`
- Commands run:
  - `npm.cmd run build`
  - `npm.cmd run test`
  - `npm.cmd run test:integration`
  - `npm.cmd run web:build`
- Result: Auth now issues and verifies signed bearer tokens, protected routes accept `Authorization: Bearer ...`, the frontend persists the access token in session storage, and all API/frontend validations pass.
- Follow-up: Restart the API/web dev servers, sign in again to refresh local session state, then verify project/experiment/run flows under JWT auth.

## 2026-03-16 01:35 CST
- Summary: Replaced the custom auth flow with Clerk-managed authentication across the Next.js frontend and Nest API.
- Files changed: `apps/web/src/app/*`, `apps/web/src/components/app-shell.tsx`, `apps/web/src/lib/*`, `apps/web/src/middleware.ts`, `apps/api/src/modules/auth/*`, `apps/api/src/common/auth/*`, `apps/api/src/modules/workspaces/workspaces.service.ts`, `prisma/schema.prisma`, `prisma/migrations/20260316_add_clerk_user_mapping/migration.sql`, `prisma/seed.ts`, `.env.example`, `README.md`
- Commands run:
  - `npm.cmd install @clerk/nextjs --workspace @labops/web`
  - `npm.cmd install @clerk/backend --workspace @labops/api`
  - `npm.cmd run build`
  - `npm.cmd run test`
  - `npm.cmd run test:integration`
  - `npm.cmd run web:build`
- Result: The frontend now uses Clerk provider/middleware/sign-in/sign-up routes, the backend verifies Clerk-issued tokens and maps them to local users via `externalAuthId`, and new users can create their first workspace directly from the overview page.
- Follow-up: Set real Clerk keys in `.env`, restart both dev servers, sign in through `/sign-in`, then verify workspace/project/experiment flows with a real Clerk user.

## 2026-03-16 05:30 CST
- Summary: Added a run comparison workspace on the experiments page and reconciled the branch with the full Clerk auth migration from the earlier auth branch.
- Files changed: `apps/web/src/app/experiments/page.tsx`, `apps/web/src/components/run-comparison-panel.tsx`, `apps/web/src/app/globals.css`
- Commands run:
  - `git cherry-pick 1b6d203`
  - `npm.cmd run test`
  - `npx.cmd tsc --noEmit -p apps/web/tsconfig.json`
- Result: Run comparison now supports selecting up to three runs and comparing lifecycle status, params, latest metrics, checklist state, and evidence counts side by side. Backend unit tests pass again after bringing the completed Clerk migration onto this branch.
- Follow-up: Verify the comparison panel visually in the browser, then commit and push this branch before opening the PR.
