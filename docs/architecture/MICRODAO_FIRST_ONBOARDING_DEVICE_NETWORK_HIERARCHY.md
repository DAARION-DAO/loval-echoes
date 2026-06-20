# MicroDAO-First Onboarding And Device Network Hierarchy

Status: product architecture decision

Date: 2026-06-20

Owner repo for product journey: `loval-echoes`

Related runtime repo: `daarion-edge-client`

Scope: docs-only. No Auth UI, Dashboard UI, route, Supabase migration, RPC,
generated type, pricing, billing, Edge Client, Local Agent Runtime, Worker Node,
Genesis, Lovable publish, or backend profile change is included.

## Final Classification

```text
MICRODAO_FIRST_HIERARCHY_DEFINED
```

The MVP product hierarchy is:

```text
User Account
-> MicroDAO Membership
-> Device Pairing
-> MicroDAO Agent / Node
-> DAARION Network
```

The MVP formula is:

```text
MicroDAO + device + approved membership = DAARION network node
```

## Decision Summary

DAARION MVP should stay MicroDAO-first.

A user can create a free account without creating a MicroDAO, but device pairing
is not a universal first-user action. Pairing codes are created only after the
user has approved MicroDAO membership and an active device backend profile
exists.

This keeps the product focused on the current implementation and avoids opening
a parallel Personal Agent / Citizenship product path before the MicroDAO journey
is live and verified.

## Verified Current State

Current repo evidence:

- `docs/product/CONNECT_DEVICE_CONTRACT.md` defines device pairing as a
  MicroDAO-member action.
- `docs/product/DASHBOARD_ENTRY_REQUIREMENTS.md` states that an authenticated
  account without active MicroDAO membership cannot generate device pairing
  invitations or read MicroDAO-scoped device status.
- `docs/product/END_TO_END_USER_JOURNEY.md` maps the intended path as account,
  create or join MicroDAO, Dashboard, Connect Device, pairing, health, Genesis,
  and Dashboard continuation.
- `supabase/migrations/20260620070143_device_pairing_invites_status.sql`
  stores pairing invitations and device statuses with `community_id`, `user_id`,
  `created_by`, `membership_role`, and approved membership checks.

Therefore the current technical model is already MicroDAO/community-scoped, not
personal-citizen-scoped.

## Entity Boundaries

### User Account

The user's free authenticated account in the DAARION PWA.

Rules:

- Account signup is free.
- Account signup must not automatically create a MicroDAO.
- A free account may exist without MicroDAO membership.
- A free account alone cannot create device pairing codes.

### MicroDAO

A separate community, team, organization, or operating workspace.

Rules:

- MicroDAO creation is a gated action.
- The gate may be founding access, admin approval, invite, whitelist,
  subscription, or another explicit entitlement.
- MicroDAO creation must not be implied by account signup or personal device
  connection.

### MicroDAO Membership

The relationship between a user and a MicroDAO.

Rules:

- Device pairing requires approved MicroDAO membership.
- The Dashboard can show MicroDAO-scoped device status only for the selected
  MicroDAO context.
- Membership and community invitation codes remain separate from device pairing
  codes.

### Device Pairing

The act of issuing and consuming a short-lived device pairing code for the
selected MicroDAO context.

Rules:

- Pairing is MicroDAO-scoped in MVP.
- Pairing requires approved MicroDAO membership.
- Pairing also requires an active device backend profile.
- Connecting a device does not create or imply ownership of a MicroDAO.

### MicroDAO Agent / Node

The product-level result of combining an approved MicroDAO context with a paired
device and future agent/runtime capability.

Rules:

- A device becomes meaningful in DAARION MVP through a MicroDAO context.
- Agent/runtime capabilities should be presented as MicroDAO/node capabilities,
  not as a separate personal citizenship product.

## Post-MVP Concepts

The following concepts are explicitly out of MVP:

- Personal Agent / DAARION Citizenship without MicroDAO.
- `personal_citizen` pairing context.
- `DAARION City Citizens` system-community bridge.
- "Activate Personal Agent" as the default post-signup path.
- Personal device pairing that bypasses MicroDAO membership.

Guardrail:

```text
Do not implement Personal Agent / Citizenship UI until MicroDAO-first
onboarding, entitlement-gated MicroDAO creation, and MicroDAO-scoped device
pairing are live and verified.
```

## First-User Journey

The first-user journey should not start at Dashboard or Connect Device.

The MVP flow is:

```text
Landing
-> Create free account
-> Choose next step
-> Create MicroDAO / Join MicroDAO / Apply or wait for access / View Dashboard
-> Approved MicroDAO membership
-> Connect Device
-> MicroDAO node becomes ready
```

First-user choices after account creation should be:

```text
Create MicroDAO
Join MicroDAO
Apply / wait for access
View Dashboard
```

The UI must not offer "Activate Personal Agent" as an MVP primary action.

## Device Connection Rules

Connect Device should remain unavailable or safely blocked until both conditions
are true:

```text
approved MicroDAO membership
active device backend profile
```

If the user has a free account but no approved MicroDAO membership, the product
should explain that a device connects to a MicroDAO context and direct the user
to create, join, or request access.

If the user has approved MicroDAO membership but no active backend profile, the
Connect Device state should remain setup-required and must not generate a fake
pairing code.

## Entitlement Boundary

Account access and MicroDAO creation are different gates.

Free:

- create a user account;
- sign in;
- request access;
- join a MicroDAO when invited and approved;
- view allowed public/account surfaces.

Gated:

- create a MicroDAO;
- operate MicroDAO agents;
- connect devices to a MicroDAO;
- use team/community memory, RAG, automation, and higher limits;
- future Worker Node or commercial network participation.

## Implementation Guardrails

Do not implement the following in the next UI PR:

- Personal Agent activation.
- DAARION Citizenship onboarding.
- personal device pairing without MicroDAO membership.
- system-community bridge for personal users.
- backend profile creation.
- Supabase migration or RPC changes.
- Edge Client changes.
- Local Agent Runtime or Worker Node flows.

The next implementation PR should only clarify first-user choices around:

```text
Create MicroDAO
Join MicroDAO
Apply / wait for access
View Dashboard
```

`Connect Device` remains a MicroDAO-scoped action and must stay blocked until
approved MicroDAO membership and an active backend profile exist.

## Next Milestone

Recommended next implementation PR:

```text
fix: clarify first-user onboarding choices
```

Goal:

- make the first user understand that account signup is free;
- separate account creation from MicroDAO creation;
- present MicroDAO creation as a gated path;
- present joining MicroDAO as the invite path;
- keep device connection unavailable until MicroDAO membership and backend
  profile conditions are met.

Lovable publish is not required for this docs-only architecture decision.
