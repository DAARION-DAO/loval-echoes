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
  HTTP_404: "Не нашли конечную точку API. Проверьте адрес или развертывание.",
  HTTP_401: "Нужна авторизация. Войдите заново.",
  HTTP_403: "Доступ запрещен",
  HTTP_500: "Временная ошибка сервера. Повторите позже.",
  NETWORK_ERROR: "Ошибка сети. Проверьте подключение к интернету",
  TIMEOUT_ERROR: "Превышено время ожидания",
  API_NON_JSON: "Сервер вернул некорректный ответ. Попробуйте позже.",
  UNKNOWN: "Произошла неожиданная ошибка. Попробуйте ещё раз.",
};
export const mapDifyError = (error: string): string => {
  // Handle specific API errors first
  if (error.includes('API returned non-JSON response')) {
    return FRIENDLY_ERRORS.API_NON_JSON;
  }
  
  // Handle HTTP errors from API calls
  if (error.startsWith('HTTP_')) {
    const errorKey = error as keyof typeof FRIENDLY_ERRORS;
    return FRIENDLY_ERRORS[errorKey] || FRIENDLY_ERRORS.UNKNOWN;
  }
  
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

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Map specific error messages to user-friendly text
    const message = error.message.toLowerCase();
    
    if (message.includes('401') || message.includes('unauthorized')) {
      return 'Сессия истекла. Войдите заново.';
    }
    
    if (message.includes('404') || message.includes('not found')) {
      return 'Не удалось найти запрашиваемый ресурс. Проверьте подключение к серверу.';
    }
    
    if (message.includes('500') || message.includes('server')) {
      return 'Временная ошибка сервера. Повторите позже.';
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'Проблема с подключением к серверу.';
    }
    
    if (message.includes('failed to fetch')) {
      return 'Не удалось подключиться к серверу. Проверьте интернет-соединение.';
    }
    
    if (message.includes('api returned non-json')) {
      return 'Сервер вернул некорректный ответ. Обратитесь в поддержку.';
    }
    
    // Use the existing mapDifyError function for known errors
    return mapDifyError(error.message);
  }
  
  return 'Неизвестная ошибка.';
};