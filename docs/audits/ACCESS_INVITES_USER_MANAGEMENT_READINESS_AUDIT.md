# Access, Invites, User Management Readiness Audit

Date: 2026-06-20

Branch: `codex/access-invites-user-management-readiness-audit`

Final classification: `ACCESS_AND_INVITES_NOT_READY`

## Scope

This is an audit-only report for access, invitations, user management, role gates, billing gates, and RPC/migration readiness.

No runtime code, Supabase schema, RPC, migration, billing, Edge Client, Local Agent Runtime, Worker Node, or Lovable publish changes were made.

## Executive Summary

The current product has several important pieces in place, but the access and invitation system is not ready for a reliable public onboarding flow.

Implemented or partially implemented:

- Public account signup through `/auth?signup=true`.
- MicroDAO invite codes through `invitation_codes`.
- MicroDAO member/admin invite management in `src/pages/Participants.tsx`.
- Invite-code joining through `/onboarding?inviteCode=...` and `join_community_by_code`.
- Platform guardian invitation UI in `src/pages/admin/AdminTeam.tsx`.
- Platform guardian invitation acceptance route at `/accept-invite` with an invite token query parameter.
- Admin user status update through `admin_set_approval_status`.
- Billing admin RPC surfaces in `src/pages/admin/AdminBilling.tsx`.

Not ready:

- Platform guardian invite creation can fail because the newer invite RPC uses `gen_random_bytes(32)` without a guaranteed `pgcrypto` extension/search-path setup in the platform-admin invite migrations.
- Unauthenticated community invite recipients are routed through `/auth?redirect=...`, not a signup-first invite flow. This preserves the onboarding redirect but does not make first-user signup or invite acceptance explicit.
- Admin access-request approval still relies on direct table/profile writes in `src/pages/admin/AdminAccessRequests.tsx`, with code comments acknowledging that a secure platform admin RPC is still required.
- Several role/access/billing controls exist in the UI but are intentionally disabled or rely on migrations/RPCs that need live target proof.
- Raw or near-raw backend errors can still surface in some invite/admin failure paths.

Because at least one high-privilege invite path is currently blocked and several access-management operations are only partial, the readiness classification is `ACCESS_AND_INVITES_NOT_READY`.

## Current Flow Inventory

| Flow | Entry Point | Backend Surface | Registered User Required | Current Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Public Early Access signup | `/auth?signup=true` | Supabase Auth, `profiles` creation in `useAuth` | No | Partially ready | Signup creates a user account/profile but does not create a MicroDAO automatically. This matches the MicroDAO-first MVP rule. |
| MicroDAO member invite | `/participants` -> `/onboarding?inviteCode=...` | `invitation_codes`, `join_community_by_code` | Yes for acceptance | Partially ready | Owner/admin can generate an active member code if RLS permits. Unauthenticated recipients are redirected to `/auth?redirect=...`, not explicitly to signup-first invite acceptance. |
| MicroDAO admin invite | `/participants` -> `/onboarding?inviteCode=...` | `invitation_codes`, `join_community_by_code` | Yes for acceptance | Partially ready | Owner-only generation is enforced in UI. Same unauthenticated invite handoff issue as member invites. |
| Platform guardian/admin invite | `/admin/team` -> `/accept-invite` with invite token | `platform_admin_invites`, `admin_create_platform_admin_invite`, `accept_platform_admin_invite`, `admin_revoke_platform_admin_invite` | Yes for acceptance | Blocked | Current newer RPC uses `gen_random_bytes(32)`. Migrations do not guarantee the function is available in the RPC search path. |
| Onboarding inviteCode flow | `/onboarding?inviteCode=...` | `join_community_by_code` | Yes | Partially ready | Invite code is loaded into UI and submitted through RPC. If unauthenticated, the page redirects to `/auth?redirect=<onboarding path>`. |
| Access request / waitlist | `/onboarding`, admin access request panel | `access_requests`, `profiles.access_tier`, partial admin direct writes | Yes | Partially ready / blocked for admin writes | User request submission exists. Admin approval path attempts direct writes and acknowledges that secure platform admin RPC work is still required. |

## Role Model Observed In Code

### Supabase Auth User

Source: `src/hooks/useAuth.tsx`

The base identity is a Supabase Auth user. The app creates or loads a matching `profiles` row using `profiles.user_id`.

### Profile

Observed fields and concepts:

- `profiles.user_id`
- `profiles.display_name`
- `profiles.role`
- `profiles.approval_status`
- `profiles.access_tier`

New profiles are created with `approval_status: 'pending'`.

### Platform Guardian / Admin

Sources:

- `src/components/admin/GuardianRoute.tsx`
- `src/pages/admin/AdminTeam.tsx`
- `src/pages/AcceptInvite.tsx`
- `supabase/migrations/20260616120549_d8a0d06a-0423-4510-8676-5fc62c83e509.sql`

The admin console is gated by `profile.role === 'guardian'`. The platform admin invite RPC only permits `invited_role = 'guardian'`.

Current gap: the guardian invite path is not migration-ready because `admin_create_platform_admin_invite` depends on `gen_random_bytes(32)` without a guaranteed `pgcrypto` extension/search-path setup.

