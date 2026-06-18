# UI Copy Audit: Device Connection Language

Status: copy and information-architecture alignment

Related decision: `docs/planning/UNIFIED_DAARION_PWA_DEVICE_CONNECTION_JOURNEY.md`

## Scope

This audit aligns user-facing language with the product decision that
`https://1.daarion.city` is the normal DAARION PWA entry point and that users
should think "Connect Device", not "Install Edge Client".

This change does not implement pairing, backend behavior, runtime behavior,
Genesis changes, authentication changes, or Edge Client changes.

## Copy Changes

| Location | Current wording | Recommended wording | Rationale |
| --- | --- | --- | --- |
| `src/lib/i18n.ts` navigation | Install Client | Connect Device | Sidebar and public navigation should name the user task, not the technical client. |
| `src/lib/i18n.ts` public nav | Client | Device | Keeps the public header short while avoiding a separate-client mental model. |
| `src/pages/Install.tsx` hero | DAARION Edge Client | Connect your device to DAARION | The page can keep its route, but the first message should be device connection. |
| `src/pages/Install.tsx` primary CTA | Download for this device | Prepare this device | The user is preparing a device; native download is only one possible path. |
| `src/pages/Install.tsx` secondary CTA | Open Web / PWA | Open device setup on web | Avoids exposing the PWA split as the primary product model. |
| `src/pages/Install.tsx` platform section | Choose your platform | Prepare your device | The decision is about device readiness, not platform shopping. |
| `src/pages/Install.tsx` native section | Native Installers | Native app when needed | Native install becomes an escalation for local capabilities. |
| `src/pages/Install.tsx` follow-up section | What happens after installation? | What happens after connecting a device? | Aligns the path with the product journey. |
| `src/pages/Install.tsx` unlocks section | What Edge Client unlocks | What a connected device unlocks | Explains outcome without requiring the user to understand Edge Client. |
| `src/pages/Start.tsx` footer | DAARION Edge Client | Connect Device | Public landing footer should match the unified journey. |
| `src/pages/AgentDirectory.tsx` CTA/footer | Client / DAARION Edge Client | Device / Connect Device | Agent-directory users should see the same path language. |
| `src/pages/AgentDirectory.tsx` privacy agent copy | Edge Client layer | connected device layer | Device-level privacy is clearer than product/runtime naming. |
| `src/lib/i18n.ts` MicroDAO explanation | local deployment via DAARION Edge Client | device connection for local capabilities | Keeps MicroDAO explanation product-centered. |
| `src/lib/i18n.ts` pricing features | Edge Client infrastructure/modules | connected-device infrastructure / Device modules | Pricing should describe capabilities, not repo/runtime boundaries. |

## Deferred Copy Areas

These are intentionally not implemented in this PR because they would require
workflow or feature changes:

- a new `/connect-device` route;
- a Dashboard device status card;
- a post-onboarding "Connect device" next-step card;
- MicroDAO-generated device pairing invite payloads;
- real device readiness state in `loval-echoes`.

Until those contracts exist, copy should avoid promising that pairing can be
completed from the MicroDAO PWA.

## Consistency Review

Target story after this copy pass:

```text
Landing / 1.daarion.city
-> Create or join MicroDAO
-> Connect Device
-> Prepare Device
-> Device Ready
-> Activate Local Agent
-> Optional Worker Node
```

The UI should avoid asking normal users to understand:

- backend;
- registry;
- pairing internals;
- localhost;
- runtime architecture;
- repository boundaries.

Technical terms remain acceptable only in developer-oriented sections, release
links, logs, or source-code references.

## Remaining Product Gap

The copy can now point users toward "Connect Device", but the actual
MicroDAO-to-device pairing contract is still not implemented in `loval-echoes`.
The next feature PR should not fake pairing locally. It should either define the
pairing payload contract or add a clearly disabled/pending device connection
surface.
