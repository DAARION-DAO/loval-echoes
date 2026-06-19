# DAARION MicroDAO Value Proposition Audit

Status: product/business positioning audit

Date: 2026-06-19

Owner repo for user-facing product journey: `loval-echoes`

Depends on:

- `docs/product/MICRODAO_PRICING_REVIEW.md`
- `docs/product/MICRODAO_PRICING_RECOMMENDATION.md`
- `docs/product/MICRODAO_PRICING_LADDER_IMPLEMENTATION_PLAN.md`
- `docs/product/CONNECT_DEVICE_CONTRACT.md`
- `docs/product/DASHBOARD_ENTRY_REQUIREMENTS.md`

Scope: docs-only product positioning audit. No pricing change, billing
implementation, payment integration, smart contract change, frontend change,
backend change, Edge Client change, Local Agent Runtime work, or Worker Node
work is included.

## Final Classification

```text
VALUE PARTIALLY CLEAR
```

## Question

```text
Can a new user understand why a MicroDAO costs money?
```

Answer:

```text
Partially.
```

A new user can infer that the product includes an AI-assisted MicroDAO workspace,
but the current pricing copy is still too feature-led. It does not clearly
explain the paid outcome: a MicroDAO helps a leader coordinate people, preserve
decisions, turn knowledge into action, and keep a community operating without
constant manual follow-up.

## Audited Surfaces

| Surface | File | Current role |
| --- | --- | --- |
| Pricing page | `src/pages/Pricing.tsx` | Renders public plan cards from `pricingExtra` copy and billing config. |
| Pricing translations | `src/lib/i18n.ts` | Contains plan titles, descriptions, feature bullets, and access-program copy in supported languages. |
| Billing page | `src/pages/Billing.tsx` | Repeats Leader Plan price and selected feature bullets. |
| Onboarding billing panel | `src/pages/MicroDAOOnboarding.tsx` | Shows Leader Plan Activation and testing-mode billing note. |
| Pricing docs | `docs/product/MICRODAO_PRICING_RECOMMENDATION.md` | Defines Founding, Starter, Community, Leader, Organization ladder. |
| Implementation planning | `docs/product/MICRODAO_PRICING_LADDER_IMPLEMENTATION_PLAN.md` | Defines future plan keys, limits, transition rules, and implementation phases. |

## Current Pricing Message

The current public pricing message is roughly:

```text
Choose your MicroDAO development stage.
Leader Plan gives 1 active MicroDAO, Community Spirit AI, basic memory/RAG,
invitations, tasks, knowledge base, group chats, and crypto billing.
```

This is useful, but it answers:

```text
What features are included?
```

better than:

```text
What pain does this remove?
What result does the leader get?
Why does the price increase by plan?
```

## Feature Language Vs Outcome Language

| Current feature language | User outcome that should be clearer |
| --- | --- |
| `1 active MicroDAO` | One operational space where a group can coordinate around shared goals. |
| `Community Spirit (AI Assistant)` | A persistent helper that remembers context, explains decisions, and keeps the group aligned. |
| `Basic memory / RAG for knowledge` | The community stops losing agreements, context, files, and reasoning across chats. |
| `Unlimited participant invitations` | The leader can bring people into the workspace up to the plan limit without manual setup chaos. |
| `Tasks, knowledge base, and group chats` | Conversations become accountable work, decisions, and shared memory. |
| `Crypto billing: DAAR, USDT, USDC, POL` | Payment is crypto-native and aligned with DAARION's ecosystem. |
| `Founder Program` | Early users can shape the product and lock scarce founding access. |
| `Partner Access` | Operators can manage multiple client/community spaces. |
| `Sovereign / Network` | Larger organizations can plan private infrastructure and advanced governance later. |
| `Worker Node` | Technical operators can apply for a separate infrastructure role, not a normal MicroDAO plan. |

## User Understanding Checklist

### What is a MicroDAO?

Current state:

```text
Partially clear.
```

The UI says "MicroDAO", "Community Spirit", "workspace", "chats", "tasks", and
"knowledge base", but it does not yet define MicroDAO in one simple outcome
sentence on the pricing surface.

