# DAARION Dashboard Entry Requirements

Status: product architecture contract

Date: 2026-06-19

Owner repo for product journey: `loval-echoes`

Related runtime repo: `daarion-edge-client`

Scope: docs-only. No source code, backend implementation, Edge Client changes,
or onboarding implementation changes are included.

## Final Classification

```text
CONTRACT DEFINED
```

This document defines when a user can enter the MicroDAO Dashboard, when device
capabilities become available, and what remains missing before the full product
journey is complete.

## Core Rule

Dashboard entry and device readiness are not the same gate.

```text
MicroDAO Dashboard access = account + allowed membership
Device-powered actions = connected and healthy device
```

A user should not be blocked from the MicroDAO Dashboard because they have not
connected a device. Instead, the Dashboard should show the next device action
when device capabilities are useful or required.

## Current Dashboard Entry Facts

Verified in `loval-echoes`:

- `src/App.tsx` routes unauthenticated users to auth surfaces.
- `src/App.tsx` routes users without an active community to `/onboarding`.
- `src/pages/MicroDAOOnboarding.tsx` navigates successful create/join flows to
  `/dashboard`.
- `src/integrations/supabase/types.ts` defines `communities`,
  `community_members`, `profiles`, and `invitation_codes`.
- `src/pages/NewIndex.tsx` renders the Dashboard after active MicroDAO state is
  available.

Current gap:

- the Dashboard does not yet read or render device readiness state;
- there is no stateful "Connect device" card;
- there is no MicroDAO-bound device pairing invite.

## Entry Tiers

### Tier 1: Public Entry

The user can access public pages when no account is present.

Allowed surfaces:

- landing;
- auth;
- public install/device setup explanation;
- public documentation-style pages.

Not allowed:

- MicroDAO workspace actions;
- device pairing invitation generation;
- membership-scoped device status.

### Tier 2: Authenticated Account

The user has an authenticated account but no active MicroDAO membership.

Allowed surfaces:

- create MicroDAO;
- join MicroDAO by community invite;
- account/profile basics.

Not allowed:

- Dashboard workspace;
- Connect Device invite generation;
- device status for a MicroDAO.

Reason:

Device connection must be bound to a MicroDAO membership, not only a raw
account.

### Tier 3: MicroDAO Dashboard

The user has an active MicroDAO membership that product policy allows.

Allowed surfaces:

- Dashboard;
- chats/projects/tasks/invites already owned by the product;
- Connect Device entry point;
- device status summary when backend contract exists.

Not required:

- Edge pairing;
- native install;
- Genesis completion.

### Tier 4: Device Connected

The user has at least one device associated with the active MicroDAO context.

Allowed surfaces:

- device status card;
- health diagnostics summary;
- device setup continuation;
- feature-specific device capability cards.

Still gated:

- local agent activation if runtime is not ready;
- Worker Node application if capability and trust requirements are not met.

### Tier 5: Device Ready

The device has completed required pairing, compatible health, and required
Genesis/provisioning steps for the requested capability.

Allowed surfaces:

- first useful device-powered action;
- Local Agent entry only after that milestone is opened and implemented;
- Worker Node application only through an explicit advanced/operator path.

## Required Dashboard State Model

The Dashboard needs a backend-read device status model. This model is not
implemented yet.

Minimum fields:

| Field | Purpose |
| --- | --- |
| `account_id` | Bind readiness to authenticated user. |
| `community_id` | Bind readiness to active MicroDAO. |
| `membership_id` or `role` | Enforce role/policy scope. |
| `device_id` | Stable backend identifier for the connected device. |
| `device_label` | User-safe label such as "This Mac". |
| `platform` | Optional user-safe platform summary. |
| `pairing_status` | Whether the device has consumed a valid pairing invitation. |
| `health_state` | Latest backend health state reported by Edge/backend. |
| `genesis_status` | Whether runtime provisioning is not started, pending, complete, or failed. |
| `capability_summary` | Optional summary for future feature gating. |
| `last_seen_at` | Last trusted device activity timestamp. |
| `next_action` | One user-facing next action. |

This state must be persisted by the backend, not faked only in browser local
state.

## Dashboard States And Actions

