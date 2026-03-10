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