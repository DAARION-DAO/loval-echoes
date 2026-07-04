# Repository Role

Status: public sanitized repository role card

This repository is part of the DAARION.city / DAGI / MicroDAO ecosystem.

The full canonical repository ownership map lives in the private operations
repository: `IvanTytar/microdao-daarion`.

This public repository contains only a sanitized local role summary.

## Role

`DAARION-DAO/loval-echoes` is the MicroDAO web application and Lovable/Supabase
beta launch layer.

It owns onboarding, dashboard, and Connect Device UI flows for the MicroDAO beta
experience.

## Owns

- MicroDAO user-facing app;
- Connect Device product journey;
- Supabase beta integration;
- frontend application state;
- user-facing device readiness presentation.

## Does Not Own

- main DAARION.city public frontend;
- native Edge Client runtime;
- public Edge Backend runtime;
- live node-network operations truth;
- private deployment runbooks;
- direct production backend profile insertion without approved public health gate.

`device_backend_profiles` must not be activated until the public Edge Backend
health endpoint returns HTTP 200.

## Related Repositories

- `DAARION-DAO/daarion-ai-city` - public DAARION.city frontend.
- `DAARION-DAO/daarion-edge-client` - user-installed Edge Client.
- `DAARION-DAO/daarion-edge-backend` - public Edge Backend health/API contract.
- `IvanTytar/microdao-daarion` - private operations truth.

## Public / Private Boundary

Public repositories may contain source code, public contracts, sanitized docs,
generic examples, and non-sensitive roadmap notes.

This repository must not contain live NODA/IP/DNS/firewall/Octelium/deployment
truth, private production runbooks, incidents, secrets, operator access details,
or private infrastructure evidence.

Live node-network operations truth belongs in the private
`IvanTytar/microdao-daarion` repository.