| Dashboard state | Meaning | User-facing label | Primary action |
| --- | --- | --- | --- |
| `no_device` | No device is connected to this MicroDAO membership | Not connected | Connect device |
| `invite_available` | User can generate a device pairing invitation | Ready to connect | Prepare device |
| `invite_created` | Pairing invitation exists but no device has consumed it | Waiting for this device | Enter invitation code |
| `pairing_required` | Edge/runtime has no effective paired backend | Connection required | Continue device setup |
| `paired_unchecked` | Pairing exists, health not checked yet | Checking connection | Check connection |
| `offline` | Health check could not reach backend | Device needs attention | Check connection |
| `contract_invalid` | Backend response does not match public health contract | Setup needs support | Retry later / contact support |
| `version_mismatch` | Backend or client version is incompatible | Update required | Update device app |
| `online` | Backend is reachable and compatible | Device connected | Continue |
| `degraded` | Backend reports degraded service | Connected with limited service | Continue with caution |
| `maintenance` | Backend reports maintenance mode | Service maintenance | Try later |
| `genesis_required` | Pairing and health are ready, provisioning not complete | Device setup incomplete | Complete device setup |
| `genesis_pending` | Provisioning is waiting for approval or completion | Device pending | Check status |
| `device_ready` | Device is connected and usable for its current purpose | Device ready | Start first useful action |
| `blocked` | Product policy or trust requirement blocks continuation | Needs attention | View requirement |

The UI can collapse these into fewer labels for normal users, but the backend
and product logic should keep enough detail to avoid ambiguous support states.

## Dashboard Entry Conditions

### A user may enter `/dashboard` when

- the user is authenticated;
- the user has at least one allowed MicroDAO membership;
- the active MicroDAO can be resolved;
- route guards do not classify the profile as rejected or blocked;
- required data loading does not fail.

### A user should see "Connect device" when

- the user is on a Dashboard with an active MicroDAO;
- no device readiness state exists for the active MicroDAO; or
- the existing device state requires pairing, setup, or reconnection.

### A user should see "Device connected" when

- the backend has a device readiness record for the active MicroDAO;
- pairing has been consumed by Edge;
- health is `online`, `degraded`, or `maintenance`;
- the product can explain the next action without exposing backend internals.

### A user should see "Device ready" when

- the device is connected;
- required Genesis/provisioning is complete for the selected capability;
- the backend has recorded readiness;
- the Dashboard has a first useful action available.

## Genesis Relationship

Genesis should not block basic MicroDAO Dashboard entry.

Genesis should block only the features that require Edge runtime provisioning.

Product framing:

```text
Complete device setup
```

Technical framing such as "Sovereign Genesis" can remain inside the Edge
runtime, but should not be the first concept in the normal Dashboard journey.

## Public Installer Relationship

The Dashboard may link to native installation only after the user has MicroDAO
context and a device pairing invitation.

Public download links alone do not close the onboarding gap. The product must
first know:

- which account is connecting the device;
- which MicroDAO the device belongs to;
- which role/purpose the device is being prepared for;
- which pairing payload the Edge runtime should consume.

Until public signed release readiness is complete, native install should remain
tester/canary or clearly caveated in product copy.

## First Useful Action Requirement

The Dashboard should not end the flow at "Device connected". It should show one
next useful action based on the device purpose.

Initial allowed examples:

- continue MicroDAO workspace;
- activate local agent, once that milestone is opened and implemented;
- apply for Worker Node, only through an explicit advanced path;
- check device status;
- reconnect or update device if health/version is not acceptable.

Local Agent Runtime and Worker Node remain blocked until this Dashboard status
bridge exists.

## Minimum Next Implementation Milestone

Recommended single next milestone:

```text
product: implement Connect Device invite and Dashboard status bridge
```

Minimum scope:

1. Add backend contract/storage for device pairing invitations.
2. Add backend contract/storage for MicroDAO-scoped device status.
3. Add Dashboard "Connect device" entry point.
4. Generate a device pairing invitation from authenticated MicroDAO context.
5. Let Edge consume the invite and report status through backend state.
6. Show Dashboard device readiness and one next action.
7. Validate:

```text
Landing
-> account
-> create or join MicroDAO
-> Dashboard
-> Connect device
-> Edge pairing
-> health
-> Genesis if required
-> Dashboard shows device state
```

## What Remains Blocked

Until the device pairing and Dashboard status bridge is implemented and
validated, keep these blocked:

- Local Agent Runtime Foundation;
- Worker Node onboarding;
- public stable Edge Client onboarding;
- new Genesis feature expansion;
- user-facing claims that device onboarding is self-service.

## Decision

The valid Dashboard path is:

```text
Account
-> allowed MicroDAO membership
-> Dashboard
```

The valid device-ready path is:

```text
Dashboard
-> Connect device
-> device pairing invitation
-> Edge pairing
-> health
-> Genesis/provisioning when required
-> backend readiness record
-> Dashboard device state
```

These gates are now defined. Implementation remains the next narrow milestone.
