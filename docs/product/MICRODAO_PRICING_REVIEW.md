# DAARION MicroDAO Pricing Review

Status: product/business review

Date: 2026-06-19

Owner repo for user-facing product journey: `loval-echoes`

Scope: docs-only. No billing implementation, payment integration, smart
contract change, frontend copy change, backend change, Edge Client change, Local
Agent Runtime work, or Worker Node work is included.

## Final Classification

```text
PRICING SHOULD BE RESTRUCTURED
```

The current `2 DAAR / month` Leader Plan is acceptable as an early founding
price, but it is too low and too flat to be the durable public price for a
MicroDAO with AI assistant behavior, memory/RAG, collaboration, member invites,
future device support, and future agent/runtime usage.

## Question

```text
Is 2 DAAR/month economically and strategically correct?
```

Answer:

```text
No, not as the normal long-term Leader price.
```

It should be treated as a limited founding/early-access price, not as the stable
market price for the product.

## Verified Current Product Facts

The current pricing and billing model found in the repo:

| Area | Evidence | Current behavior |
| --- | --- | --- |
| Public pricing page | `src/pages/Pricing.tsx` | Renders a free Participant tier, a Leader Plan, Founder Program, Partner, Sovereign, and Worker Node entries. |
| Leader Plan constants | `src/lib/subscriptionTypes.ts` | `Leader Plan`, `priceUsd: 20`, `priceDaar: 2`, `daarUsdRate: 10`, monthly period. |
| Billing config fallback | `src/lib/cryptoBilling.ts` | `LEADER_PLAN_USD = 20`, `LEADER_PLAN_DAAR = 2`, `DAAR_USDT_RATE = 10`. |
| Billing plan config table | `supabase/migrations/20260616120000_billing_plan_configs.sql` | Seeds `leader` with `20 USD`, `2 DAAR`, `10` DAAR/USDT rate, Polygon payment network. |
| Subscription table defaults | `supabase/migrations/20260613100000_identity_crypto_foundation.sql` and later billing migrations | `microdao_subscriptions` defaults to plan `leader`, `20.00` USD, `2.0` DAAR. |
| Payment flow | `src/components/billing/CryptoPaymentIntent.tsx` | Creates subscription and crypto payment intent, then waits for manual or backend verification. |
| Onboarding billing gate | `src/pages/MicroDAOOnboarding.tsx` | Shows Leader Plan Activation, but testing mode keeps MicroDAO creation available while crypto billing is verified. |
| Pricing page features | `src/lib/i18n.ts`, `src/pages/Pricing.tsx` | Leader Plan includes 1 active MicroDAO, Community Spirit AI, basic memory/RAG, participant invitations, tasks, knowledge base, group chats, crypto billing. |
| Member invite default | `src/services/communityMembers.ts`, `src/pages/Participants.tsx`, `src/pages/MicroDAOOnboarding.tsx` | Invitation code defaults commonly use `maxUses = 50` or `code_max_uses: 50`. |
| Product device roadmap | `docs/product/CONNECT_DEVICE_CONTRACT.md`, `docs/product/DASHBOARD_ENTRY_REQUIREMENTS.md` | Device connection and backend-backed device status are defined as product contracts, but not fully implemented. |

## Current Plan Shape

Current user-visible model:

```text
Participant
Free for invited members

Leader Plan
2 DAAR / month
$20 equivalent
1 active MicroDAO
Community Spirit AI
Basic memory / RAG
Invitations
Tasks
Knowledge base
Group chats

Founder / Partner / Sovereign / Worker Node
Invitation, manual review, or technical positioning
```

The product is already more than a simple chat subscription. It is positioned as
a MicroDAO workspace with an AI assistant, memory, collaboration surfaces, and a
future device/runtime path.

## Strategic Problem

`2 DAAR / month` compresses several different economic units into one low flat
price:

- one active MicroDAO;
- up to the current 50-person invite scale;
- Community Spirit AI;
- RAG/memory;
- knowledge and file-related storage surfaces;
- chats and tasks;
- future device connection;
- future local agent activation;
- future Worker Node eligibility paths.

That price is useful for adoption, but weak as a durable revenue model because
it does not distinguish between:

- a 3-person experimental MicroDAO;
- a 10-person starter community;
- a 50-person operational community;
- a community with active agents and storage;
- a community using device/runtime features.

## Economic Pressure Areas

### 1. AI Usage

AI cost scales with:

- chat/message volume;
- number of members using the assistant;
- RAG retrieval and answer generation;
- summaries, reports, task automation, and agent actions;
- future multi-agent routing.

Risk:

```text
2 DAAR/month can be consumed quickly by active AI usage if no budget or quota
exists.
```

Pricing implication:

- each paid tier should include a clear monthly AI budget or fair-use envelope;
- high usage should become an add-on or higher plan trigger;
- raw token accounting can remain internal at launch, but the product needs a
  usage boundary.

### 2. Storage And Memory

Memory/RAG cost scales with:

- document count;
- embeddings;
- file storage;
- conversation retention;
- vector index growth;
- backups and compliance retention.

Risk:

```text
Flat pricing without storage limits encourages unbounded memory growth.
```

Pricing implication:

- early tiers should include conservative storage and memory limits;
- long-term pricing should make storage a quota dimension, not the primary
  mental model for users.

### 3. Community Scale

Member count affects:

