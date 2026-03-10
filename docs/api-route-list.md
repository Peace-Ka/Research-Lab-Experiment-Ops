# API Route List (v1)

## Auth
- POST `/v1/auth/register`
- POST `/v1/auth/login`
- POST `/v1/auth/refresh`
- POST `/v1/auth/logout`
- POST `/v1/auth/mfa/setup`
- POST `/v1/auth/mfa/verify`

## Profile
- GET `/v1/me`
- PATCH `/v1/me`

## Workspaces and Membership
- POST `/v1/workspaces`
- GET `/v1/workspaces`
- GET `/v1/workspaces/:workspaceId`
- PATCH `/v1/workspaces/:workspaceId`
- DELETE `/v1/workspaces/:workspaceId`
- GET `/v1/workspaces/:workspaceId/members`
- POST `/v1/workspaces/:workspaceId/members`
- PATCH `/v1/workspaces/:workspaceId/members/:memberId`
- DELETE `/v1/workspaces/:workspaceId/members/:memberId`

## Projects
- GET `/v1/workspaces/:workspaceId/projects`
- POST `/v1/workspaces/:workspaceId/projects`
- GET `/v1/workspaces/:workspaceId/projects/:projectId`
- PATCH `/v1/workspaces/:workspaceId/projects/:projectId`
- DELETE `/v1/workspaces/:workspaceId/projects/:projectId`

## Experiments
- GET `/v1/workspaces/:workspaceId/projects/:projectId/experiments`
- POST `/v1/workspaces/:workspaceId/projects/:projectId/experiments`
- GET `/v1/workspaces/:workspaceId/experiments/:experimentId`
- PATCH `/v1/workspaces/:workspaceId/experiments/:experimentId`

## Runs
- GET `/v1/workspaces/:workspaceId/experiments/:experimentId/runs`
- POST `/v1/workspaces/:workspaceId/experiments/:experimentId/runs`
- GET `/v1/workspaces/:workspaceId/runs/:runId`
- PATCH `/v1/workspaces/:workspaceId/runs/:runId/status`

## Datasets
- GET `/v1/workspaces/:workspaceId/datasets`
- POST `/v1/workspaces/:workspaceId/datasets`
- POST `/v1/workspaces/:workspaceId/datasets/:datasetId/versions`
- GET `/v1/workspaces/:workspaceId/datasets/:datasetId/versions`

## Models
- GET `/v1/workspaces/:workspaceId/models`
- POST `/v1/workspaces/:workspaceId/models`
- POST `/v1/workspaces/:workspaceId/models/:modelId/versions`
- GET `/v1/workspaces/:workspaceId/models/:modelId/versions`

## Artifacts and Lineage
- POST `/v1/workspaces/:workspaceId/runs/:runId/artifacts/upload-url`
- POST `/v1/workspaces/:workspaceId/runs/:runId/artifacts`
- GET `/v1/workspaces/:workspaceId/runs/:runId/artifacts`
- POST `/v1/workspaces/:workspaceId/runs/:runId/lineage/parents/:parentRunId`
- GET `/v1/workspaces/:workspaceId/runs/:runId/lineage`

## Reproducibility and Reviews
- GET `/v1/workspaces/:workspaceId/runs/:runId/checklist`
- PATCH `/v1/workspaces/:workspaceId/runs/:runId/checklist/:itemId`
- POST `/v1/workspaces/:workspaceId/runs/:runId/reviews`
- PATCH `/v1/workspaces/:workspaceId/runs/:runId/reviews/:reviewId`

## Reporting and Audit
- GET `/v1/workspaces/:workspaceId/dashboard`
- POST `/v1/workspaces/:workspaceId/reports/exports`
- GET `/v1/workspaces/:workspaceId/reports/exports/:exportId`
- GET `/v1/workspaces/:workspaceId/audit-logs`