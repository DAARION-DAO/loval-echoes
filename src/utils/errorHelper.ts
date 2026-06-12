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
  return String(error || 'Неизвестная ошибка');
}
