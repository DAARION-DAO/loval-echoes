// Система локализации для поддержки UK/EN/RU/ES

export type Language = 'uk' | 'en' | 'ru' | 'es';

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
  
  // Навигация
  nav: {
    home: string;
    chats: string;
    tasks: string;
    projects: string;
    agents: string;
    participants: string;
    news: string;
    chatManage: string;
    knowledgeBase: string;
    meetings: string;
    promptEditor: string;
    integrations: string;
    installClient: string;
    settings: string;
    more: string;
    navigation: string;
  };

  // Дашборд
  dashboard: {
    welcome: string;
    welcomeDesc: string;
    quickActions: string;
    createChat: string;
    createChatDesc: string;
    createProject: string;
    createProjectDesc: string;
    startMeeting: string;
    startMeetingDesc: string;
    importHistory: string;
    importHistoryDesc: string;
    communityActivity: string;
    activityDesc: string;
    onlineUsers: string;
    onlineAgents: string;
    totalUsers: string;
    activeChats: string;
    todayMessages: string;
    newsFeed: string;
  };

  // Лейаут
  layout: {
    appName: string;
    logout: string;
    user: string;
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
  
  landing: {
    heroTitle: string;
    heroSubtitle: string;
    heroDesc: string;
    createSpace: string;
    login: string;
    client: string;
    installPwa: string;
    whatIsMicroDAO: string;
    whatIsMicroDAODesc: string;
    featuresTitle: string;
  };
  success: string;
  projects: {
    title: string;
    description: string;
    createBtn: string;
    searchPlaceholder: string;
    emptyState: string;
    errorLoad: string;
    errorCreate: string;
    successCreate: string;
    backBtn: string;
    detailsTitle: string;
    notFound: string;
  };
  tasks: {
    title: string;
    description: string;
    board: string;
    list: string;
    calendar: string;
    addTask: string;
    searchPlaceholder: string;
    errorLoad: string;
    errorCreate: string;
    errorUpdate: string;
    errorDelete: string;
    errorNoProjects: string;
    successCreate: string;
    successUpdate: string;
    successDelete: string;
    taskTitle: string;
    taskTitlePlaceholder: string;
    taskDesc: string;
    taskDescPlaceholder: string;
    total: string;
    overdue: string;
    today: string;
    inReview: string;
    allStatuses: string;
    backlog: string;
    todo: string;
    inProgress: string;
    done: string;
    next7days: string;
    noDueDate: string;
    noTasksFound: string;
    noTasks: string;
    newTask: string;
    newTaskDesc: string;
    prevMonth: string;
    nextMonth: string;
    more: string;
    taskLegend: string;
  };
  kb: {
    title: string;
    description: string;
    searchPlaceholder: string;
    indexBtn: string;
    indexing: string;
    indexSuccess: string;
    indexSuccessTitle: string;
    indexError: string;
    indexErrorTitle: string;
    indexFailedDesc: string;
    errorLoadFiles: string;
    addedToKb: string;
    removedFromKb: string;
    fileUpdated: string;
    errorUpdate: string;
    uploadBtn: string;
    emptyState: string;
    noFilesFound: string;
    tabCommunity: string;
    tabProjects: string;
    tabPersonal: string;
    allFiles: string;
    removeFromKb: string;
    addToKb: string;
    reindex: string;
    download: string;
    copyLink: string;
    move: string;
    indexed: string;
    configTitle: string;
    configDesc: string;
    chunkSize: string;
    chunkOverlap: string;
    indexAction: string;
  };
}

