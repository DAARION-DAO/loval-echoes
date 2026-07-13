## Read-only audit report

- owning project confirmed: yes
- production domain mapping confirmed: yes — this Lovable project lists `https://1.daarion.city` as a custom domain
- VITE_SUPABASE_URL present: unknown
- VITE_SUPABASE_URL available to production vite build: unknown
- VITE_SUPABASE_PUBLISHABLE_KEY present: unknown
- VITE_SUPABASE_PUBLISHABLE_KEY available to production vite build: unknown
- variables configured only as runtime/backend secrets: no — runtime/backend secrets list does not contain either Vite variable
- exact root cause: production bundle is being built without `VITE_SUPABASE_URL` in the frontend build-time environment; available tools can confirm domain mapping and runtime/backend secret names, but cannot inspect Lovable production frontend build-secret/env scope or build logs for these variables without exposing values
- smallest configuration-only fix: configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the exact Lovable production frontend build environment for project `4411fba9-f975-4193-bebf-d5df27e57cfc`, not only as backend/runtime secrets or preview/dev env
- clean rebuild required: yes
- env values printed: no
- code/files changed: no
- DB/migrations changed: no
- publish performed: no

## Capability gap

The available read-only tools here can list project URLs and backend/runtime secret names only. They do not expose a safe presence-only view of Lovable production frontend build variables, their workspace/project ownership, whitespace in names, build availability, or historical production build metadata/logs for commit `cca721927abe77c39a2d9db78ec6dc37b2198e71`.

## Plan виправлення після підтвердження

1. Manually verify in Lovable project settings / environment configuration that the two frontend build-time variables exist for this exact project and production build scope:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`

2. Ensure they are configured as frontend/Vite build environment variables for production, not as backend/runtime function secrets and not preview-only/dev-only variables.

3. Check exact names for typos or invisible whitespace before/after the names.

4. After configuration is corrected, run a clean production rebuild / publish for the same project and domain.

5. Smoke-test production after rebuild:
   - new deployment ID
   - new JS/CSS hashes
   - `#root` non-empty
   - React mounted
   - `Error: supabaseUrl is required` absent
   - no secrets printed in console or bundles