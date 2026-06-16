# Sprint: Guardian-managed Billing Plan Config (F4C)

- `[x]` Add i18n translation keys in `src/lib/i18n.ts`
- `[x]` Create config hook `useBillingPlanConfig` in `src/lib/cryptoBilling.ts`
- `[x]` Update `src/pages/Pricing.tsx` to use active configuration
- `[x]` Update `src/pages/Billing.tsx` to use active configuration
- `[x]` Update `src/components/billing/CryptoPaymentIntent.tsx` to load live config and snapshot values at creation time
- `[x]` Update `src/pages/admin/AdminBilling.tsx` with "Billing Plan Configuration" editor section
- `[x]` Verify typescript compilation and build locally
- `[x]` Perform smoke verification checks

# Sprint: Billing Config UI Verification & Patch (F4C-S0)

- `[x]` Part 1: Inspect hook definition and dynamic usage across pages
- `[x]` Part 2: Confirm database connectivity and RPC accessibility
- `[x]` Part 3: Verify form update and save validations
- `[x]` Part 4: Run typecheck and production build successfully

# Sprint: Guardian Admin Agent Chat (F4B)

- `[x]` Add i18n translation keys in `src/lib/i18n.ts`
- `[x]` Implement `src/hooks/useAdminAgentContext.ts` for live platform telemetry (Overview, Billing, Access Requests, Platforms Agents, and Team invites)
- `[x]` Implement dynamic multi-language agent responses (en, uk, ru, es) based on live telemetry in `src/pages/admin/AdminAgent.tsx`
- `[x]` Add right column "Platform Context Panel" with live aggregated telemetry inside AdminAgent
- `[x]` Verify production build and TypeScript compilation