- active chat volume;
- number of profiles and memberships;
- invites and approvals;
- permission complexity;
- support burden;
- assistant context complexity.

The current 50-member maximum is a useful tier boundary. A plan with up to 50
members should not be priced like a solo or 3-person experiment.

Pricing implication:

```text
Member count should be the primary simple pricing axis for early market.
```

### 4. Future Agent Usage

Future agent usage may include:

- multiple active agents;
- specialized agents;
- agent routing;
- automation;
- reports and scheduled actions;
- tool/API calls.

Risk:

```text
If all agent usage is bundled into 2 DAAR/month, DAARION loses the ability to
fund the agent layer.
```

Pricing implication:

- include one Community Spirit Agent in every paid MicroDAO plan;
- price additional active agents separately later;
- avoid promising unlimited active agents in the base Leader tier.

### 5. Future Local Device Support

The Connect Device contract separates Dashboard access from device readiness.
Device support may introduce:

- device pairing/status backend records;
- diagnostics;
- release support;
- installer support burden;
- runtime compatibility support;
- future local model orchestration.

Pricing implication:

- allow one prepared device in Starter;
- include more devices in Leader;
- charge additional device profiles or advanced runtime features separately;
- keep native install optional until a user needs local/privileged capabilities.

### 6. Future Worker Node Support

Worker Node is not a normal MicroDAO collaboration feature. It implies:

- platform trust;
- operator verification;
- node health requirements;
- workload rules;
- possible rewards or economic flows;
- higher support and abuse risk.

Pricing implication:

```text
Worker Node should remain outside ordinary MicroDAO pricing until the trust,
reward, and operator contracts exist.
```

## Evaluation Of Updated Pricing Ladder

Recommended ladder:

```text
Founding:
2 DAAR/month
First 10 MicroDAO
Permanent founding price for those first 10 MicroDAO

Starter:
5 DAAR/month
Up to 10 members

Community:
15 DAAR/month
Up to 25 members

Leader:
30 DAAR/month
Up to 50 members
```

Assessment:

| Plan | Assessment |
| --- | --- |
| Founding at 2 DAAR | Strong scarcity-based early-adopter offer if limited to the first 10 MicroDAO and kept permanently for that cohort. |
| Starter at 5 DAAR | Good bridge from adoption to sustainability for small groups. |
| Community at 15 DAAR | Important midpoint between 10 and 50 members; prevents a sharp jump from Starter to Leader while pricing higher activity, memory, and moderation load. |
| Leader at 30 DAAR | Strategically defensible for 50-member communities because it prices the product as an operational workspace, not a simple chat. |

At the repo's current implied rate of `1 DAAR = 10 USD`, the ladder maps to:

| Plan | DAAR | USD equivalent |
| --- | ---: | ---: |
| Founding | 2 | 20 |
| Starter | 5 | 50 |
| Community | 15 | 150 |
| Leader | 30 | 300 |

This makes `Community` roughly `6 USD/member/month` at the 25-member cap and
`Leader` roughly `6 USD/member/month` at the 50-member cap. That keeps the
per-member economics consistent while acknowledging that 25 active members
create substantially more chat, memory, agent, and moderation load than a
10-member Starter MicroDAO.

The `Community` midpoint also avoids forcing users to jump directly from `5
DAAR` to `30 DAAR`. That makes the ladder easier to adopt while preserving a
sustainable price for the full 50-member Leader tier.

## Should Pricing Depend On These Dimensions?

| Dimension | Launch recommendation | Rationale |
| --- | --- | --- |
| Number of members | Yes, primary axis | Easy for users to understand and maps to usage/support cost. |
| Number of active agents | Yes, but later | Include one Community Spirit Agent first; charge for extra active agents when registry/routing are real. |
| Storage | Yes, as quota/fair-use | Do not lead with storage pricing, but define limits to prevent unbounded RAG costs. |
| Activity level | Yes, internally first | Track usage and enforce fair-use before showing complex metered pricing. |
| Device count | Yes, after device status is real | Include a small number of devices per tier; add more later. |
| Worker Node participation | Separate program | Should not be bundled into normal MicroDAO pricing. |

## Current Copy/Product Mismatch

The pricing translation currently says "unlimited participant invitations" for
Leader Plan, while the product context states a maximum of 50 members per
MicroDAO and invite defaults commonly use `50`.

This is not fixed in this PR because the task is docs-only, but it should be
resolved before changing public pricing copy.

Recommended wording later:

```text
Member invitations up to your plan limit
```

## Risks If Current Pricing Stays Flat

| Risk | Severity | Reason |
| --- | --- | --- |
| Active communities become structurally unprofitable | High | AI/RAG/support cost can exceed a flat low fee. |
| Users anchor DAARION as a cheap chatbot | High | Product value is MicroDAO operating layer, not a single assistant. |
| Later price increase feels punitive | Medium | Early users may expect 2 DAAR to remain the normal price. |
| Device and Worker Node features become impossible to fund | High | Runtime and trust support costs need pricing headroom. |
| Plan boundaries remain unclear | Medium | Current pricing does not explain member, device, storage, or usage limits. |

## Review Conclusion

The correct interpretation is:

```text
2 DAAR/month = permanent founding access price for the first 10 MicroDAO
not durable Leader Plan price
```

DAARION should restructure pricing before public growth so early adoption stays
attractive without underpricing the product's agent, memory, collaboration, and
future device/runtime layers.
