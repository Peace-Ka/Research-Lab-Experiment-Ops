# Week 1 Deliverables

## Goal
Ship a production-grade foundation for a lab experiment operations platform focused on reproducibility and collaboration.

## Deliverables
1. Repository scaffold completed with monorepo folders, docs, and infra placeholders.
2. Database schema v1 defined in Prisma for:
   - users, workspaces, memberships, and projects
   - datasets and immutable dataset versions
   - models and immutable model versions
   - experiments and runs
   - run params, run metrics, artifacts, and lineage links
   - reproducibility checklist items and run checklist states
   - run reviews, audit logs, and report exports
3. API route list v1 defined and mapped to modules.
4. Baseline docs committed:
   - architecture overview
   - folder structure
   - week 1 plan
   - changelog
   - work log
5. Initial executable backend slice scaffolded:
   - NestJS app shell
   - health endpoint
   - auth module
   - workspaces module
   - projects module
   - Prisma seed placeholder
6. Baseline operational quality requirements defined:
   - RBAC roles
   - audit logging for all mutations
   - artifact checksum integrity
   - immutable dataset/model version records

## Acceptance Criteria
- Folder structure exists as specified in `docs/folder-structure.md`.
- Prisma schema validates once Node and Prisma are installed.
- Every route in `docs/api-route-list.md` maps to a bounded context module.
- Backend source scaffold exists for the first delivery slice.
- Changelog and work log record the scaffold work.

## Out of Scope
- Full endpoint implementation.
- Full frontend beyond initial shell.
- ML training orchestration.
- Production deployment.
