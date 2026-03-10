# Week 1 Deliverables

## Goal
Ship a production-grade project foundation for a lab experiment operations platform focused on reproducibility and collaboration.

## Deliverables
1. Repository scaffold completed (monorepo folders + docs + infra placeholders).
2. Database schema v1 defined in Prisma for:
   - users, workspaces, memberships, projects
   - datasets and immutable dataset versions
   - models and immutable model versions
   - experiments and runs
   - run params, run metrics, artifacts, lineage links
   - reproducibility checklist items and run checklist states
   - run reviews, audit logs, report exports
3. API route list v1 defined and mapped to modules.
4. Baseline docs committed:
   - architecture overview
   - week 1 plan
   - changelog
   - work log
5. Baseline operational quality requirements defined:
   - RBAC roles
   - audit logging for mutations
   - artifact checksum integrity
   - immutable version records for dataset/model artifacts
6. Development bootstrap files added:
   - `.env.example`
   - `docker-compose.dev.yml`
   - GitHub Actions CI/CD placeholders

## Acceptance Criteria
- Folder structure exists as specified in README.
- Prisma schema validates once Node/Prisma toolchain is installed.
- Every route in `docs/api-route-list.md` maps to a bounded context module.
- Changelog and work-log include this domain migration.

## Out of Scope for Week 1
- Full endpoint implementation.
- Full frontend beyond initial shell.
- ML training pipeline orchestration.
- Cloud production deployment.
