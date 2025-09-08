// Система локализации для поддержки RU/UA/EN

export type Language = 'ru' | 'ua' | 'en';

export interface Translations {
  // Общие
  loading: string;
  error: string;
  retry: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  send: string;
  stop: string;

  // Дополнительные общие
  allRepliesVisible: string;
  inviteParticipants: string;
  globalSearch: string;
  online: string;
  
  // Создание
  branchFromMessage: string;
  project: string;
  generalChat: string;
  name: string;
  description: string;
  tags: string;
  create: string;
  
  // Принципы ЖОС
  principlesTitle: string;
  principleNeutral: string;
  principleVisible: string;
  principlePause: string;
  
  // Настройки
  profile: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
  language: string;
  showPrinciplesBanner: string;
  
  // ЖОС баннер
  zhosBanner: {
    line1: string;
    line2: string;
    line3: string;
    pauseButton: string;
  };
  
  // Чаты
  chats: {
    title: string;
    newChat: string;
    emptyState: string;
    search: string;
    rename: string;
    delete: string;
    deleteConfirm: string;
    fork: string;
    forkFrom: string;
  };
  
  // Сообщения
  messages: {
    typing: string;
    copyCode: string;
    like: string;
    dislike: string;
    feedback: string;
    sources: string;
    report: string;
    fork: string;
    pauseNode: string;
  };
  
  // Файлы
  files: {
    upload: string;
    dragDrop: string;
    tooLarge: string;
    invalidType: string;
    preview: string;
  };
  
  // Голос
  voice: {
    startRecording: string;
    stopRecording: string;
    transcribing: string;
    playAudio: string;
    pauseAudio: string;
  };
  
  // Присутствие
  presence: {
    online: string;
    typing: string;
    limit: string; // "N/12"
    waitingRoom: string;
  };
  
  // Настройки
  settings: {
    title: string;
    difyConfig: string;
    apiKey: string;
    baseUrl: string;
    fileSettings: string;
    maxFileSize: string;
    auditLog: string;
    exportSettings: string;
    importSettings: string;
  };
  
  // Ошибки
  errors: {
    chatNotFound: string;
    invalidParams: string;
    providerNotInitialized: string;
    quotaExceeded: string;
    serverError: string;
    unauthorized: string;
    forbidden: string;
    networkError: string;
    timeout: string;
    fileTooLarge: string;
    fileTypeNotAllowed: string;
    rateLimitExceeded: string;
    unknownError: string;
    retry: string;
    hideDetails: string;
    showDetails: string;
  };
}

