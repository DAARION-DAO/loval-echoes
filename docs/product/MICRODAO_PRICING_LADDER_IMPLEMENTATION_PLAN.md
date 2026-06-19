# DAARION MicroDAO Pricing Ladder Implementation Plan

Status: product implementation planning

Date: 2026-06-19

Owner repo for user-facing product journey: `loval-echoes`

Depends on:

- `docs/product/MICRODAO_PRICING_REVIEW.md`
- `docs/product/MICRODAO_PRICING_RECOMMENDATION.md`

Scope: docs-only planning. No billing implementation, payment integration,
smart contract change, frontend change, backend change, Edge Client change,
Local Agent Runtime work, or Worker Node work is included.

## Final Classification

```text
PRICING LADDER DEFINED FOR IMPLEMENTATION
```

## Purpose

This document converts the approved pricing architecture into an implementation
plan before any code, billing, database, or UI changes are made.

The product decision is:

```text
2 DAAR/month is not the normal public Leader price.
2 DAAR/month is a permanent Founding price for the first 10 approved MicroDAOs.
```

## Approved Pricing Ladder

| Plan | Plan key | Price | Member limit | Intended use |
| --- | --- | ---: | ---: | --- |
| Participant | `participant` | Free | By invitation | Join and participate in an existing MicroDAO. |
| Founding | `founding` | `2 DAAR/month` | Up to 50 by approval | First 10 approved MicroDAOs, permanent founding price. |
| Starter | `starter` | `5 DAAR/month` | 10 | Small MicroDAO teams and early communities. |
| Community | `community` | `15 DAAR/month` | 25 | Growing MicroDAOs with more activity and moderation load. |
| Leader | `leader` | `30 DAAR/month` | 50 | Full active MicroDAO leadership tier. |
| Organization | `organization` | `100+ DAAR/month` | Custom | Multi-community or institution-scale cases. |

At the current repo-assumed rate of `1 DAAR = 10 USD`, this maps to:

| Plan | DAAR | USD equivalent |
| --- | ---: | ---: |
| Founding | 2 | 20 |
| Starter | 5 | 50 |
| Community | 15 | 150 |
| Leader | 30 | 300 |
| Organization | 100+ | 1000+ |

## Non-Negotiable Product Rules

### Rule 1: Founding Scarcity

The Founding plan is only for the first 10 approved MicroDAOs.

```text
Founding = permanent early access price
not public stable pricing
```

### Rule 2: Founding Permanence

The first 10 approved MicroDAOs keep `2 DAAR/month` permanently while:

- the MicroDAO remains active;
- the owner remains in good standing;
- usage stays within fair-use policy;
- the plan is not transferred without manual approval.

### Rule 3: Dashboard Access Stays Separate

Pricing changes must not make device readiness a Dashboard gate.

```text
Dashboard access = account + allowed MicroDAO membership
Device-powered actions = connected and healthy device
```

### Rule 4: Worker Node Is Separate

Worker Node rights are not bundled into MicroDAO pricing.

Worker Node remains a separate advanced/operator program until trust, reward,
and operator contracts exist.

### Rule 5: No Silent Unlimited Claims

Future UI copy should not say "unlimited participant invitations" unless the
product truly supports unlimited paid usage.

Recommended future copy:

```text
Member invitations up to your plan limit
```

## Plan Entitlement Model

Minimum plan entitlement fields:

| Field | Meaning |
| --- | --- |
| `plan_key` | Stable identifier: `founding`, `starter`, `community`, `leader`, `organization`. |
| `price_daar` | Monthly price in DAAR. |
| `price_usd` | USD-equivalent display value. |
| `member_limit` | Maximum approved members for the MicroDAO. |
| `active_microdao_limit` | Number of active MicroDAOs included. |
| `included_agent_count` | Number of included active agents. |
| `ai_budget_label` | User-safe budget label, not raw token details. |
| `memory_quota_label` | User-safe memory/RAG quota label. |
| `device_limit` | Included connected device count once device status is implemented. |
| `is_public` | Whether the plan appears in public pricing. |
| `requires_manual_approval` | Whether the plan must be approved by team/guardian. |
| `is_permanent_founder_price` | Whether the price is permanently locked for approved founding MicroDAOs. |

Recommended initial entitlements:

| Plan | Active MicroDAOs | Agents | AI budget | Memory/RAG | Devices later | Manual approval |
| --- | ---: | ---: | --- | --- | ---: | --- |
| Founding | 1 | 1 | Founding fair-use | Basic | Early access | Yes |
| Starter | 1 | 1 | Small | Basic | 1 | No |
| Community | 1 | 1 | Medium | Medium | 2-3 | No |
| Leader | 1 | 1 | Higher | Higher | 3-5 | No |
| Organization | Custom | Custom | Custom | Custom | Custom | Yes |

Do not expose raw token budgets in the first public UI unless usage tracking and
support processes are ready.