### MicroDAO Roles

Sources:

- `src/services/communityMembers.ts`
- `src/pages/Participants.tsx`
- `supabase/migrations/20260612201050_e2648fc6-52b5-4081-b4e3-7a02996aca7e.sql`

Observed roles:

- `owner`
- `admin`
- `member`

Invite roles are limited to:

- `admin`
- `member`

Owner/admin users can manage member invites in the UI. Owner users can generate admin invites in the UI.

### Early Access / Access Tier

Sources:

- `src/pages/MicroDAOOnboarding.tsx`
- `src/pages/admin/AdminAccessRequests.tsx`
- `src/lib/i18n.ts`

`access_tier` appears to represent advanced access programs or early access levels. It is distinct from MicroDAO membership and platform guardian role.

Current gap: admin approval of advanced access requests is not fully RPC-backed.

### Pending / Invited / Approved States

Observed concepts:

- `profiles.approval_status`: `pending`, `approved`, `rejected`, and UI handling for `blocked`.
- `community_members.status`: `approved` is used by `join_community_by_code`.
- `invitation_codes.is_active`, `used_count`, `max_uses`, and `expires_at`.
- `platform_admin_invites.status`: `pending`, `accepted`, `revoked`.
- `access_requests.status`: pending/approved/rejected/needs-info style flow in the admin UI.

## Guardian/Admin Action Readiness

| Action | Current Surface | Readiness | Evidence / Gap |
| --- | --- | --- | --- |
| Invite platform guardian/admin | `src/pages/admin/AdminTeam.tsx` -> `admin_create_platform_admin_invite` | Blocked | RPC uses `gen_random_bytes(32)`; platform invite migrations do not ensure pgcrypto availability. |
| Accept platform guardian/admin invite | `src/pages/AcceptInvite.tsx` -> `accept_platform_admin_invite` | Blocked until invite creation works | Route exists. Unauthenticated users are sent to `/auth?redirect=...`. Older migration version updates `profiles.id = auth.uid()`, while the newer migration fixes this to `profiles.user_id = auth.uid()`. Live target needs proof that the newer function body is active. |
| Revoke platform guardian/admin invite | `src/pages/admin/AdminTeam.tsx` -> `admin_revoke_platform_admin_invite` | Unknown / needs live proof | RPC exists in newer migration. Needs proof after invite creation is fixed. |
| Approve or block user | `src/pages/admin/AdminUsers.tsx` -> `admin_set_approval_status` | Partially ready | Secure RPC exists and updates `profiles.approval_status` by `user_id`. Needs live proof in target. |
| Change role/access level | `src/pages/admin/AdminUsers.tsx` | Not ready | UI controls are disabled and labeled as requiring a future RPC. |
| Approve access request / set access tier | `src/pages/admin/AdminAccessRequests.tsx` | Not ready | Code attempts direct updates to `access_requests` and `profiles.access_tier`, then shows fallback copy saying secure platform admin RPC is required. |
| View user details | `src/pages/admin/AdminUsers.tsx`, `src/lib/adminQueries.ts` | Partially ready | Admin query RPC/fallback pattern exists. Needs live RLS proof. |
| List/revoke invites | `src/pages/admin/AdminTeam.tsx`, `src/pages/Participants.tsx` | Partially ready | Community invite list/regeneration exists. Platform invite list/revoke exists but depends on platform invite migrations and policies. |
| Billing access changes | `src/pages/admin/AdminBilling.tsx` | Out of scope / needs separate release proof | Admin billing RPCs exist, but billing should remain separate from P0 access/invite readiness. |

## RPC And Migration Readiness Matrix

| RPC / Table | Purpose | Status |
| --- | --- | --- |
| `invitation_codes` | Stores community/platform-scope invitation codes | Present in migrations. Community usage is wired in UI. |
| `validate_invitation_code(p_code)` | Validates invite code metadata | Present and granted to authenticated users. Not clearly used in the current UI flow. |
| `join_community_by_code(p_code)` | Joins authenticated user to community from invite code | Present and granted to authenticated users. Current UI calls it from `/onboarding`. |
| `create_microdao_with_spirit_agent(...)` | Creates MicroDAO, owner membership, and Community Spirit agent | Present. Related to onboarding, not directly an invite-management fix. |
| `admin_set_approval_status(p_user_id, p_status)` | Guardian/admin approval-status mutation | Present and granted to authenticated users with internal `is_admin` check. |
| `platform_admin_invites` | Stores guardian/admin invite tokens | Present in platform admin invite migrations. Duplicate migration definitions require live target proof. |
| `admin_create_platform_admin_invite(invited_email, invited_role)` | Creates platform guardian invite | Present but blocked by `gen_random_bytes(32)` readiness issue. |
| `accept_platform_admin_invite(p_invite_token)` | Accepts platform guardian invite | Present. Needs proof that newer `user_id = auth.uid()` function body is active in target. |
| `admin_revoke_platform_admin_invite(p_invite_id)` | Revokes pending platform guardian invite | Present. Needs live proof after invite creation works. |
| `access_requests` direct updates | Advanced access request approval | Not ready | Current admin UI still attempts direct table/profile updates and warns a secure RPC is required. |

