// Presence-only check for Supabase build-time env vars.
// Never returns or logs the actual values.
export interface SupabaseEnvStatus {
  urlPresent: boolean;
  keyPresent: boolean;
  ok: boolean;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const url = import.meta.env.VITE_SUPABASE_URL as unknown;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as unknown;
  const urlPresent = isNonEmptyString(url);
  const keyPresent = isNonEmptyString(key);
  return { urlPresent, keyPresent, ok: urlPresent && keyPresent };
}