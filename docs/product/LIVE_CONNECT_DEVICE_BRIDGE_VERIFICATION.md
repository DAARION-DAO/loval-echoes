# Live Connect Device Bridge Verification

Status: validation report

Date: 2026-06-19

Repository: `loval-echoes`

Live product: `https://1.daarion.city`

Scope: validation only. No implementation, backend API, Edge Client, Local
Agent Runtime, Worker Node, Genesis, release, or onboarding redesign work was
performed.

## Final Answer

Is the Connect Device bridge now visible and usable on the live deployed
product?

```text
NO
```

The latest bridge code is deployed and the public install handoff assets are
live, but the complete Dashboard click-through could not be fully verified from
this environment because `/dashboard` requires an authenticated account with an
active MicroDAO membership. The result is therefore not a full live product
journey pass.

## Final Classification

```text
LIVE BRIDGE PARTIALLY VERIFIED
```

## Deployment Verification

Checked with cache-busted requests:

```bash
curl -sSL 'https://1.daarion.city/?codex-cache-bust=live-bridge-20260619'
curl -sSL 'https://1.daarion.city/install?codex-cache-bust=live-bridge-20260619'
```

Observed live bundle:

```text
assets/index-BTzYX569.js
```

Previous stale bundle:

```text
assets/index-DBOMV7Nz.js
```

Result:

```text
PASS
```

The live site is no longer serving the stale `assets/index-DBOMV7Nz.js` bundle.
The live bundle matches the current merged build artifact name generated after
PR #6.

## Deployed Bundle Evidence

Fetched:

```text
https://1.daarion.city/assets/index-BTzYX569.js
https://1.daarion.city/assets/Install-DkNbujE4.js
```

### Dashboard Bridge Strings

The live main bundle contains:

| Evidence | Result |
| --- | --- |
| `Connect this device` | Present |
| `Device status` | Present |
| `This is not a MicroDAO invite code. The device still needs a live connection code.` | Present |
| `daarion.device_connection_intent` | Present |
| `deviceIntent` | Present |
| `Dashboard access does not require a connected device.` | Present |
| `Install-DkNbujE4.js` lazy route reference | Present |

### Install Page Handoff Strings

The deployed install chunk contains:

| Evidence | Result |
| --- | --- |
| `MicroDAO context attached` | Present |
| `Device setup for {community}` | Present |
| `A live device pairing invite will become available after the device-connection contract is active.` | Present |
| `This is not a live device connection code yet.` | Present |
| `deviceIntent` | Present |

Result:

```text
PASS
```

The deployed code contains the Dashboard bridge, setup-intent handoff, and
install-page context banner introduced by PR #6.

## Live UX Audit

| Check | Result | Notes |
| --- | --- | --- |
| `/dashboard` route available to anonymous validation | Blocked | Dashboard requires auth and active MicroDAO membership. |
| Dashboard Connect Device card exists in deployed code | Pass | Confirmed in deployed main bundle. |
| Dashboard device status section exists in deployed code | Pass | Confirmed in deployed main bundle. |
| Dashboard Connect Device CTA exists in deployed code | Pass | Confirmed in deployed main bundle. |
| Click-through from real Dashboard card to `/install?deviceIntent=...` | Not fully verified | Requires authenticated account with active MicroDAO membership. |
| Public `/install` route is deployed | Pass | Live install route serves the updated bundle. |
| Install page recognizes `deviceIntent` path in deployed code | Pass | Confirmed in deployed install chunk. |

## Install Page Validation

| Requirement | Result | Notes |
| --- | --- | --- |
| MicroDAO context banner appears when `deviceIntent` is present | Bundle-verified | The deployed chunk contains the exact banner strings and query parameter handling. |
| Device connection language is visible | Pass | Deployed chunk contains current Connect Device / device setup wording. |
| No "Install Edge Client" as primary wording | Pass | The deployed install route uses device connection language for the primary flow. |
| No community invite/device invite confusion | Pass | The deployed strings explicitly say the setup handoff is not a MicroDAO invite code and not a live device connection code yet. |

## Product Contract Validation

Compared against:

- `docs/product/CONNECT_DEVICE_CONTRACT.md`
- `docs/product/DASHBOARD_ENTRY_REQUIREMENTS.md`

| Contract requirement | Deployed state | Result |
| --- | --- | --- |
| `1.daarion.city` remains the product entry | Live site uses `https://1.daarion.city` | Pass |
| Dashboard access does not require device readiness | Deployed copy states this explicitly | Pass |
| Community invite is not treated as device invite | Deployed copy states this explicitly | Pass |
| Dashboard has a Connect Device entry point | Deployed bundle contains the card and CTA | Bundle-verified |
| Device setup handoff carries MicroDAO context | Deployed bundle contains `deviceIntent` handling | Bundle-verified |
| Real backend device pairing invite exists | Not implemented | Expected gap |
| Real Dashboard device status from backend exists | Not implemented | Expected gap |
| Edge pairing backend contract exists | Not implemented | Expected gap |

## Mismatches And Gaps

### Gap 1: Authenticated Dashboard click-through not exercised

The deployed Dashboard bridge is present in the live bundle, but this validation
did not use an authenticated browser session with an active MicroDAO membership.
Therefore the real UI sequence:

```text
/dashboard
-> Connect Device
-> /install?deviceIntent=...
```

is not fully user-click verified.

Severity:

```text
MEDIUM
```

Why it matters: the bundle can contain correct code while real account,
membership, routing, or deployment state could still block the visible journey.

### Gap 2: Device pairing remains non-authoritative

The current `deviceIntent` handoff is intentionally display-safe and
non-authoritative. It does not create a real Edge pairing invitation, device
record, or backend readiness state.

Severity:

```text
EXPECTED BLOCKER
```

This is the next planned milestone, not a regression in PR #6.

## Product Readiness Status

```text
Dashboard bridge deployment: VERIFIED
Install context handoff assets: VERIFIED
Authenticated live click-through: PENDING
Real device invite/status backend: NOT IMPLEMENTED
Edge pairing backend contract: NOT IMPLEMENTED
Local Agent Runtime: BLOCKED
Worker Node: BLOCKED
```

## Recommendation

Before opening the backend/API milestone, run one manual authenticated UX pass:

```text
1. Sign into 1.daarion.city.
2. Use an account with an active MicroDAO membership.
3. Open /dashboard.
4. Confirm the Connect Device card is visible.
5. Click Prepare device.
6. Confirm navigation to /install?deviceIntent=...
7. Confirm the MicroDAO context banner appears.
```

If that manual pass succeeds, the next milestone is:

```text
product: backend-backed device pairing invitation and status
```

If it fails, open a narrow fix PR for the exact Dashboard or routing blocker.
