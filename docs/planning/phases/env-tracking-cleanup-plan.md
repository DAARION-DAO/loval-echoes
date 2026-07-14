# Environment Tracking Cleanup Plan

Status: **GO**

## Objective

Remove the browser-only root `.env` file from Git tracking, ensure local environment files are ignored, retain a safe tracked `.env.example`, and restore the existing repository security check without changing runtime behavior or production configuration.

## Current State

- Baseline HEAD is `a816c1e074c7ed61acb7b1dc991b21af637af38f` on a clean branch from `origin/main`.
- Git currently tracks root `.env`; `npm run security:check` treats that condition as a failure.
- Sanitized inspection found only `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_URL` in the tracked file.
- Current and historical classification is `SECURITY_REVIEW_REQUIRED` / `NOT_CONFIRMED_SECRET_EXPOSURE`: no service-role, `sb_secret`, database credential, signing key, private key, or confidential token was identified.
- Official Supabase documentation classifies publishable keys and legacy `anon` keys as low-privilege client identifiers; secret and service-role keys remain backend-only.
- `.gitignore` ignores `.env.*` but not root `.env`, and explicitly retains `.env.example`.
- A tracked `.env.example` already exists with browser configuration variable names.

## Scope

- Stop tracking root `.env` while preserving the worktree copy where practical.
- Ignore root `.env` and local variants while retaining `.env.example`.
- Validate that `.env.example` contains no copied real values or secret-class credentials.
- Run the existing security check, sanitized secret scans, ignore/tracking checks, changed-path review, and whitespace review.
- Record evidence in a matching completion report and publish a draft security PR.

## Explicit Non-Goals

- Credential rotation or revocation.
- Git history rewriting.
- Supabase project, Auth, RLS, schema, migration, Edge Function, or deployment changes.
- Application source, runtime, dependency, lockfile, build configuration, or CI changes.
- Edge-runtime or Phase 1A changes.

## Repository Ownership

This cleanup belongs only to `loval-echoes`, the web/product repository. It does not change the `daarion-edge-client` local runtime or any cross-repository contract.

## Files and Modules Expected to Change

- `.env`: deletion from Git tracking only; retain the local worktree copy.
- `.gitignore`: add an explicit root `.env` ignore rule while preserving `.env.example`.
- `docs/planning/phases/env-tracking-cleanup-plan.md`: this plan.
- `docs/planning/phases/env-tracking-cleanup-completion.md`: evidence and release verdict.

`.env.example` is inspect-only unless sanitized verification proves it unsafe or incomplete. No application module may change.

## Contracts Affected

No runtime, API, database, Supabase, or deployment contract changes. The developer setup contract becomes explicit: real local values live in an ignored `.env`; version control contains names and non-secret placeholders only in `.env.example`.

## Security Considerations

- Never print or copy environment values.
- Verify classifications by key name, prefix/type, and legacy JWT role only.
- Stop if any confidential credential class is discovered; rotation would require a separate incident workflow.
- Do not claim that removing current tracking removes historical copies.
- Do not claim production configuration or deployment verification.
- Review the complete diff for secret values and private operational data before commit.

## Migration and Compatibility Considerations

- No data or deployment migration exists.
- Existing developers retain their local `.env` because the operation uses index-only removal.
- Fresh clones use `.env.example` to create an ignored local `.env`.
- Git history remains intact.

## Implementation Steps

1. Record clean worktree, branch, baseline HEAD, tracking state, and sanitized key inventory.
2. Verify `.env.example` contains only safe placeholders without printing values.
3. Remove root `.env` from the Git index while preserving the local file.
4. Add an explicit `.env` ignore rule and preserve `!.env.example`.
5. Confirm local `.env` is ignored and no longer tracked.
6. Run security, secret, changed-path, and whitespace checks.
7. Review the full diff and write the completion report.
8. Commit, push, and open a draft PR; do not merge.

## Tests

- `npm run security:check`
- repository secret-pattern scan without printing environment values
- `git ls-files --error-unmatch .env` must fail
- `git check-ignore -v --no-index .env` must identify the explicit ignore rule
- sanitized `.env.example` classification must show placeholders/public identifiers only
- `git diff --check`
- exact changed-path review

No runtime build is required because application source, dependencies, configuration, and runtime behavior do not change.

## Acceptance Criteria

- `.env` is absent from the Git index and remains ignored locally.
- `.env.example` remains tracked and contains no real confidential value.
- Existing `npm run security:check` passes.
- Changed paths remain limited to `.env`, `.gitignore`, and the two phase documents.
- No production configuration, credential rotation, history rewrite, application code, dependency, migration, or deployment change occurs.
- Completion report records exact evidence and does not overstate secret exposure or production verification.

## Rollback Strategy

Before merge, discard or revert the cleanup commit. After merge, reverting would restore tracking and re-open the security failure, so the preferred operational rollback is to correct `.env.example` or ignore rules without restoring real local values to Git.

## Documentation Updates

Create only `docs/planning/phases/env-tracking-cleanup-completion.md`. No architecture, ADR, roadmap, or product documentation change is required because runtime behavior and repository ownership are unchanged.

## Open Questions

None. Repository evidence and the authorized prompt resolve the bounded cleanup behavior. Production environment management remains outside this task.

## GO / CONDITIONAL_GO / NO_GO

**GO.** The inspected file contains only browser-exposed Supabase configuration classes, the safe example already exists, and the change can remain limited to Git tracking, ignore rules, and evidence documentation. Discovery of a secret/service-role/database/private credential would immediately change this verdict to `NO_GO` and require a separate rotation-first workflow.