## `gen_random_bytes(integer) does not exist` Investigation

The likely failing function is `public.admin_create_platform_admin_invite(invited_email text, invited_role text)` in:

`supabase/migrations/20260616120549_d8a0d06a-0423-4510-8676-5fc62c83e509.sql`

The function body contains:

```sql
encode(gen_random_bytes(32), 'hex')
```

The platform-admin invite migrations inspected for this audit do not enable `pgcrypto`.

Later device-pairing migrations do contain `CREATE EXTENSION IF NOT EXISTS pgcrypto;`, but that does not guarantee the extension was available when this RPC was created or that `gen_random_bytes` is resolvable inside a function with:

```sql
SET search_path = public, auth
```

Potential root causes:

1. `pgcrypto` is not enabled in the target Supabase database.
2. `pgcrypto` is installed into a schema such as `extensions`, but the function search path does not include that schema.
3. The target database has a partially applied or older platform-admin invite function body.
4. Duplicate platform-admin invite migrations created inconsistent function bodies across environments.

Future fix recommendation, not implemented here:

- Add a narrowly scoped Supabase migration that enables `pgcrypto` in the target-supported schema.
- Qualify the function call if needed, for example `extensions.gen_random_bytes(32)`, or update the function `search_path` to include the extension schema used by Supabase.
- Recreate `admin_create_platform_admin_invite`, `accept_platform_admin_invite`, and `admin_revoke_platform_admin_invite` with one canonical function body.
- Verify `accept_platform_admin_invite` updates `profiles` by `user_id = auth.uid()`, not `id = auth.uid()`.
- Run a live guardian-invite smoke before publishing the invite UI as ready.

## Preferred Invite Link Behavior

The desired invite recipient behavior should be:

```text
Invite link
-> unauthenticated recipient
-> /auth?signup=true preserving inviteCode or redirect
-> signup / login
-> return to /onboarding?inviteCode=...
-> join MicroDAO
```

Current behavior:

- Community invite URL is built as `/onboarding?inviteCode=...`.
- `MicroDAOOnboarding` redirects unauthenticated users to `/auth?redirect=<current onboarding URL>`.
- `AuthForm` selects signup only when `signup=true` is present.
- `AuthForm` currently redirects authenticated users to `/`, not explicitly to the `redirect` query target.
- Platform admin invite acceptance redirects unauthenticated users to `/auth?redirect=<accept-invite URL>`, not signup-first.

This means invite intent can be preserved in the URL, but the first-user path is not yet explicit, tested, or reliable enough for public use.

## Product And Security Risks

### P0

- Platform guardian invite creation is blocked by missing/incorrect `gen_random_bytes` support.
- A high-privilege invitation flow cannot be considered ready until create, accept, revoke, list, and audit behavior are verified in the live Supabase target.
- Access request approval is not fully RPC-backed and should not be presented as production-ready admin control.

### P1

- Community invite acceptance for unauthenticated users is not signup-first and may not preserve intent after signup/login in a reliable, tested way.
- Some admin and invite failure paths can surface backend messages instead of controlled product copy.
- Role/access-tier controls are present but disabled or partial, which can confuse guardians if not clearly labeled.

### P2

- Email delivery for community invites is not connected.
- Invite analytics, expiration policy, and revocation audit history are limited.
- Billing changes should remain separated from access/invite readiness until the access model is stable.

## Recommended Next Milestone

Next milestone: `fix: repair access invite readiness blockers`

Narrow scope:

1. Repair platform guardian invite RPC readiness:
   - make `gen_random_bytes` available and resolvable;
   - canonicalize platform admin invite functions;
   - verify grants and policies.
2. Make unauthenticated community invite acceptance signup-first:
   - invite link should reach signup if the recipient is new;
   - invite code or redirect must survive signup/login;
   - successful acceptance should return to Dashboard.
3. Keep access request approval blocked or disabled until backed by a secure guardian/admin RPC.
4. Replace raw admin/invite backend errors with controlled user-facing messages.
5. Add live smoke evidence for:
   - member invite;
   - admin invite;
   - guardian invite;
   - pending/rejected/approved user status.

Do not include pricing, billing, device pairing, Edge Client, Local Agent Runtime, Worker Node, or Personal Agent/Citizenship work in that milestone.

## Publish Gate

Do not Lovable Publish or promote the access/invite surface as ready until:

- platform guardian invite creation works in the live target;
- platform guardian invite acceptance works after signup/login;
- member/admin MicroDAO invite links work for new unauthenticated users;
- access request approval is either RPC-backed or visibly setup-blocked;
- raw Supabase/PostgREST errors are not shown in normal user-facing invite flows.

## Final Answer

Can a new user and admin team reliably complete access, invite, and role-management flows today?

No.

The account signup and MicroDAO invite foundations exist, but the full access/invite/admin readiness gate is blocked by platform guardian invite RPC readiness, partial unauthenticated invite handling, and incomplete secure admin mutation paths.
