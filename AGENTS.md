# Repository Instructions: loval-echoes

## Scope and source of truth

These instructions apply to this repository unless a more specific nested `AGENTS.md` overrides them.

- Identify this repository and read its `README`, relevant `docs/`, manifests, configuration, and source before proposing or making changes.
- Treat repository evidence as authoritative. Keep verified facts, inferences, and recommendations distinct.
- Do not import architecture, terminology, schemas, endpoints, or business rules from another project without an explicit, versioned contract in this repository.
- Prefer bounded, reversible vertical slices. Preserve existing conventions and working behavior.
- Never expose credentials, keys, tokens, private endpoints, infrastructure topology, or operational evidence in code, documentation, logs, diffs, or reports.

## Canonical sovereign-agent baseline

- Read `docs/audits/SOVEREIGN_AGENT_BASELINE_AUDIT_2026-07-04.md`,
  `docs/architecture/SYSTEM_CONTEXT_AND_OWNERSHIP.md`, and
  `docs/planning/SOVEREIGN_AGENT_MASTER_ROADMAP.md` before sovereign-agent work.
- The baseline is a read-only source snapshot, not production verification.
- Phase 1A local-only inference is the only eligible next runtime milestone and
  belongs to `daarion-edge-client`. It still requires its own plan and human
  review. Phase 1B and later work remains `NO_GO` until separately authorized.
- Pairing and readiness projections require separate future threat-driven ADRs;
  current UI, SQL, types, and documentation do not close their security gates.

## Repository boundary

`loval-echoes` is the product web and control layer for the DAARION Sovereign Agent pipeline.

It may own:

- authenticated product experience, MicroDAO onboarding, and membership views;
- Dashboard and Connect Device journeys;
- device-pairing invitation UI and safe readiness projections;
- user-facing agent controls and privacy controls.

It must not own:

- local model execution or raw local agent memory;
- local Loop Runtime execution, private run state, checkpoints, or scheduling;
- private cryptographic keys or wallet signing;
- Reticulum runtime or an LXMF mailbox;
- unrestricted local tools or native worker execution;
- live private infrastructure configuration.

The web layer must not present planned, simulated, or optimistic states as verified device capability. Privileged pairing payloads must be purpose-specific, validated, revocable, and signed or verified by an authoritative backend contract. A community invitation is not device-pairing authorization.

The web layer may expose user controls and versioned safe loop/readiness
projections. It must not execute, resume, cancel, or mutate local workflows except
through an explicit authenticated contract owned and enforced by the edge runtime.

## Local-first and public/private policy

- Private sovereign-agent inference is local-first. Remote inference must never occur silently or through an implicit fallback.
- Any future remote inference requires an explicit policy, visible user approval, and safe disclosure of what data may leave the device.
- Keep raw prompts, private memory, private keys, wallet material, and sensitive local evidence out of Supabase and browser-visible state.
- Dashboard projections must be minimal, safe summaries whose provenance and freshness are explicit.
- Octelium, if referenced, is only an external secure-access layer; it does not replace decentralized transport and must not leak deployment truth into this public repository.

## Mandatory phase workflow

For every implementation phase:

1. Read all active `AGENTS.md` files and relevant skills.
2. Invoke `$daarion-phase-planner` and create `docs/planning/phases/<phase-id>-plan.md` before application-code changes.
3. Inspect the real implementation and git state; list assumptions, risks, blockers, ownership, contracts, acceptance criteria, tests, and non-goals. Confirm the applicable baseline audit has been completed and human-reviewed; otherwise stop at audit/planning with `NO_GO` for application implementation.
4. Continue only when the written plan is `GO`, or `CONDITIONAL_GO` with no unresolved security blocker.
5. Select only the domain skills relevant to the phase. Do not require unrelated skills.
6. Implement the complete bounded vertical slice and no broader architecture.
7. Run narrow tests first, then repository-required lint, typecheck, build, contract, and security checks as applicable.
8. Review the complete diff, update architecture/ADR/roadmap/status documentation, and write `docs/planning/phases/<phase-id>-completion.md`.
9. Invoke `$daarion-release-gate`. Never claim completion if required checks failed or evidence is missing.

Always use `$daarion-testing`, `$daarion-security-review`, `$daarion-documentation`, and `$daarion-release-gate` for implementation phases. Use these when relevant:

- `$daarion-cross-repo-contracts` for pairing, deep links, shared schemas, revocation, or readiness projections;
- `$daarion-supabase-contracts` for Supabase schema, Auth, RLS, RPC, Edge Function, or projection work;
- `$daarion-repository-auditor` for baseline, readiness, mock, TODO, or documentation-consistency audits.

## Change and release gates

- Do not add a production dependency without explicit justification in the phase plan and lockfile review.
- Do not perform destructive migrations. Database changes require an authorized phase, reversible migration plan, RLS review, and verification against the intended project.
- Do not deploy, publish, apply migrations, change repository settings, or open a pull request automatically.
- Validate every frontend-to-backend boundary. A URL, client-supplied user ID, or browser state is never authorization evidence.
- Do not claim a feature is implemented because documentation, naming, mocks, or UI states describe it.
- If a required check cannot run, record the exact blocker and safest verification command; the release gate cannot be `PASS`.
