# MicroDAO Connect Device Beta Gate

Date: 2026-07-03

Repository: `DAARION-DAO/loval-echoes`

Branch: `beta/connect-device-gate-audit`

Scope: audit and beta-gate report only. No Supabase deploy, key rotation,
remote migration, production database write, DAARWIZZ routing, Edge worker mode,
node federation, or new MicroDAO feature work was performed.

## Final Classification

```text
CONNECT_DEVICE_BETA_GATE_BLOCKED_BY_BACKEND_PROFILE_AND_EDGE_RELEASE
```

The web app is in a safe fail-closed state for Connect Device. It can show the
MicroDAO-scoped Connect Device entry point, read backend status through RPC, and
generate an Edge-compatible pairing code after backend configuration exists.

It is not ready for a real beta pairing smoke until:

1. exactly one active production `device_backend_profiles` row exists;
2. that row points to a verified DAARION Edge backend base URL;
3. the backend answers `GET /api/v1/edge/health` with the Edge health contract;
4. the operator decides whether beta testers should use the currently published
   `v0.2.2-3` Edge artifacts or wait for a foundation-aligned `0.2.2-4` release.

## Repository And Security Status

Verified local repo state:

```text
loval-echoes branch before audit: main
loval-echoes current branch: beta/connect-device-gate-audit
origin/main contains PR #24 merge commit: cbaae991656aff0a2970a2901451e7453fdd89f8
.env tracked in git: no
```

Local `supabase/config.toml` has `verify_jwt = true` for:

- `auth-security`
- `login-fix`
- `auto-register`
- `embed-document`
- `rag-search`
- `ai-agent-chat`

Public unauthenticated function checks against
`https://hjquragwfmcrljanmhtt.supabase.co/functions/v1/*` returned:

| Function | Result |
| --- | --- |
| `ai-agent-chat` | `401 UNAUTHORIZED_NO_AUTH_HEADER` |
| `rag-search` | `401 UNAUTHORIZED_NO_AUTH_HEADER` |
| `embed-document` | `401 UNAUTHORIZED_NO_AUTH_HEADER` |
| `auto-register` | `401 UNAUTHORIZED_NO_AUTH_HEADER` |
| `auth-security` | `401 UNAUTHORIZED_NO_AUTH_HEADER` |
| `login-fix` | `401 UNAUTHORIZED_NO_AUTH_HEADER` |

This proves the public no-JWT path is blocked. It does not prove the legacy
`410` body because the gateway rejects requests before the function runs unless a
valid JWT is present.

## Production Public Smoke

Safe public checks only were run. No credentialed login was attempted.

| Target | Result |
| --- | --- |
| `https://1.daarion.city/?codex-cache-bust=connect-device-beta-gate-20260703` | `200`, `text/html`, served app shell |
| `https://microdao.lovable.app/?codex-cache-bust=connect-device-beta-gate-20260703` | `200`, effective URL `https://1.daarion.city/`, served app shell |
| `https://1.daarion.city/install?codex-cache-bust=connect-device-beta-gate-20260703` | `200`, served app shell |
| Live main bundle | `assets/index-0PrRdPZ7.js` |
| Live install chunk | `assets/Install-BeC0NuYO.js` |

The live install chunk still contains:

```text
EDGE_CLIENT_RELEASE_TAG = v0.2.2-3
EDGE_CLIENT_VERSION = 0.2.2-3
```

## Connect Device Current Flow Map

Source evidence:

- `src/components/device/DeviceConnectionCard.tsx`
- `src/services/deviceConnection.ts`
- `src/pages/Install.tsx`
- `supabase/migrations/20260620073053_d1664383-57a1-4a83-9c62-27e192fc6fc5.sql`

Current source-level flow:

```text
Authenticated user with approved MicroDAO membership
-> Dashboard renders DeviceConnectionCard
-> get_device_connection_status(p_community_id, 'standard_device')
-> if backend_profile_configured = false, card shows setup-required/fail-closed state
-> if backend profile exists, user can request create_device_pairing_invitation(...)
-> RPC creates pending device_pairing_invitations row
-> RPC creates or updates microdao_device_statuses as invite_created
-> returns pairing_code
-> web app opens /install?deviceInvite=<daarion-pair:base64url-json>
-> install page decodes and shows the code for DAARION Edge
-> Edge Client user pastes code into PairingGate
```

What already works in source:

