# DAARION Connect Device Contract

Status: product architecture contract

Date: 2026-06-19

Owner repo for product journey: `loval-echoes`

Related runtime repo: `daarion-edge-client`

Scope: docs-only. No runtime code, onboarding implementation, backend
implementation, Edge Client changes, Local Agent Runtime work, or Worker Node
work is included in this milestone.

## Final Classification

```text
CONTRACT DEFINED
```

The product contract is defined for the next implementation milestone. The
contract is not implemented yet. The full onboarding journey remains blocked
until a backend-backed device pairing invite and Dashboard device status path
exist.

## Purpose

The previous end-to-end onboarding audit found that a user can create or join a
MicroDAO and reach the MicroDAO Dashboard, but cannot continue as one coherent
product journey into device connection, Edge pairing, health, Genesis, and
Dashboard readiness.

This document defines the missing product contract:

```text
How does a MicroDAO member connect a device and become a valid Dashboard user?
```

## Product Boundary

Normal users should think:

```text
Create or join MicroDAO
-> Connect device
-> Device ready
-> Continue in Dashboard
```

They should not need to understand:

- Edge runtime;
- backend URLs;
- registry internals;
- localhost;
- environment variables;
- repository boundaries;
- pairing internals.

## Verified Current State

### `loval-echoes`

- `src/pages/MicroDAOOnboarding.tsx` creates MicroDAOs through
  `create_microdao_with_spirit_agent`.
- `src/pages/MicroDAOOnboarding.tsx` joins MicroDAOs through
  `join_community_by_code`.
- `src/services/communityMembers.ts` builds community invite links as
  `/onboarding?inviteCode=...`.
- `src/integrations/supabase/types.ts` defines `communities`,
  `community_members`, and `invitation_codes`.
- `src/pages/NewIndex.tsx` renders the MicroDAO Dashboard, but does not yet
  expose a stateful device readiness card or MicroDAO-bound Connect Device
  action.

### `daarion-edge-client`

- `src/components/PairingGate.tsx` accepts an invitation code or link and calls
  the Tauri `pair_backend` command.
- `src-tauri/src/pairing.rs` persists `pairing.json` and accepts locally
  parseable pairing payloads with backend URL, label, and environment.
- `src-tauri/src/backend_health.rs` resolves health through the paired backend
  and returns `pairing_required`, `offline`, `contract_invalid`,
  `version_mismatch`, `online`, `degraded`, or `maintenance`.
- `src/components/GenesisWizard.tsx` blocks Genesis when pairing is missing.
- `src-tauri/src/provisioning.rs` uses the pairing-aware backend resolver for
  Genesis provisioning calls.

## Core Distinction

Community invitation and device pairing are different contracts.

| Contract | Current owner | Purpose | Current status |
| --- | --- | --- | --- |
| Community invite | `loval-echoes` | Lets a person join a MicroDAO | Implemented |
| Device pairing invite | Not implemented | Lets an approved MicroDAO member connect a device/runtime | Missing |
| Edge PairingState | `daarion-edge-client` | Stores the paired backend profile on the device | Implemented |
| Backend health | `daarion-edge-client` plus backend contract | Confirms paired backend reachability and compatibility | Implemented in Edge, backend contract documented |
| Genesis provisioning | `daarion-edge-client` plus backend | Registers/provisions the local device/runtime | Implemented in Edge, full product journey not validated |
| Dashboard device status | `loval-echoes` plus backend | Shows device readiness to the user in MicroDAO context | Missing |

A MicroDAO community invite must not be accepted as an Edge device pairing
invite. Reusing one code for both meanings would create user confusion and
unsafe authorization boundaries.

## Entities

### User

The human using DAARION. A user can create or join one or more MicroDAOs.

Product identity currently flows through Supabase Auth and `profiles`.

### Account

The authenticated web account in `loval-echoes`. It owns the browser session
and product-level access checks.

The account is not the same as a local Edge runtime identity.

### MicroDAO

