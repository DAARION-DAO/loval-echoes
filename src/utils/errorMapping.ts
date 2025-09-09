/**
 * Маппинг ошибок Dify API на дружественные UX-тексты
 */

export interface ErrorDetails {
  code: string;
  title: string;
  message: string;
  retryable: boolean;
  showDetails?: boolean;
}

export const FRIENDLY_ERRORS = {
  HTTP_404: "Не удалось найти API. Проверьте подключение.",
  HTTP_401: "Требуется авторизация. Войдите заново.",
  HTTP_403: "Недостаточно прав для выполнения действия.",
  HTTP_500: "Временная ошибка сервера. Повторите позже.",
  NETWORK_ERROR: "Ошибка сети. Проверьте подключение к интернету.",
  TIMEOUT: "Превышено время ожидания. Попробуйте ещё раз.",
  UNKNOWN: "Произошла неожиданная ошибка. Попробуйте ещё раз.",
};
export const mapDifyError = (error: string): string => {
  // Handle HTTP errors from API calls
  if (error.startsWith('HTTP ')) {
    const status = error.split(' ')[1];
    switch (status) {
      case '404': return FRIENDLY_ERRORS.HTTP_404;
      case '401': return FRIENDLY_ERRORS.HTTP_401;
      case '403': return FRIENDLY_ERRORS.HTTP_403;
      case '500': return FRIENDLY_ERRORS.HTTP_500;
      default: return FRIENDLY_ERRORS.UNKNOWN;
    }
  }

  const errorMap: Record<string, string> = {
    '404 conversation_not_exists': 'Чат не найден или был удалён. Обновите список.',
    '400 invalid_param': 'Неверные параметры запроса.',
    '400 provider_not_initialize': 'Отсутствует конфигурация модели. Проверьте ключи в настройках.',
    '400 provider_quota_exceeded': 'Квота модели исчерпана.',
    '500 internal server error': 'Временная ошибка сервиса. Повторите позже.',
    'unauthorized': 'Требуется авторизация.',
    'forbidden': 'Доступ запрещён.',
    'network_error': 'Ошибка сети. Проверьте подключение к интернету.',
    'timeout': 'Превышено время ожидания. Попробуйте ещё раз.',
    'file_too_large': 'Размер файла превышает допустимый лимит (25 МБ).',
    'file_type_not_allowed': 'Тип файла не поддерживается.',
    'rate_limit_exceeded': 'Слишком много запросов. Подождите немного.',
  };

  // Поиск по точному совпадению
  if (errorMap[error]) {
    return errorMap[error];
  }

  // Поиск по частичному совпадению
  const lowerError = error.toLowerCase();
  for (const [key, message] of Object.entries(errorMap)) {
    if (lowerError.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerError)) {
      return message;
    }
  }

  // Если не найдено, возвращаем общее сообщение
  return FRIENDLY_ERRORS.UNKNOWN;
};

export const isRetryableError = (error: string): boolean => {
  const retryableErrors = [
    'network_error',
    'timeout',
    '500 internal server error',
    'rate_limit_exceeded',
  ];

  const lowerError = error.toLowerCase();
  return retryableErrors.some(retryable => 
    lowerError.includes(retryable.toLowerCase()) || retryable.toLowerCase().includes(lowerError)
  );
};