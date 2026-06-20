# Authenticated Connect Device Flow Verification

Status: product validation report

Date: 2026-06-20

Repository: `loval-echoes`

Scope: validation only. No runtime code, backend implementation, Edge Client
changes, Local Agent Runtime work, or Worker Node work are included.

## Final Classification

```text
CONNECT_DEVICE_FLOW_PARTIALLY_VERIFIED
```

## Answer

Can an authenticated MicroDAO member reach a clear next step after clicking
Connect Device?

```text
NO
```

The Dashboard-to-install handoff is present in source and deployed bundle
evidence, and it carries MicroDAO context through `deviceIntent`. However, this
Codex run did not have a confirmed real authenticated MicroDAO browser session,
so the live Dashboard click-through was not user-click verified.

More importantly, the current handoff still stops before a real device pairing
path. The install page correctly explains that the handoff is not a live device
connection code yet. A user can understand that the product is preparing a
device connection, but cannot complete backend-backed pairing or see
authoritative device status today.

## References Checked

- `docs/product/CONNECT_DEVICE_CONTRACT.md`
- `docs/product/DASHBOARD_ENTRY_REQUIREMENTS.md`
- `docs/product/LIVE_CONNECT_DEVICE_BRIDGE_VERIFICATION.md`
- `src/components/device/DeviceConnectionCard.tsx`
- `src/services/deviceConnection.ts`
- `src/pages/NewIndex.tsx`
- `src/pages/Install.tsx`

## Live Deployment Evidence

Live site checked:

```text
https://1.daarion.city/?codex-cache-bust=connect-device-flow-verify
```

Observed live bundle:

```text
assets/index-B9C_9WVc.js
```

Bundle checks:

| Check | Result |
| --- | --- |
| Root page returns 200 | Pass |
| Main bundle contains `deviceIntent` | Pass |
| Main bundle contains Connect Device wording | Pass |
| Main bundle references install chunk | Pass |
| Install chunk is `Install-Bf5kh3Ln.js` | Pass |
| Install chunk contains `deviceIntent` handling | Pass |
| Install chunk contains MicroDAO context copy | Pass |
| Install chunk contains pending live-connection warning | Pass |

## Source-Level Flow Evidence

### Dashboard entry point

`src/pages/NewIndex.tsx` renders `DeviceConnectionCard` when an active
MicroDAO exists:

```text
activeCommunityId -> DeviceConnectionCard
```

The card receives:

- authenticated user id;
- active MicroDAO id;
- active MicroDAO name;
- membership role;
- navigation handler for the generated install path.

### Device intent generation

`src/services/deviceConnection.ts` builds a local, display-safe
`daarion.device_connection_intent` payload and creates:

```text
/install?deviceIntent=...
```

The intent status is:

```text
requires_backend_pairing_contract
```

This confirms the current implementation is intentionally not an authoritative
backend pairing invite.

### Install page handoff

`src/pages/Install.tsx` reads:

```text
deviceIntent
```

from the query string, decodes the payload, and shows a MicroDAO context banner
with device setup language.

The install page also contains explicit pending-contract copy, including:

```text
This is not a live device connection code yet.
```

## Product Contract Validation

| Contract requirement | Current state | Result |
| --- | --- | --- |
| Dashboard access does not require device readiness | Defined and preserved | Pass |
| Dashboard exposes Connect Device when active MicroDAO exists | Present in source | Source-verified |
| Connect Device carries MicroDAO context to install page | Present in source and deployed bundle | Bundle-verified |
| Community invite is not reused as device invite | Current handoff uses separate `deviceIntent` | Pass |
| Real device pairing invitation exists | Not implemented | Gap |
| Real Dashboard device status exists | Not implemented | Gap |
| Authenticated browser click-through was exercised | Not completed in this run | Gap |

## Current User Journey

Verified evidence supports this partial flow:

```text
Authenticated Dashboard with active MicroDAO
-> Connect Device card
-> Prepare device CTA
-> /install?deviceIntent=...
-> MicroDAO context banner
```

The verified flow stops here:

```text
No live device pairing invite
No backend-backed device status
No authoritative paired device record
No completed Genesis-to-Dashboard readiness loop
```

## Pairing Path Visibility

The user can see that device setup is connected to the active MicroDAO context.
That is useful and directionally correct.

The user cannot yet complete device pairing from this path. The current install
page explicitly labels the handoff as not being a live device connection code.
This avoids false claims, but it also means the product journey still reaches a
dead end before real pairing.

## Highest-Value Blocker

```text
No backend-backed MicroDAO device pairing/status bridge.
```

This single blocker covers the missing authoritative device invite, backend
device record, and Dashboard-readable device status needed to turn the current
display-safe handoff into a real product flow.

## Recommendation

Do not start Local Agent Runtime or Worker Node work yet.

The next implementation milestone should be narrowly scoped to:

```text
product: backend-backed device pairing invitation and status
```

Minimum outcome:

```text
Dashboard
-> Connect Device
-> real MicroDAO-scoped device pairing invite
-> Edge consumes invite
-> backend records device status
-> Dashboard shows current device state
```

## Validation Commands

Commands run during this verification:

```bash
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
rg -n "DeviceConnectionCard|prepareDeviceConnection|deviceIntent|CONNECT_DEVICE_FLOW|LIVE_CONNECT_DEVICE_BRIDGE|DASHBOARD_ENTRY|CONNECT_DEVICE_CONTRACT" src docs/product docs/audits --glob '!node_modules'
node - <<'NODE'
// Live bundle and install chunk checks for deviceIntent and MicroDAO context.
NODE
```

Additional validation after writing this report:

```text
npm run build
git diff --check
credential-pattern scan over docs/audits/AUTHENTICATED_CONNECT_DEVICE_FLOW_VERIFICATION.md
```
