import { translations, Language } from "@/lib/i18n";

export interface ErrorDetails {
  title: string;
  message: string;
  code?: string;
  retryable?: boolean;
  showDetails?: boolean;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  
  const saved = localStorage.getItem('language');
  const lang: Language = (saved && ['uk', 'en', 'ru', 'es'].includes(saved)) ? (saved as Language) : 'en';
  return String(error || translations[lang].errors.unknownError);
}
