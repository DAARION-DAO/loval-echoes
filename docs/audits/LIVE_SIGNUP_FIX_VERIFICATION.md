# Live Signup Fix Verification

Date: 2026-06-19

Repository: `DAARION-DAO/loval-echoes`

Scope: verification only. No source code, backend, billing, payment, Edge Client, Local Agent Runtime, Worker Node, branch, commit, or PR changes were made.

## Context

PR #13 was merged into `main`:

```text
e7f28da9b0522f667aeafc8fdbf28310087dccda
```

Lovable publish was executed after the merge.

This verification checks whether the P0 early-access signup fix is now live on:

```text
https://1.daarion.city
```

## Final Classification

P0 FIX VERIFIED

## Answer

Can a new user now reliably reach the signup form from the public site?

Yes.

The deployed site now serves the PR #13 bundle. The `/auth` and `/auth?signup=true` routes both resolve to the updated bundle, and the deployed JavaScript contains the exact controlled-tab behavior needed for:

```text
/auth
-> Sign In

/auth?signup=true
-> Early Access / signup form
```

The old misleading quota-limit copy is no longer present in the deployed bundle, and the user-facing early-access limit copy is present for quota/limit error handling.

## Deployment Verification

Live root route:

```text
https://1.daarion.city/?codex-cache-bust=signup-fix-verify
```

Current live assets:

```text
assets/index-B9C_9WVc.js
assets/index-B7Y1mqJo.css
```

Deployment ID observed in response headers:

```text
cbc2a3ac-1163-4351-8571-3fb1dc64d0c3
```

This is newer than the previously observed pre-fix bundle:

```text
assets/index-BTzYX569.js
```

The live JavaScript asset was downloaded and checked:

```text
https://1.daarion.city/assets/index-B9C_9WVc.js
status: 200
size: 702834 bytes
```

## Route Verification

### `/auth`

Checked:

```text
https://1.daarion.city/auth?codex-cache-bust=auth-node-check
```

Observed:

```text
status: 200
deployment-id: cbc2a3ac-1163-4351-8571-3fb1dc64d0c3
assets/index-B9C_9WVc.js
assets/index-B7Y1mqJo.css
```

Expected behavior from deployed bundle:

```text
Sign In tab active
login form visible
```

### `/auth?signup=true`

Checked:

```text
https://1.daarion.city/auth?signup=true&codex-cache-bust=signup-node-check
```

Observed:

```text
status: 200
deployment-id: cbc2a3ac-1163-4351-8571-3fb1dc64d0c3
assets/index-B9C_9WVc.js
assets/index-B7Y1mqJo.css
```

Expected behavior from deployed bundle:

```text
Early Access tab active
signup form visible immediately
manual tab switching not required
```

## Bundle Behavior Evidence

The deployed bundle contains the controlled auth-tab decision:

```text
s.get("signup")==="true"?"signup":"signin"
```

The deployed signup form contains:

```text
display-name
signup-email
signup-password
```

The deployed auth labels contain:

```text
Sign In
Early Access
```

This matches the local PR #13 smoke result where:

```text
/auth
-> Sign In selected

/auth?signup=true
-> Early Access selected
```

## Copy Verification

New user-facing early-access copy is present in the deployed bundle:

```text
Ранній доступ тимчасово обмежено. Ми відкриваємо нові місця поступово. Залиште заявку або спробуйте пізніше.
```

```text
Early access is temporarily limited. We are opening new spots gradually. Leave a request or try again later.
```

Old misleading quota/message-limit copy is absent from the deployed bundle:

```text
Ви перевищили ліміт створення спільнот.
Ви перевищили ліміт створення повідомлень.
You have exceeded the limit for creating communities.
```

The signup page should not show any quota or limit banner by default. The early-access copy is reserved for actual quota/limit error handling.

## Tooling Note

The in-app browser verification path timed out while attaching to live tabs in this Codex environment. A fallback headless Chrome attempt also failed in this environment before producing usable rendered DOM evidence.

This is recorded as a verification tooling limitation, not as an application failure, because:

- the live HTML routes return `200`;
- both routes serve the PR #13 bundle;
- the bundle hash matches the locally smoke-tested PR #13 build;
- the deployed bundle contains the exact query-param controlled-tab logic;
- the deployed bundle contains the expected signup inputs;
- the deployed bundle no longer contains the old misleading quota copy.

## Result

```text
P0 signup entry blocker: CLOSED
Deployment truth: VERIFIED
Bundle truth: VERIFIED
Rendered live browser smoke from this environment: TOOLING LIMITED
```

## Recommendation

Proceed to the next product validation gate:

```text
Authenticated Dashboard
-> Connect Device
-> Install handoff
-> Pairing path
```

Do not reopen pricing, billing, Local Agent Runtime, Worker Node, or Android `removeChild` work as part of this signup fix.
