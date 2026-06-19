# Live Onboarding Failure Audit

Date: 2026-06-19

Repository: `DAARION-DAO/loval-echoes`

Scope: audit only. No source code, backend, auth, billing, Edge Client, Local Agent Runtime, or Worker Node changes were made.

## Final Classification

P0

## Answer

Can a new user reliably register and log in today?

No.

The current user path can expose confusing access-limit language during signup, ignores multiple `?signup=true` entry points, passes raw auth/backend errors directly to users, and still has unverified Android Chrome login crashes reported by testers. That is enough to block public onboarding until fixed and manually re-tested.

## Reported Tester Failure

Tester-reported issue:

```text
Ранній доступ
-> Ви перевищили ліміт створення повідомлень
```

From a normal user's point of view, this reads as a broken registration flow rather than an intentional early-access restriction.

## Evidence From Current Repository

### 1. Public CTA routes intend signup, but the auth form ignores the intent

Multiple user-facing CTA paths navigate to `/auth?signup=true`:

- `src/pages/Start.tsx` sends guest onboarding drafts to `/auth?signup=true`.
- `src/pages/Start.tsx` primary header CTA sends unauthenticated users to `/auth?signup=true`.
- `src/pages/Start.tsx` bottom onboarding CTA sends unauthenticated users to `/auth?signup=true`.
- `src/pages/Pricing.tsx` sends multiple unauthenticated pricing CTAs to `/auth?signup=true`.
- `src/components/PublicHeader.tsx` defaults unauthenticated primary action to `/auth?signup=true`.

However, `src/components/AuthForm.tsx` renders:

```tsx
<Tabs defaultValue="signin" className="w-full">
```

and does not read `window.location.search` or `useSearchParams()` to select the signup tab. A user who clicks "Ранній доступ" or "Почати" can land on the sign-in tab instead of the signup flow.

Classification: frontend/product issue.

Severity: P0, because the first action does not consistently open the expected registration state.

### 2. Signup shows MicroDAO limit copy before the user creates an account

`src/components/AuthForm.tsx` renders this banner inside the signup tab:

```tsx
{t.onboarding.errorLimitDesc}
```

Current Ukrainian translation in `src/lib/i18n.ts`:

```text
Ви перевищили ліміт створення спільнот.
```

This string is intended for authenticated MicroDAO creation limits in `src/pages/Start.tsx`, where `isOverLimit` checks:

```tsx
accessTier === 'early_access' && memberships.length >= 1
accessTier === 'community' && memberships.length >= 3
```

But in signup it is shown as a static informational banner before account creation. That makes the registration surface look blocked even when no actual registration attempt has occurred.

Classification: frontend/product copy issue.

Severity: P0, because it makes early access look closed or broken at the exact moment a new user is trying to enter.

### 3. Current main and live bundle differ from the reported text, but keep the same class of issue

The exact tester-reported Ukrainian phrase with "повідомлень" was not found in current `main` or the current live bundle.

Current live deployment check:

```text
https://1.daarion.city/?codex-cache-bust=onboarding-audit
-> assets/index-BTzYX569.js
```

The current live bundle contains:

```text
Ви перевищили ліміт створення спільнот.
You have exceeded the limit for creating communities.
Вы превысили лимит создания сообществ.
```

This means the tester screenshot likely came from one of:

- a stale cached PWA/service-worker bundle;
- an older deployed bundle;
- a different runtime/backend error path not represented in the current static bundle;
- browser translation of related copy.

The product issue remains: signup can still display a quota-limit message before the user understands whether registration is open, closed, or requires an invitation.

Classification: product/frontend/deployment-caching issue.

Severity: P0.

### 4. Raw Supabase auth errors are shown directly to the user

`src/components/AuthForm.tsx` passes `error.message` directly into destructive toasts for signup, login fallback, resend confirmation, password reset, and password update paths.

Examples:

- signup generic path: `description: error.message`
- login fallback path: `description: error.message`
- resend confirmation path: `description: error.message`
- password reset path: `description: error.message`

That means backend/Auth provider wording can appear as product copy. If Supabase or a deployed auth policy returns a quota/rate-limit message, the user sees it without a DAARION-specific explanation or recovery path.

Classification: frontend/product error handling issue, with backend/config dependency.

Severity: P0 for onboarding reliability.

### 5. Profile approval semantics are inconsistent

The auth/profile creation paths disagree:

- `src/hooks/useAuth.tsx` creates missing profiles with `approval_status: 'pending'`.
- `src/hooks/useSessionRecovery.ts` creates missing profiles with `approval_status: 'pending'`.
- `src/hooks/useUserApprovalStatus.tsx` creates missing profiles with `approval_status: 'approved'` and `access_tier: 'early_access'`, but then sets local state to `pending`.
- Later migrations include auto-approval behavior, but runtime hooks still preserve contradictory client-side assumptions.

Route guards in `src/App.tsx` block only `rejected` and `blocked`, while `pending` users can still be routed toward onboarding if they have no membership.

Classification: product/backend-contract/frontend-state issue.

Severity: P0/P1. It may not be the direct cause of the screenshot, but it makes clean-user onboarding state non-authoritative and hard to explain.

## Not Found

No evidence was found that public signup directly calls the `auth-security`, `login-fix`, or `auto-register` Supabase functions. The active `AuthForm` uses Supabase Auth client calls directly:

- `supabase.auth.signUp`
- `supabase.auth.signInWithPassword`
- `supabase.auth.resend`
- `supabase.auth.resetPasswordForEmail`

No direct tie was found between registration and AI message quota enforcement in the current frontend. The visible issue is primarily mislabeled/incorrectly placed quota copy plus raw auth errors, not a confirmed AI usage quota gate.

## Root Cause Summary

The registration experience does not have a single explicit product state for early access.

Instead, it combines:

- signup CTAs that do not reliably open signup;
- MicroDAO creation limit copy shown inside account signup;
- raw backend/Auth errors shown directly to users;
- inconsistent profile approval defaults;
- possible stale PWA bundle exposure on mobile.

This makes a blocked or limited state look like a broken website.

## Remediation Plan

### Immediate P0 Fix

1. Make `AuthForm` honor `?signup=true` and open the signup tab.
2. Remove `t.onboarding.errorLimitDesc` from the signup form.
3. Replace it with explicit early-access copy:

```text
DAARION is in early access. Create your account first; MicroDAO creation may require approval or an invitation.
```

4. Map Supabase Auth errors to DAARION product-safe messages instead of showing raw `error.message`.
5. Add a specific "registration temporarily limited" state if signup is intentionally restricted.

### Follow-up P0/P1 Fix

1. Define one source of truth for new-user approval:
   - open registration;
   - waitlist;
   - invite-only;
   - founder/advanced access.
2. Remove contradictory client-side profile creation semantics.
3. Add a clean-user smoke test:

```text
Landing -> Early Access -> signup tab -> create account -> onboarding state
```

4. Add live deployment/PWA cache verification for mobile testers.

## Product Readiness

Current status:

```text
New-user registration reliability: BLOCKED
Public onboarding: BLOCKED
Pricing/billing work: BLOCKED
Connect Device backend work: BLOCKED
Local Agent Runtime Foundation: BLOCKED
```

## Recommendation

Open one narrow fix PR:

```text
fix: repair early-access signup entry and onboarding limit copy
```

Do not continue pricing, billing, Connect Device backend, Local Agent Runtime, or Worker Node work until a clean new-user account can reach the intended onboarding state without confusing quota messages.
