import type { SupabaseEnvStatus } from "@/lib/supabaseEnv";

interface Props {
  status: SupabaseEnvStatus;
  compact?: boolean;
}

/**
 * Friendly fallback UI shown when required Supabase build-time env vars are missing.
 * Renders in place of the app (fatal mode) or as an inline admin banner (compact mode).
 * Never displays env values.
 */
export function SupabaseEnvErrorScreen({ status, compact = false }: Props) {
  const missing = [
    !status.urlPresent && "VITE_SUPABASE_URL",
    !status.keyPresent && "VITE_SUPABASE_PUBLISHABLE_KEY",
  ].filter(Boolean) as string[];

  const wrapperClass = compact
    ? "rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm"
    : "min-h-screen flex items-center justify-center bg-background p-6";

  const cardClass = compact
    ? ""
    : "max-w-md w-full rounded-xl border border-border bg-card p-6 shadow-lg";

  return (
    <div className={wrapperClass} role="alert" aria-live="assertive">
      <div className={cardClass}>
        <h1 className={compact ? "text-base font-semibold text-destructive" : "text-xl font-semibold text-destructive mb-2"}>
          Backend configuration missing
        </h1>
        <p className="text-muted-foreground mt-2">
          The app can’t reach its backend because required build-time variables were not included in this production bundle.
        </p>
        <ul className="mt-3 list-disc pl-5 text-sm">
          {missing.map((name) => (
            <li key={name}><code className="font-mono">{name}</code> — missing</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Configure these in the production frontend build environment and re-publish. No values are shown here for security.
        </p>
      </div>
    </div>
  );
}