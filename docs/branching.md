# Branching Workflow

Use short-lived branches and keep `main` stable.

## Branch Types
- `feat/<scope>`: new user-facing behavior, endpoints, or schema capabilities.
- `fix/<scope>`: bug fixes and regressions.
- `docs/<scope>`: docs-only changes.
- `chore/<scope>`: tooling, infra, or maintenance without product behavior changes.
- `test/<scope>`: test-only improvements.

## Standard Flow
1. Sync `main`:
   - `git checkout main`
   - `git pull origin main`
2. Create branch:
   - `git checkout -b feat/<scope>`
3. Implement and verify:
   - run build/test commands relevant to the change.
4. Commit with strict type (`feat`, `fix`, `docs`, `chore`, `test`).
5. Push branch:
   - `git push -u origin <branch-name>`
6. Open PR and merge only after checks pass.

## Commit-Type Policy
- `feat`: new behavior or API capability.
- `fix`: correctness issue resolved.
- `docs`: documentation only.
- `test`: tests only.
- `chore`: non-functional maintenance.

## Current Next Branch
For the next feature, use:
- `feat/run-params-metrics`