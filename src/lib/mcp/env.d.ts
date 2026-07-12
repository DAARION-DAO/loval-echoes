// Ambient declaration for tools bundled into the Supabase Edge Function.
// At runtime the emitted Deno function reads process.env for SUPABASE_URL /
// SUPABASE_PUBLISHABLE_KEY. Vite/tsc do not need Node types for this — just
// the shape used by the tool handlers.
declare const process: { env: Record<string, string | undefined> };