const translations: Record<Language, Translations> = {
  uk: {
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

    nav: {
      home: 'Головна',
      chats: 'Чати',
      tasks: 'Завдання',
      projects: 'Проєкти',
      agents: 'Агенти',
      participants: 'Учасники',
      news: 'Новини',
      chatManage: 'Керування чатами',
      knowledgeBase: 'База знань',
      meetings: 'Зустрічі',
      promptEditor: 'Редактор промптів',
      integrations: 'Інтеграції',
      installClient: 'Встановити клієнт',
      settings: 'Налаштування',
      more: 'Більше',
      navigation: 'Навігація',
    },

    dashboard: {
      welcome: 'Ласкаво просимо',
      welcomeDesc: 'Ваш центр керування спільнотою',
      quickActions: 'Швидкі дії',
      createChat: 'Створити чат',
      createChatDesc: 'Розпочніть нову розмову зі спільнотою',
      createProject: 'Створити проєкт',
      createProjectDesc: 'Організуйте завдання та ресурси',
      startMeeting: 'Розпочати зустріч',
      startMeetingDesc: 'Запланувати або почати відеозустріч',
      importHistory: 'Імпорт історії',
      importHistoryDesc: 'Завантажте попередні розмови',
      communityActivity: 'Активність спільноти',
      activityDesc: 'Огляд поточної активності',
      onlineUsers: 'Користувачі онлайн',
      onlineAgents: 'Агенти онлайн',
      totalUsers: 'Всього користувачів',
      activeChats: 'Активні чати',
      todayMessages: 'Повідомлень сьогодні',
      newsFeed: 'Стрічка новин',
    },

    layout: {
      appName: 'Loval Echoes',
      logout: 'Вийти',
      user: 'Користувач',
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
    landing: {
      heroTitle: 'MicroDAO',
      heroSubtitle: 'Дух Спільноти',
      heroDesc: 'Жива операційна система для команд, DAO та спільнот. Чати, задачі, знання, зустрічі й агенти — в одному просторі для спільної дії.',
      createSpace: 'Створити простір',
      login: 'Увійти',
      client: 'Клієнт',
      installPwa: 'Встановити застосунок',
      whatIsMicroDAO: 'Що таке MicroDAO?',
      whatIsMicroDAODesc: 'MicroDAO — це автономний цифровий простір спільноти, де комунікація, задачі, знання, зустрічі та агенти працюють як єдина система. Кожна спільнота може мати власні правила, памʼять, учасників і агентів.',
      featuresTitle: 'Функціонал MicroDAO',
    },
    success: 'Успіх',
    projects: {
      title: 'Проєкти',
      description: 'Керуйте проєктами та спільною роботою команди',
      createBtn: 'Створити проєкт',
      searchPlaceholder: 'Пошук проєктів...',
      emptyState: 'Проєктів не знайдено. Створіть перший проєкт для спільної роботи.',
      errorLoad: 'Не вдалося завантажити проєкти',
      errorCreate: 'Не вдалося створити проєкт',
      successCreate: 'Проєкт створено успішно',
      backBtn: 'Назад до проєктів',
      detailsTitle: 'Деталі проєкту',
      notFound: 'Проєкт не знайдено',
    },
    tasks: {
      title: 'Мої завдання',
      description: 'Керуйте своїми завданнями та відстежуйте прогрес',
      board: 'Дошка',
      list: 'Список',
      calendar: 'Календар',
      addTask: 'Додати завдання',
      searchPlaceholder: 'Пошук завдань...',
      errorLoad: 'Не вдалося завантажити завдання',
      errorCreate: 'Не вдалося створити завдання',
      errorUpdate: 'Не вдалося оновити завдання',
      errorDelete: 'Не вдалося видалити завдання',
      errorNoProjects: 'Немає доступних проєктів',
      successCreate: 'Завдання створено',
      successUpdate: 'Завдання оновлено',
      successDelete: 'Завдання видалено',
      taskTitle: 'Назва завдання',
      taskTitlePlaceholder: 'Введіть назву завдання...',
      taskDesc: 'Опис завдання',
      taskDescPlaceholder: 'Додайте опис (необов\'язково)...',
      total: 'Всього',
      overdue: 'Протерміновано',
      today: 'Сьогодні',
      inReview: 'На перевірці',
      allStatuses: 'Усі статуси',
      backlog: 'Беклог',
      todo: 'До виконання',
      inProgress: 'В процесі',
      done: 'Готово',
      next7days: 'Наступні 7 днів',
      noDueDate: 'Без терміну',
      noTasksFound: 'Завдання не знайдено',
      noTasks: 'У вас поки немає завдань',
      newTask: 'Нове завдання',
      newTaskDesc: 'Створіть нове завдання для відстеження',
      prevMonth: 'Назад',
      nextMonth: 'Вперед',
      more: 'ще',
      taskLegend: 'Завдання',
    },
    kb: {
      title: 'База знань',
      description: 'Документи та знання вашої спільноти',
      searchPlaceholder: 'Пошук документів...',
      indexBtn: 'Індексувати ШІ',
      indexing: 'Індексація...',
      indexSuccess: 'Файл успішно проіндексовано ШІ та додано у векторну базу знань.',
      indexSuccessTitle: 'Індексацію завершено',
      indexError: 'Помилка індексації',
      indexErrorTitle: 'Помилка індексації',
      indexFailedDesc: 'Не вдалося проіндексувати файл',
      errorLoadFiles: 'Не вдалося завантажити файли',
      addedToKb: 'Додано до бази знань',
      removedFromKb: 'Вилучено з бази знань',
      fileUpdated: 'Файл успішно оновлено',
      errorUpdate: 'Не вдалося оновити файл',
      uploadBtn: 'Завантажити файл',
      emptyState: 'База знань порожня. Завантажте перший документ.',
      noFilesFound: 'Файлів не знайдено',
      tabCommunity: 'Спільна',
      tabProjects: 'Проєкти',
      tabPersonal: 'Особиста',
      allFiles: 'Усі файли',
      removeFromKb: 'Вилучити з бази знань',
      addToKb: 'Додати до бази знань',
      reindex: 'Переіндексувати',
      download: 'Завантажити',
      copyLink: 'Копіювати посилання',
      move: 'Перемістити',
      indexed: 'Проіндексовано',
      configTitle: 'Налаштування індексації ШІ',
      configDesc: 'Вкажіть розмір чанків та перекриття для розбиття документа. Це допоможе орієнтуватися у RAG-пошуку.',
      chunkSize: 'Розмір чанку',
      chunkOverlap: 'Перекриття',
      indexAction: 'Індексувати',
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

    nav: {
      home: 'Home',
      chats: 'Chats',
      tasks: 'Tasks',
      projects: 'Projects',
      agents: 'Agents',
      participants: 'Participants',
      news: 'News',
      chatManage: 'Manage Chats',
      knowledgeBase: 'Knowledge Base',
      meetings: 'Meetings',
      promptEditor: 'Prompt Editor',
      integrations: 'Integrations',
      installClient: 'Install Client',
      settings: 'Settings',
      more: 'More',
      navigation: 'Navigation',
    },

    dashboard: {
      welcome: 'Welcome',
      welcomeDesc: 'Your community control center',
      quickActions: 'Quick Actions',
      createChat: 'Create Chat',
      createChatDesc: 'Start a new conversation with the community',
      createProject: 'Create Project',
      createProjectDesc: 'Organize tasks and resources',
      startMeeting: 'Start Meeting',
      startMeetingDesc: 'Schedule or start a video meeting',
      importHistory: 'Import History',
      importHistoryDesc: 'Load previous conversations',
      communityActivity: 'Community Activity',
      activityDesc: 'Overview of current activity',
      onlineUsers: 'Online Users',
      onlineAgents: 'Online Agents',
      totalUsers: 'Total Users',
      activeChats: 'Active Chats',
      todayMessages: 'Messages Today',
      newsFeed: 'News Feed',
    },

    layout: {
      appName: 'Loval Echoes',
      logout: 'Logout',
      user: 'User',
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
    landing: {
      heroTitle: 'MicroDAO',
      heroSubtitle: 'Spirit of Community',
      heroDesc: 'A living operating system for teams, DAOs, and communities. Chats, tasks, knowledge, meetings, and agents — all in one space for collective action.',
      createSpace: 'Create Space',
      login: 'Log In',
      client: 'Client',
      installPwa: 'Install App',
      whatIsMicroDAO: 'What is MicroDAO?',
      whatIsMicroDAODesc: 'MicroDAO is an autonomous digital space for communities, where communication, tasks, knowledge, meetings, and agents work as a unified system. Each community can have its own rules, memory, members, and agents.',
      featuresTitle: 'MicroDAO Features',
    },
    success: 'Success',
    projects: {
      title: 'Projects',
      description: 'Manage projects and team collaboration',
      createBtn: 'Create Project',
      searchPlaceholder: 'Search projects...',
      emptyState: 'No projects found. Create your first project to start collaborating.',
      errorLoad: 'Failed to load projects',
      errorCreate: 'Failed to create project',
      successCreate: 'Project created successfully',
      backBtn: 'Back to projects',
      detailsTitle: 'Project Details',
      notFound: 'Project not found',
    },
    tasks: {
      title: 'My Tasks',
      description: 'Manage your tasks and track progress',
      board: 'Board',
      list: 'List',
      calendar: 'Calendar',
      addTask: 'Add Task',
      searchPlaceholder: 'Search tasks...',
      errorLoad: 'Failed to load tasks',
      errorCreate: 'Failed to create task',
      errorUpdate: 'Failed to update task',
      errorDelete: 'Failed to delete task',
      errorNoProjects: 'No available projects',
      successCreate: 'Task created',
      successUpdate: 'Task updated',
      successDelete: 'Task deleted',
      taskTitle: 'Task Title',
      taskTitlePlaceholder: 'Enter task title...',
      taskDesc: 'Task Description',
      taskDescPlaceholder: 'Add description (optional)...',
      total: 'Total',
      overdue: 'Overdue',
      today: 'Today',
      inReview: 'In Review',
      allStatuses: 'All statuses',
      backlog: 'Backlog',
      todo: 'To Do',
      inProgress: 'In Progress',
      done: 'Done',
      next7days: 'Next 7 days',
      noDueDate: 'No due date',
      noTasksFound: 'Tasks not found',
      noTasks: 'You have no tasks yet',
      newTask: 'New Task',
      newTaskDesc: 'Create a new task to track',
      prevMonth: 'Back',
      nextMonth: 'Forward',
      more: 'more',
      taskLegend: 'Task',
    },
    kb: {
      title: 'Knowledge Base',
      description: 'Documents and knowledge of your community',
      searchPlaceholder: 'Search documents...',
      indexBtn: 'Index with AI',
      indexing: 'Indexing...',
      indexSuccess: 'File successfully indexed by AI and added to the vector knowledge base.',
      indexSuccessTitle: 'Indexing completed',
      indexError: 'Indexing error',
      indexErrorTitle: 'Indexing error',
      indexFailedDesc: 'Failed to index file',
      errorLoadFiles: 'Failed to load files',
      addedToKb: 'Added to knowledge base',
      removedFromKb: 'Removed from knowledge base',
      fileUpdated: 'File successfully updated',
      errorUpdate: 'Failed to update file',
      uploadBtn: 'Upload File',
      emptyState: 'Knowledge base is empty. Upload your first document.',
      noFilesFound: 'No files found',
      tabCommunity: 'Community',
      tabProjects: 'Projects',
      tabPersonal: 'Personal',
      allFiles: 'All files',
      removeFromKb: 'Remove from knowledge base',
      addToKb: 'Add to knowledge base',
      reindex: 'Reindex',
      download: 'Download',
      copyLink: 'Copy link',
      move: 'Move',
      indexed: 'Indexed',
      configTitle: 'AI Indexing Settings',
      configDesc: 'Specify chunk size and overlap for splitting the document. This will help optimize RAG search quality.',
      chunkSize: 'Chunk size',
      chunkOverlap: 'Overlap',
      indexAction: 'Index',
    },
  },

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

    nav: {
      home: 'Главная',
      chats: 'Чаты',
      tasks: 'Задачи',
      projects: 'Проекты',
      agents: 'Агенты',
      participants: 'Участники',
      news: 'Новости',
      chatManage: 'Управление чатами',
      knowledgeBase: 'База знаний',
      meetings: 'Встречи',
      promptEditor: 'Редактор промптов',
      integrations: 'Интеграции',
      installClient: 'Установить клиент',
      settings: 'Настройки',
      more: 'Ещё',
      navigation: 'Навигация',
    },

    dashboard: {
      welcome: 'Добро пожаловать',
      welcomeDesc: 'Ваш центр управления общиной',
      quickActions: 'Быстрые действия',
      createChat: 'Создать чат',
      createChatDesc: 'Начните новый разговор с общиной',
      createProject: 'Создать проект',
      createProjectDesc: 'Организуйте задачи и ресурсы',
      startMeeting: 'Начать встречу',
      startMeetingDesc: 'Запланировать или начать видеовстречу',
      importHistory: 'Импорт истории',
      importHistoryDesc: 'Загрузите предыдущие разговоры',
      communityActivity: 'Активность общины',
      activityDesc: 'Обзор текущей активности',
      onlineUsers: 'Пользователи онлайн',
      onlineAgents: 'Агенты онлайн',
      totalUsers: 'Всего пользователей',
      activeChats: 'Активные чаты',
      todayMessages: 'Сообщений сегодня',
      newsFeed: 'Лента новостей',
    },

    layout: {
      appName: 'Loval Echoes',
      logout: 'Выйти',
      user: 'Пользователь',
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
    landing: {
      heroTitle: 'MicroDAO',
      heroSubtitle: 'Дух Сообщества',
      heroDesc: 'Живая операционная система для команд, DAO и сообществ. Чаты, задачи, знания, встречи и агенты — в одном пространстве для совместных действий.',
      createSpace: 'Создать пространство',
      login: 'Войти',
      client: 'Клиент',
      installPwa: 'Установить приложение',
      whatIsMicroDAO: 'Что такое MicroDAO?',
      whatIsMicroDAODesc: 'MicroDAO — это автономное цифровое пространство сообщества, где коммуникация, задачи, знания, встречи и агенты работают как единая система. Каждое сообщество может иметь свои правила, память, участников и агентов.',
      featuresTitle: 'Функционал MicroDAO',
    },
    success: 'Успех',
    projects: {
      title: 'Проекты',
      description: 'Управляйте проектами и совместной работой команды',
      createBtn: 'Создать проект',
      searchPlaceholder: 'Поиск проектов...',
      emptyState: 'Проекты не найдены. Создайте первый проект для совместной работы.',
      errorLoad: 'Не удалось загрузить проекты',
      errorCreate: 'Не удалось создать проект',
      successCreate: 'Проект успешно создан',
      backBtn: 'Назад к проектам',
      detailsTitle: 'Детали проекта',
      notFound: 'Проект не найден',
    },
    tasks: {
      title: 'Мои задачи',
      description: 'Управляйте своими задачами и отслеживайте прогресс',
      board: 'Доска',
      list: 'Список',
      calendar: 'Календарь',
      addTask: 'Добавить задачу',
      searchPlaceholder: 'Поиск задач...',
      errorLoad: 'Не удалось загрузить задачи',
      errorCreate: 'Не удалось создать задачу',
      errorUpdate: 'Не удалось обновить задачу',
      errorDelete: 'Не удалось удалить задачу',
      errorNoProjects: 'Нет доступных проектов',
      successCreate: 'Задача создана',
      successUpdate: 'Задача обновлена',
      successDelete: 'Задача удалена',
      taskTitle: 'Название задачи',
      taskTitlePlaceholder: 'Введите название задачи...',
      taskDesc: 'Описание задачи',
      taskDescPlaceholder: 'Добавьте описание (опционально)...',
      total: 'Всего',
      overdue: 'Просрочено',
      today: 'Сегодня',
      inReview: 'На проверке',
      allStatuses: 'Все статусы',
      backlog: 'Бэклог',
      todo: 'К выполнению',
      inProgress: 'В процессе',
      done: 'Готово',
      next7days: 'Следующие 7 дней',
      noDueDate: 'Без срока',
      noTasksFound: 'Задачи не найдены',
      noTasks: 'У вас пока нет задач',
      newTask: 'Новая задача',
      newTaskDesc: 'Создайте новую задачу для отслеживания',
      prevMonth: 'Назад',
      nextMonth: 'Вперед',
      more: 'ещё',
      taskLegend: 'Задача',
    },
    kb: {
      title: 'База знаний',
      description: 'Документы и знания вашего сообщества',
      searchPlaceholder: 'Поиск документов...',
      indexBtn: 'Индексировать ИИ',
      indexing: 'Индексация...',
      indexSuccess: 'Файл успешно проиндексирован ИИ и добавлен в векторную базу знаний.',
      indexSuccessTitle: 'Индексация завершена',
      indexError: 'Ошибка индексации',
      indexErrorTitle: 'Ошибка индексации',
      indexFailedDesc: 'Не удалось проиндексировать файл',
      errorLoadFiles: 'Не удалось загрузить файлы',
      addedToKb: 'Добавлено в базу знаний',
      removedFromKb: 'Удалено из базы знаний',
      fileUpdated: 'Файл успешно обновлен',
      errorUpdate: 'Не удалось обновить файл',
      uploadBtn: 'Загрузить файл',
      emptyState: 'База знаний пуста. Загрузите первый документ.',
      noFilesFound: 'Файлов не найдено',
      tabCommunity: 'Общая',
      tabProjects: 'Проекты',
      tabPersonal: 'Личная',
      allFiles: 'Все файлы',
      removeFromKb: 'Убрать из базы знаний',
      addToKb: 'Добавить в базу знаний',
      reindex: 'Переиндексировать',
      download: 'Скачать',
      copyLink: 'Копировать ссылку',
      move: 'Переместить',
      indexed: 'Индексирован',
      configTitle: 'Настройки индексации ИИ',
      configDesc: 'Укажите размер чанков и перекрытие для разбиения документа. Это поможет оптимизировать качество RAG-поиска.',
      chunkSize: 'Размер чанка',
      chunkOverlap: 'Перекрытие',
      indexAction: 'Индексировать',
    },
  },

  es: {
    loading: 'Cargando...',
    error: 'Error',
    retry: 'Reintentar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    send: 'Enviar',
    stop: 'Detener',

    allRepliesVisible: 'Todas las respuestas son visibles para todos',
    inviteParticipants: 'Invitar participantes',
    globalSearch: 'Búsqueda global',
    online: 'En línea',
    
    branchFromMessage: 'Rama desde el mensaje',
    project: 'Proyecto',
    generalChat: 'Chat general',
    name: 'Nombre',
    description: 'Descripción',
    tags: 'Etiquetas',
    create: 'Crear',
    
    principlesTitle: 'Principios de la Comunidad',
    principleNeutral: 'El agente es neutral y considera todo el contexto',
    principleVisible: 'Todos los mensajes son visibles para todos',
    principlePause: 'Use «Pausa/Nudo» en conflictos',
    
    profile: 'Perfil',
    theme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    themeSystem: 'Sistema',
    language: 'Idioma',
    showPrinciplesBanner: 'Mostrar banner de principios',
    
    zhosBanner: {
      line1: 'El agente ZHOS es neutral y considera el contexto de toda la conversación.',
      line2: 'Todos los mensajes y respuestas son visibles para todos los miembros de la comunidad.',
      line3: 'Si surge tensión — presione Pausa/Fijar Nudo: el agente reflejará brevemente las posiciones y sugerirá el siguiente paso sin acusaciones.',
      pauseButton: 'Pausa/Nudo',
    },

    nav: {
      home: 'Inicio',
      chats: 'Chats',
      tasks: 'Tareas',
      projects: 'Proyectos',
      agents: 'Agentes',
      participants: 'Participantes',
      news: 'Noticias',
      chatManage: 'Gestionar chats',
      knowledgeBase: 'Base de conocimiento',
      meetings: 'Reuniones',
      promptEditor: 'Editor de prompts',
      integrations: 'Integraciones',
      installClient: 'Instalar cliente',
      settings: 'Configuración',
      more: 'Más',
      navigation: 'Navegación',
    },

    dashboard: {
      welcome: 'Bienvenido',
      welcomeDesc: 'Tu centro de control comunitario',
      quickActions: 'Acciones rápidas',
      createChat: 'Crear chat',
      createChatDesc: 'Inicia una nueva conversación con la comunidad',
      createProject: 'Crear proyecto',
      createProjectDesc: 'Organiza tareas y recursos',
      startMeeting: 'Iniciar reunión',
      startMeetingDesc: 'Programar o iniciar una videollamada',
      importHistory: 'Importar historial',
      importHistoryDesc: 'Carga conversaciones anteriores',
      communityActivity: 'Actividad comunitaria',
      activityDesc: 'Resumen de la actividad actual',
      onlineUsers: 'Usuarios en línea',
      onlineAgents: 'Agentes en línea',
      totalUsers: 'Total de usuarios',
      activeChats: 'Chats activos',
      todayMessages: 'Mensajes de hoy',
      newsFeed: 'Noticias',
    },

    layout: {
      appName: 'Loval Echoes',
      logout: 'Cerrar sesión',
      user: 'Usuario',
    },
    
    chats: {
      title: 'Chats de la comunidad',
      newChat: 'Nuevo chat',
      emptyState: 'Inicia una conversación — este es un chat comunitario. Todos verán tu mensaje.',
      search: 'Buscar chats...',
      rename: 'Renombrar',
      delete: 'Eliminar',
      deleteConfirm: 'Esto eliminará la conversación en Dify. ¿Continuar?',
      fork: 'Crear rama',
      forkFrom: 'del chat',
    },
    
    messages: {
      typing: 'escribiendo...',
      copyCode: 'Copiar código',
      like: 'Me gusta',
      dislike: 'No me gusta',
      feedback: 'Comentarios',
      sources: 'Fuentes',
      report: 'Reportar violación',
      fork: 'Crear rama',
      pauseNode: 'Pausa/Nudo fijado',
    },
    
    files: {
      upload: 'Subir archivo',
      dragDrop: 'Arrastra archivos aquí o haz clic para seleccionar',
      tooLarge: 'El tamaño del archivo excede el límite permitido (25 MB)',
      invalidType: 'Tipo de archivo no compatible',
      preview: 'Vista previa',
    },
    
    voice: {
      startRecording: 'Iniciar grabación',
      stopRecording: 'Detener grabación',
      transcribing: 'Transcribiendo voz...',
      playAudio: 'Reproducir',
      pauseAudio: 'Pausar',
    },
    
    presence: {
      online: 'en línea',
      typing: 'escribiendo...',
      limit: '/ 12',
      waitingRoom: 'Cuando haya un lugar disponible — te dejaremos entrar automáticamente',
    },
    
    settings: {
      title: 'Configuración',
      difyConfig: 'Configuración de Dify',
      apiKey: 'Clave API',
      baseUrl: 'URL base',
      fileSettings: 'Configuración de archivos',
      maxFileSize: 'Tamaño máximo de archivo (MB)',
      auditLog: 'Registro de auditoría',
      exportSettings: 'Exportar configuración',
      importSettings: 'Importar configuración',
    },
    
    errors: {
      chatNotFound: 'Chat no encontrado o fue eliminado. Actualice la lista.',
      invalidParams: 'Parámetros de solicitud no válidos.',
      providerNotInitialized: 'Configuración del modelo ausente. Verifique las claves en la configuración.',
      quotaExceeded: 'Cuota del modelo agotada.',
      serverError: 'Error temporal del servicio. Inténtelo de nuevo más tarde.',
      unauthorized: 'Se requiere autorización.',
      forbidden: 'Acceso prohibido.',
      networkError: 'Error de red. Verifique su conexión a internet.',
      timeout: 'Tiempo de espera agotado. Inténtelo de nuevo.',
      fileTooLarge: 'El tamaño del archivo excede el límite permitido (25 MB).',
      fileTypeNotAllowed: 'Tipo de archivo no compatible.',
      rateLimitExceeded: 'Demasiadas solicitudes. Espere un momento.',
      unknownError: 'Ocurrió un error inesperado. Inténtelo de nuevo.',
      retry: 'Reintentar',
      hideDetails: 'Ocultar detalles',
      showDetails: 'Mostrar detalles',
    },
    landing: {
      heroTitle: 'MicroDAO',
      heroSubtitle: 'Espíritu de la Comunidad',
      heroDesc: 'Un sistema operativo vivo para equipos, DAO y comunidades. Chats, tareas, conocimiento, reuniones y agentes, todo en un solo espacio para la acción colectiva.',
      createSpace: 'Crear espacio',
      login: 'Iniciar sesión',
      client: 'Cliente',
      installPwa: 'Instalar aplicación',
      whatIsMicroDAO: '¿Qué es MicroDAO?',
      whatIsMicroDAODesc: 'MicroDAO es un espacio digital autónomo para comunidades, donde la comunicación, las tareas, el conocimiento, las reuniones y los agentes funcionan como un sistema unificado. Cada comunidad puede tener sus propias reglas, memoria, miembros y agentes.',
      featuresTitle: 'Funciones de MicroDAO',
    },
    success: 'Éxito',
    projects: {
      title: 'Proyectos',
      description: 'Administre proyectos y la colaboración del equipo',
      createBtn: 'Crear Proyecto',
      searchPlaceholder: 'Buscar proyectos...',
      emptyState: 'No se encontraron proyectos. Cree su primer proyecto para comenzar a colaborar.',
      errorLoad: 'Error al cargar los proyectos',
      errorCreate: 'Error al crear el proyecto',
      successCreate: 'Proyecto creado con éxito',
      backBtn: 'Volver a proyectos',
      detailsTitle: 'Detalles del proyecto',
      notFound: 'Proyecto no encontrado',
    },
    tasks: {
      title: 'Mis tareas',
      description: 'Gestione sus tareas y realice un seguimiento del progreso',
      board: 'Tablero',
      list: 'Lista',
      calendar: 'Calendario',
      addTask: 'Añadir tarea',
      searchPlaceholder: 'Buscar tareas...',
      errorLoad: 'Error al cargar las tareas',
      errorCreate: 'Error al crear la tarea',
      errorUpdate: 'Error al actualizar la tarea',
      errorDelete: 'Error al eliminar la tarea',
      errorNoProjects: 'No hay proyectos disponibles',
      successCreate: 'Tarea creada',
      successUpdate: 'Tarea actualizada',
      successDelete: 'Tarea eliminada',
      taskTitle: 'Título de la tarea',
      taskTitlePlaceholder: 'Ingrese el título de la tarea...',
      taskDesc: 'Descripción de la tarea',
      taskDescPlaceholder: 'Añada una descripción (opcional)...',
      total: 'Total',
      overdue: 'Atrasado',
      today: 'Hoy',
      inReview: 'En revisión',
      allStatuses: 'Todos los estados',
      backlog: 'Backlog',
      todo: 'Por hacer',
      inProgress: 'En progreso',
      done: 'Hecho',
      next7days: 'Próximos 7 días',
      noDueDate: 'Sin fecha de vencimiento',
      noTasksFound: 'Tareas no encontradas',
      noTasks: 'Aún no tiene tareas',
      newTask: 'Nueva tarea',
      newTaskDesc: 'Cree una nueva tarea para realizar seguimiento',
      prevMonth: 'Atrás',
      nextMonth: 'Adelante',
      more: 'más',
      taskLegend: 'Tarea',
    },
    kb: {
      title: 'Base de conocimiento',
      description: 'Documentos y conocimiento de su comunidad',
      searchPlaceholder: 'Buscar documentos...',
      indexBtn: 'Indexar con IA',
      indexing: 'Indexando...',
      indexSuccess: 'Archivo indexado con éxito por la IA y agregado a la base de conocimiento vectorial.',
      indexSuccessTitle: 'Indexación completada',
      indexError: 'Error de indexación',
      indexErrorTitle: 'Error de indexación',
      indexFailedDesc: 'No se pudo indexar el archivo',
      errorLoadFiles: 'Error al cargar los archivos',
      addedToKb: 'Añadido a la base de conocimiento',
      removedFromKb: 'Eliminado de la base de conocimiento',
      fileUpdated: 'Archivo actualizado con éxito',
      errorUpdate: 'Error al actualizar el archivo',
      uploadBtn: 'Subir archivo',
      emptyState: 'La base de conocimiento está vacía. Suba su primer documento.',
      noFilesFound: 'No se encontraron archivos',
      tabCommunity: 'Comunidad',
      tabProjects: 'Proyectos',
      tabPersonal: 'Personal',
      allFiles: 'Todos los archivos',
      removeFromKb: 'Quitar de la base de conocimiento',
      addToKb: 'Añadir a la base de conocimiento',
      reindex: 'Reindexar',
      download: 'Descargar',
      copyLink: 'Copiar enlace',
      move: 'Mover',
      indexed: 'Indexado',
      configTitle: 'Configuración de indexación de IA',
      configDesc: 'Especifique el tamaño del fragmento y el solapamiento para dividir el documento. Esto ayudará a optimizar la calidad de búsqueda de RAG.',
      chunkSize: 'Tamaño del fragmento',
      chunkOverlap: 'Solapamiento',
      indexAction: 'Indexar',
    },
  },
};

// Хук для использования переводов
import { useState, useEffect } from 'react';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    // Migrate legacy 'ua' to 'uk'
    if (saved === 'ua') {
      localStorage.setItem('language', 'uk');
      return 'uk';
    }
    if (saved && ['uk', 'en', 'ru', 'es'].includes(saved)) {
      return saved as Language;
    }
    
    // Определяем язык по браузеру
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ru')) return 'ru';
    if (browserLang.startsWith('uk')) return 'uk';
    if (browserLang.startsWith('es')) return 'es';
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  return { t, language, setLanguage };
};