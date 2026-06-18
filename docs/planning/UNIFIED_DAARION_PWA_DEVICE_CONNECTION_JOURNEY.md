# Unified DAARION PWA Device Connection Journey

Status: planning decision, docs-only

Owner repo for this document: `loval-echoes`

Related runtime repo: `daarion-edge-client`

## Decision

`https://1.daarion.city` is the single normal user-facing DAARION PWA entry point.

MicroDAO PWA and Edge Client PWA should be unified at the product-journey level,
not merged into one repository or runtime. Users should not start with the mental
model of installing a separate product called "Edge Client". The primary user
action is:

```text
Connect my device
```

The Edge Client remains a device/native runtime foundation. It should appear to
normal users only when the device task actually requires native capabilities.

Local Agent Runtime Foundation remains blocked until the full product journey is
validated from `https://1.daarion.city` through device connection, health,
Genesis, Dashboard, and first useful action.

## Product Ownership

### `loval-echoes`

`loval-echoes` owns the user-facing DAARION product journey:

- account and access flows;
- MicroDAO onboarding;
- create or join MicroDAO;
- dashboard and normal workspace navigation;
- the future "Connect device" journey;
- the public PWA shell for `https://1.daarion.city`;
- user-facing language for device readiness, status, and next actions.

Current repo evidence:

- `src/App.tsx` routes unauthenticated users to public/auth surfaces, users
  without memberships to `/onboarding`, and users with a community to
  `/dashboard`.
- `src/pages/MicroDAOOnboarding.tsx` owns the create/join MicroDAO flow and
  navigates successful creation to `/dashboard`.
- `public/manifest.json` and `public/sw.js` define the current MicroDAO PWA
  install/offline shell.
- `src/pages/Install.tsx` is currently the bridge to Edge Client download/PWA,
  but it should not remain the primary product mental model.

### `daarion-edge-client`

`daarion-edge-client` owns native/device runtime concerns:

- native Tauri app;
- OS keyring identity and local signing boundary;
- local device capability checks;
- privileged local operations unavailable to a browser PWA;
- local agent runtime and model access when that milestone opens;
- worker mode eligibility and boundaries;
- native installer, logs, and device runtime diagnostics;
- backend pairing and health implementation inside the device runtime.

The Edge Client web/PWA surface should remain secondary, internal, pilot, or
developer-oriented until the unified journey is validated through
`https://1.daarion.city`.

## Unified User Journey

Target flow:

```text
Landing / 1.daarion.city
-> account or access
-> create or join MicroDAO
-> connect device
-> choose Web/PWA or Native only if needed
-> pair device
-> health check
-> Genesis
-> Dashboard
-> first useful action
```

The user-facing journey should hide implementation boundaries. Users should not
need to understand backend URLs, registries, pairing internals, localhost,
environment variables, repository boundaries, or runtime topology.

## Device Connection Language

Preferred user-facing language:

- Connect device
- Prepare device
- Device connected
- Activate local agent
- Apply for Worker Node

Avoid as primary user-facing language:

- Edge runtime
- backend
- registry
- localhost
- environment variables
- pairing internals
- repository split
- install Edge Client

"Install Edge Client" can remain in advanced or native-specific copy, but the
main product action should be "Connect device".

## Native Edge Client Positioning

### PWA alone is sufficient for

- account and access;
- creating or joining a MicroDAO;
- dashboard navigation;
- chats, tasks, projects, participants, settings, and billing surfaces already
  owned by `loval-echoes`;
- starting a device connection journey;
- showing high-level device connection status after a backend contract exists.

### Native app is needed for

- local AI execution;
- local model access;
- hardware and capability checks that require native APIs;
- OS keyring-backed identity operations handled by the runtime;
- privileged device operations;
- worker node participation;
- future local agent runtime diagnostics;
- logs and packaged runtime smoke testing.

The product should explain native install as an escalation:

```text
This device needs the native app to run local capabilities.
```

not as the first required step for every user.

## Information Architecture Recommendation

### Connect Device

Recommended locations:

- after successful MicroDAO onboarding as a next-step card;
- on the Dashboard as a persistent readiness/status card;
- in Settings as a device/account capability section;
- optionally in Participants or admin/operator surfaces when inviting operators
  or worker candidates.