const translations: Record<Language, Translations> = {
  ru: {
    loading: 'Загрузка...',
    error: 'Ошибка',
    retry: 'Повторить',
    cancel: 'Отмена',
    save: 'Сохранить',
    delete: 'Удалить',
    edit: 'Редактировать',
    send: 'Отправить',
    stop: 'Остановить',

    allRepliesVisible: 'Все реплики видят все участники',
    inviteParticipants: 'Пригласите участников',
    globalSearch: 'Глобальный поиск',
    online: 'Онлайн',
    
    branchFromMessage: 'Ветка из сообщения',
    project: 'Проект',
    generalChat: 'Общий чат',
    name: 'Название',
    description: 'Описание',
    tags: 'Теги',
    create: 'Создать',
    
    principlesTitle: 'Принципы ЖОС',
    principleNeutral: 'Агент нейтрален и учитывает контекст всей беседы',
    principleVisible: 'Все сообщения видны всем участникам',
    principlePause: 'В споре используйте «Пауза/Узел»',
    
    profile: 'Профиль',
    theme: 'Тема',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    themeSystem: 'Системная',
    language: 'Язык',
    showPrinciplesBanner: 'Показывать баннер принципов',
    
    zhosBanner: {
      line1: 'Агент ЖОС нейтрален и учитывает контекст всей беседы.',
      line2: 'Все сообщения и ответы видны всем участникам общины.',
      line3: 'Если возникает напряжение — нажмите Пауза/Зафиксировать узел: агент кратко отзеркалит позиции и предложит следующий шаг без обвинений.',
      pauseButton: 'Пауза/Узел',
    },
    
    chats: {
      title: 'Чаты общины',
      newChat: 'Новый чат',
      emptyState: 'Начните разговор — это общий чат общины. Ваше сообщение увидят все.',
      search: 'Поиск чатов...',
      rename: 'Переименовать',
      delete: 'Удалить',
      deleteConfirm: 'Это сотрёт беседу в Dify. Продолжить?',
      fork: 'Создать ветку',
      forkFrom: 'из чата',
    },
    
    messages: {
      typing: 'печатает...',
      copyCode: 'Копировать код',
      like: 'Нравится',
      dislike: 'Не нравится',
      feedback: 'Обратная связь',
      sources: 'Источники',
      report: 'Сообщить о нарушении',
      fork: 'Создать ветку',
      pauseNode: 'Пауза/Узел зафиксирован',
    },
    
    files: {
      upload: 'Загрузить файл',
      dragDrop: 'Перетащите файлы сюда или нажмите для выбора',
      tooLarge: 'Размер файла превышает допустимый лимит (25 МБ)',
      invalidType: 'Тип файла не поддерживается',
      preview: 'Предпросмотр',
    },
    
    voice: {
      startRecording: 'Начать запись',
      stopRecording: 'Остановить запись',
      transcribing: 'Распознавание речи...',
      playAudio: 'Воспроизвести',
      pauseAudio: 'Пауза',
    },
    
    presence: {
      online: 'в сети',
      typing: 'печатает...',
      limit: '/ 12',
      waitingRoom: 'Когда место освободится — мы вас впустим автоматически',
    },
    
    settings: {
      title: 'Настройки',
      difyConfig: 'Конфигурация Dify',
      apiKey: 'API ключ',
      baseUrl: 'Базовый URL',
      fileSettings: 'Настройки файлов',
      maxFileSize: 'Максимальный размер файла (МБ)',
      auditLog: 'Журнал аудита',
      exportSettings: 'Экспорт настроек',
      importSettings: 'Импорт настроек',
    },
    
    errors: {
      chatNotFound: 'Чат не найден или был удалён. Обновите список.',
      invalidParams: 'Неверные параметры запроса.',
      providerNotInitialized: 'Отсутствует конфигурация модели. Проверьте ключи в настройках.',
      quotaExceeded: 'Квота модели исчерпана.',
      serverError: 'Временная ошибка сервиса. Повторите позже.',
      unauthorized: 'Требуется авторизация.',
      forbidden: 'Доступ запрещён.',
      networkError: 'Ошибка сети. Проверьте подключение к интернету.',
      timeout: 'Превышено время ожидания. Попробуйте ещё раз.',
      fileTooLarge: 'Размер файла превышает допустимый лимит (25 МБ).',
      fileTypeNotAllowed: 'Тип файла не поддерживается.',
      rateLimitExceeded: 'Слишком много запросов. Подождите немного.',
      unknownError: 'Произошла неожиданная ошибка. Попробуйте ещё раз.',
      retry: 'Повторить',
      hideDetails: 'Скрыть детали',
      showDetails: 'Показать детали',
    },
  },
  
  ua: {
    loading: 'Завантаження...',
    error: 'Помилка',
    retry: 'Повторити',
    cancel: 'Скасування',
    save: 'Зберегти',
    delete: 'Видалити',
    edit: 'Редагувати',
    send: 'Надіслати',
    stop: 'Зупинити',

    allRepliesVisible: 'Усі репліки бачать усі учасники',
    inviteParticipants: 'Запросіть учасників',
    globalSearch: 'Глобальний пошук',
    online: 'Онлайн',
    
    branchFromMessage: 'Гілка від повідомлення',
    project: 'Проєкт',
    generalChat: 'Загальний чат',
    name: 'Назва',
    description: 'Опис',
    tags: 'Теги',
    create: 'Створити',
    
    principlesTitle: 'Принципи ЖОС',
    principleNeutral: 'Агент нейтральний і враховує увесь контекст',
    principleVisible: 'Усі повідомлення видимі для всіх',
    principlePause: 'У конфлікті використовуйте «Пауза/Вузол»',
    
    profile: 'Профіль',
    theme: 'Тема',
    themeLight: 'Світла',
    themeDark: 'Темна',
    themeSystem: 'Системна',
    language: 'Мова',
    showPrinciplesBanner: 'Показувати банер принципів',
    
    zhosBanner: {
      line1: 'Агент ЖОС нейтральний і враховує контекст всієї розмови.',
      line2: 'Усі повідомлення та відповіді видні всім учасникам спільноти.',
      line3: 'Якщо виникає напруження — натисніть Пауза/Зафіксувати вузол: агент коротко відобразить позиції та запропонує наступний крок без звинувачень.',
      pauseButton: 'Пауза/Вузол',
    },
    
    chats: {
      title: 'Чати спільноти',
      newChat: 'Новий чат',
      emptyState: 'Почніть розмову — це спільний чат громади. Ваше повідомлення побачать всі.',
      search: 'Пошук чатів...',
      rename: 'Перейменувати',
      delete: 'Видалити',
      deleteConfirm: 'Це видалить розмову в Dify. Продовжити?',
      fork: 'Створити гілку',
      forkFrom: 'з чату',
    },
    
    messages: {
      typing: 'друкує...',
      copyCode: 'Копіювати код',
      like: 'Подобається',
      dislike: 'Не подобається',
      feedback: 'Зворотний зв\'язок',
      sources: 'Джерела',
      report: 'Повідомити про порушення',
      fork: 'Створити гілку',
      pauseNode: 'Пауза/Вузол зафіксовано',
    },
    
    files: {
      upload: 'Завантажити файл',
      dragDrop: 'Перетягніть файли сюди або натисніть для вибору',
      tooLarge: 'Розмір файлу перевищує допустимий ліміт (25 МБ)',
      invalidType: 'Тип файлу не підтримується',
      preview: 'Попередній перегляд',
    },
    
    voice: {
      startRecording: 'Почати запис',
      stopRecording: 'Зупинити запис',
      transcribing: 'Розпізнавання мовлення...',
      playAudio: 'Відтворити',
      pauseAudio: 'Пауза',
    },
    
    presence: {
      online: 'в мережі',
      typing: 'друкує...',
      limit: '/ 12',
      waitingRoom: 'Коли місце звільниться — ми впустимо вас автоматично',
    },
    
    settings: {
      title: 'Налаштування',
      difyConfig: 'Конфігурація Dify',
      apiKey: 'API ключ',
      baseUrl: 'Базовий URL',
      fileSettings: 'Налаштування файлів',
      maxFileSize: 'Максимальний розмір файлу (МБ)',
      auditLog: 'Журнал аудиту',
      exportSettings: 'Експорт налаштувань',
      importSettings: 'Імпорт налаштувань',
    },
    
    errors: {
      chatNotFound: 'Чат не знайдено або було видалено. Оновіть список.',
      invalidParams: 'Неправильні параметри запиту.',
      providerNotInitialized: 'Відсутня конфігурація моделі. Перевірте ключі в налаштуваннях.',
      quotaExceeded: 'Квота моделі вичерпана.',
      serverError: 'Тимчасова помилка сервісу. Повторіть пізніше.',
      unauthorized: 'Потрібна авторизація.',
      forbidden: 'Доступ заборонено.',
      networkError: 'Помилка мережі. Перевірте підключення до інтернету.',
      timeout: 'Перевищено час очікування. Спробуйте ще раз.',
      fileTooLarge: 'Розмір файлу перевищує допустимий ліміт (25 МБ).',
      fileTypeNotAllowed: 'Тип файлу не підтримується.',
      rateLimitExceeded: 'Забагато запитів. Зачекайте трохи.',
      unknownError: 'Сталася неочікувана помилка. Спробуйте ще раз.',
      retry: 'Повторити',
      hideDetails: 'Приховати деталі',
      showDetails: 'Показати деталі',
    },
  },
  
  en: {
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    send: 'Send',
    stop: 'Stop',

    allRepliesVisible: 'All replies are visible to everyone',
    inviteParticipants: 'Invite participants',
    globalSearch: 'Global search',
    online: 'Online',
    
    branchFromMessage: 'Branch from message',
    project: 'Project',
    generalChat: 'General chat',
    name: 'Name',
    description: 'Description',
    tags: 'Tags',
    create: 'Create',
    
    principlesTitle: 'Community Principles',
    principleNeutral: 'The agent is neutral and considers full context',
    principleVisible: 'All messages are visible to everyone',
    principlePause: 'Use "Pause/Knot" in conflicts',
    
    profile: 'Profile',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    language: 'Language',
    showPrinciplesBanner: 'Show principles banner',
    
    zhosBanner: {
      line1: 'ZHOS Agent is neutral and considers the context of the entire conversation.',
      line2: 'All messages and responses are visible to all community members.',
      line3: 'If tension arises — press Pause/Fix Node: the agent will briefly mirror positions and suggest the next step without accusations.',
      pauseButton: 'Pause/Node',
    },
    
    chats: {
      title: 'Community Chats',
      newChat: 'New Chat',
      emptyState: 'Start a conversation — this is a community chat. Everyone will see your message.',
      search: 'Search chats...',
      rename: 'Rename',
      delete: 'Delete',
      deleteConfirm: 'This will erase the conversation in Dify. Continue?',
      fork: 'Create Branch',
      forkFrom: 'from chat',
    },
    
    messages: {
      typing: 'is typing...',
      copyCode: 'Copy code',
      like: 'Like',
      dislike: 'Dislike',
      feedback: 'Feedback',
      sources: 'Sources',
      report: 'Report violation',
      fork: 'Create branch',
      pauseNode: 'Pause/Node fixed',
    },
    
    files: {
      upload: 'Upload file',
      dragDrop: 'Drag files here or click to select',
      tooLarge: 'File size exceeds the allowed limit (25 MB)',
      invalidType: 'File type not supported',
      preview: 'Preview',
    },
    
    voice: {
      startRecording: 'Start recording',
      stopRecording: 'Stop recording',
      transcribing: 'Transcribing speech...',
      playAudio: 'Play',
      pauseAudio: 'Pause',
    },
    
    presence: {
      online: 'online',
      typing: 'is typing...',
      limit: '/ 12',
      waitingRoom: 'When a spot opens up — we will let you in automatically',
    },
    
    settings: {
      title: 'Settings',
      difyConfig: 'Dify Configuration',
      apiKey: 'API Key',
      baseUrl: 'Base URL',
      fileSettings: 'File Settings',
      maxFileSize: 'Maximum file size (MB)',
      auditLog: 'Audit Log',
      exportSettings: 'Export Settings',
      importSettings: 'Import Settings',
    },
    
    errors: {
      chatNotFound: 'Chat not found or was deleted. Refresh the list.',
      invalidParams: 'Invalid request parameters.',
      providerNotInitialized: 'Model configuration missing. Check keys in settings.',
      quotaExceeded: 'Model quota exceeded.',
      serverError: 'Temporary service error. Please try again later.',
      unauthorized: 'Authorization required.',
      forbidden: 'Access forbidden.',
      networkError: 'Network error. Check your internet connection.',
      timeout: 'Request timeout. Please try again.',
      fileTooLarge: 'File size exceeds the allowed limit (25 MB).',
      fileTypeNotAllowed: 'File type not supported.',
      rateLimitExceeded: 'Too many requests. Please wait a moment.',
      unknownError: 'An unexpected error occurred. Please try again.',
      retry: 'Retry',
      hideDetails: 'Hide details',
      showDetails: 'Show details',
    },
  },
};

// Хук для использования переводов
import { useState, useEffect } from 'react';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved && ['ru', 'ua', 'en'].includes(saved)) {
      return saved as Language;
    }
    
    // Определяем язык по браузеру
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ru')) return 'ru';
    if (browserLang.startsWith('uk')) return 'ua';
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = translations[language];

  return { t, language, setLanguage };
};