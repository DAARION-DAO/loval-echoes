# Android Login Failure Audit

Date: 2026-06-19

Repository: `DAARION-DAO/loval-echoes`

Scope: audit only. No source code, backend, auth, Edge Client, Local Agent Runtime, or Worker Node changes were made.

## Final Classification

P0

## Answer

Can a new Android Chrome user reliably log in today?

No.

Testers reported a runtime crash during Android Chrome login. The current repository does not contain first-party `removeChild` calls, which means the visible exception is most likely thrown from React/vendor DOM reconciliation while unmounting or replacing nodes during the auth flow.

## Reported Tester Failure

Tester-reported Android Chrome error:

```text
Failed to execute 'removeChild' on 'Node':
The node to be removed is not a child of this node.
```

Russian UI/screenshot equivalent:

```text
Не удалось выполнить команду 'removeChild' для узла 'Node':
удаляемый узел не является дочерним по отношению к этому узлу
```

Reported context:

```text
Android
Chrome
Login / Вхід
```

## Evidence From Current Repository

### 1. No first-party `removeChild` call exists

Search across `src`, `public`, and built output did not find a handwritten app call that removes DOM nodes directly.

The current live bundle contains the token `removeChild`, but that comes from bundled vendor/runtime code, not from first-party source.

Classification: frontend runtime issue, not an explicit app-level DOM API call.

### 2. Auth flow has several unmount/remount triggers

`src/components/AuthForm.tsx` can rapidly replace auth UI sections based on:

- `user` state redirecting to `/`;
- `attemptAutoLogin()` redirecting to `/`;
- password reset mode based on URL/hash;
- `showResendButton`;
- `showForgotPassword`;
- Radix `Tabs` switching between sign-in and sign-up;
- direct DOM query/click to switch tabs:

```tsx
const signinTab = document.querySelector('[value="signin"]') as HTMLButtonElement;
if (signinTab) signinTab.click();
```

These are not necessarily wrong, but they create several mutation-heavy paths during a sensitive mobile login flow.

Classification: frontend issue.

Severity: P0, because login can crash before the user reaches the product.

### 3. Auth route is wrapped by a global ErrorBoundary that exposes raw exception text

`src/App.tsx` wraps the app in `ErrorBoundary`.

`src/components/ErrorBoundary.tsx` displays:

```tsx
{error.message}
```

That explains why a low-level DOM exception is shown directly to the user instead of a product-safe recovery screen.

Classification: frontend/product error handling issue.

Severity: P0/P1.

### 4. PWA service worker can keep Android on stale runtime code

`src/main.tsx` registers `/sw.js`.

`public/sw.js` caches:

- `/`
- `/manifest.json`
- `/offline.html`
- icons
- runtime JS/CSS/image assets with stale-while-revalidate.

The current live bundle is:

```text
assets/index-BTzYX569.js
```

But Android Chrome/PWA testers can still be running a cached previous bundle until the service worker update prompt is accepted or the cache is cleared.

Classification: deployment/PWA cache issue.

Severity: P0/P1 for live tester reliability.

### 5. External DOM mutation remains a plausible trigger

The screenshot text was reported in Russian while current Ukrainian/English routes are being tested. Android Chrome can translate pages in-place. Browser translation is a known class of React crash trigger because it mutates text nodes outside React's ownership; React later tries to remove a node that the browser translator already replaced.

This is not proven from repository evidence alone, but it is consistent with:

- Android Chrome context;
- translated Russian browser error;
- React/vendor `removeChild` exception;
- no first-party `removeChild` source call.

Classification: likely frontend/browser interaction issue.

Severity: P0 until reproduced or ruled out.

## Reproducibility Status

Not fully reproduced in this audit because the report came from tester screenshots and no real Android device/browser session with console logs was available in this run.

Minimum reproduction matrix:

```text
Device: Android phone
Browser: Chrome stable
Route: https://1.daarion.city/auth
State A: clean browser profile, no translation
State B: browser translation enabled
State C: installed PWA / existing service-worker cache
Action: sign in, switch auth tabs, use password reset link if relevant
Expected: no React ErrorBoundary, no blank screen, no DOMException
```

## Root Cause Summary

The most likely source is a React DOM reconciliation failure in the auth route, triggered by one or more of:

- mobile Chrome translation mutating DOM nodes;
- stale service-worker cached bundle;
- auth redirect/unmount race between `attemptAutoLogin`, `user` effect, and tab content;
- Radix Tabs content replacement under mobile conditions;
- direct DOM tab-switching via `querySelector(...).click()`.

The exact trigger still requires Android console evidence.

## Remediation Plan

### Immediate P0 Fix Track

1. Reproduce on real Android Chrome or BrowserStack with console logs.
2. Test with Chrome translation disabled and enabled.
3. Clear service worker/cache and compare against a fresh profile.
4. Capture:
   - route;
   - bundle hash;
   - console stack trace;
   - service worker state;
   - language/translation state.

### Implementation Candidate After Reproduction

1. Replace direct DOM tab switching with controlled React state for auth tabs.
2. Honor `?signup=true` via React state instead of DOM clicks.
3. Add `translate="no"` to the auth form container if Chrome translation is confirmed as the trigger.
4. Avoid rendering raw DOM exception text to users on public auth routes.
5. Add a product-safe auth error fallback:

```text
We could not complete sign-in on this browser. Refresh and try again, or contact support.
```

6. Add an Android Chrome smoke test checklist for:

```text
/auth -> sign in -> redirect
/auth?signup=true -> signup tab
forgot password panel
PWA cached old bundle update prompt
```

## Product Readiness

Current status:

```text
Android Chrome login reliability: BLOCKED
Public onboarding: BLOCKED
Pricing/billing work: BLOCKED
Connect Device backend work: BLOCKED
Local Agent Runtime Foundation: BLOCKED
```

## Recommendation

Open one narrow fix PR only after reproduction evidence is captured, or combine it with the early-access signup fix if the implementation remains small:

```text
fix: stabilize auth entry and Android login lifecycle
```

The fix should not include pricing, billing, Connect Device backend, Edge Client, Local Agent Runtime, or Worker Node work.
