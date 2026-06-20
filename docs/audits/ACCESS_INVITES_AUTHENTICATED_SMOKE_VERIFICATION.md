# Access Invites Authenticated Smoke Verification

Date/time: 2026-06-20 11:01 UTC

Live URL: `https://1.daarion.city`

Deployed commit: `1a1580620b924ae8283d230ba73d772ea7feef14`

Live bundle:

- `assets/index-nteW3W14.js`
- `assets/index-BLcAqnwm.css`

Current classification before this report: `ACCESS_AND_INVITES_PARTIALLY_READY`

Final classification after this report: `ACCESS_AND_INVITES_PARTIALLY_READY`

## Scope

This report records the authenticated smoke-test boundary for access and invite readiness.

No product code, Supabase migrations, RPCs, pricing, billing, Edge Client, device backend profiles, Local Agent Runtime, Worker Node, or Personal Agent/Citizenship work was changed.

## Accounts And Test Data

No live credentials were available to Codex in this environment.

Accounts used:

| Role | Used | Notes |
| --- | --- | --- |
| MicroDAO owner/admin | No | Required for the full authenticated invite smoke. |
| Invite recipient | No | Required to prove signup/signin through a real invite. |
| Guardian/platform admin | No | Required to prove Guardian Console behavior through authenticated UI actions. |

Invite code type used:

| Type | Used | Notes |
| --- | --- | --- |
| Synthetic route probe | Yes | `CODEXSMOKE` was used only to verify unauthenticated redirect and inviteCode preservation. It was not a valid invite and was not accepted. |
| Real member invite | No | Required for P0-ready classification. |
| Real admin invite | No | Required for P0-ready classification where admin invite is in scope. |

## Public And Static Smoke Already Verified

The deployed site serves the expected post-PR #22 bundle:

```text
assets/index-nteW3W14.js
assets/index-BLcAqnwm.css
data-commit-sha="1a1580620b924ae8283d230ba73d772ea7feef14"
```

Unauthenticated route probe:

```text
/onboarding?inviteCode=CODEXSMOKE
-> /auth?signup=true&redirect=%2Fonboarding%3FinviteCode%3DCODEXSMOKE
```

Observed public/signup behavior:

- `Early Access` tab is active.
- Signup fields are visible.
- Free account copy is visible.
- The redirect preserves the original onboarding inviteCode path.

Deployed chunk inspection also confirms:

- Participants invite links are generated as signup-first links.
- Participants copy explains manual sharing and signup-first behavior.
- Guardian invite setup failures map to controlled setup-required copy.
- Admin role/access/billing controls include secure-admin-RPC disabled-state copy.
- Personal Agent / Citizenship / `personal_citizen` / `DAARION City Citizens` UI markers were not introduced.
- Connect Device setup-required copy remains present.

These checks support `ACCESS_AND_INVITES_PARTIALLY_READY`, but they do not prove a real authenticated invite acceptance.

## Manual Smoke Results

| Area | Expected | Result | Notes |
| --- | --- | --- | --- |
| MicroDAO owner/admin session | Owner/admin can open Participants and generate or view member/admin invites. | NOT RUN | Requires a real MicroDAO owner/admin session. |
| Participants invite UI | Manual sharing copy is clear, signup-first behavior is explained, and no raw backend errors appear. | PARTIAL | Verified by deployed chunk/static copy only. Authenticated UI click-through was not run. |
| Unauthenticated invite recipient | Invite link routes to `/auth?signup=true` and preserves inviteCode in safe redirect. | PASS | Verified with synthetic `CODEXSMOKE` route probe. |
| Registered invite recipient | Signup/signin returns to the preserved onboarding invite context. | NOT RUN | Requires a real invite recipient signup/signin session. |
| Membership result | Recipient becomes approved member/admin, reaches pending state, or receives clear failure copy. | NOT RUN | Requires a real valid invite code and authenticated recipient. |
| Guardian invite fail-closed | Missing RPC/pgcrypto readiness is hidden or fail-closed with safe copy. | NOT RUN | Deployed chunk contains fail-closed mapping, but a Guardian account was not available for live action testing. |
| Admin user controls | Missing secure RPC actions are disabled or clearly unavailable with no fake success. | NOT RUN | Deployed chunks contain disabled-state copy, but a Guardian account was not available for live UI testing. |

## Required Report Fields

| Field | Result |
| --- | --- |
| Raw backend errors visible | NO in tested public/signup-first paths; NOT RUN for authenticated owner/admin/guardian actions. |
| InviteCode preserved | YES for unauthenticated route redirect. |
| Membership outcome | NOT RUN |
| Guardian smoke | NOT RUN |
| Admin controls smoke | NOT RUN |

## P0 Readiness Decision

The status must remain:

```text
ACCESS_AND_INVITES_PARTIALLY_READY
```

Reason:

The public/static smoke passed, but the complete authenticated path was not verified with:

- a real MicroDAO owner/admin account;
- a real valid invite code;
- a real recipient signup/signin flow;
- a real authenticated MicroDAO membership result;
- a real guardian/admin account for high-privilege fail-closed checks.

## Promotion Criteria

The status can move to `ACCESS_AND_INVITES_P0_READY` only after a manual live run proves:

1. A real owner/admin can generate or view a member invite link.
2. A fresh unauthenticated recipient opens that link and lands on signup-first auth.
3. Signup/signin preserves the invite context.
4. The recipient reaches the correct MicroDAO membership state:
   - `APPROVED`, or
   - a clear `PENDING` / request state with no raw backend errors.
5. Guardian invite and admin user controls fail closed or remain disabled with safe copy.
6. No raw `gen_random_bytes`, Supabase, or PostgREST errors are visible.

## Manual Runbook

Use role-described test accounts only. Do not record credentials in this repository.

1. Sign in as a MicroDAO owner/admin.
2. Open `https://1.daarion.city/participants`.
3. Generate or copy a member invite link.
4. Open the invite link in a fresh browser or incognito session.
5. Confirm the recipient lands on `/auth?signup=true` with the onboarding redirect preserved.
6. Complete signup or sign in as the recipient.
7. Confirm the recipient returns to the MicroDAO invite/onboarding context.
8. Record the membership result as `APPROVED`, `PENDING`, or `FAILED`.
9. If a guardian account is available, open the Guardian Console team/users/access surfaces and verify setup-required/disabled states without raw backend errors.

## Blocked Directions

Until this authenticated smoke is complete, keep these directions blocked:

- pricing/billing implementation;
- device backend profile activation;
- Edge Client pairing;
- Local Agent Runtime;
- Worker Node;
- Personal Agent / Citizenship.
