## Pre-publish security gate — read-only report

Scan: `security--get_scan_results`, 2026-07-12 08:36 UTC. Project owning https://1.daarion.city/.

| Item | Value |
|---|---|
| critical / error count | **1** |
| supply-chain critical / error | 0 |
| env or secret exposure detected | No |
| `.env` committed | No |
| SUPABASE_SERVICE_ROLE_KEY / DB password / JWT / RouterOS / DNS creds exposed | No |
| warn count | 12 |

The single `error` finding is `agent_security / grant_admin_role_bypass`: the `grant_admin_role` (and `revoke_admin_role`) RPC lost its admin-only caller check, so any authenticated user can self-promote to platform admin. Not env-related, not secret exposure — a pre-existing DB function regression. This is what blocks `preview_ui--publish`.

Warns (not blocking, not env-related): integration tokens mirrored to localStorage; PostgREST `.or()` interpolation in knowledge-base search; wrong-column profile lookup in `verify-polygon-payment`; 3 Supabase linter warns (SECURITY DEFINER exec, mutable search_path); 6 MISSING_RLS_POLICY notices (fail-closed, not exposure).

## Decision needed before republish

Publish stays blocked until the `error`-level finding is resolved. Pick one path:

### Option A — Fix the critical, then republish (recommended)

Scope is a single migration, no code, no runtime infra touched.

1. Migration `harden_grant_revoke_admin_role`:
   - Redefine `public.grant_admin_role(p_user_id uuid)` and `public.revoke_admin_role(p_user_id uuid)` as `SECURITY DEFINER`, `SET search_path = public`, with a guard `if not public.has_role(auth.uid(), 'admin') then raise exception 'not authorized'; end if;` and, for `grant_admin_role`, reject `p_user_id = auth.uid()` (no self-grant).
   - `REVOKE EXECUTE ON FUNCTION public.grant_admin_role(uuid), public.revoke_admin_role(uuid) FROM PUBLIC, anon, authenticated;`
   - `GRANT EXECUTE ... TO service_role;` (admin edge functions call as service role; direct client `.rpc()` is no longer allowed).
2. Re-run `security--run_security_scan`, confirm the `error` clears, then call `security--manage_security_finding` (`mark_as_fixed`) on `grant_admin_role_bypass` with the migration reference.
3. Republish via `preview_ui--publish` (no code changes, current commit) so the Vite bundle is rebuilt with the restored `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Post-publish smoke: fetch `https://1.daarion.city/`, confirm new JS/CSS hashes, `#root` non-empty, no `Error: supabaseUrl is required` in console.

Does not touch: Supabase DB rows, `device_backend_profiles`, `api.daarion.city`, RouterOS, DNS, UFW, TLS, Edge Client/Backend runtime. Only DDL on two RPCs.

### Option B — Ignore the finding to unblock publish now, fix later

Only if you accept that any signed-in user can self-promote to admin until fixed. I would call `security--manage_security_finding` (`ignore`) with an explicit justification, republish, then track the fix as a follow-up. I do not recommend this on a production system.

### Option C — Do nothing / abort republish

Site remains broken with `supabaseUrl is required`.

## Please confirm which option to run (A, B, or C). No files will be edited and no publish will be triggered until you approve.
