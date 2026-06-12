
## Status of the sync

Repo is already at the target commit `99a6f4e` ("feat: Sprint B2 - MicroDAO Leader Onboarding & Community Spirit Agent"). The local migration file `supabase/migrations/20260612190000_trial_and_waitlist.sql` is present and unapplied. All Sprint B2 frontend code (onboarding lobby, leader setup, Дух Спільноти dashboard card, invite-code joiner) is already in the working tree from that commit.

## Critical issues found in the migration

Applying the file as-is would break or regress security. I want to apply the migration **plus a corrective migration in the same step** to fix:

1. **`is_admin(uuid)` redefinition is unsafe.** The migration replaces the existing project-wide `is_admin` with a heuristic ("first approved profile + 1 day"). The current `is_admin` returns true only for `profiles.role = 'guardian'` and is used by other policies. Replacing it will silently change admin semantics across the whole app, including the SecurityDashboard and approval flows. Fix: **do not redefine `is_admin`**, keep the existing one, and reference it as-is from the invitation_codes policies.

2. **`profiles` SELECT policy regresses email privacy.** The migration drops the current policy and recreates `FOR SELECT USING (true)` — this re-exposes emails to all authenticated users. This directly contradicts the project security memory ("hide emails via RLS"). Fix: keep the existing privacy-preserving profiles policies untouched (drop those two policy statements from the migration via the corrective migration that re-applies the safe version after the fact).

3. **`agents.agent_type` backfill is wrong.** `ADD COLUMN ... NOT NULL DEFAULT 'community_spirit'` will mark every pre-existing agent (personal agents, presets, etc.) as Community Spirit. Fix: in the corrective migration, set `agent_type` to `'personal'` for rows where `scope = 'personal'` and to `'preset'` where `is_preset = true`; leave the column nullable-friendly default but only newly-inserted Spirit Agents will use `'community_spirit'` via the RPC.

4. **`community_setup_sessions` policy is missing `FOR ALL`.** As written, the policy has no command clause, which Postgres interprets as ALL — works, but I'll explicitly write `FOR ALL` to be safe and to avoid linter warnings.

5. **`agents` insert in `create_microdao_with_spirit_agent` references `is_preset`** — verified the column exists, so this is fine. I'll double-check `connection_type`/`status` enums during apply; if a constraint rejects `'msp'` or `'active'` the RPC will fail and I'll patch.

6. **Invitation-codes safety** — the SELECT/ALL policies correctly limit visibility to admins, creators, and community owners/admins. Non-members cannot list active codes. Validation goes through the SECURITY DEFINER RPC. This matches the brief.

7. **`community_members.status`** — kept as `'approved'`. RPCs insert with `status = 'approved'`. Consistent with the rest of the app.

8. **Existing users are preserved** — the migration does not touch existing `communities`, `community_members`, or owner/admin assignments. The `handle_new_user` trigger continues to set `approval_status = 'approved'` so new signups go to onboarding, not a waitlist.

## Plan

1. **Create corrective migration** `supabase/migrations/20260612200000_b2_safety_fixes.sql` that runs after the Sprint B2 migration and:
   - Restores the original safe `is_admin(uuid)` (guardian-based).
   - Restores the email-hiding `profiles` SELECT policies (drop the permissive one introduced by B2, recreate the prior safe policies).
   - Backfills `agents.agent_type` to `'personal'` / `'preset'` for rows that are not actually community-spirit agents.
   - Adds explicit `FOR ALL` to the `community_setup_sessions` policy.

2. **Apply both migrations** via `supabase--migration` (one approval). After approval, regenerated types update `agents`, `invitation_codes`, `community_setup_sessions`, `agent_permissions`, `agent_action_logs`.

3. **Verify frontend wiring** — quickly read the Sprint B2 pages already shipped (`MicroDAOOnboarding.tsx`, leader setup, dashboard card) to confirm they call `create_microdao_with_spirit_agent`, `validate_invitation_code`, `join_community_by_code`. Patch only if there's a typed mismatch (e.g. `as any` workarounds before types regenerate).

4. **Run security linter** and address any new warnings.

5. **Publish** with `preview_ui--publish` after confirming title/meta on `/`, `/pricing`, `/agents`, `/install` are still set.

6. **Smoke tests** against the published URL using the browser tool:
   - Load `/`, `/pricing`, `/agents`, `/install` (public).
   - Existing approved user with existing community → `/dashboard` opens, chats/projects/knowledge/prompts render.
   - New signup → lands on `/onboarding`, no waitlist screen.
   - Create MicroDAO flow → community + owner membership + Дух Спільноти agent + permissions + action log + setup session completion, dashboard card visible.
   - Join by code flow → insert a test `invitation_codes` row via `supabase--insert`, validate via RPC, join, confirm `used_count` increments and membership exists.

7. **Report back** with: migration status, linter results, deploy URL, smoke results, and screenshots of onboarding lobby / guided setup / Дух Спільноти dashboard card.

## Notes / non-goals

- No edits to `src/integrations/supabase/client.ts`, `.env`, or `config.toml`.
- No changes to the Reset Password, Auth, RAG (KB), or existing prompt-editor flows other than what regenerated types require.
- The corrective migration does **not** weaken any policy added in B2 — only restores prior protections that B2 inadvertently dropped.
