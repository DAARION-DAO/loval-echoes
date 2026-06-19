# DAARION End-To-End Onboarding Audit

Status: product validation audit

Audit date: 2026-06-19

Scope: docs-only analysis. No runtime code, onboarding code, backend code, Edge
Client code, release artifacts, Local Agent Runtime work, or Worker Node work
was changed.

## Final Answer

Can a brand-new user reach Dashboard without developer help?

```text
NO
```

A new user can reach the MicroDAO Dashboard after account creation and MicroDAO
create/join flow, but the complete intended journey from `1.daarion.city` to a
connected Edge device, health diagnostics, Genesis, and product Dashboard is
blocked.

## Product Readiness Classification

```text
USER JOURNEY BLOCKED
```

The implementation has strong individual pieces:

- public DAARION PWA entry;
- account/auth flow;
- MicroDAO create flow;
- MicroDAO join-by-code flow;
- MicroDAO Dashboard;
- Edge PairingState foundation;
- Edge backend health diagnostics;
- Edge Genesis/runtime screens.

Those pieces are not yet joined into one self-service path for a non-technical
new user.

## What Works

| Area | Evidence | Status |
| --- | --- | --- |
| Public entry | `src/App.tsx`, `src/pages/Start.tsx`, `public/manifest.json`, `public/sw.js` | Implemented |
| Account auth | `src/components/AuthForm.tsx`, Supabase Auth calls | Implemented with caveats |
| Create MicroDAO | `src/pages/MicroDAOOnboarding.tsx` calls `create_microdao_with_spirit_agent`, creates invite codes, default conversation/task, then navigates to `/dashboard` | Implemented |
| Join MicroDAO | `src/pages/MicroDAOOnboarding.tsx` calls `join_community_by_code`, sets active community, then navigates to `/dashboard` | Implemented |
| Dashboard | `src/pages/NewIndex.tsx` renders Community Spirit state, quick actions, invites, activity, and workspace actions | Implemented |
| Product copy | `docs/planning/UI_COPY_DEVICE_CONNECTION_LANGUAGE_AUDIT.md` and current `/install` copy use "Connect Device" / "Prepare Device" language | Improved |
| Edge pairing | `daarion-edge-client/src/components/PairingGate.tsx` and `src-tauri/src/pairing.rs` | Implemented in runtime |
| Edge health | `daarion-edge-client/src-tauri/src/backend_health.rs` | Implemented in runtime |

## What Is Unclear Or Partial

| Area | Finding | Impact |
| --- | --- | --- |
| Account approval | `useAuth` creates profiles with `approval_status: pending`, while route guards block only `rejected` and `blocked`; `useUserApprovalStatus` can also create an approved profile but returns `pending` immediately after insert | New-user access policy is ambiguous and should be smoke-tested with a real clean account |
| Dashboard next step | Dashboard has invites, Community Spirit, chats/projects/import, but no device readiness card or stateful "Connect Device" CTA | User reaches Dashboard but is not guided into device connection |
| `/install` role | `/install` is a public download/setup hub and still references `v0.2.2-3` assets | It is not a MicroDAO-bound continuation step |
| Web/PWA handoff | `/install` links directly to `https://edge.daarion.city` | User leaves the product shell and sees a separate Edge app |
| Edge copy | Edge runtime still exposes "DAARION Edge", "Sovereign Genesis", "Hardware Audit", "Worker Mode", and developer/operator wording | Non-technical user receives a second mental model |
| Installer status | Edge release docs classify the foundation-aligned release as tester-only; public release remains blocked by signing/trust/real-device proof | Public onboarding cannot safely depend on native install |

## Blockers

