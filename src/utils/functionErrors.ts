import { FunctionsHttpError } from '@supabase/supabase-js';

export const getFunctionErrorMessage = async (error: unknown, fallback: string) => {
  if (error instanceof FunctionsHttpError) {
    const payload = await error.context.json().catch(() => null);
    if (typeof payload?.details === 'string' && payload.details.trim()) {
      return payload.details;
    }
    if (typeof payload?.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