Recommended framing:

```text
A MicroDAO is a shared operating space for a community: people, memory, tasks,
decisions, and an AI helper that keeps the work moving.
```

### What problem does it solve?

Current state:

```text
Partially clear.
```

The current copy names tools, not the user's pain. It should more directly speak
to:

- scattered chats;
- forgotten decisions;
- unclear responsibilities;
- repeated onboarding explanations;
- community leaders carrying all coordination work manually;
- knowledge that is spread across files, messages, and people's memory.

### Why is it worth paying for?

Current state:

```text
Weak.
```

The pricing page lists included capabilities, but does not yet connect price to
economic value:

- saves leader time;
- reduces coordination overhead;
- keeps members aligned;
- turns community knowledge into answers and actions;
- preserves continuity as more members join;
- creates a foundation for device/local runtime later.

### Why do plans differ?

Current state:

```text
Not clear enough.
```

The current implementation still shows one `Leader Plan` and advanced access
programs. The approved ladder is defined in docs, but public copy does not yet
explain why:

```text
10 members -> Starter
25 members -> Community
50 members -> Leader
```

The plan difference should be explained as:

```text
More people means more conversations, more memory, more decisions, more agent
work, and more coordination load.
```

## Current Value Gap

The current pricing language sells a bundle of tools:

```text
AI assistant
RAG
Invitations
Chats
Tasks
Knowledge base
```

The product should sell a result:

```text
Your community becomes an operating system: members know where to go, decisions
are remembered, tasks move forward, and the leader is not the only person
holding the context.
```

## Plan-Specific Gaps

### Founding

Gap:

The current "Founder Program" language talks about priority and influence, but
the new Founding MicroDAO plan is a pricing tier with permanent scarcity for the
first 10 approved MicroDAOs. These are related, but not identical.

Need:

Make clear that Founding is:

- a real MicroDAO subscription;
- first-10 only;
- permanent pricing while active and policy-compliant;
- not a Worker Node or investor/governance promise.

### Starter

Gap:

Current UI has no Starter plan. When introduced, it must not feel like a reduced
feature list only.

Need:

Position Starter as:

```text
Get a small group out of scattered chat and into one shared operating rhythm.
```

### Community

Gap:

Current UI has no midpoint between small group and full 50-member Leader plan.

Need:

Position Community as:

```text
Keep a growing community aligned before coordination breaks down.
```

### Leader

Gap:

Current Leader copy is feature-complete but outcome-light.

Need:

Position Leader as:

```text
Run a serious 50-member MicroDAO with persistent memory, accountability, and
AI-assisted coordination.
```

### Organization

Gap:

Current Sovereign/Network copy describes infrastructure and modules, but not the
business reason to go custom.

Need:

Position Organization as:

```text
Coordinate multiple communities or institution-scale operations with custom
limits, support, and future infrastructure options.
```

## Payment Justification By Plan

| Plan | Why someone pays |
| --- | --- |
| Founding | To lock scarce early access and build a serious first MicroDAO with product influence. |
| Starter | To stop running a small community through scattered chats and manual reminders. |
| Community | To coordinate a growing group where memory, onboarding, and decisions start to break down. |
| Leader | To run an active 50-member workspace where the AI helper, memory, tasks, and chats carry real operating load. |
| Organization | To coordinate multiple or larger communities with custom support, limits, and future infrastructure. |

## Recommended Positioning Principle

Every plan should answer this sequence:

```text
Who is this for?
What problem does it remove?
What operating result does the user get?
What limit explains the price?
What is not included yet?
```

## Current Risk

If pricing is implemented before value positioning is clarified, users may read
the plan as:

```text
Pay DAAR for some AI/chat features.
```

The intended reading should be:

```text
Pay DAAR to operate a community with shared memory, AI-assisted coordination,
and a path toward connected devices and future local agents.
```

## Audit Conclusion

The value is present in the product direction, but the pricing copy should be
rewritten around outcomes before the new ladder is exposed publicly.

Recommended next step:

```text
docs/ui-copy: prepare outcome-first pricing copy
```

Do not change billing, smart contracts, or payment flow until the outcome-first
copy is approved.