| Severity | Blocker | Evidence | Why it blocks the journey |
| --- | --- | --- | --- |
| CRITICAL | No MicroDAO-to-device pairing contract exists in the product journey | `docs/planning/UNIFIED_DAARION_PWA_DEVICE_CONNECTION_JOURNEY.md` states community invite URLs are not device pairing payloads; `src/services/communityMembers.ts` builds `/onboarding?inviteCode=...` links only | A user can join/create a MicroDAO, but cannot receive a valid device pairing payload from that MicroDAO context |
| CRITICAL | Dashboard has no stateful Connect Device entry or Device Status | `src/pages/NewIndex.tsx` includes Community Spirit, invite, modules, rules, tasks, and activity actions, but no device status or pairing state | After reaching Dashboard, the user has no obvious next step toward device connection |
| HIGH | `/install` still targets stale public release artifacts | `src/pages/Install.tsx` hardcodes `EDGE_CLIENT_RELEASE_TAG = "v0.2.2-3"` and builds links to that tag | The public install path does not represent the foundation-aligned Edge runtime state |
| HIGH | Native public release trust is blocked | Edge release docs classify public release as blocked by signing/notarization and real-device proof | A non-technical user can hit operating-system trust prompts or unvalidated installer behavior |
| HIGH | Edge web/PWA remains a separate technical shell | Live `edge.daarion.city` serves a separate app shell; Edge source shows PairingGate and Genesis screens using Edge/runtime language | The user leaves the unified MicroDAO journey before device readiness is explained |
| HIGH | Genesis-to-MicroDAO Dashboard return is missing | Edge runtime has its own Dashboard; `loval-echoes` has no Edge device status bridge | Even if Genesis succeeds, the product Dashboard does not know the device is connected |
| MEDIUM | Account approval semantics are ambiguous | `useAuth` inserts `pending`; `useUserApprovalStatus` has a fallback path that inserts `approved` but sets local status `pending`; route guards do not block `pending` | Real clean-user behavior may differ depending on race/profile state and Supabase policy |
| MEDIUM | Community invite code can be confused with device invitation code | MicroDAO onboarding and Edge PairingGate both say invitation code, but they are different payloads | Users may paste a community invite into Edge and fail without understanding why |
| MEDIUM | `/install` can be accessed before MicroDAO context | `/install` is public and not tied to active community state | Users may start with device/install work before account/MicroDAO readiness |
| LOW | Live deployment and repo state can drift | Live `1.daarion.city` and `edge.daarion.city` serve separate bundles | Audits must continue checking deployed bundles, not only source |

## User Journey Verdict By Step

| Step | Verdict |
| --- | --- |
| Landing -> Account | Partial pass |
| Account -> Create/Join MicroDAO | Partial pass |
| Create/Join MicroDAO -> Dashboard | Pass for implemented MicroDAO path |
| Dashboard -> Connect Device | Fail |
| Connect Device -> Pairing | Fail at product bridge |
| Pairing -> Health | Implemented in Edge runtime, not reachable from product journey |
| Health -> Genesis | Implemented in Edge runtime, not validated as product journey |
| Genesis -> DAARION Dashboard | Fail; no MicroDAO status return/continuation bridge |

## Highest-Value Blocker

The single highest-value blocker is:

```text
Missing MicroDAO-bound Connect Device contract and Dashboard entry point.
```

This is the bridge between the already-implemented MicroDAO product journey and
the already-implemented Edge runtime foundation.

Without this bridge, release signing, Local Agent Runtime, Worker Node, and more
Genesis features do not make the first-run journey coherent. The user can either
operate in MicroDAO or enter Edge runtime, but the product does not yet connect
the two as one understandable flow.

## Recommended Next Milestone

Recommend exactly one next milestone:

```text
product: define Connect Device pairing contract and Dashboard entry point
```

Minimum scope:

- define the MicroDAO-to-device pairing payload contract;
- decide who generates the device invite: MicroDAO backend, operator backend, or
  dedicated pairing service;
- define payload binding: user, MicroDAO, backend profile, role, expiry, and
  revocation;
- add a Dashboard "Connect Device" readiness entry point in planning or UI;
- keep native install behind "needed for local capabilities";
- keep Local Agent Runtime and Worker Node blocked;
- do not fake pairing in local frontend state.

Out of scope for that milestone:

- Local Agent Runtime;
- Worker Node onboarding;
- new Genesis features;
- backend trust/auth beyond the pairing payload contract;
- public stable release publication.

## Decision

```text
Foundation pieces: PRESENT
Product journey: BLOCKED
Public onboarding: BLOCKED
Local Agent Runtime: BLOCKED
Worker Node: BLOCKED
```

The product should not move to Local Agent Runtime Foundation yet. The next
valuable artifact is a narrow Connect Device bridge that makes the current
MicroDAO and Edge foundations behave as one product journey.
