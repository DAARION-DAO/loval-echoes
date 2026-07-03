# DAARION Edge Backend Health Truth

Date: 2026-07-03

Repository: `DAARION-DAO/loval-echoes`

Branch: `beta/edge-backend-health-truth`

Related audit PR: `https://github.com/DAARION-DAO/loval-echoes/pull/25`

Scope: read-only audit and backend-health truth report. No deploy, Supabase
apply, production database write, backend profile insert, Edge worker mode,
DAARWIZZ routing, node federation, Qdrant write, or runtime service change was
performed.

## 1. Executive Verdict

`loval-echoes` Connect Device is correctly fail-closed.

The current blocker is not the UI. The blocker is the absence of a verified
production DAARION Edge backend base URL that returns HTTP `200` JSON from:

```text
GET <backend_url>/api/v1/edge/health
```

No `device_backend_profiles` production row should be created until that backend
URL is verified.

Current verdict:

```text
EDGE_BACKEND_HEALTH_TRUTH_BLOCKED_BY_NO_VERIFIED_EDGE_BACKEND_URL
```

## 2. Existing Backend Implementation

Result:

```text
production DAARION Edge backend implementation: not found
```

Inspected evidence:

| Location | Finding |
| --- | --- |
| `loval-echoes` | Contains the frontend Connect Device flow, Supabase device pairing tables/RPCs, and install page. It does not contain a deployable service for `GET /api/v1/edge/health`. |
| `loval-echoes/supabase/functions` | Contains application Edge Functions such as auth, chat, RAG, import, push, and validation functions. No function implements `GET /api/v1/edge/health`. |
| `loval-echoes/supabase/migrations/20260620070143_device_pairing_invites_status.sql` | Defines `device_backend_profiles`, pairing invitations, MicroDAO device status, and `record_device_readiness`. This is database contract, not the Edge backend health service. |
| `loval-echoes/src/services/deviceConnection.ts` | Encodes and decodes pairing payloads with `backendUrl`, but does not implement backend health. |
| `research/daarion-edge-client` | Tauri client source at `0.2.2-4`; contains the backend health client and contract docs. It is not the backend server. |
| `microdao-daarion/daarion-edge-client` | Older local Edge Client copy at `0.2.2-3`; does not prove the live health backend exists. |
| DAARION infrastructure workspace | Contains historical DAGI router, gateway, nginx, RBAC, memory/RAG, SOFIIA, and node infrastructure references. Targeted search did not find a `daarion-edge-backend` implementation or `/api/v1/edge/health` route. |
| `daarion-ai-city` | No `GET /api/v1/edge/health` implementation was found in the inspected workspace search. |

Conclusion: there are partial adjacent services and a clear client-side
contract, but no verified production Edge backend service that can currently be
used as `device_backend_profiles.backend_url`.

## 3. Health Endpoint Contract

The canonical client contract is in:

```text
research/daarion-edge-client/docs/planning/BACKEND_HEALTH_CONTRACT.md
research/daarion-edge-client/src-tauri/src/backend_health.rs
```

The Edge Client calls:

```text
GET /api/v1/edge/health
```

against the paired backend base URL.

Required response:

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

Required behavior:

- HTTP `200`;
- JSON body;
- public, read-only, unauthenticated;
- cache-resistant for diagnostics, preferably `Cache-Control: no-store`;
- `schema_version` must be `1`;
- `status` must be one of `ok`, `degraded`, or `maintenance`;
- `service` must be `daarion-edge-backend`;
- `environment` must be one of `production`, `staging`, or `development`;
- `edge_protocol_version` must be compatible with major version `1`;
- `min_edge_client_version` must not exceed the running client version;
- `server_time` must be RFC 3339;
- unknown capability keys are allowed.

Client interpretation from `backend_health.rs`:

| Condition | Edge Client state |
| --- | --- |
| No paired/effective backend | `pairing_required` |
| Timeout or network error | `offline` |
| HTTP `401` or `403` | `contract_invalid` |
| Other non-2xx HTTP | `offline` |
| Invalid JSON or missing required field | `contract_invalid` |
| Unsupported schema/protocol/client version | `version_mismatch` |
| Valid `status: ok` | `online` |
| Valid `status: degraded` | `degraded` |
| Valid `status: maintenance` | `maintenance` |

## 4. Current DNS And Deploy Evidence

Safe public checks were repeated during this audit. No credentials were used.

Observed DNS:

| Host | Evidence |
| --- | --- |
| `api.daarion.city` | A record to `144.76.224.179` |
| `edge.daarion.city` | CNAME to GitHub Pages (`daarion-dao.github.io`) |

| Candidate URL | Result |
| --- | --- |
| `https://api.daarion.city/api/v1/edge/health` | Timed out after 15 seconds. |
| `https://edge.daarion.city/api/v1/edge/health` | HTTP `404` from GitHub Pages. |

Interpretation:

- `api.daarion.city` is not currently proven reachable for the Edge health
  contract. The timeout is consistent with no reachable service, DNS/proxy
  routing gap, firewall gap, or an unavailable upstream.