The product workspace represented by `communities`. A MicroDAO owns members,
roles, invitations, and the Dashboard context.

### Membership

The relationship between a user and a MicroDAO, represented by
`community_members`. For device connection, the membership must be approved or
otherwise explicitly allowed by product policy.

### Device

A user-controlled computer or mobile device that can be prepared for DAARION
capabilities. In this contract, "device" means the Edge-capable runtime
instance, not browser notification `device_id` values already used by push or
refresh-token tables.

### Edge Client

The native/device runtime that owns local identity, local key storage, pairing,
health diagnostics, capability checks, Genesis, and future local runtime
features.

### Device Pairing Invitation

A short-lived, single-purpose payload generated from an authenticated MicroDAO
context. It authorizes one device to pair with the backend profile associated
with that MicroDAO membership.

This is the missing product bridge.

### Pairing

The act of consuming a valid device pairing invitation in the Edge runtime and
storing a paired backend profile in Edge PairingState.

### Genesis

The Edge runtime provisioning step after pairing and health compatibility are
available. Genesis must not be the first user-facing mental model in the
normal product path.

### Dashboard

The MicroDAO product workspace. The Dashboard remains accessible after
MicroDAO creation/join, even if no device is connected. Device-powered
capabilities are gated by device readiness state.

## Ownership Relationships

| Relationship | Rule |
| --- | --- |
| User -> Account | One authenticated user operates through a product account. |
| Account -> MicroDAO | The account can create or join MicroDAOs. |
| User -> Membership | A user must have an allowed membership before creating a device pairing invite. |
| MicroDAO -> Device invitation | The MicroDAO context creates or authorizes the device pairing invitation. |
| Device invitation -> Edge Client | The invitation is consumed by the Edge runtime, not by the normal MicroDAO join flow. |
| Edge Client -> PairingState | The Edge runtime owns local PairingState persistence. |
| Edge Client -> Local identity | The Edge runtime owns local identity and signing boundaries. |
| Backend -> Device record | The backend owns the authoritative association between account, MicroDAO, device, and readiness status. |
| Dashboard -> Device status | The Dashboard reads device readiness from backend state and presents non-technical status. |

## Lifecycle

### 1. Create account

The user creates or signs into an account through `loval-echoes`.

Required state:

- authenticated session;
- profile available or safely creatable;
- access policy resolved.

### 2. Join or create MicroDAO

The user creates a MicroDAO or joins one through a community invite.

Required state:

- `communities` row exists;
- `community_members` row exists;
- membership status permits Dashboard access;
- active community is selected.

### 3. Start Connect Device

The user clicks "Connect device" from Dashboard, post-onboarding next step, or
Settings.

Required state:

- authenticated account;
- active MicroDAO;
- allowed membership;
- backend able to issue a device pairing invitation.

The user should see device-oriented copy:

```text
Prepare this device for DAARION.
```

not backend, registry, or Edge runtime terminology.

### 4. Create device pairing invitation

The product backend creates a short-lived device pairing invitation bound to:

- user/account id;
- MicroDAO id;
- membership id or role;
- backend profile/environment;
- allowed device purpose;
- issue time;
- expiry time;
- single-use or revocation state;
- nonce or invitation id.

The exact endpoint name is not implemented in this milestone. The required
contract surface is:

```text
CreateDevicePairingInvitation
```

Input requirements:

- authenticated account;
- active MicroDAO id;
- intended device purpose: `standard_device`, `local_agent`, or
  `worker_candidate`;
- optional display label.

Output requirements:

- user-safe display label;
- expiration time;
- pairing payload or deep link for Edge;
- installation mode guidance: web/PWA or native;
- no private backend secrets;
- no raw local identity secrets.

### 5. Hand off to Edge runtime

The PWA presents one of these paths:

- open Edge web/PWA only if sufficient for the current device purpose;
- open native Edge Client if local or privileged capability is required;
- download native installer only when the native app is required or requested.

The handoff may use a pasted code/link first, then a deep link later. The user
should not manually copy backend URLs.