- MicroDAO membership is required by both status and invitation RPCs.
- Community invite and device pairing invite are separate concepts.
- Pairing codes are short-lived and MicroDAO-scoped.
- Normal users can call `get_device_connection_status` and
  `create_device_pairing_invitation`.
- Normal users cannot call `record_device_readiness`; that RPC is service-role
  scoped.
- The UI disables invite creation while the backend profile is not configured.

## Why It Is Fail-Closed

The fail-closed gate is intentional and source-backed.

`create_device_pairing_invitation` selects one active row from
`device_backend_profiles`:

```sql
SELECT * INTO v_profile
FROM public.device_backend_profiles
WHERE is_active = true
ORDER BY CASE environment
  WHEN 'production' THEN 0
  WHEN 'staging' THEN 1
  ELSE 2
END, created_at DESC
LIMIT 1;
```

If no active profile exists, it returns:

```text
ok = false
dashboard_state = blocked
pairing_status = not_paired
next_action = wait_for_backend_profile
backend_profile_configured = false
message = Device connection is not configured yet. Try again later.
```

`DeviceConnectionCard` treats `backend_profile_configured === false` or
`next_action === wait_for_backend_profile` as setup-required, then disables the
primary invite action. This prevents fake pairing success.

## Required Production Row Shape

Table:

```text
public.device_backend_profiles
```

Required active production row:

| Column | Required value |
| --- | --- |
| `label` | User-safe backend label, for example `DAARION Edge Beta Backend` |
| `environment` | `production` |
| `backend_url` | The verified DAARION Edge backend base URL |
| `is_active` | `true` |

Defaults:

- `id` defaults to `gen_random_uuid()`.
- `created_at` and `updated_at` default to `now()`.

Database constraints:

- `backend_url` must match `^https?://[^[:space:]]+$`.
- production rows must use `https://`.
- only one row can be active because of
  `idx_device_backend_profiles_one_active`.

## Required Edge Backend URL

The `backend_url` must be the base URL of a real DAARION Edge backend. Edge will
call:

```text
GET <backend_url>/api/v1/edge/health
```

That endpoint must be public, read-only, unauthenticated, and return HTTP `200`
JSON matching:

```json
{
  "schema_version": 1,
  "status": "ok",
  "service": "daarion-edge-backend",
  "environment": "production",
  "backend_version": "0.1.0",
  "edge_protocol_version": "1.0.0",
  "min_edge_client_version": "0.2.2-3",
  "server_time": "2026-07-03T00:00:00Z",
  "capabilities": {
    "genesis": true,
    "registry": true,
    "model_registry": true,
    "voice_ceremony": false,
    "worker_relay": false
  }
}
```

Public candidate checks did not validate a backend URL:

| Candidate | Result |
| --- | --- |
| `https://api.daarion.city/api/v1/edge/health` | timeout after 15 seconds |
| `https://edge.daarion.city/api/v1/edge/health` | `404` GitHub Pages response |

Therefore no production `backend_url` is approved by this audit.

## Safe SQL Snippet

Do not run this until the backend URL passes the health contract above.

```sql
begin;

-- Preserve the single-active-profile invariant explicitly.
update public.device_backend_profiles
set is_active = false,
    updated_at = now()
where is_active = true;

insert into public.device_backend_profiles (
  label,
  environment,
  backend_url,
  is_active
)
values (
  'DAARION Edge Beta Backend',
  'production',
  'https://<VERIFIED_EDGE_BACKEND_BASE_URL>',
  true
)
on conflict (backend_url) do update
set label = excluded.label,
    environment = excluded.environment,
    is_active = excluded.is_active,
    updated_at = now();

commit;
```

Equivalent Lovable task text:

```text
Insert exactly one active production row into public.device_backend_profiles
after verifying that the backend base URL responds to
GET /api/v1/edge/health with the DAARION Edge health contract.

Use:
- label: DAARION Edge Beta Backend
- environment: production
- backend_url: https://<verified Edge backend base URL>
- is_active: true

Do not create multiple active rows. Do not use edge.daarion.city unless that
host serves the required backend health endpoint.
```

## Loval To Edge Client Compatibility

Secondary repo inspected read-only:

```text
repository: DAARION-DAO/daarion-edge-client
origin: https://github.com/DAARION-DAO/daarion-edge-client.git
inspected branch: codex/cross-platform-installer-readiness
origin/main: cef52ba393847dde3e369eeb11e756d3e147e055
```

Compatibility findings:

