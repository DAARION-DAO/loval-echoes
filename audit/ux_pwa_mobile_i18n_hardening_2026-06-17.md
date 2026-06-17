# UX / PWA / Mobile / i18n Hardening Audit

Date: 2026-06-17

Scope: repo-level frontend hardening for public site, app shell UX, PWA readiness, mobile layout, visible i18n, asset/chunk weight, and tester handoff. This audit intentionally excludes F3C.2 watcher work, DAARION Holder Gate, pricing changes, Supabase migrations, RLS/security policy changes, private MicroDAO messages/documents/memory/RAG chunks, and agent prompts.

## Implemented In This Pass

| Area | Severity | Target screens | Change | Acceptance criteria |
| --- | --- | --- | --- | --- |
| Public mobile header | High | `/`, `/pricing`, `/install`, `/agents` at 390/430px | Replaced repeated page headers with shared `PublicHeader`; mobile now shows logo, language selector, compact primary CTA, and menu. | No clipped CTA at 390px; nav remains reachable through menu; touch targets are at least 40px and visually sized for mobile. |
| PWA update UX | Medium | Installed PWA / repeat visits | Added `PwaUpdatePrompt` and service-worker update-ready event. | A waiting SW can surface a visible update prompt instead of relying on console output. |
| Offline fallback | Medium | PWA offline navigation | Added `/offline.html`; SW v3 precaches it and falls back to it when navigation cache misses. | Offline navigation shows a branded fallback instead of a blank/failing page. |
| PWA manifest | Medium | Browser install UI | Added manifest screenshots; converted `.png` icon files from JPEG data to real PNG dimensions. | Manifest has non-empty screenshots; icons match declared PNG type and size. |
| Push permission | High | Authenticated app settings / notification hooks | Removed automatic notification permission prompt during initialization. | Push permission request happens only through explicit user action. |
| Billing/admin visible i18n | Medium | `/billing`, `/admin/billing`, crypto payment intent | Replaced obvious EN-only labels/toasts with existing `identity` and `cryptoBilling` keys. | Identity checklist, backend verification toasts, manual review badge, and guardian queue CTA use translation data. |
| Pricing visible i18n | Low | `/pricing` | Grouped short hardcoded pricing labels into a 4-language local copy map without changing billing config. | Visible labels no longer fall back to English-only except intentional product names. |

## Module Findings And Backlog

| Module | Severity | Finding | Recommendation | Acceptance criteria |
| --- | --- | --- | --- | --- |
| Public site | High | Header actions were duplicated per page and too wide for 390px mobile. | Keep shared `PublicHeader`; add responsive image `srcset`/lazy loading for below-the-fold media. | No horizontal overflow at 390/430/768/1280; hero media loads correctly and non-critical images are lazy. |
| Auth / onboarding | Medium | Some onboarding copy and actions are long on mobile; step flow can feel form-heavy. | Add stepper/progress state, sticky mobile action row, and shorter per-step guidance. | Users can identify current step and next action without scrolling back to the top. |
| App shell / navigation | High | Main app nav has many modules and guardian/admin access can feel mixed with normal workflows. | Consolidate top header/drawer/bottom nav, group guardian/admin under secondary access, verify 44px touch targets. | Normal users see primary workflows first; guardian/admin links are present but visually separated. |
| Dashboard | Medium | Quick actions mix create/operate/configure intents; decorative density competes with status. | Group quick actions by intent and surface status-first blocks. | A returning user can see current status and next operational action in the first viewport. |
| Chat / messenger | High | Composer and voice/upload controls need live mobile keyboard testing. | Make composer keyboard-safe, compact attachment/voice popover, and add pagination/virtualization for long chats. | Composer remains visible with mobile keyboard; long chats do not cause noticeable UI jank. |
| Projects / tasks / Kanban | High | Drag-and-drop is desktop-first and cards risk cramped mobile layout. | Add list-first mobile view with quick filters; keep DnD desktop-first. | Mobile cards show priority, deadline, owner, and status without horizontal scroll. |
| Knowledge base / import | Medium | Upload/indexing state should be unified across import and KB screens. | Add shared status model for indexed/processing/failed and empty states with next action. | Empty and processing states explain exactly what to do next. |
| Billing | High | Payment flow is functionally present but should read as a guided sequence. | Convert visual flow into stepper: identity -> intent -> pay -> submit hash -> secure verify -> result. Do not change pricing. | Users can identify current payment stage and recovery action after error/manual review. |
| Integrations / settings | Medium | Real integration status and local/demo state can be visually similar. | Separate real integrations from local/demo saved state; show last sync and reconnect/disconnect actions. | Users can tell what is actually connected. |
| Admin / Guardian | High | Wide tables are hard on mobile; verifier/manual fallback need strong visual distinction. | Add mobile card view, filters/status chips, and separate secure verifier from manual fallback actions. | Guardian can review payment state on mobile without horizontal table scanning. |
| PWA | High | Manual SW/manifest improved, but installability should be checked in browser and Lighthouse. | Verify install/offline/update on Chrome desktop and Android; add maskable-safe icon if visual crop is poor. | Browser reports installable PWA, correct icons, offline fallback, and no unsolicited permission prompts. |
| i18n | High | `i18n.ts` is very large and some pages keep local dictionaries. | Phase in module dictionaries or add an i18n coverage script for visible text. | UK/EN/RU/ES visible UI parity is measurable and missing strings are reported in CI/build review. |
| Performance | High | `dist` and media/chunks remain heavy; real-time voice meeting SDK was removed in the follow-up pass. | Convert/compress large media, review main imports, and set bundle budgets. | Main app chunk and media size budgets are tracked in future PRs. |

## Validation Plan For Testers

- Public pages: test `/`, `/pricing`, `/install`, `/agents` at 390, 430, 768, and 1280 widths.
- PWA: verify install prompt, installed launch, offline navigation fallback, and update prompt after SW version change.
- Languages: switch UK/EN/RU/ES on public pages and billing/admin paths; record visible untranslated labels.
- Authenticated app: check normal-user app shell, guardian admin shell, billing UI, and payment verification UI without changing price config.
- Mobile: verify no horizontal overflow, no clipped CTA/header actions, readable cards, and usable touch targets.

## Implementation Phases

1. Quick wins completed in this pass: shared public header, PWA fallback/update prompt, manifest screenshots, real PNG icons, push opt-in behavior, targeted Billing/Admin/Pricing visible i18n.
2. Core app UX pass: app shell navigation, dashboard quick-action grouping, onboarding stepper, billing stepper, mobile-safe chat composer, KB/import empty/status states.
3. Heavy module pass: projects/tasks mobile list view, admin mobile card view, integrations/settings clarity, i18n module split or coverage script.
4. Optimization pass: media conversion/compression, bundle/chunk review, production log cleanup, bundle-size budget checks.

## Guardrails

- No Supabase migrations were added.
- No RLS/security policies were changed.
- No pricing config was changed.
- No Edge Functions were changed.
- No private MicroDAO messages, documents, memory, RAG chunks, or agent prompts were touched.
