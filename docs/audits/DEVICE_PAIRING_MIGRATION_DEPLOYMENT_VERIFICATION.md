# Device Pairing Migration Deployment Verification

Date: 2026-06-20

Repository: `DAARION-DAO/loval-echoes`

Scope: docs-only deployment verification. No code changes, admin UI, Edge Client changes, backend profile creation, or pairing smoke execution are included.

## Final Status

```text
Migration Applied: YES
Active Backend Profile: NO
Ready For Pairing Smoke Test: NO
System State: BLOCKED AS EXPECTED
```

## Context

PR #16 introduced the backend-backed device pairing and Dashboard status bridge:

```text
Dashboard
-> Connect Device
-> create device pairing invitation
-> /install?deviceInvite=...
-> Edge-compatible pairing code
-> Dashboard device status
```

The migration has now been applied through the Lovable/Supabase-managed flow. The system is intentionally left blocked until the production DAARION Edge backend URL is finalized and exactly one active backend profile exists.

## Migration Evidence

Original PR #16 migration file:

```text
supabase/migrations/20260620070143_device_pairing_invites_status.sql
```

Lovable-applied/generated migration now present on `main`:

```text
supabase/migrations/20260620073053_d1664383-57a1-4a83-9c62-27e192fc6fc5.sql
```

Supabase generated types were also updated:

```text
src/integrations/supabase/types.ts
```

The generated types include the new device pairing tables and RPCs, which confirms that the Lovable/Supabase schema reflection step has run.

## Created Tables

The migration creates:

- `device_backend_profiles`
- `device_pairing_invitations`
- `microdao_device_statuses`

## Created Or Verified Database Controls

The migration includes:

- indexes for lookup and expiry paths;
- a partial unique index enforcing only one active backend profile:
  `idx_device_backend_profiles_one_active`;
- `updated_at` triggers for the new tables;
- RLS enabled on all new public tables;
- SELECT policy for members/admins reading own device pairing invitations;
- SELECT policy for members/admins reading own device status.

## RPCs

The migration creates or verifies:

- `create_device_pairing_invitation(uuid,text,text)`
- `get_device_connection_status(uuid,text)`
- `record_device_readiness(uuid,text,text,text,text,text,text,jsonb)`
- `encode_device_pairing_payload(jsonb)`

## Grants

Authenticated users can call:

- `get_device_connection_status(uuid,text)`
- `create_device_pairing_invitation(uuid,text,text)`

`service_role` can call:

- `record_device_readiness(uuid,text,text,text,text,text,text,jsonb)`
- `encode_device_pairing_payload(jsonb)`

The device readiness writer remains service-role scoped. Normal users cannot directly mark a device ready.

## Active Backend Profile

```text
Active Backend Profile: NO
```

Reason:

```text
Production DAARION Edge backend URL is not finalized yet.
device_backend_profiles intentionally remains empty.
```

This is the correct state. Adding an admin UI for the backend URL now would increase the risk of accidentally activating the wrong endpoint in production.

## Expected Fail-Closed Behavior

Until an active backend profile exists:

- `create_device_pairing_invitation` returns a blocked response with `next_action = wait_for_backend_profile`;
- `get_device_connection_status` returns `backend_profile_configured: false` and `no_device`;
- the Dashboard Connect Device card shows a setup-required state;
- invite creation stays disabled;
- no `/install?deviceInvite=...` live pairing code is issued;
- raw Supabase/PostgREST errors should not appear to the user.

This means the product path is blocked honestly instead of creating fake pairing success.

## Smoke-Test Status

```text
Ready For Pairing Smoke Test: NO
```

Blocked until:

```text
exactly one active production device_backend_profiles row exists
```

The next full smoke should not run until the production DAARION Edge backend URL is known and the row is configured through a controlled admin/manual SQL procedure.

## Rollback Concerns

If the current state needs to remain non-operational, keep `device_backend_profiles` empty or keep all rows inactive. That preserves the controlled blocked state.

If a backend profile is later created incorrectly:

- deactivate the row or delete it through the controlled database admin path;
- confirm the partial unique index still prevents multiple active profiles;
- verify Dashboard returns to setup-required state;
- do not expose a public admin UI for this until a separate protected internal admin procedure exists.

If UI behavior regresses after publish:

- revert the Lovable publish or revert the PR #16 merge commit from `main`;
- do not create a backend profile as a workaround for a UI issue.

## Next Allowed Milestone

Allowed next milestone:

```text
fix: improve Connect Device setup-required state
```

Only if the current blocked state needs clearer user-facing copy or visual treatment.

Blocked milestones:

- full pairing smoke;
- backend-backed live pairing;
- Edge Client changes;
- Local Agent Runtime;
- Worker Node;
- admin UI for backend profile editing.

The full pairing smoke is allowed only after one active production `device_backend_profiles` row exists.
