# Phase 00: Sovereign Agent Baseline Adoption Plan

## Objective

Adopt the human-approved 2026-07-04 sovereign-agent audit decision as a documentation baseline for `loval-echoes` and its contract with `daarion-edge-client`. Establish canonical ownership, claim-status language, security gates, ADRs, and a phased roadmap without changing application behavior.

## Current State

- The repository is on `docs/repository-role-card` at commit `0f16a31841eebde3545eaf1cd58fb2ef40dd800a`, authored 2026-07-04.
- Tracked files are clean. Existing untracked repository instructions, DAARION skills, roadmap, and phase reports are preserved as prior documentation work.
- `docs/REPOSITORY_ROLE.md` identifies this repository as the web product/control layer.
- Source evidence includes Supabase-authenticated product flows, distinct community and device invitation paths, device readiness UI/contracts, and cloud-assisted web AI functions.
- The complete original audit report is not present in the checked repositories or supplied attachments. The supplied human approval and current source evidence can be adopted, but missing audit prose must not be reconstructed or presented as recovered evidence.

## Scope

- Create the canonical 2026-07-04 baseline audit adoption record.
- Document target architecture, system context, ownership, public/private boundaries, capability status, claim status, threat model, security gates, roadmap, and open questions.
- Record ADRs for local-first inference, SQLite runtime-state foundation, and the Reticulum/LXMF integration boundary.
- Split the first implementation milestone into Phase 1A, 1B, and 1C.
- Preserve cloud-assisted web AI as a separate trust domain from Edge local-first inference.
- Cross-link relevant existing repository-role and device-connection documents.

## Explicit Non-Goals

- No TypeScript, React, SQL migration, Supabase Edge Function, configuration, dependency, CI, deployment, or repository-setting changes.
- No inference, memory database, Agent Supervisor, loop runtime, tools, identity, wallet, worker, Reticulum/LXMF, pairing, or readiness implementation.
- No remote service, deployed schema, private infrastructure, or production-readiness verification.
- No claim that the unavailable full audit artifact was recovered.

## Repository Ownership

`loval-echoes` owns authenticated product experience, MicroDAO context, onboarding, Dashboard, Connect Device, pairing invitation UI, user-facing controls, privacy controls, and safe readiness projections. It does not own local model execution, raw local memory, private keys, wallet signing, Reticulum/LXMF runtime, unrestricted local tools, or native worker execution.

`daarion-edge-client` owns the local Tauri/Rust sovereign runtime and publishes only bounded, safe projections to the web layer. Cross-repository contracts remain explicit and versioned; neither repository imports the other's private state or implementation internals.

## Files and Modules Expected to Change

Documentation only:

- `docs/audits/SOVEREIGN_AGENT_BASELINE_AUDIT_2026-07-04.md`
- `docs/architecture/SOVEREIGN_AGENT_TARGET_ARCHITECTURE.md`
- `docs/architecture/SYSTEM_CONTEXT_AND_OWNERSHIP.md`
- `docs/architecture/CAPABILITY_STATUS_MATRIX.md`
- `docs/architecture/PUBLIC_PRIVATE_BOUNDARIES.md`
- `docs/planning/SOVEREIGN_AGENT_MASTER_ROADMAP.md`
- `docs/planning/OPEN_QUESTIONS.md`
- `docs/security/THREAT_MODEL.md`
- `docs/security/SECURITY_GATES.md`
- `docs/adr/0001-local-first-inference-and-remote-consent.md`
- `docs/adr/0002-local-runtime-state-and-sqlite-foundation.md`
- `docs/adr/0003-reticulum-lxmf-integration-boundary.md`
- `docs/planning/phases/phase-00-baseline-adoption-completion.md`

No application module is expected to change.

## Contracts Affected

No executable contract changes. Documentation will define future requirements for versioned device-pairing invitations, safe readiness projections, revocation, local-only inference policy, and a future authenticated transport IPC boundary. Existing behavior remains classified from source evidence rather than upgraded by documentation.

## Security Considerations

- Treat web cloud-assisted AI and Edge local-first inference as different trust domains.
- Do not publish secrets, private endpoints, infrastructure topology, credentials, keys, user data, raw memory, or wallet material.
- Document gates for pairing, tools, transport IPC, wallet signing, worker leases, model artifacts, and autonomous loops.
- Mark confirmed evidence separately from hypotheses and unresolved questions.
- Keep Supabase authorization dependent on authenticated identity, membership checks, RLS, and grants; documentation does not prove deployed policy state.

## Migration and Compatibility Considerations

This phase contains no migrations and makes no compatibility change. Future contract/schema changes require versioning, migration design, rollback, cross-repository fixtures, and separate human review.

## Implementation Steps

1. Capture repository snapshot and evidence limitations.
2. Create common status vocabularies and apply them consistently.
3. Document repository ownership and trust boundaries.
4. Create the capability matrix and claim-drift table from verified source paths.
5. Record the target architecture and phased roadmap, including 1A/1B/1C.
6. Record threat model, security gates, and ADR decisions.
7. Cross-link existing product/device documents without rewriting runtime claims.
8. Validate paths, links, status vocabulary, scope, sensitive-data exclusions, and diff boundaries.
9. Produce the completion report and release-gate result.

## Tests

- Verify every required document exists.
- Verify required capability and claim-status tokens are used consistently.
- Verify ADR numbers are unique and all ADR links resolve.
- Search changed documentation for secrets, private-key material, credentials, machine-specific paths, and private infrastructure details.
- Confirm `git diff --name-only` contains documentation/instruction paths only and no application, migration, dependency, CI, or deployment file.
- Run repository-provided documentation-safe or security-safe checks only where they do not install dependencies or modify application state.

## Acceptance Criteria

- All required baseline documents exist and agree on ownership, statuses, and phase ordering.
- Findings cite exact repository paths and symbols where available.
- Cloud web AI is not mislabeled as Edge local inference.
- The missing original audit artifact is disclosed as a provenance limitation.
- Phase 1A, 1B, and 1C are separate and no later phase is authorized.
- Application implementation remains `NO_GO`; only the narrowly defined Phase 1A may proceed after separate plan and human review.
- Documentation release gate returns `PASS` or a fully explained `CONDITIONAL_PASS`; required-check failure cannot be reported as `PASS`.

## Rollback Strategy

Remove only the new Phase 00 documentation files after review. No source, schema, dependency, runtime state, or deployment rollback is required.

## Documentation Updates

This phase is documentation-only. The documents listed above become the reviewable baseline; existing `README` claims are inventoried for later correction rather than modified unless a contradiction would otherwise make the new baseline unsafe.

## Open Questions

- Where is the complete approved audit report, if it must be preserved verbatim as a separate immutable artifact?
- What is the canonical versioned device-pairing schema shared by both repositories?
- What exact safe readiness projection fields may leave the device?
- Which future ADR will separately decide pairing and readiness projection contracts?
- What platforms and secure-storage guarantees are mandatory for the first Edge release?

## GO / CONDITIONAL_GO / NO_GO

`CONDITIONAL_GO` for this documentation-only baseline adoption. Conditions: preserve the missing-audit-artifact limitation, make no application changes, and do not reinterpret documentation as production verification. Application implementation remains `NO_GO`; a separate human-reviewed Phase 1A plan is the only eligible next runtime milestone.
