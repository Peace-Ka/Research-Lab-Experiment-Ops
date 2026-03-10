# Repository Bootstrap (Git + GitHub)

If your remote repository does not exist yet, create one on GitHub first, then connect and push.

## Commands
1. `git remote remove origin` (only if wrong remote exists)
2. `git remote add origin https://github.com/<your-username>/lab-experiment-ops.git`
3. `git push -u origin main`

## Logging Rule
- For each change batch:
  1. update `CHANGELOG.md`
  2. update `docs/work-log.md`
  3. commit with clear scope (`feat:`, `chore:`, `docs:`)
  4. push
