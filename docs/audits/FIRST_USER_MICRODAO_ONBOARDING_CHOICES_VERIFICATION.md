# First-User MicroDAO Onboarding Choices Verification

## Status

Classification: `FIRST_USER_CHOICES_CLARIFIED`

This verification records the first implementation pass after the MicroDAO-first MVP hierarchy decision.

## Changed Surfaces

- Auth signup copy now explains that the user creates a free DAARION account first.
- The signup CTA now says that the user is creating a free account, not a MicroDAO.
- Password recovery help remains available for returning users, but no longer dominates the `/auth?signup=true` first-user path.
- The no-membership onboarding lobby now presents four clear first-user choices:
  - Create MicroDAO
  - Join MicroDAO
  - Apply / wait for access
  - View Dashboard after MicroDAO membership
- The MicroDAO creation card now states that MicroDAO creation is a separate gated action.
- The device connection note states that Connect Device is not the first step for a new account.

## Product Boundary

Account signup is free and does not automatically create a MicroDAO.

MicroDAO creation remains a separate gated action for a community, team, or organization.

Device pairing remains unavailable until the user has approved MicroDAO membership and the device connection service is active.

## Excluded From MVP

Personal Agent / DAARION Citizenship without MicroDAO remains post-MVP.

This implementation does not add:

- Personal Agent activation
- `personal_citizen` pairing context
- DAARION City Citizens system community
- device pairing without MicroDAO membership
- automatic MicroDAO creation during account signup

## Verification Notes

The route guard still sends signed-in users without MicroDAO membership to the onboarding lobby. This is intentional for the MVP because Dashboard and Connect Device are MicroDAO-scoped in the current product model.

Connect Device remains secondary for first users without approved MicroDAO membership. No pairing code should be generated from the first-user onboarding choices alone.

## Next Validation Gate

After merge and publish, run a live first-user pass:

```text
Landing
→ create free account / early access
→ onboarding lobby
→ confirm MicroDAO-first choices
→ confirm Connect Device is not primary before membership
```
