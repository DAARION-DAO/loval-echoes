# Tester Smoke Checklist: UX / PWA / Mobile / i18n

Target commit: `0faa00b`

Scope: post-publish Lovable smoke test for the UX/PWA/mobile/i18n hardening pass and Agora removal. Do not run live Polygon payment tests in this checklist unless a separate F3C.1 live payment run is explicitly assigned.

## Guardrails

- Do not change pricing.
- Do not apply migrations.
- Do not modify RLS/security policies.
- Do not rotate keys.
- Do not test private MicroDAO messages, documents, memory, RAG chunks, or agent prompts.
- Do not test F3C.2 scheduled watcher or DAARION Holder Gate.

## 1. Public Pages

Test widths: 390, 430, 768, 1280.

Pages:
- `/`
- `/pricing`
- `/install`
- `/agents`

Expected:
- Header CTA is not clipped at 390px.
- No horizontal page overflow.
- Language selector remains usable.
- Mobile menu opens and links route correctly.
- Primary CTA remains reachable.
- Logo/title do not overlap header actions.
- Browser console has no critical runtime errors.

## 2. PWA

Expected:
- App is installable in a supported browser.
- Manifest loads and includes screenshots.
- Icons render correctly and are not rejected as invalid image type.
- Offline navigation shows the branded offline fallback page instead of a blank failure.
- Push notification permission is not requested automatically on first load.
- Push permission prompt appears only after an explicit user action.

## 3. Languages

Languages:
- UK
- EN
- RU
- ES

Expected:
- Public pages stay usable after switching language.
- Billing visible labels use localized text where changed in this pass.
- Admin billing verifier toasts/manual-review labels do not show unexpected English-only text, except product names.
- Record any remaining untranslated visible UI as backlog, not as a blocker unless it blocks the user flow.

## 4. Normal User App Shell

Pages:
- `/dashboard`
- `/chats`
- `/billing`
- `/settings`

Expected:
- Normal user can navigate without broken routes.
- `/chats` no longer shows an Agora voice meeting button.
- Existing chat text and voice-message flows still render if available.
- `/billing` identity checklist is readable on mobile.
- Secure verifier button is visible when a payment intent flow reaches that state.

## 5. Guardian / Admin

Pages:
- `/admin`
- `/admin/billing`

Expected:
- Guardian routes still open for guardian account.
- Billing intents remain visible.
- Backend verifier action is still present.
- Manual fallback actions remain present and visually clear:
  - `Approve manually`
  - `Reject manually`
- No horizontal overflow blocks critical payment review actions on mobile.

## 6. Agora Removal

Expected:
- No Agora voice meeting UI appears in `/chats`.
- No browser network call to `agora-token`.
- No Agora SDK chunk is loaded.
- No console error mentioning Agora.

## 7. Build/Runtime Notes

Known acceptable warning:
- Browserslist/caniuse-lite may be stale during local build.

Blockers:
- Critical runtime error on first page load.
- Header CTA clipped on 390px public pages.
- PWA install rejected due to invalid manifest/icons.
- Automatic push permission prompt on first load.
- Missing Guardian manual fallback buttons.
- Any visible service/private key in frontend output.

## Result Template

```txt
Commit tested:
Environment:
Browser/device:

Public pages:
PWA:
Languages:
Normal user shell:
Guardian/admin:
Agora removal:
Console errors:
Blockers:
Non-blocking backlog:
Ready for next phase: yes/no
```