## Current Repo State To Preserve

Verified current implementation facts:

- `src/lib/subscriptionTypes.ts` defines `LEADER_PLAN` as `20 USD / 2 DAAR`.
- `src/lib/cryptoBilling.ts` has local fallback constants for `20 USD / 2 DAAR`.
- `supabase/migrations/20260616120000_billing_plan_configs.sql` seeds a single
  `leader` config with `20 USD / 2 DAAR`.
- `src/pages/Pricing.tsx` renders the current Leader plan through billing
  config.
- `src/pages/MicroDAOOnboarding.tsx` still allows testing-mode MicroDAO creation
  while crypto billing is being verified.

This planning milestone does not change those facts.

## Migration Strategy

### Phase 1: Plan Config Design

Create an implementation PR that only defines the target plan config model and
migration strategy.

Do not change public UI yet.

Expected output:

- database migration plan for multiple plan rows;
- plan key list;
- entitlement fields;
- rollback approach;
- test plan.

### Phase 2: Database Config Migration

Add database-backed plan configs for:

- `founding`;
- `starter`;
- `community`;
- `leader`;
- `organization`.

Rules:

- preserve the existing active `leader` behavior until UI and billing are ready;
- do not silently convert existing subscriptions;
- add any new fields additively;
- keep rollback simple.

### Phase 3: Billing Selection Logic

Teach billing logic to select a plan by `plan_key`.

Rules:

- keep the existing Leader payment flow working;
- do not enforce member limits until the plan entitlement model is connected;
- do not add smart contract changes;
- do not change payment assets in this milestone.

### Phase 4: Pricing UI Copy

Update public pricing after backend/config readiness.

Required copy changes:

- show Founding as limited/permanent for first 10 approved MicroDAOs;
- show Starter, Community, Leader, Organization;
- replace "unlimited participant invitations";
- avoid promising device, Local Agent, or Worker Node features before their
  contracts are implemented.

### Phase 5: Entitlement Enforcement

Only after plan configs and copy are stable:

- enforce member limits;
- expose upgrade prompts;
- support downgrade rules;
- record plan changes clearly.

This should be a separate milestone because enforcement can affect active users.

## Transition Rules

### Existing 2 DAAR Users

Before implementation, decide whether existing active `2 DAAR` subscriptions are
classified as:

```text
Founding
```

or remain:

```text
Legacy Leader
```

Recommendation:

```text
If they are among the first 10 approved MicroDAOs, classify them as Founding.
Otherwise treat them as legacy and migrate manually.
```

### Upgrade Rules

Recommended:

- Starter -> Community when member count or usage requires it;
- Community -> Leader when approaching 25 members or higher activity;
- Leader -> Organization when more than 50 members or multi-MicroDAO use is
  required.

### Downgrade Rules

Recommended:

- downgrades apply at next billing period;
- downgrade blocked if current member count exceeds target plan limit;
- downgrade never deletes data automatically;
- user gets clear instructions to reduce members or choose a higher plan.

### Founding Transfer Rule

Founding price is not automatically transferable.

Manual approval is required for:

- ownership transfer;
- MicroDAO sale/assignment;
- suspicious account changes;
- abnormal usage patterns.

## Implementation Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Breaking current Leader billing | High | Keep existing `leader` config untouched until multi-plan flow is ready. |
| User confusion over Founding vs Leader | Medium | Public copy must clearly say Founding is first-10 only. |
| Existing subscriptions misclassified | High | Add explicit migration decision before database changes. |
| Member limit enforcement blocks active users | High | Enforce limits only after transition policy is reviewed. |
| Device features overpromised | Medium | Keep device language as future/included-later until backend status exists. |
| Worker Node bundled too early | High | Keep Worker Node in a separate advanced/operator program. |

## Explicit Non-Goals

Do not implement in the pricing ladder milestone:

- payment processor changes;
- smart contracts;
- DAAR token economics changes;
- Local Agent Runtime;
- Worker Node onboarding;
- device pairing backend;
- Dashboard device status backend;
- Genesis expansion;
- organization billing automation.

## Acceptance Criteria For Future Implementation

A future implementation PR is ready only when:

- plan keys are stable;
- Founding permanence policy is explicitly encoded or documented;
- existing `leader` subscribers have a migration decision;
- public pricing copy matches plan limits;
- billing can create an intent for a selected plan;
- member limits are not enforced until an explicit enforcement milestone;
- no Worker Node or device feature is falsely included as ready.

## Recommended Next PR

After this planning document is reviewed, the next narrow implementation PR
should be:

```text
product: add pricing ladder config schema
```

Scope:

- database/config planning or additive schema only;
- no public UI switch yet;
- no payment integration changes beyond plan key support if explicitly needed;
- no smart contracts.

If the team is not ready to touch database configuration, the safer next PR is:

```text
docs/ui-copy: prepare pricing ladder copy
```

but it should remain copy-only and should not change billing behavior.
