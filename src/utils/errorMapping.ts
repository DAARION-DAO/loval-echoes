/**
 * Маппинг ошибок Dify API на дружественные UX-тексты
 */
export const mapDifyError = (error: string): string => {
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
  return 'Произошла неожиданная ошибка. Попробуйте ещё раз.';
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