### 6. Pair device

The Edge runtime consumes the device pairing invitation and stores PairingState.

Required result:

- `PairingState.state = paired`;
- `PairingState.source = invite_payload`;
- backend URL normalized by Edge runtime;
- label and environment available for diagnostics;
- no pairing mutation in `loval-echoes` local-only state.

### 7. Check health

The Edge runtime checks `GET /api/v1/edge/health` on the paired backend.

Allowed states:

- `pairing_required`;
- `offline`;
- `contract_invalid`;
- `version_mismatch`;
- `online`;
- `degraded`;
- `maintenance`.

Dashboard copy should translate these states into user language.

### 8. Complete Genesis when required

Genesis is a runtime provisioning step after pairing and compatible health.

Genesis should be framed in product UI as device preparation, not as a separate
product the user must understand first.

### 9. Report device readiness

The backend records the device state against the account and MicroDAO
membership.

Required contract surface:

```text
RecordDeviceReadiness
```

Minimum state fields:

- device id;
- user/account id;
- MicroDAO id;
- membership id or role;
- Edge identity public key or node id, when available;
- pairing status;
- backend health state;
- Genesis/provisioning status;
- last checked time;
- device purpose;
- capability summary when available;
- user-facing readiness state.

### 10. Continue in Dashboard

The Dashboard reads device readiness and shows one clear next action.

Examples:

- Connect device;
- Continue device setup;
- Device connected;
- Check connection;
- Activate local agent;
- Apply for Worker Node.

## Required Backend Contract Surfaces

This milestone does not implement backend endpoints. It defines the minimum
contracts needed before implementation can start.

### Contract A: CreateDevicePairingInvitation

Purpose: issue a short-lived device invitation for an approved MicroDAO member.

Must enforce:

- authenticated account;
- active MicroDAO membership;
- role or policy allows device connection;
- single-use or revocable invitation;
- expiration;
- audit event.

Must return:

- pairing payload or link for Edge;
- user-facing label;
- expiry;
- required runtime path: web/PWA or native;
- safe error if not allowed.

### Contract B: ValidateOrConsumeDevicePairingInvitation

Purpose: let Edge consume the device invitation and receive the backend profile
needed for PairingState.

Must enforce:

- invitation exists;
- invitation is unused or still valid by policy;
- invitation is not expired or revoked;
- invitation is bound to the intended MicroDAO/account;
- backend profile is compatible with Edge pairing;
- audit event.

Must return:

- backend URL or backend profile reference consumable by Edge;
- label;
- environment;
- optional server-issued device record id;
- no user private data;
- no long-lived secrets in cleartext.

### Contract C: GetDeviceConnectionStatus

Purpose: let `loval-echoes` show device readiness in Dashboard and Settings.

Must enforce:

- authenticated account;
- membership-scoped read access;
- no exposure of another member's private device details unless role allows it.

Must return:

- current device readiness state;
- last health state;
- last checked time;
- device label or platform summary;
- next recommended action;
- safe warning if public installer/trust path is blocked.

### Contract D: RecordDeviceReadiness

Purpose: let Edge/backend record that pairing, health, and Genesis state have
progressed.

Must enforce:

- request is tied to the paired device identity or pairing session;
- state changes are monotonic where needed;
- raw private identity material is never accepted or stored.

Must return:

- accepted state;
- next action;
- Dashboard-safe summary.

## Invitation And Token Relationships

| Item | Meaning | Can grant MicroDAO membership? | Can pair device? |
| --- | --- | --- | --- |
| Community invite code | Existing `/onboarding?inviteCode=...` flow | Yes | No |
| Device pairing invite | New missing contract | No | Yes |
| Edge PairingState | Local runtime configuration after pairing | No | Already paired state |
| Backend health contract | Runtime compatibility check | No | No |
| Genesis provisioning result | Runtime/device provisioning result | No | No, but can mark device ready |

Device pairing invitations should be:

