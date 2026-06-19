# DAARION End-To-End User Journey

Status: product validation map

Audit date: 2026-06-19

Owner repo for product journey: `loval-echoes`

Related runtime repo: `daarion-edge-client`

## Purpose

This document maps the intended first-run journey for a new DAARION user from
`https://1.daarion.city` to a usable Dashboard. It is not an implementation
spec and does not change runtime behavior.

The question being validated:

```text
Can a completely new person who has never seen DAARION go from
1.daarion.city to Dashboard without developer assistance?
```

## Current Product Boundary

`loval-echoes` owns the normal user-facing product path:

- landing and public PWA shell;
- account and authentication;
- MicroDAO create/join onboarding;
- workspace Dashboard;
- future "Connect Device" journey.

`daarion-edge-client` owns native/device runtime concerns:

- native Tauri app;
- OS keyring identity and local signing;
- backend pairing and health diagnostics;
- Genesis provisioning;
- device capability checks;
- future local agent runtime and worker mode.

Normal users should understand the task as:

```text
Create or join MicroDAO -> Connect Device -> Device Ready -> Dashboard
```

They should not need to understand repository boundaries, backend URLs,
registry internals, localhost, or the Edge runtime.

## Expected Journey Map

| Step | Page / Surface | User action | Expected result | Dependencies | Failure modes |
| --- | --- | --- | --- | --- | --- |
| 1. Landing | `/` on `https://1.daarion.city` | Read value proposition and choose create/sign in | User understands DAARION starts from MicroDAO, not a separate client | Public SPA deployment, PWA shell | Copy drift, stale deployed bundle, user starts at `/install` without context |
| 2. Account / Access | `/auth` | Create account or sign in | User has an authenticated Supabase session | Supabase Auth, email confirmation policy, profile creation | Email confirmation friction, existing-account confusion, auth callback errors |
| 3. Access state | Route guards in `src/App.tsx` | Return to `/` after auth | User is routed to `/onboarding` if they have no approved MicroDAO membership | `profiles`, `community_members`, `useUserApprovalStatus`, `useActiveCommunity` | Ambiguous `pending` profile behavior, profile creation race, no approved membership |
| 4. Create MicroDAO | `/onboarding` | Start setup wizard, enter community/agent details, launch | Community, owner membership, Spirit Agent setup data, invite codes, and default conversation/task are created; user lands on `/dashboard` | Supabase RPC `create_microdao_with_spirit_agent`, invitation code inserts, conversations/tasks tables | RPC/table errors, required fields unclear, subscription gate deferred, no device next step |
| 5. Join MicroDAO | `/onboarding?inviteCode=...` or manual code | Enter community invite code | User joins an existing MicroDAO and lands on `/dashboard` | Supabase RPC `join_community_by_code`, active community invite code | Invalid/expired invite, community invite confused with device pairing invite |
| 6. Dashboard arrival | `/dashboard` | Review workspace | User sees MicroDAO workspace, Community Spirit status, quick actions, invites, and activity | Approved membership, active community state | No "Connect Device" readiness card, no device status, no continuation toward pairing |
| 7. Connect Device entry | Future `/connect-device` or Dashboard card | Choose "Connect Device" | User starts stateful device connection from MicroDAO context | Product route/card not implemented yet | User must manually discover `/install`; no state is carried from MicroDAO to device |
| 8. Choose Web/PWA or native | Current `/install` | Choose web setup or platform installer | User understands native app is needed only for local/privileged device capability | Install page copy, current release links, Edge PWA link | Public links still target old/stale artifacts; native trust gates remain blocked |
| 9. Pair device | Edge PairingGate | Enter DAARION invitation code/link | Edge runtime stores paired backend profile and unblocks health/Genesis | Device pairing payload contract, `pair_backend`, PairingState | MicroDAO invite code is not the same as Edge pairing payload; no product bridge creates the payload |
| 10. Health diagnostics | Edge runtime | Run/check health | Runtime reports `online`, `degraded`, `maintenance`, `offline`, `contract_invalid`, `version_mismatch`, or `pairing_required` | Paired backend, public health contract | No paired backend, invalid backend contract, old backend, public release not foundation-aligned |
| 11. Genesis | Edge runtime | Complete Genesis provisioning | Device identity/provisioning completes and Edge dashboard becomes available | Pairing, backend config, secure local storage, provisioning backend | Pairing required, backend unavailable, technical Genesis language, provisioning backend not validated end-to-end |
| 12. Product Dashboard continuation | `loval-echoes` Dashboard | Return to DAARION workspace | MicroDAO Dashboard reflects device status and next useful action | Cross-app state handoff/status contract | No current status bridge from Edge runtime back to MicroDAO Dashboard |