Primary CTA:

```text
Connect device
```

Secondary CTAs:

```text
Prepare this device
Open device setup
Download native app
```

### Device Status

Device Status should live in Dashboard and Settings. It should use plain states:

- Not connected
- Connection required
- Checking connection
- Connected
- Needs attention
- Native app required

Technical health states from the Edge runtime should be translated before being
shown in normal MicroDAO UI.

### Local Agent

Local Agent should appear only after the device is connected or when the product
can explain why native capabilities are useful. It should not be the first step
before account, MicroDAO, and device readiness.

### Worker Node

Worker Node belongs behind an explicit advanced/operator path:

- "Apply for Worker Node";
- eligibility and capability checks;
- clear boundary that worker mode is not the default device connection path.

Worker mode must not be implied by normal PWA installation.

## Current Gaps And Blockers

### Edge public route reliability

The public Edge web/PWA surface is not ready to be the main user entry. The
normal user entry should stay on `https://1.daarion.city` until Edge route
fallback and product flow are validated.

### Invite code versus pairing payload

Current MicroDAO invite URLs are community onboarding links, for example:

```text
/onboarding?inviteCode=...
```

That is not the same as an Edge device pairing payload. The relationship between
MicroDAO membership, backend profile, and device pairing invite is not yet
implemented in `loval-echoes`.

Required future contract:

- who generates a device pairing invite;
- whether it is bound to MicroDAO, user profile, backend profile, or operator
  role;
- how expiry, revocation, and role scope work;
- how the browser PWA hands the invite to the native runtime without exposing
  backend internals to the user.

Do not fake this in frontend copy or local state.

### Genesis to Dashboard validation

The Edge foundation has backend health and Genesis pieces, but the full product
journey is still pending validation:

```text
Install / launch
-> invite-code onboarding
-> pairing success
-> health status resolution
-> Genesis
-> Dashboard arrival
```

Until that journey passes, Local Agent Runtime Foundation remains blocked.

### Current install surface

`src/pages/Install.tsx` currently presents Edge Client as the main object to
download or open as Web/PWA. Future product work should convert this into a
device connection hub or route users to a new "Connect device" surface.

## Minimal Migration Plan

This plan intentionally avoids broad rewrites.

1. Keep `https://1.daarion.city` as the only normal user-facing PWA entry point.
2. Add product copy and IA for "Connect device" before changing runtime code.
3. Convert `/install` from an Edge-first download page into a device connection
   explanation or create a separate `/connect-device` route and redirect normal
   users there.
4. Add a Dashboard readiness card for device connection after MicroDAO creation
   or join.
5. Keep native app download behind a conditional branch:
   "Native app required for local AI, hardware checks, or worker participation."
6. Define the MicroDAO-to-device pairing payload contract before implementing
   pairing UI in `loval-echoes`.
7. Reuse `daarion-edge-client` as the runtime implementation once the product
   path can hand off a valid pairing payload.
8. Validate the full first-run journey before opening Local Agent Runtime
   Foundation.

## Out Of Scope For This Planning Step

- Backend implementation.
- Pairing implementation.
- Runtime changes in `daarion-edge-client`.
- New PWA manifest or service worker changes.
- New route implementation.
- Genesis protocol changes.
- Trust/auth protocol.
- Worker mode implementation.
- Local Agent Runtime Foundation.

## Next Narrow PR

Recommended next PR after this docs-only planning change:

```text
ux: introduce Connect Device entry point
```

Suggested scope:

- update visible navigation language from "Install Client" toward "Connect
  device";
- add or repurpose a route for device connection education;
- keep all pairing/backend actions disabled or explicitly marked pending until
  the pairing payload contract exists.

Do not implement actual pairing in that PR unless the backend/device-pairing
contract has been defined first.

## Success Criteria

A contributor reading this document should understand:

- users enter DAARION through `https://1.daarion.city`;
- `loval-echoes` owns the product journey;
- `daarion-edge-client` owns native/device runtime behavior;
- native install is only required for local or privileged device capabilities;
- future UI should say "Connect device", not "Install Edge Client";
- Local Agent Runtime Foundation stays blocked until the full product journey is
  validated.