- short-lived;
- revocable;
- scoped to a MicroDAO membership;
- single-use by default;
- audit logged;
- safe to paste;
- safe to display as a QR/deep link later;
- distinct from community invites in UI and data model.

## Dashboard Entry Conditions

There are two Dashboard concepts and they must remain separate.

### MicroDAO Dashboard Entry

A user can enter the MicroDAO Dashboard when:

- authenticated;
- profile/access policy permits use;
- active MicroDAO membership exists;
- membership status is approved or otherwise allowed by current product policy.

A connected device is not required for basic Dashboard access.

### Device-Ready Dashboard State

Device-powered features become available only when:

- device pairing exists;
- backend health is compatible enough for the feature;
- Genesis/provisioning requirements are satisfied for that feature;
- device status is visible to `loval-echoes` through backend state.

Device readiness must gate device-powered actions, not the whole MicroDAO
Dashboard.

## Product States

Normal Dashboard labels should be user-centered.

| Backend/runtime state | Dashboard label | Primary action |
| --- | --- | --- |
| No device status | Not connected | Connect device |
| Pairing invite not created | Ready to connect | Prepare device |
| Invite created, not consumed | Waiting for this device | Enter invitation code |
| Edge reports `pairing_required` | Connection required | Continue device setup |
| Edge reports `offline` | Device needs attention | Check connection |
| Edge reports `contract_invalid` | Setup needs support | Contact support / retry later |
| Edge reports `version_mismatch` | Update required | Update device app |
| Edge reports `online` | Device connected | Continue |
| Edge reports `degraded` | Connected with limited service | Continue with caution |
| Edge reports `maintenance` | Service maintenance | Try later |
| Genesis not complete | Device setup incomplete | Complete device setup |
| Genesis complete and status recorded | Device ready | Activate local agent / first useful action |

## Minimum Implementation Needed To Close The Blocker

The smallest safe implementation sequence after this contract is:

1. Add backend storage and API contract for device pairing invitations and
   device connection status.
2. Add a Dashboard "Connect device" readiness card or route in `loval-echoes`
   that requests a device pairing invitation from active MicroDAO context.
3. Update Edge pairing to consume the MicroDAO device pairing payload format if
   the current backend-url payload is not sufficient.
4. Record device readiness after pairing, health, and Genesis progress.
5. Show device readiness in the MicroDAO Dashboard.
6. Validate the product path:

```text
1.daarion.city
-> account
-> create or join MicroDAO
-> Dashboard
-> Connect device
-> pair Edge runtime
-> health
-> Genesis
-> Dashboard shows device ready
```

## Explicit Non-Goals

Do not include in the next implementation milestone:

- Local Agent Runtime;
- Worker Node onboarding;
- new Genesis features;
- stable public release publication;
- wallet authorization;
- governance signing;
- payments;
- marketplace/federation;
- broad onboarding redesign;
- fake local-only device readiness.

## Open Decisions For Implementation

The contract is defined, but implementation still needs these concrete choices:

| Decision | Required before code? | Notes |
| --- | --- | --- |
| Backend endpoint names | Yes | This doc defines contract surfaces, not final URLs. |
| Device pairing invite storage schema | Yes | Must be separate from existing community invitation semantics or clearly typed if reused. |
| Whether one device can connect to multiple MicroDAOs in MVP | Yes | Recommend one active MicroDAO context for MVP unless backend already supports multi-profile device state. |
| Deep link format | No | Pasted code/link is sufficient for first implementation. |
| Native app requirement per capability | Partially | Can start with web/PWA guidance plus native escalation when needed. |
| Dashboard polling vs realtime status | No | Polling is sufficient for MVP. |

## Decision

The missing relationship is now defined:

```text
Account + approved MicroDAO membership
-> short-lived device pairing invitation
-> Edge PairingState
-> health
-> Genesis/provisioning
-> backend device readiness record
-> MicroDAO Dashboard device status
```

The next milestone should implement this bridge narrowly. Local Agent Runtime,
Worker Node, and public stable release expansion remain blocked until the
Connect Device path works as a real product flow.