## Repository Evidence

### `loval-echoes`

- `src/App.tsx` routes unauthenticated users to `/auth`, users with no
  approved memberships to `/onboarding`, and users with memberships to
  `/dashboard`.
- `src/pages/Start.tsx` provides the public landing and sends unauthenticated
  create intent to `/auth?signup=true`.
- `src/components/AuthForm.tsx` uses Supabase Auth for sign-up/sign-in.
- `src/hooks/useAuth.tsx` creates missing profiles with
  `approval_status: pending`.
- `src/hooks/useUserApprovalStatus.tsx` treats lookup errors as `pending`; route
  guards currently block only `rejected` and `blocked`.
- `src/hooks/useActiveCommunity.tsx` loads only approved community memberships.
- `src/pages/MicroDAOOnboarding.tsx` implements create and join flows, including
  `create_microdao_with_spirit_agent`, `join_community_by_code`, invite-code
  inserts, active community selection, and navigation to `/dashboard`.
- `src/pages/NewIndex.tsx` renders Dashboard quick actions, Community Spirit
  state, invite codes, and MicroDAO activity, but does not expose a device
  readiness state or stateful Connect Device card.
- `src/pages/Install.tsx` uses user-centered copy, but still links to
  `edge.daarion.city` and release artifacts under `v0.2.2-3`.
- `public/manifest.json` and `public/sw.js` define the MicroDAO PWA shell.

### `daarion-edge-client`

- `src/components/PairingGate.tsx` accepts an invitation code/link and calls
  `pair_backend`.
- `src-tauri/src/pairing.rs` owns persisted PairingState and validates pairing
  payloads locally.
- `src-tauri/src/backend_health.rs` implements pairing-aware backend health
  diagnostics.
- `src/components/GenesisWizard.tsx` blocks Genesis when pairing is missing and
  still uses technical `Sovereign Genesis` language.
- `docs/audits/EDGE_CLIENT_INSTALLER_AND_FIRST_RUN_AUDIT.md` records public
  onboarding as failed for the current public installer path.
- `docs/release/EDGE_CLIENT_PUBLIC_RELEASE_REPORT.md` classifies the
  foundation-aligned release path as tester-only.
- `docs/release/CROSS_PLATFORM_INSTALLER_READINESS.md` records public release
  as blocked by platform signing assets and real-device proof.

## Current Live Surface Notes

Checked live surfaces on 2026-06-19:

- `https://1.daarion.city` served the current MicroDAO SPA bundle
  `assets/index-DBOMV7Nz.js`.
- `https://1.daarion.city/install` is the public device setup route in the same
  MicroDAO SPA.
- `https://edge.daarion.city` served a separate Edge app shell with title
  `Tauri + React + Typescript` and a separate bundle.

The live product is therefore already split into two user-visible app shells.
The product decision says `1.daarion.city` should be the only normal entry, but
the current implementation still sends users to the Edge shell or native
download path before a MicroDAO-bound device pairing payload exists.

## Journey State

| Segment | Current state |
| --- | --- |
| Landing | Implemented |
| Account / auth | Implemented with caveats |
| Create MicroDAO | Implemented |
| Join MicroDAO by community invite | Implemented |
| MicroDAO Dashboard arrival | Implemented |
| Dashboard Connect Device entry | Missing |
| MicroDAO-bound device pairing payload | Missing |
| Edge pairing gate | Implemented in Edge runtime |
| Health diagnostics | Implemented in Edge runtime |
| Genesis | Implemented in Edge runtime with technical UX |
| Edge-to-MicroDAO Dashboard status return | Missing |
| Public installer trust | Blocked |

## Acceptance Gap

The current product can get a user to a MicroDAO Dashboard, but the intended
full path cannot yet be completed as one coherent product journey:

```text
Landing
-> account/access
-> create or join MicroDAO
-> connect device
-> pair device
-> health check
-> Genesis
-> Dashboard
-> first useful action
```

The missing bridge is not just UI copy. The product needs a MicroDAO-bound
device connection contract and a Dashboard/route surface that can hand a valid
device pairing payload to the Edge runtime without exposing backend internals.
