# Access, Invites, User Management P0 Fix Verification

Date: 2026-06-20

Branch: `codex/stabilize-access-invite-readiness`

Expected PR: `fix: stabilize access and invite readiness`

Final classification: `ACCESS_AND_INVITES_PARTIALLY_READY`

## Scope

This verification records the narrow P0 stabilization work that followed `ACCESS_AND_INVITES_NOT_READY`.

No Supabase migrations, RPC definitions, generated types, pricing, billing implementation, device backend profile activation, Edge Client changes, Local Agent Runtime, Worker Node, Genesis redesign, or Personal Agent/Citizenship work were introduced.

## What Was Stabilized

### 1. Signup-First MicroDAO Invite Links

MicroDAO invite links generated from `src/services/communityMembers.ts` now point to:

```text
/auth?signup=true&redirect=<encoded onboarding invite path>
```

The preserved redirect target is:

```text
/onboarding?inviteCode=<code>
```

This means a shared MicroDAO invite link now opens the Early Access/signup tab first for unauthenticated users while preserving the invite code for the onboarding join step.

### 2. Direct InviteCode Route Redirect

`src/pages/MicroDAOOnboarding.tsx` now treats direct unauthenticated `inviteCode` visits as signup-first:

```text
/onboarding?inviteCode=...
-> /auth?signup=true&redirect=...
```

Non-invite onboarding redirects keep the existing auth redirect behavior.

### 3. Auth Redirect Preservation

`src/components/AuthForm.tsx` now reads a sanitized internal `redirect` query parameter.

Safe redirects:

- must start with `/`;
- must not start with `//`;
- must not point back to `/auth`.

The redirect target is used for:

- existing-session redirect;
- remembered-session auto-login redirect;
- Supabase signup email redirect;
- immediate signup session redirect;
- sign-in redirect.

This keeps invite context after signup/login without introducing an open redirect.

### 4. Participants Invite Copy

`src/pages/Participants.tsx` now states that:

- invite sharing is manual because email delivery is not connected;
- the invite link opens signup for new users;
- the invite link returns users to the preserved `inviteCode` after authentication.

The participants invite/member actions now show controlled fallback copy instead of raw backend errors in normal toast failures.

### 5. Platform Guardian Invite Fail-Closed State

`src/pages/admin/AdminTeam.tsx` now treats platform guardian invite setup failures as a controlled setup-required state.

Failures matching missing function/table/RLS/pgcrypto readiness disable guardian invite creation locally and show:

```text
Guardian invite creation is temporarily unavailable until the database invite RPC and pgcrypto readiness are confirmed.
```

This prevents raw `gen_random_bytes(integer) does not exist` or related Supabase/PostgREST messages from reaching the user.

### 6. Platform Guardian Invite Acceptance Copy

`src/pages/AcceptInvite.tsx` now:

- routes unauthenticated invite recipients through `/auth?signup=true&redirect=...`;
- shows controlled copy if guardian invite acceptance fails due to missing RPC/pgcrypto/RLS readiness;
- avoids exposing raw backend failure text.

### 7. Admin User Management Fail-Closed Copy

`src/pages/admin/AdminUsers.tsx` keeps approval-status changes routed through `admin_set_approval_status`, but failure messages no longer expose raw RPC/Supabase errors.

Role, access-tier, and billing edit controls remain disabled and now explain that secure admin RPC readiness is required.

### 8. Access Request Admin Writes Disabled

`src/pages/admin/AdminAccessRequests.tsx` no longer attempts direct client writes to:

- `access_requests`;
- `profiles.access_tier`.

Pending access-request action buttons are disabled until a secure platform admin RPC exists. The page remains readable and explains that approval writes are blocked by design.

## What Remains Blocked

The system is not fully ready for public access/invite operations yet.

Still blocked:

- real platform guardian invite creation until the `gen_random_bytes` / `pgcrypto` readiness issue is fixed in Supabase;
- live proof that `accept_platform_admin_invite` uses the canonical `profiles.user_id = auth.uid()` function body;
- secure RPC-backed access-request approval and access-tier changes;
- live smoke proof for member invite, admin invite, guardian invite, revoke invite, and admin status updates.

## Manual Verification Checklist

Required before classifying the path as P0 ready:

- Unauthenticated MicroDAO invite link opens `/auth?signup=true`.
- Invite redirect preserves `/onboarding?inviteCode=...`.
- Signup or login returns to the onboarding invite context.
- Registered user can join a MicroDAO through the preserved invite code.
- Participants page shows manual sharing copy.
- Guardian invite setup failure does not expose raw `gen_random_bytes` or Supabase/PostgREST errors.
- Access request approval controls are disabled until secure RPC work is implemented.
- Role/access/billing controls remain disabled or fail closed.

## Final Answer

Can the base access/invite path be considered more coherent and safer after this PR?

Yes, partially.

The P0 user-facing readiness issues are stabilized: invite links are signup-first, invite context is preserved, guardian invite failures fail closed, raw backend error exposure is reduced, and direct access-request writes are disabled.

However, full access/invite readiness still depends on a future Supabase/RPC milestone for guardian invite generation and secure access-request approval.