- Loval emits `daarion-pair:<base64url-json>`.
- Edge parser accepts the `daarion-pair:` prefix.
- Edge parser accepts `backendUrl`, `backend_url`, or `backend`.
- Edge parser accepts `label`, `organization`, or `profile`.
- Edge parser accepts `environment` or `env`.
- Edge normalizes the backend URL and stores it in `pairing.json`.
- Edge then resolves health through `GET /api/v1/edge/health`.

Conclusion:

```text
Loval pairing payload shape is compatible with current Edge parser source.
```

The compatibility gap is not payload syntax. The gap is the absence of a
verified live backend URL and a current public Edge release that contains the
pairing/health foundation.

## Edge Release And Install Link Status

Current Loval install page points to GitHub release:

```text
v0.2.2-3
```

GitHub release evidence:

- `v0.2.2-3` exists.
- It is a prerelease.
- Expected artifacts are uploaded.

Current Edge source evidence:

- `daarion-edge-client/package.json` version is `0.2.2-4`.
- `daarion-edge-client/src-tauri/tauri.conf.json` version is `0.2.2-4`.
- `v0.2.2-3` is an ancestor of `origin/main`.
- `origin/main` is 27 commits ahead of `v0.2.2-3`.
- Edge docs state that `v0.2.2-3` predates the current pairing and health
  foundation.

Verdict:

```text
Install links are current relative to the latest published GitHub release, but
stale relative to current Edge source and the Connect Device beta goal.
```

No install-link code fix was made because no `0.2.2-4` release exists yet.

## Manual Browser Smoke Checklist

Run after the backend profile row exists and the web app is republished if
needed.

### App/Auth Smoke

1. Open `https://1.daarion.city`.
2. Confirm the app loads without console runtime errors.
3. Log in with an approved beta account.
4. Refresh the page and confirm the session persists.
5. Open or create a chat.
6. Send one message.
7. Confirm authenticated `ai-agent-chat` succeeds.
8. In a separate unauthenticated/incognito context, confirm chat/RAG/embed
   functions remain blocked without JWT.

### Connect Device Smoke

1. Log in with an account that has approved MicroDAO membership.
2. Open Dashboard.
3. Confirm the Connect Device card is visible.
4. Confirm backend status no longer says setup required.
5. Click Connect/Prepare Device.
6. Confirm a `daarion-pair:` code is created.
7. Confirm navigation to `/install?deviceInvite=...`.
8. Confirm the install page shows the MicroDAO context and the device connection
   code.
9. Open DAARION Edge current beta build.
10. Paste the pairing code into `Enter invitation code`.
11. Confirm Edge stores paired state with:
    - `source = invite_payload`
    - expected backend URL
    - expected label
    - `environment = production`
12. Run Edge health check.
13. Confirm state is `online`, `degraded`, or `maintenance`.
14. Confirm bad or missing backend produces `offline`, `contract_invalid`,
    `version_mismatch`, or `pairing_required` as appropriate.
15. Confirm Dashboard status updates only through the approved service-role
    readiness writer path, not from arbitrary user writes.

## Is The Button Ready For Beta Smoke?

```text
Safe to expose as fail-closed: yes.
Ready for real pairing beta-smoke: no.
```

Reason:

- The Loval UI/RPC shape is ready for the backend-profile gate.
- The current production data/config is missing the active backend profile row.
- The tested candidate backend URLs do not satisfy the Edge health contract.
- The public native installer links still point to `v0.2.2-3`, which is stale
  relative to current Edge pairing/health source.

## Follow-Up Needed Before Beta

Recommended next task:

```text
beta: verify and configure DAARION Edge backend profile
```

Acceptance criteria:

1. Choose the real Edge backend base URL.
2. Prove `GET <backend_url>/api/v1/edge/health` returns the contract.
3. Insert exactly one active production `device_backend_profiles` row through
   an approved manual/Lovable/Supabase admin path.
4. Publish or explicitly approve which Edge Client build beta testers should
   use.
5. Run the manual browser + Edge pairing smoke above.

Separate Edge release task:

```text
release: publish foundation-aligned Edge Client 0.2.2-4 beta artifacts
```

Do this before claiming native installer readiness for Connect Device beta.

## Explicit Non-Goals

- No DAARWIZZ routing.
- No worker mode.
- No node federation.
- No production database writes by Codex.
- No Supabase function deploy.
- No key rotation.
- No remote migration apply.
- No auth architecture change.
- No `push-send` changes.