- `edge.daarion.city` is currently serving a GitHub Pages surface for this path,
  not a backend API route. The host exists, but `/api/v1/edge/health` is not
  deployed there.

Neither candidate is approved as a `backend_url`.

## 5. Required Minimal Backend For Beta

The smallest safe beta backend is a narrow health-contract service first.

Recommended MVP:

- FastAPI or lightweight Node service;
- one public read-only endpoint:

```text
GET /api/v1/edge/health
```

- returns the contract in section 3;
- no authentication requirement for health;
- no worker execution;
- no DAARWIZZ routing;
- no node federation;
- no Qdrant writes;
- no production DB writes from the health endpoint;
- no secrets in response;
- optional later signed readiness callback or RPC wrapper for
  `record_device_readiness`.

No existing required environment-variable set was found for a missing Edge
backend service. If the MVP is created, define typed server-only settings for
environment, backend version, protocol version, minimum supported Edge Client
version, and advertised capabilities. Keep any future Supabase privileged key
server-only and out of public clients, logs, and docs.

Future optional endpoint, after a separate trust/auth design:

```text
POST /api/v1/edge/readiness
```

or a backend-only service wrapper that calls `record_device_readiness` with
service-role credentials. That is explicitly not required for the first health
truth proof.

## 6. Required `device_backend_profiles` Row After Verification

Do not create this row until the backend base URL returns a valid health
contract.

Required row shape:

| Column | Value |
| --- | --- |
| `label` | `DAARION Edge Beta Backend` |
| `environment` | `production` |
| `backend_url` | Verified DAARION Edge backend base URL |
| `is_active` | `true` |

Exact URL to insert:

```text
NONE VERIFIED YET
```

Candidate selection rule:

- if `https://api.daarion.city/api/v1/edge/health` returns valid HTTP `200`
  contract JSON, insert `https://api.daarion.city`;
- if another production hostname returns valid HTTP `200` contract JSON, insert
  that hostname's base URL;
- do not use `https://edge.daarion.city` while it returns GitHub Pages `404` for
  the health path.

## 7. Safe SQL Snippet

Do not apply this SQL during this audit.

Run only after the backend URL passes the health contract:

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

Required precondition:

```bash
curl -fsS https://<VERIFIED_EDGE_BACKEND_BASE_URL>/api/v1/edge/health
```

must return HTTP `200` JSON matching the health contract.

## 8. Edge Client Release Status

Current public install path in `loval-echoes`:

```text
EDGE_CLIENT_RELEASE_TAG = v0.2.2-3
EDGE_CLIENT_VERSION = 0.2.2-3
```

GitHub release evidence:

```text
v0.2.2-3: published prerelease with platform artifacts
v0.2.2-4: release tag not found
```

Local source evidence:

| Source | Version | Finding |
| --- | --- | --- |
| `daarion-edge-client` public/current-line workspace copy | `0.2.2-3` | Older local copy and current public release line. |
| `daarion-edge-client` research workspace copy | `0.2.2-4` | Source contains backend health contract and runtime health diagnostics evidence, but no public release tag was found. |

Decision:

- `v0.2.2-3` can remain evidence for current public installer/download
  availability.
- Real Connect Device beta pairing plus health validation needs either a
  verified local/current `0.2.2-4` build or a released `0.2.2-4` or later
  artifact, because the inspected `0.2.2-4` source contains the explicit
  health-contract implementation and validation docs.
- In both cases, no beta pairing smoke is valid until a live backend URL passes
  `/api/v1/edge/health`.

## 9. Recommended Next PR And Deploy Sequence

Recommended sequence:

1. Merge the docs-only Connect Device beta gate report.
2. Merge this health-truth report.
3. Create an Edge backend MVP PR in the correct backend repository.
4. Implement only `GET /api/v1/edge/health` first.
5. Deploy the backend to the selected production host.
6. Verify:

```bash
curl -fsS https://<candidate-host>/api/v1/edge/health
```

7. Only after verification, insert exactly one active production
   `device_backend_profiles` row.
8. Run a first Connect Device smoke.
9. Decide separately whether to publish `0.2.2-4` Edge Client artifacts before
   broader beta.

Exact next unblock step:

```text
Deploy or expose a minimal DAARION Edge backend that returns HTTP 200 JSON at
/api/v1/edge/health, then verify the chosen production base URL before writing
device_backend_profiles.
```

## 10. Explicit Non-Goals

This audit did not and must not imply:

- worker mode enablement;
- DAARWIZZ routing;
- node federation;
- production DB writes;
- Supabase migration apply;
- service-role readiness callback implementation;
- Qdrant writes or re-embedding;
- fake `device_backend_profiles` row;
- fake pairing success;
- use of `edge.daarion.city` while the health path returns GitHub Pages `404`;
- use of `api.daarion.city` while the health path times out.

## Final Status

```text
Edge backend implementation found: no verified production implementation
Verified backend URL: none
Connect Device backend profile: must remain absent or inactive
Safe next unblock: deploy/verify minimal health endpoint, then insert profile
```
