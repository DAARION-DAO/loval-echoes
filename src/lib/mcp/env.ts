// Bundled into the Supabase Edge Function; Deno populates process.env at runtime.
declare const process: { env: Record<string, string | undefined> };

export function getSupabaseUrl(): string {
  return process.env.SUPABASE_URL ?? "";
}

export function getSupabasePublishableKey(): string {
  return process.env.SUPABASE_PUBLISHABLE_KEY ?? "";
}