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
  branch: string;
  actions: string;

  // Дополнительные общие
  allRepliesVisible: string;
  inviteParticipants: string;
  globalSearch: {
    title: string;
    filtersLabel: string;
    allChats: string;
    startDatePlaceholder: string;
    endDatePlaceholder: string;
    resetBtn: string;
    nothingFound: string;
    tryAnotherQuery: string;
    startTypingToSearch: string;
    searchHint: string;
    keyboardHint: string;
    footerNavigation: string;
    inChat: string;
    userMessage: string;
    spiritAnswer: string;
    typeChat: string;
    typeMessage: string;
    typeProject: string;
    typeUser: string;
    typeFile: string;
  };
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
    backToLanding: string;
    goToDashboard: string;
    billing: string;
    platformTeam: string;
    adminAgent: string;
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
    successCreate: string;
    wipTitle: string;
    wipDesc: string;
    errorCreate: string;
    messenger: string;
    pin: string;
    unpin: string;
    archive: string;
    archiveConfirm: string;
    archiveSuccessTitle: string;
    archiveSuccessDesc: string;
    renameSuccessTitle: string;
    renameSuccessDesc: string;
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
    copySuccessTitle: string;
    copySuccessDesc: string;
    feedbackDisabledTitle: string;
    feedbackDisabledDesc: string;
    feedbackSuccessTitle: string;
    feedbackSuccessDesc: string;
    feedbackErrorTitle: string;
    feedbackErrorDesc: string;
    voiceDisabledTitle: string;
    voiceDisabledDesc: string;
    deleteSuccessTitle: string;
    deleteSuccessDesc: string;
    deleteErrorTitle: string;
    deleteErrorDesc: string;
    copyBtn: string;
    systemSender: string;
    spiritSender: string;
    userSender: string;
    deleteTooltip: string;
    deletedText: string;
    fileUnavailable: string;
    hideTranscript: string;
    showTranscript: string;
    sourcesTitle: string;
    tokensCount: string;
    latency: string;
    cost: string;
    replyTooltip: string;
    stopTtsTooltip: string;
    startTtsTooltip: string;
    createThreadTooltip: string;
    reply1: string;
    reply24: string;
    reply5: string;
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
    errorCode: string;
    errorRetryable: string;
    yes: string;
    no: string;
    loadCommunitiesError: string;
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
    loadError: string;
    titleRequired: string;
    createError: string;
    createModalTitle: string;
    createModalDesc: string;
    labelName: string;
    placeholderName: string;
    labelDesc: string;
    placeholderDesc: string;
    cancelBtn: string;
    creatingBtn: string;
    today: string;
    yesterday: string;
    daysAgo: string;
    activeCount: string;
    overdueCount: string;
    completedCount: string;
    openBtn: string;
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
  auth: {
    signIn: string;
    signUp: string;
    displayName: string;
    displayNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    useCase: string;
    useCasePlaceholder: string;
    founderCode: string;
    founderCodePlaceholder: string;
    founderCodeHelper: string;
    submitApplication: string;
    submitFounder: string;
    loginBtn: string;
    communityName: string;
    communityNamePlaceholder: string;
    communityType: string;
  };
  onboarding: {
    lobbyTitle: string;
    lobbyIntro: string;
    draftAlertTitle: string;
    draftAlertDesc: string;
    restoreDraft: string;
    activeCommunities: string;
    createCommunity: string;
    createCommunitySubtitle: string;
    createCommunityDesc: string;
    startOnboardingBtn: string;
    joinCommunity: string;
    joinCommunitySubtitle: string;
    joinCodePlaceholder: string;
    joinBtn: string;
    joinLoading: string;
    applyFounder: string;
    applyFounderSubtitle: string;
    applyFounderDesc: string;
    enterReasonPlaceholder: string;
    applyBtn: string;
    applySuccessTitle: string;
    applySuccessDesc: string;
    joinSuccessTitle: string;
    joinSuccessDesc: string;
    wizardTitle: string;
    saveDraftBtn: string;
    saveDraftSuccessTitle: string;
    saveDraftSuccessDesc: string;
    draftRestoredTitle: string;
    draftRestoredDesc: string;
    errorSelectCommunityName: string;
    creationSuccessTitle: string;
    creationSuccessDesc: string;
    stepTitle: string;
    agentStep1: string;
    agentStep2: string;
    agentStep3: string;
    agentStep4: string;
    agentStep5: string;
    agentStep6: string;
    agentStep7: string;
    agentStep8: string;
    labelCommunityName: string;
    labelCommunityDesc: string;
    labelMission: string;
    labelGoal30Days: string;
    labelCommunityRules: string;
    labelAgentName: string;
    labelAutonomyLevel: string;
    autonomyAssistant: string;
    autonomyCoordinator: string;
    autonomyAdmin: string;
    labelInviteCodes: string;
    labelMemberCode: string;
    labelAdminCode: string;
    labelInitialNotes: string;
    labelFirstTaskTitle: string;
    labelFirstTaskDesc: string;
    inputPlaceholderCommunityName: string;
    inputPlaceholderCommunityDesc: string;
    inputPlaceholderMission: string;
    inputPlaceholderGoal30Days: string;
    inputPlaceholderCommunityRules: string;
    inputPlaceholderAgentName: string;
    inputPlaceholderMemberCode: string;
    inputPlaceholderAdminCode: string;
    inputPlaceholderInitialNotes: string;
    inputPlaceholderFirstTaskTitle: string;
    inputPlaceholderFirstTaskDesc: string;
    btnNextStep: string;
    btnPrevStep: string;
    btnComplete: string;
    btnCompleting: string;
    creationErrorTitle: string;
    creationErrorDesc: string;
    joinErrorTitle: string;
    joinErrorDesc: string;
    saveDraftErrorTitle: string;
    submitErrorTitle: string;
    errorLimitTitle: string;
    errorLimitDesc: string;
    errorCreationTitle: string;
    errorCreationDesc: string;
  };
  spiritWidget: {
    activeStatus: string;
    mainOrganizer: string;
    supervisorAdmin: string;
    coordinator: string;
    assistant: string;
    spiritDAO: string;
    memoryMission: string;
    goal30Days: string;
    defaultMission: string;
    defaultGoal: string;
    agentReady: string;
    quickActions: string;
    talkBtn: string;
    talkToastTitle: string;
    talkToastDesc: string;
    summarizeBtn: string;
    summarizeToastTitle: string;
    summarizeToastDesc: string;
    inviteBtn: string;
    inviteToastTitle: string;
    inviteToastDesc: string;
    createTaskBtn: string;
    rulesBtn: string;
    rulesToastTitle: string;
    rulesToastDesc: string;
    planWeekBtn: string;
    planWeekToastTitle: string;
    planWeekToastDesc: string;
    widgetTitle: string;
  };
  clientInstall: {
    macSilicon: string;
    macIntel: string;
    windows: string;
    linux: string;
    android: string;
    ios: string;
    beta: string;
    canary: string;
    sideload: string;
    comingSoon: string;
    archLayersTitle: string;
    archLayersSubtitle: string;
    l1Title: string;
    l1Subtitle: string;
    l1Point1: string;
    l1Point2: string;
    l1Point3: string;
    l1Point4: string;
    l2Title: string;
    l2Subtitle: string;
    l2Point1: string;
    l2Point2: string;
    l2Point3: string;
    l2Point4: string;
    l3Title: string;
    l3Subtitle: string;
    l3Point1: string;
    l3Point2: string;
    l3Point3: string;
    l3Point4: string;
    installTitle: string;
    installSubtitle: string;
    downloadFromGithub: string;
    viewReleasesGithub: string;
    supportedPlatforms: string;
    platformFormat: string;
    platformDesc: string;
    securityTitle: string;
    secSovereignTitle: string;
    secSovereignDesc: string;
    secSandboxTitle: string;
    secSandboxDesc: string;
    secUpdatesTitle: string;
    secUpdatesDesc: string;
    secVerificationDesc: string;
    forDevsTitle: string;
    forDevsStep1: string;
    forDevsStep2: string;
    forDevsStep3: string;
    forDevsTerminal: string;
    forDevsStep4: string;
    openOnGithub: string;
    diagnosticsTitle: string;
    diagnosticsDesc: string;
    readyTitle: string;
    readyDesc: string;
    downloadBtn: string;
    returnToMicroDAO: string;
    footerCopyright: string;
    footerDesc: string;
    downloadInstaller: string;
    openWebPwa: string;
    selectPlatformBelow: string;
    fallbackVersionDesc: string;
    githubSourceLinkDesc: string;
    architectureLabel: string;
    formatLabel: string;
    versionLabel: string;
    devToolsLabel: string;
    sourceCodeGithub: string;
  };
  pricingExtra: {
    title: string;
    subtitle: string;
    desc: string;
    testing: string;
    scaling: string;
    recommended: string;
    selfHosted: string;
    free: string;
    forFirstCommunities: string;
    earlyAccessDesc: string;
    pendingLaunch: string;
    forSmallTeams: string;
    communityDesc: string;
    byInvitation: string;
    supportDevelopment: string;
    founderDesc: string;
    autonomous: string;
    forDaoNetworks: string;
    sovereignDesc: string;
    earlyAccessFeature1: string;
    earlyAccessFeature2: string;
    earlyAccessFeature3: string;
    earlyAccessFeature4: string;
    earlyAccessFeature5: string;
    communityFeature1: string;
    communityFeature2: string;
    communityFeature3: string;
    communityFeature4: string;
    communityFeature5: string;
    founderFeature1: string;
    founderFeature2: string;
    founderFeature3: string;
    founderFeature4: string;
    founderFeature5: string;
    sovereignFeature1: string;
    sovereignFeature2: string;
    sovereignFeature3: string;
    sovereignFeature4: string;
    sovereignFeature5: string;
    applyBtn: string;
    requestAccessBtn: string;
    becomeFounderBtn: string;
    startBtn: string;
    
    leaderPlanName: string;
    leaderPlanPrice: string;
    leaderPlanPeriod: string;
    leaderPlanDesc: string;
    leaderPlanFeature1: string;
    leaderPlanFeature2: string;
    leaderPlanFeature3: string;
    leaderPlanFeature4: string;
    leaderPlanFeature5: string;
    leaderPlanFeature6: string;
    activateCryptoBtn: string;
    buyDaarBtn: string;
    
    participantName: string;
    participantDesc: string;
    participantFeature1: string;
    participantFeature2: string;
    participantFeature3: string;
    participantFeature4: string;
    joinInviteBtn: string;

    partnerName: string;
    partnerDesc: string;
    partnerFeature1: string;
    partnerFeature2: string;
    partnerFeature3: string;
    partnerFeature4: string;
    partnerCta: string;

    sovereignName: string;
    sovereignDescNew: string;
    sovereignFeatureNew1: string;
    sovereignFeatureNew2: string;
    sovereignFeatureNew3: string;
    sovereignFeatureNew4: string;
    sovereignCta: string;

    workerNodeName: string;
    workerNodeDesc: string;
    workerNodeFeature1: string;
    workerNodeFeature2: string;
    workerNodeFeature3: string;
    workerNodeFeature4: string;
    workerNodeCta: string;

    distinctionTitle: string;
    distinctionDesc: string;
    manageSubscription: string;
    goToVerificationQueue: string;
    billingTitle: string;
    billingDesc: string;
    inviteGuardian: string;
    guardianEmail: string;
    createInvite: string;
    copyInviteLink: string;
    pendingInvites: string;
    acceptedInvites: string;
    revokeInvite: string;
    askAdminAgent: string;
    draftMode: string;
    noAutonomousActions: string;
    privateDataProtected: string;
  };
  start: {
    heroTagline: string;
    featureRuleTitle: string;
    featureRuleDesc: string;
    featureMemoryTitle: string;
    featureMemoryDesc: string;
    featureCoordTitle: string;
    featureCoordDesc: string;
    featureChatTitle: string;
    featureChatDesc: string;
    featureAgentTitle: string;
    featureAgentDesc: string;
    archRuleTitle: string;
    archRuleDesc: string;
    heroIntro: string;
    spaceCapTitle: string;
    spiritZhosTitle: string;
    spiritZhosDesc: string;
    spiritPrinciplesTitle: string;
    principle1: string;
    principle2: string;
    principle3: string;
    principle4: string;
    principle5: string;
    howItWorksTitle: string;
    howItWorksSubtitle: string;
    step1Num: string;
    step1Title: string;
    step1Desc: string;
    step2Num: string;
    step2Title: string;
    step2Desc: string;
    step3Num: string;
    step3Title: string;
    step3Desc: string;
    step4Num: string;
    step4Title: string;
    step4Desc: string;
    archTitle: string;
    archSubtitle: string;
    archDagiTitle: string;
    archDagiDesc: string;
    archSpaceTitle: string;
    archSpaceDesc: string;
    archSecondMeTitle: string;
    archSecondMeDesc: string;
    spaceTypesTitle: string;
    typeProjectTitle: string;
    typeProjectDesc: string;
    typeCreativeTitle: string;
    typeCreativeDesc: string;
    typeInfraTitle: string;
    typeInfraDesc: string;
    typeCityTitle: string;
    typeCityDesc: string;
    ecosystemTitle: string;
    dagiDesc: string;
    microDaoDesc: string;
    cityDesc: string;
    joinBtn: string;
  };
  importExtra: {
    title: string;
    backBtn: string;
    uploadBtn: string;
    formatsHelper: string;
    dropActive: string;
    dropInactive: string;
    limitDesc: string;
    importBtn: string;
    importing: string;
    errorTooLargeTitle: string;
    errorTooLargeDesc: string;
    importSuccessTitle: string;
    importSuccessDesc: string;
    importFailedTitle: string;
    howToExportTg: string;
    tgStep1: string;
    tgStep1Desc: string;
    tgStep2: string;
    tgStep2Desc: string;
    tgStep3: string;
    tgStep3Desc: string;
  };
  settingsExtra: {
    profileDesc: string;
    uploadPhoto: string;
    errorTitle: string;
    errorTooLarge: string;
    errorImageOnly: string;
    labelDisplayName: string;
    placeholderDisplayName: string;
    themeSectionTitle: string;
    themeSectionDesc: string;
    langSelectLabel: string;
    zhosSectionTitle: string;
    zhosSectionDesc: string;
    zhosShowPrinciples: string;
    pushTitle: string;
    pushDesc: string;
    enableBtn: string;
    pushDeniedAlert: string;
    notifyNewsTitle: string;
    notifyNewsDesc: string;
    notifyChatsTitle: string;
    notifyChatsDesc: string;
    loadingChats: string;
    noChats: string;
    chatFallbackName: string;
    limitsTitle: string;
    limitsOnline: string;
    limitsFileSize: string;
    limitsMessageLength: string;
    saving: string;
    langUk: string;
    langEn: string;
    langRu: string;
    langEs: string;
  };
  authForm: {
    authErrorTitle: string;
    fillRequired: string;
    userExistsTitle: string;
    userExistsDesc: string;
    regSuccessTitle: string;
    regSuccessDesc: string;
    welcomeTitle: string;
    welcomeDesc: string;
    regErrorDesc: string;
    emailNotVerifiedTitle: string;
    emailNotVerifiedDesc: string;
    invalidCredentialsTitle: string;
    invalidCredentialsDesc: string;
    loginErrorTitle: string;
    welcomeLoginDesc: string;
    loginErrorDesc: string;
    resendConfirmRequired: string;
    resendConfirmSuccessTitle: string;
    resendConfirmSuccessDesc: string;
    resendConfirmErrorDesc: string;
    forgotPasswordRequired: string;
    forgotPasswordSuccessTitle: string;
    forgotPasswordSuccessDesc: string;
    forgotPasswordErrorDesc: string;
    fillBothPasswords: string;
    passwordsDoNotMatch: string;
    passwordMinLength: string;
    updatePasswordErrorTitle: string;
    updatePasswordSuccessTitle: string;
    updatePasswordSuccessDesc: string;
    updatePasswordErrorDesc: string;
    newPasswordTitle: string;
    newPasswordDesc: string;
    labelNewPassword: string;
    placeholderNewPassword: string;
    labelConfirmPassword: string;
    placeholderConfirmPassword: string;
    btnUpdatePassword: string;
    btnUpdatingPassword: string;
    btnBackToLogin: string;
    cantLoginTitle: string;
    cantLoginDesc: string;
    btnResetPassword: string;
    deviceRemembered: string;
    forgotPasswordLink: string;
    emailUnconfirmedAlert: string;
    btnResendConfirm: string;
    btnResendingConfirm: string;
    forgotPasswordSectionTitle: string;
    forgotPasswordSectionDesc: string;
    requiredFieldsError: string;
    recoveryLinkInvalidTitle: string;
    recoveryLinkInvalidDesc: string;
  };
  chatsExtra: {
    today: string;
    yesterday: string;
    daysAgo: string;
    loading: string;
    totalChats: string;
    noChatsFound: string;
    noChatsYet: string;
    searchChatsPlaceholder: string;
    filterNoChatsFoundDesc: string;
    filterNoChatsYetDesc: string;
    voiceMeetingBtn: string;
    voiceMeetingDialogTitle: string;
    forkedFrom: string;
    active: string;
    loadErrorTitle: string;
    pinSuccess: string;
    unpinSuccess: string;
    pinDesc: string;
    unpinDesc: string;
    pinError: string;
    pinTooltip: string;
    unpinTooltip: string;
    onlineCount: string;
    error: string;
  };
  chatsManagement: {
    loadErrorTitle: string;
    loadErrorDesc: string;
    chatsArchivedTitle: string;
    chatsRestoredTitle: string;
    chatsArchivedDesc: string;
    chatsRestoredDesc: string;
    archiveErrorTitle: string;
    archiveErrorDesc: string;
    restoreErrorDesc: string;
    chatsDeletedTitle: string;
    chatsDeletedDesc: string;
    deleteErrorTitle: string;
    deleteErrorDesc: string;
    loadingChats: string;
    backToChatsBtn: string;
    pageTitle: string;
    pageSubtitle: string;
    totalChatsCount: string;
    searchPlaceholder: string;
    tabActive: string;
    tabArchived: string;
    selectedChatsCount: string;
    selectAllChats: string;
    btnToArchive: string;
    btnRestore: string;
    btnDelete: string;
    deleteConfirmTitle: string;
    deleteConfirmDesc: string;
    deleteLogNote: string;
    cancelBtn: string;
    deleteForeverBtn: string;
    noChatsFound: string;
    noActiveChats: string;
    noArchivedChats: string;
    searchEmptyStateDesc: string;
    activeEmptyStateDesc: string;
    messagesCount: string;
    chatCreatedDate: string;
    chatUpdatedDate: string;
    btnOpenChat: string;
    noMessages: string;
  };
  newsExtra: {
    loadErrorTitle: string;
    loadErrorDesc: string;
    settingsUpdatedTitle: string;
    notifyEnabledDesc: string;
    notifyDisabledDesc: string;
    updateSettingsErrorTitle: string;
    updateSettingsErrorDesc: string;
    messageSentTitle: string;
    messageSentAgentDesc: string;
    sendErrorTitle: string;
    sendErrorDesc: string;
    agentFallbackName: string;
    userFallbackName: string;
    feedTitle: string;
    notifyLabel: string;
    textPlaceholder: string;
    helperText: string;
  };
  participantsExtra: {
    userFallbackName: string;
    loadErrorTitle: string;
    loadErrorDesc: string;
    updateProfileErrorTitle: string;
    updateProfileErrorDesc: string;
    requestApprovedTitle: string;
    requestRejectedTitle: string;
    userApprovedDesc: string;
    userRejectedDesc: string;
    voteRegisteredDesc: string;
    requestErrorTitle: string;
    requestErrorDesc: string;
    loadingText: string;
    pageTitle: string;
    pageSubtitle: string;
    tabPending: string;
    tabApproved: string;
    tabRejected: string;
    noPendingTitle: string;
    noPendingDesc: string;
    requestedDate: string;
    approvedVotes: string;
    rejectedVotes: string;
    requiredVotes: string;
    statusPending: string;
    commentPlaceholder: string;
    btnApprove: string;
    btnReject: string;
    alreadyVoted: string;
    joinedDate: string;
    roleMember: string;
    rejectedDate: string;
    roleRejected: string;
    triggerButton: string;
    onlineCountDesc: string;
    online: string;
    offline: string;
    offlineHeader: string;
    onlineHeader: string;
    notInNetwork: string;
    noParticipants: string;
    remainingOnline: string;
  };
  promptEditor: {
    loadErrorDesc: string;
    refreshSuccessDesc: string;
    errorEmptyVersionNameTitle: string;
    errorEmptyVersionNameDesc: string;
    saveSuccessDesc: string;
    saveErrorTitle: string;
    saveErrorDesc: string;
    activateSuccessDesc: string;
    activateErrorTitle: string;
    activateErrorDesc: string;
    editVersionLoadedDesc: string;
    loadingCommunity: string;
    noActiveCommunityTitle: string;
    noActiveCommunityDesc: string;
    pageTitle: string;
    pageSubtitle: string;
    btnRefresh: string;
    btnSaveVersion: string;
    btnSavingVersion: string;
    tabSystem: string;
    tabResponses: string;
    tabFallback: string;
    labelSystemInstructions: string;
    labelResponsesInstructions: string;
    labelFallbackInstructions: string;
    descSystemInstructions: string;
    descResponsesInstructions: string;
    descFallbackInstructions: string;
    activeVersionLabel: string;
    viewOnlyWarning: string;
    unsavedChangesAlert: string;
    labelVersionName: string;
    placeholderVersionName: string;
    labelPromptContentSystem: string;
    labelPromptContentResponses: string;
    labelPromptContentFallback: string;
    placeholderPromptContentSystem: string;
    placeholderPromptContentResponses: string;
    placeholderPromptContentFallback: string;
    versionsListTitle: string;
    totalVersionsCount: string;
    noVersionsFound: string;
    badgeActive: string;
    badgeDraft: string;
    btnActivate: string;
    btnEdit: string;
    btnView: string;
  };
  integrationsExtra: {
    loadErrorTitle: string;
    loadErrorDesc: string;
    updateSuccessTitle: string;
    updateSuccessDesc: string;
    updateErrorTitle: string;
    updateErrorDesc: string;
    connectSuccessTitle: string;
    connectSuccessDesc: string;
    connectErrorTitle: string;
    connectErrorDesc: string;
    disconnectSuccessTitle: string;
    disconnectSuccessDesc: string;
    disconnectErrorTitle: string;
    disconnectErrorDesc: string;
    scopeLabel: string;
    scopePrivate: string;
    scopeTeam: string;
    scopePrivateDesc: string;
    scopeTeamDesc: string;
    setupTitle: string;
    setupDesc: string;
    btnSetupSave: string;
    placeholderBotToken: string;
    placeholderChatId: string;
    placeholderApiKey: string;
    placeholderPhoneNumber: string;
    placeholderSmtpHost: string;
    placeholderSmtpPort: string;
    placeholderSmtpPassword: string;
    placeholderCalendarToken: string;
    placeholderSlackChannel: string;
    placeholderDiscordServer: string;
    labelBotToken: string;
    labelChatId: string;
    labelApiKey: string;
    labelPhoneNumber: string;
    labelSmtpHost: string;
    labelSmtpPort: string;
    labelSmtpPassword: string;
    labelCalendarType: string;
    labelCalendarToken: string;
    labelSlackChannel: string;
    labelDiscordServer: string;
    descriptionTelegram: string;
    descriptionWhatsapp: string;
    descriptionEmail: string;
    nameCalendar: string;
    descriptionCalendar: string;
    descriptionSlack: string;
    descriptionDiscord: string;
    descriptionGoogleDrive: string;
    descriptionGoogleDocs: string;
    descriptionOpenAI: string;
    descriptionDeepSeek: string;
    pageTitle: string;
    pageSubtitle: string;
    pageDesc1: string;
    pageDesc2: string;
    tabsAll: string;
    tabsTeam: string;
    tabsPrivate: string;
    statusConnected: string;
    statusNotConnected: string;
    scopeTeamText: string;
    scopePrivateText: string;
    lastSyncText: string;
    btnEnabled: string;
    btnDisabled: string;
    btnConnecting: string;
    btnConnect: string;
    btnSetup: string;
    btnDisconnect: string;
    btnCancel: string;
    howItWorksTitle: string;
    howItWorksStep1: string;
    howItWorksStep2: string;
    howItWorksStep3: string;
    howItWorksStep4: string;
    selectPlaceholder: string;
  };
  projectLayout: {
    tabChat: string;
    tabKanban: string;
    tabDocs: string;
    tabMeetings: string;
    tabSettings: string;
    docsWipTitle: string;
    docsWipDesc: string;
    meetingsWipTitle: string;
    meetingsWipDesc: string;
    settingsWipTitle: string;
    settingsWipDesc: string;
  };
  agoraVoiceCall: {
    loadErrorAuth: string;
    loadErrorInit: string;
    connectingTitle: string;
    connectingDesc: string;
    connectErrorToken: string;
    connectedTitle: string;
    connectedDesc: string;
    connectErrorChannel: string;
    disconnectedTitle: string;
    disconnectedDesc: string;
    channelHeader: string;
    participantsCount: string;
    btnStartMeeting: string;
    tooltipMute: string;
    tooltipUnmute: string;
    labelParticipants: string;
    participantFallback: string;
  };
  chatInterface: {
    errPlayTitle: string;
    errPlayDesc: string;
    errTtsTitle: string;
    errTtsDesc: string;
    userFallbackName: string;
    errUploadTitle: string;
    errFileSizeTitle: string;
    errFileSizeDesc: string;
    errFileTypeTitle: string;
    errHttpsTitle: string;
    errHttpsDesc: string;
    errMicrophoneNotSupportedTitle: string;
    errMicrophoneNotSupportedDesc: string;
    errMicrophoneNotFoundTitle: string;
    errMicrophoneNotFoundDesc: string;
    logTtsFallback: string;
    toastProcessingVoiceTitle: string;
    toastConvertingDesc: string;
    toastSavingDesc: string;
    toastAudioRecordedTitle: string;
    toastSendingDesc: string;
    toastAudioFormatErrorTitle: string;
    toastAudioFormatErrorDesc: string;
    toastVoiceDisabledTitle: string;
    toastVoiceDisabledDesc: string;
    toastAuthErrorTitle: string;
    toastAuthErrorDesc: string;
    toastServerErrorTitle: string;
    toastServerErrorDesc: string;
    toastVoiceRecognitionErrorTitle: string;
    toastVoiceRecognitionErrorDesc: string;
    toastMicPermissionDeniedTitle: string;
    toastMicPermissionDeniedDesc: string;
    toastMicBusyTitle: string;
    toastMicBusyDesc: string;
    toastSecurityErrorTitle: string;
    toastSecurityErrorDesc: string;
    toastNotSupportedTitle: string;
    toastNotSupportedDesc: string;
    toastRecordErrorTitle: string;
    toastRecordErrorDesc: string;
    toastAccessErrorTitle: string;
    toastAccessErrorDesc: string;
    toastDifyPrivateChatAlert: string;
    btnAutoStopOn: string;
    btnSpeaking: string;
    labelUploadingFiles: string;
    ariaDeleteFile: string;
    placeholderRecording: string;
    placeholderTypeMessage: string;
    ariaAttachFile: string;
    ariaVoiceSettings: string;
    voiceSettingsTitle: string;
    voiceModeLabel: string;
    voiceModeDesc: string;
    autoStopLabel: string;
    autoStopDesc: string;
    ariaStopPlayback: string;
    ariaStopRecording: string;
    ariaStartRecording: string;
    ariaStopGeneration: string;
    ariaSendMessage: string;
    titleMainAgentUnavailable: string;
    indicatorAgentTyping: string;
    indicatorSpeakingResponse: string;
  };
  pendingApproval: {
    cardTitle: string;
    cardDesc: string;
    accountLabel: string;
    statusLabel: string;
    statusPending: string;
    btnLogout: string;
    btnBackHome: string;
  };
  agentDirectory: {
    stewardBadge: string;
    stewardDesc: string;
    stewardFunc1: string;
    stewardFunc2: string;
    stewardFunc3: string;
    stewardFunc4: string;
    stewardPrompt: string;
    ragBadge: string;
    ragDesc: string;
    ragFunc1: string;
    ragFunc2: string;
    ragFunc3: string;
    ragFunc4: string;
    ragPrompt: string;
    taskBadge: string;
    taskDesc: string;
    taskFunc1: string;
    taskFunc2: string;
    taskFunc3: string;
    taskFunc4: string;
    taskPrompt: string;
    procBadge: string;
    procDesc: string;
    procFunc1: string;
    procFunc2: string;
    procFunc3: string;
    procFunc4: string;
    procPrompt: string;
    navbarAgents: string;
    navbarPricing: string;
    navbarClient: string;
    panelBtn: string;
    startBtn: string;
    pageTitle: string;
    pageSubtitle: string;
    pageDesc: string;
    labelFuncs: string;
    labelPrompt: string;
    btnStartChat: string;
    btnCreateSpace: string;
    footerCopyright: string;
  };
  agents: {
    yaroName: string;
    yaroDesc: string;
    eonName: string;
    eonDesc: string;
    errLoad: string;
    errNameRequired: string;
    successCreate: string;
    errCreate: string;
    labelPersonalSuffix: string;
    errAlreadyInstalled: string;
    personalChatName: string;
    successInstall: string;
    errInstall: string;
    successActive: string;
    successPaused: string;
    errStatus: string;
    deleteConfirm: string;
    successDelete: string;
    errDelete: string;
    statusActive: string;
    statusPaused: string;
    statusDisconnected: string;
    pageTitle: string;
    pageSubtitle: string;
    catalogBtn: string;
    catalogTitle: string;
    btnInstall: string;
    connectCustomBtn: string;
    connectCustomTitle: string;
    labelAgentName: string;
    placeholderAgentName: string;
    labelAgentDesc: string;
    placeholderAgentDesc: string;
    labelConnectionType: string;
    connectionTypeMsp: string;
    btnCreateAgent: string;
    noAgentsTitle: string;
    noAgentsDesc: string;
    btnConnectAgent: string;
    preset: string;
    labelType: string;
    btnToChat: string;
  };
  chatPage: {
    returnToChats: string;
    userFallbackName: string;
    agentFallbackName: string;
    knotFixedDesc: string;
    branchSuccessDesc: string;
    auditViolationDesc: string;
    btnKnot: string;
    indicatorTypingSingle: string;
    indicatorTypingMultiple: string;
    forkedFromTitle: string;
  };  communityChat: {
    title: string;
    description: string;
    loadError: string;
    sendError: string;
    loading: string;
    welcomeMsg: string;
    welcomeSystemName: string;
    welcomeUpdateMsg: string;
    welcomeAgentName: string;
    agentName: string;
    agentBadge: string;
    inputPlaceholder: string;
    agentTyping: string;
    senderFallbackUser: string;
    senderFallbackMember: string;
  };
  threadPanel: {
    title: string;
    subtitle: string;
    parentPreview: string;
    parentSender: string;
    emptyState: string;
    inputPlaceholder: string;
    sendError: string;
  };
  videoIntro: {
    notSupported: string;
    unmute: string;
    mute: string;
    skip: string;
    welcome: string;
  };
  createModal: {
    createTitle: string;
    chatDesc: string;
    branchDesc: string;
    projectDesc: string;
    chatType: string;
    placeholderChatName: string;
    placeholderProjectName: string;
    placeholderBranchName: string;
    placeholderDescOptional: string;
    placeholderTags: string;
    tagsHint: string;
    messageIdLabel: string;
    placeholderMessageId: string;
    createBtn: string;
    chatTypeLabel: string;
    chatTitleLabel: string;
    projectTitleLabel: string;
    branchTitleLabel: string;
    descPlaceholder: string;
    tagsPlaceholder: string;
    messageIdPlaceholder: string;
  };
  fileUploadDialog: {
    dialogTitle: string;
    dialogDesc: string;
    labelDescription: string;
    placeholderDescription: string;
    labelTags: string;
    placeholderTags: string;
    btnUpload: string;
    progress: string;
    dragActive: string;
    dragInactive: string;
    supportedFormats: string;
  };
  pushNotifications: {
    permissionDeniedTitle: string;
    permissionDeniedDesc: string;
    notSupportedTitle: string;
    notSupportedDesc: string;
    swRegistrationFailedTitle: string;
    swRegistrationFailedDesc: string;
    enabledTitle: string;
    enabledDesc: string;
    enabledTabDesc: string;
    disabledTitle: string;
    disabledDesc: string;
    settingsSavedTitle: string;
    settingsSavedDesc: string;
    settingsSaveFailedTitle: string;
    settingsSaveFailedDesc: string;
  };
  onboardingWizard: {
    aiGuide: string;
    listening: string;
    autonomy: string;
    stepOf: string;
    stepsTitle: string[];
    completed: string;
    labelCommName: string;
    placeholderCommName: string;
    labelCommType: string;
    placeholderCommType: string;
    types: {
      workspace: string;
      village: string;
      dao: string;
      club: string;
      charity: string;
      other: string;
    };
    labelCommDesc: string;
    placeholderCommDesc: string;
    placeholderCommMission: string;
    placeholderCommGoal: string;
    placeholderCommValues: string;
    labelAgentName: string;
    labelAgentTone: string;
    placeholderAgentTone: string;
    tones: {
      warm: string;
      philosophical: string;
      technical: string;
      formal: string;
    };
    autonomyLevelLabel: string;
    autonomyLevels: {
      assistant: string;
      assistantDesc: string;
      coordinator: string;
      coordinatorDesc: string;
      admin: string;
      adminDesc: string;
    };
    permissionsLabel: string;
    permissions: {
      welcome: string;
      tasks: string;
      invites: string;
      summaries: string;
    };
    sensitiveActionsWarning: string;
    labelInviteMember: string;
    labelInviteAdmin: string;
    labelMaxUses: string;
    labelKbSeed: string;
    placeholderKbSeed: string;
    taskPlanningTitle: string;
    taskTitleLabel: string;
    taskDescLabel: string;
    configReviewTitle: string;
    reviewLabels: {
      name: string;
      type: string;
      agent: string;
      autonomy: string;
      code: string;
    };
    lobbyBtn: string;
    draftBtn: string;
    nextBtn: string;
    launchBtn: string;
    errorNameRequired: string;
    errorNameDesc: string;
    defaultAgentName: string;
    defaultFirstTaskTitle: string;
    defaultFirstTaskDesc: string;
    agentMsg1: string;
    agentMsg2: string;
    agentMsg3: string;
    agentMsg4: string;
    agentMsg5: string;
    agentMsg6: string;
    agentMsg7: string;
    agentMsg8: string;
    exitBtn: string;
    ecosystemTitle: string;
    ecosystemSubtitle1: string;
    ecosystemSubtitle2: string;
    ecosystemDesc: string;
    draftFoundTitle: string;
    draftFoundDesc: string;
    restoreDraftBtn: string;
    existingCommTitle: string;
    createCommTitle: string;
    createCommDesc: string;
    startCreationBtn: string;
    joinCommTitle: string;
    joinCommDesc: string;
    joinCommPlaceholder: string;
    joiningBtn: string;
    joinBtn: string;
    partnerTitle: string;
    partnerDesc: string;
    partnerPendingTitle: string;
    partnerPendingDesc: string;
    partnerPlaceholder: string;
    sendingBtn: string;
    sendRequestBtn: string;
    toastErrorTitle: string;
    toastEnterInviteCode: string;
    toastJoinSuccessTitle: string;
    toastJoinSuccessDesc: string;
    toastJoinErrorTitle: string;
    toastJoinErrorDesc: string;
    toastPartnerSuccessTitle: string;
    toastPartnerSuccessDesc: string;
    toastPartnerErrorTitle: string;
    toastDraftRestoredTitle: string;
    toastDraftRestoredDesc: string;
    toastDraftSavedTitle: string;
    toastDraftSavedDesc: string;
    toastDraftSaveErrorTitle: string;
    toastStep1ErrorTitle: string;
    toastStep1ErrorDesc: string;
    defaultChatName: string;
    toastCreateSuccessTitle: string;
    toastCreateSuccessDesc: string;
    toastCreateErrorTitle: string;
    toastCreateErrorDesc: string;
    defaultStepMsg: string;
  };
  communityNewsFeed: {
    urgentSentTitle: string;
    urgentSentDesc: string;
    sendErrorTitle: string;
    sendErrorDesc: string;
    agentBadge: string;
    userBadge: string;
    title: string;
    messagesCount: string;
    placeholder: string;
    sendAllBtn: string;
    hint: string;
  };
  kanban: {
    taskTitlePlaceholder: string;
    taskDescPlaceholder: string;
    assignBtn: string;
    addBtn: string;
    dragPlaceholder: string;
    addTaskTooltip: string;
    taskCreated: string;
    taskDeleted: string;
    success: string;
    loadError: string;
    createError: string;
    updateError: string;
    deleteError: string;
    backlog: string;
    todo: string;
    inProgress: string;
    inReview: string;
    done: string;
  };
  onlineUsers: {
    userFallbackName: string;
    zeroOnline: string;
    onlineStatus: string;
    totalOnline: string;
  };
  reactions: {
    authRequiredTitle: string;
    authRequiredDesc: string;
    addErrorTitle: string;
    addErrorDesc: string;
    addTooltip: string;
  };
  avatar: {
    userFallbackChar: string;
  };
  userProfile: {
    updatedTitle: string;
    updatedDesc: string;
    updateErrorTitle: string;
    updateErrorDesc: string;
    fileTooLarge: string;
    unsupportedFileType: string;
    fileSecurityFailed: string;
    uploadFailed: string;
  };
  session: {
    expiredTitle: string;
    expiredDesc: string;
    timeoutTitle: string;
    timeoutDesc: string;
  };
  security: {
    loadErrorTitle: string;
    loadErrorDesc: string;
    successLoginLog: string;
    failedLoginLog: string;
    successRegisterLog: string;
    rateLimitLog: string;
    fileUploadLog: string;
    unknownUser: string;
    loading: string;
    panelTitle: string;
    totalEvents: string;
    last24h: string;
    criticalEvents: string;
    requireAttention: string;
    blocks: string;
    failedLogins: string;
    hackAttempts: string;
    fileUploads: string;
    verifiedFiles: string;
    criticalWarning: string;
    recentEventsTitle: string;
    max50Events: string;
    noEvents: string;
    refreshBtn: string;
  };
  chatSidebar: {
    loadErrorTitle: string;
    loadErrorDesc: string;
    defaultChatName: string;
    chatCreatedDesc: string;
    createErrorTitle: string;
    chatRenamedDesc: string;
    renameErrorTitle: string;
    renameErrorDesc: string;
    archiveConfirm: string;
    chatArchivedTitle: string;
    chatArchivedDesc: string;
    archiveErrorTitle: string;
    archiveErrorDesc: string;
    today: string;
    yesterday: string;
    searchPlaceholder: string;
    noChatsFound: string;
    noChatsYet: string;
    createFirstChatBtn: string;
    archiveTooltip: string;
  };
  themeSwitch: {
    light: string;
    dark: string;
    system: string;
  };
  errorBoundary: {
    title: string;
    desc: string;
    retryBtn: string;
    refreshBtn: string;
  };
  userApprovalPanel: {
    attentionTitle: string;
    inconsistenciesDesc: string;
    loadErrorTitle: string;
    loadErrorDesc: string;
    updateProfileErrorTitle: string;
    updateProfileErrorDesc: string;
    voiceApprovedTitle: string;
    voiceRejectedTitle: string;
    userApprovedDesc: string;
    userRejectedDesc: string;
    voteRegisteredDesc: string;
    actionErrorTitle: string;
    actionErrorDesc: string;
    panelTitle: string;
    panelDesc: string;
    unknownUser: string;
    approvalsCount: string;
    rejectionsCount: string;
    commentPlaceholder: string;
    approveBtn: string;
    rejectBtn: string;
    alreadyApproved: string;
    alreadyRejected: string;
  };
  notifications: {
    title: string;
    markAllAsRead: string;
    enablePush: string;
    pushEnabled: string;
    noNotifications: string;
    justNow: string;
    minsAgo: string;
    hoursAgo: string;
    daysAgo: string;
    pushEnabledTitle: string;
    pushEnabledDesc: string;
    enablePushErrorTitle: string;
    enablePushErrorDesc: string;
    notSupportedTitle: string;
    notSupportedDesc: string;
    permissionDeniedTitle: string;
    permissionDeniedDesc: string;
    swRegisterErrorTitle: string;
    swRegisterErrorDesc: string;
    generalErrorTitle: string;
    generalErrorDesc: string;
    newUrgentMessage: string;
    viewBtn: string;
  };
  fileValidation: {
    tooLargeTitle: string;
    tooLargeDesc: string;
    invalidTypeTitle: string;
    invalidTypeDesc: string;
    validationErrorTitle: string;
    validationErrorDesc: string;
    rateLimitTitle: string;
    rateLimitDesc: string;
    rejectedTitle: string;
    rejectedDesc: string;
    errorTitle: string;
    errorDesc: string;
  };
  identity: {
    // Section title
    sectionTitle: string;
    sectionDesc: string;

    // Checklist
    checklistTitle: string;
    emailConnected: string;
    emailRequired: string;
    telegramConnected: string;
    telegramNotLinked: string;
    telegramManual: string;
    walletConnected: string;
    walletNotConnected: string;

    // Requirement badges
    required: string;
    recommended: string;
    optional: string;

    // Wallet
    walletTitle: string;
    walletDesc: string;
    connectMetaMask: string;
    disconnectWallet: string;
    walletAddress: string;
    copyAddress: string;
    addressCopied: string;
    installMetaMask: string;
    installMetaMaskDesc: string;
    connecting: string;
    walletVerified: string;
    chainLabel: string;

    // Telegram
    telegramTitle: string;
    telegramDesc: string;
    telegramUsername: string;
    telegramPlaceholder: string;
    telegramSave: string;
    telegramSaved: string;
    telegramVerifyBot: string;
    telegramVerifyBotTooltip: string;
    telegramStatusNotLinked: string;
    telegramStatusManual: string;
    telegramStatusVerified: string;

    // Subscription
    subscriptionTitle: string;
    subscriptionDesc: string;
    leaderPlan: string;
    leaderPlanPrice: string;
    leaderPlanDaar: string;
    daarRate: string;
    acceptedAssets: string;
    testingMode: string;
    testingModeDesc: string;

    // Onboarding identity gate
    onboardingIdentityTitle: string;
    onboardingIdentityDesc: string;
    onboardingLeaderRequires: string;
    onboardingTestingNote: string;
    onboardingPriceNote: string;

    // Admin billing
    adminBillingTitle: string;
    adminBillingDesc: string;
    adminCryptoModel: string;
    adminPricingBanner: string;
    adminAcceptedLabel: string;
    adminSubscriptionStates: string;
    adminManualQueue: string;
    adminManualQueueDesc: string;
    adminFutureRoadmap: string;
    adminF3B: string;
    adminF3C: string;
    adminFiatFallback: string;
    adminNoSubscriptions: string;
  };
  advancedAccess: {
    sectionTitle: string;
    sectionDesc: string;
    selectProgram: string;
    submitApplication: string;
    applicationSent: string;
    applicationSentDesc: string;
    describePlaceholder: string;
    founderName: string;
    founderDesc: string;
    partnerName: string;
    partnerDesc: string;
    sovereignName: string;
    sovereignDesc: string;
    workerNodeName: string;
    workerNodeDesc: string;
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
    statusNeedsInfo: string;
    waitlistTitle: string;
    waitlistDesc: string;
    waitlistRequestedProgram: string;
    waitlistNoRequest: string;
    waitlistGenericPending: string;
    adminTitle: string;
    adminDesc: string;
    adminApproveMap: string;
    adminNoRequests: string;
    accessTierLabel: string;
    accessTierDesc: string;
    billingProgramsTitle: string;
    billingProgramsDesc: string;
  };
  cryptoBilling: {
    buyGetDaar: string;
    openGateway: string;
    daarRequirementDesc: string;
    createIntent: string;
    paymentInstructions: string;
    polygonOnly: string;
    treasuryAddress: string;
    submitTxHash: string;
    invalidTxHash: string;
    waitingVerification: string;
    paymentSubmitted: string;
    paymentConfirmed: string;
    paymentRejected: string;
    manualReview: string;
    activateLeaderPlan: string;
    leaderActive: string;
    leaderPendingPayment: string;
    wrongNetworkWarning: string;
    selectAsset: string;
    paymentInstructionsDesc: string;
    txHashPlaceholder: string;
    txHashFormatWarning: string;
    waitingVerificationDesc: string;
    intentExpired: string;
    intentCreated: string;
    intentCreatedDesc: string;
    intentFailed: string;
    verifyActionApprove: string;
    verifyActionReject: string;
    verifyActionReview: string;
    verifyQueueEmpty: string;
    verifyTableUser: string;
    verifyTableAsset: string;
    verifyTableAmount: string;
    verifyTableHash: string;
    verifyTableStatus: string;
    verifyTableActions: string;
    billingConfigTitle: string;
    leaderPlanUsdPrice: string;
    daarMonthlyAmount: string;
    daarUsdtRateLabel: string;
    acceptedAssetsLabel: string;
    paymentNetworkLabel: string;
    treasuryAddressLabel: string;
    daarPurchaseUrlLabel: string;
    planActiveLabel: string;
    savePricingConfigBtn: string;
    changesApplyWarning: string;
    pricingConfigUpdatedSuccess: string;
    invalidTreasuryAddressError: string;
    invalidDaarPurchaseUrlError: string;
    verifyOnPolygon: string;
    onchainVerification: string;
    verificationPending: string;
    verificationFailed: string;
    verifiedOnchain: string;
    manualReviewRequired: string;
    txAlreadyUsed: string;
    recipientMismatch: string;
    amountTooLow: string;
    assetMismatch: string;
    networkMismatch: string;
    senderWalletMismatch: string;
    viewOnPolygonScan: string;
    diagnosticWarning: string;
  };
  adminAgent: {
    title: string;
    guardianAssistant: string;
    readonlyMode: string;
    cannotPerformActions: string;
    platformContext: string;
    billingContext: string;
    accessRequestsContext: string;
    platformTeamContext: string;
    microdaoOpsContext: string;
    agentOpsContext: string;
    sqlChecks: string;
    nextStep: string;
    privateDataProtected: string;
    askAgent: string;
    generateDraftAnswer: string;
    placeholder: string;
  };
}

export const translations: Record<Language, Translations> = {
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
    branch: 'гілка',
    actions: 'Дії',

    allRepliesVisible: 'Усі репліки бачать усі учасники',
    inviteParticipants: 'Запросіть учасників',
    globalSearch: {
      title: 'Глобальний пошук',
      filtersLabel: 'Фільтри:',
      allChats: 'Усі чати',
      startDatePlaceholder: 'З',
      endDatePlaceholder: 'По',
      resetBtn: 'Скинути',
      nothingFound: 'Нічого не знайдено',
      tryAnotherQuery: 'Спробуйте змінити запит',
      startTypingToSearch: 'Почніть вводити для пошуку',
      searchHint: '🔍 Пошук по чатах, повідомленнях та проєктах',
      keyboardHint: '⌨️ Використовуйте ↑↓ для навігації, Enter для вибору',
      footerNavigation: '↑↓ навігація • Enter вибрати • Esc закрити',
      inChat: 'у чаті:',
      userMessage: 'Повідомлення',
      spiritAnswer: 'Відповідь Духа Спільноти',
      typeChat: 'Чат',
      typeMessage: 'Повідомлення',
      typeProject: 'Проєкт',
      typeUser: 'Користувач',
      typeFile: 'Файл',
    },
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
      backToLanding: 'На головну сайту',
      goToDashboard: 'Перейти в кабінет',
      billing: 'Підписка / Оплата',
      platformTeam: 'Команда платформи',
      adminAgent: 'Адмін Агент',
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
      successCreate: 'Чат створено',
      wipTitle: 'В розробці',
      wipDesc: 'Цей функціонал ще розробляється',
      errorCreate: 'Помилка створення чату',
      messenger: 'Месенджер',
      pin: 'Закріпити',
      unpin: 'Відкріпити',
      archive: 'Архівувати',
      archiveConfirm: 'Архівувати цей чат? Видалити його можна буде тільки з панелі керування.',
      archiveSuccessTitle: 'Чат архівовано',
      archiveSuccessDesc: 'Чат переміщено в архів. Видалити його можна з панелі керування чатами.',
      renameSuccessTitle: 'Назву змінено',
      renameSuccessDesc: 'Назву чату успішно оновлено',
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
      copySuccessTitle: 'Код скопійовано',
      copySuccessDesc: 'Текст скопійовано в буфер обміну',
      feedbackDisabledTitle: 'Неможливо надіслати відгук',
      feedbackDisabledDesc: 'Це повідомлення не підтримує зворотний зв\'язок',
      feedbackSuccessTitle: 'Зворотний зв\'язок надіслано',
      feedbackSuccessDesc: 'Дякуємо за оцінку!',
      feedbackErrorTitle: 'Помилка',
      feedbackErrorDesc: 'Не вдалося надіслати зворотний зв\'язок',
      voiceDisabledTitle: 'Озвучування вимкнено',
      voiceDisabledDesc: 'Увімкніть голосовий режим у налаштуваннях для автоматичного озвучування відповідей',
      deleteSuccessTitle: 'Повідомлення видалено',
      deleteSuccessDesc: 'Повідомлення було успішно видалено',
      deleteErrorTitle: 'Помилка',
      deleteErrorDesc: 'Не вдалося видалити повідомлення',
      copyBtn: 'Копіювати',
      systemSender: 'Система',
      spiritSender: 'Дух Спільноти',
      userSender: 'Користувач',
      deleteTooltip: 'Вилучити повідомлення',
      deletedText: 'Повідомлення видалено',
      fileUnavailable: 'Файл недоступний',
      hideTranscript: 'Приховати транскрипцію',
      showTranscript: 'Показати транскрипцію',
      sourcesTitle: 'Джерела',
      tokensCount: 'Токени: {count}',
      latency: 'Затримка: {count}',
      cost: 'Вартість: ${count}',
      replyTooltip: 'Відповісти в гілці',
      stopTtsTooltip: 'Зупинити',
      startTtsTooltip: 'Озвучити текст',
      createThreadTooltip: 'Створити гілку',
      reply1: 'відповідь',
      reply24: 'відповіді',
      reply5: 'відповідей',
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
      errorCode: 'Код:',
      errorRetryable: 'Повторювана:',
      yes: 'Так',
      no: 'Ні',
      loadCommunitiesError: 'Не вдалося завантажити спільноти',
    },
    landing: {
      heroTitle: 'MicroDAO / Дух Спільноти',
      heroSubtitle: 'Агентська жива операційна система для невеликих спільнот',
      heroDesc: 'Спільний простір, що обʼєднує чати, задачі та базу знань із мережею автономних ШІ-агентів. Living Memory структурує памʼять екосистеми, а агент координації допомагає автоматизувати роботу та приймати спільні рішення.',
      createSpace: 'Створити простір',
      login: 'Увійти',
      client: 'Клієнт',
      installPwa: 'Встановити застосунок',
      whatIsMicroDAO: 'Що таке MicroDAO?',
      whatIsMicroDAODesc: 'MicroDAO — це жива операційна система для невеликих спільнот, побудована навколо агентів штучного інтелекту. Вона інтегрує агентів пам\'яті та координації з вашою базою знань та задачами. Платформа забезпечує запуск приватних агентів, містить інтегрований microDAO token layer на roadmap для майбутньої токенізації та підтримує запуск через пов\'язаний open-source проєкт DAARION Edge Client.',
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
      loadError: 'Не вдалося завантажити проекти',
      titleRequired: 'Введіть назву проекту',
      createError: 'Не вдалося створити проект',
      createModalTitle: 'Створити проект',
      createModalDesc: 'Створіть новий проект для спільної роботи з командою',
      labelName: 'Назва проекту',
      placeholderName: 'Введіть назву проекту',
      labelDesc: 'Опис (необов\'язково)',
      placeholderDesc: 'Короткий опис проекту',
      cancelBtn: 'Скасувати',
      creatingBtn: 'Створення...',
      today: 'сьогодні',
      yesterday: 'вчора',
      daysAgo: '{count} дні тому',
      activeCount: '{count} активних',
      overdueCount: '{count} прострочено',
      completedCount: '{done}/{total} завершено',
      openBtn: 'Відкрити',
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
    auth: {
      signIn: 'Вхід',
      signUp: 'Ранній доступ',
      displayName: 'Ім\'я для відображення',
      displayNamePlaceholder: 'як вас називати в чаті',
      email: 'Email',
      emailPlaceholder: 'введіть ваш email',
      password: 'Пароль',
      passwordPlaceholder: 'введіть пароль',
      useCase: 'Ваш сценарій використання',
      useCasePlaceholder: 'опишіть, як ви плануєте використовувати MicroDAO...',
      founderCode: 'Код запрошення',
      founderCodePlaceholder: 'введіть код запрошення (за наявності)',
      founderCodeHelper: 'Якщо у вас є код запрошення, система зможе активувати доступ після перевірки коду. Якщо коду немає — заявка потрапить у список очікування.',
      submitApplication: 'Подати заявку',
      submitFounder: 'Перевірити код і подати заявку',
      loginBtn: 'Увійти',
      communityName: 'Назва спільноти / команди',
      communityNamePlaceholder: 'введіть назву простору',
      communityType: 'Тип спільноти',
    },
    onboarding: {
      lobbyTitle: 'MicroDAO Екосистема / Живий простір вашої мікро-спільноти',
      lobbyIntro: 'MicroDAO — це новий підхід до організації команд та спільнот. Тут немає класичного глобального waitlist-контролю. Замість цього кожен простір формується навколо автономного Духа Спільноти — штучного інтелекту, що зберігає пам’ять, веде онбординг, призначає ролі та координує спільні дії.',
      draftAlertTitle: 'Знайдено незавершене налаштування',
      draftAlertDesc: 'Ви зупинилися на кроці {step} для створення спільноти {name}.',
      restoreDraft: 'Відновити чернетку',
      activeCommunities: 'Ваші чинні MicroDAO',
      createCommunity: 'Створити нову спільноту (MicroDAO)',
      createCommunitySubtitle: 'Станьте лідером і запустіть простір з персональним Духом Спільноти',
      createCommunityDesc: 'Я, як Дух Спільноти, проведу вас через покроковий процес створення: ідентичність спільноти, місія, правила, мій власний характер, рівні автономії та перші запрошення.',
      startOnboardingBtn: 'Почати створення з Агентом',
      joinCommunity: 'Приєднатися за кодом запрошення',
      joinCommunitySubtitle: 'Введіть код від лідера, щоб автоматично отримати доступ',
      joinCodePlaceholder: 'Введіть код, напр: ECO-MEMBER-492',
      joinBtn: 'Приєднатися до спільноти',
      joinLoading: 'Приєднання...',
      applyFounder: 'Подати заявку на статус Співзасновника',
      applyFounderSubtitle: 'Партнерська програма для запуску MicroDAO',
      applyFounderDesc: 'Якщо у вас немає коду запрошення, ви можете подати заявку на отримання статусу Співзасновника (Founder) для розгортання власного MicroDAO.',
      enterReasonPlaceholder: 'Опишіть вашу спільноту та місію...',
      applyBtn: 'Надіслати заявку',
      applySuccessTitle: 'Заявку надіслано!',
      applySuccessDesc: 'Ми розглянемо ваш запит на партнерський доступ найближчим часом.',
      joinSuccessTitle: 'Успішно приєднано!',
      joinSuccessDesc: 'Ви стали учасником MicroDAO спільноти.',
      wizardTitle: 'Ініціалізація MicroDAO',
      saveDraftBtn: 'Зберегти чернетку',
      saveDraftSuccessTitle: 'Чернетку збережено',
      saveDraftSuccessDesc: 'Ви зможете продовжити налаштування пізніше.',
      draftRestoredTitle: 'Чернетку відновлено',
      draftRestoredDesc: 'Повертаємося до кроку {step}.',
      errorSelectCommunityName: 'Будь ласка, введіть назву спільноти на кроці 1.',
      creationSuccessTitle: 'Спільноту успішно створено!',
      creationSuccessDesc: 'Вітаємо у MicroDAO "{name}" з Духом Спільноти "{agentName}"!',
      stepTitle: 'Крок {step} з {total}',
      agentStep1: 'Вітаю! Я — ваш майбутній Дух Спільноти. Давайте разом створимо наше MicroDAO. Почнемо з ідентичності: як буде називатися наша спільнота, до якого типу вона належить та який її короткий опис?',
      agentStep2: 'Чудовий початок! Тепер сформуємо місію та першу 30-денну ціль. Це стане ядром моєї пам\'яті, щоб я міг допомагати координувати діяльність та тримати фокус.',
      agentStep3: 'Правила спільноти визначають наші цінності та межі спілкування. Які принципи поведінки та межі ви хочете встановити? У разі суперечок я нагадуватиму про ці правила.',
      agentStep4: 'Тепер налаштуємо мій характер. Як мене зватимуть (наприклад, \'Дух Спільноти\' або інше ім\'я)? Який тон спілкування мені обрати — дружній, філософський чи офіційний?',
      agentStep5: 'Вкажіть рівень моєї автономії та дозволи. Я можу діяти як простий Помічник, Координатор (створення задач, нагадування) або Адмін під вашим наглядом. Чутливі дії завжди вимагатимуть вашого підтвердження.',
      agentStep6: 'Створимо перші коди доступу. Ви можете згенерувати унікальні коди для адміністраторів або учасників. Наприклад, \'MYSPACE-MEMBER\' чи \'MYSPACE-ADMIN\'.',
      agentStep7: 'Давайте додамо перші знання! Введіть початкові правила, замітки або інструкції. Це насіння нашої спільної бази знань, яке я проіндексую першим.',
      agentStep8: 'Останній крок — заплануємо перші дії. Створимо перше завдання, яке ви побачите на дашборді. Це допоможе відразу перейти до роботи.',
      labelCommunityName: 'Назва спільноти / простору',
      labelCommunityDesc: 'Короткий опис або слоган',
      labelMission: 'Місія та призначення простору',
      labelGoal30Days: 'Ціль на найближчі 30 днів',
      labelCommunityRules: 'Правила та принципи поведінки',
      labelAgentName: 'Ім\'я вашого Духа Спільноти',
      labelAutonomyLevel: 'Рівень автономії Агента',
      autonomyAssistant: 'Помічник (лише відповідає)',
      autonomyCoordinator: 'Координатор (задачі, нагадування)',
      autonomyAdmin: 'Адмін (керування правами під наглядом)',
      labelInviteCodes: 'Коди доступу до простору',
      labelMemberCode: 'Код для учасників (Member)',
      labelAdminCode: 'Код для адміністраторів (Admin)',
      labelInitialNotes: 'Початкові документи бази знань',
      labelFirstTaskTitle: 'Назва першого завдання',
      labelFirstTaskDesc: 'Опис завдання',
      inputPlaceholderCommunityName: 'напр: Еко-Поселення, Web3-Синдикат',
      inputPlaceholderCommunityDesc: 'коротко про простір',
      inputPlaceholderMission: 'заради чого ми об\'єднуємося...',
      inputPlaceholderGoal30Days: 'що маємо зробити за перший місяць...',
      inputPlaceholderCommunityRules: 'напр: взаємоповага, прозорість, нейтральність ШІ...',
      inputPlaceholderAgentName: 'напр: Дух Спільноти, Steward',
      inputPlaceholderMemberCode: 'напр: ECO-MEMBER',
      inputPlaceholderAdminCode: 'напр: ECO-ADMIN',
      inputPlaceholderInitialNotes: 'правила простору, цілі, опис ролей...',
      inputPlaceholderFirstTaskTitle: 'напр: Перше знайомство',
      inputPlaceholderFirstTaskDesc: 'деталі завдання',
      btnNextStep: 'Далі',
      btnPrevStep: 'Назад',
      btnComplete: 'Створити MicroDAO',
      btnCompleting: 'Створення...',
      creationErrorTitle: 'Помилка створення',
      creationErrorDesc: 'Сталася помилка під час створення MicroDAO.',
      joinErrorTitle: 'Помилка приєднання',
      joinErrorDesc: 'Недійсний код запрошення.',
      saveDraftErrorTitle: 'Помилка збереження',
      submitErrorTitle: 'Помилка надсилання',
      errorLimitTitle: 'Ліміт перевищено',
      errorLimitDesc: 'Ви перевищили ліміт створення спільнот.',
      errorCreationTitle: 'Помилка створення',
      errorCreationDesc: 'Не вдалося створити спільноту. Спробуйте пізніше.',
    },
    spiritWidget: {
      activeStatus: 'активний',
      mainOrganizer: 'Головний AI Організатор',
      supervisorAdmin: 'Супервізований Адмін',
      coordinator: 'Координатор',
      assistant: 'Асистент',
      spiritDAO: 'Дух MicroDAO',
      memoryMission: 'Місія памʼяті:',
      goal30Days: 'Ціль на 30 днів:',
      defaultMission: 'Збереження колективного розуму та координація цілей спільноти.',
      defaultGoal: 'Не встановлено',
      agentReady: 'Дух Спільноти готовий до налаштування. Спільнота працює в автономному режимі.',
      quickActions: 'Швидкі дії Агента:',
      talkBtn: 'Поговорити',
      talkToastTitle: 'Діалог з Агентом',
      talkToastDesc: 'Дух Спільноти підключається до вашого чату...',
      summarizeBtn: 'Підсумувати',
      summarizeToastTitle: 'Підсумок роботи',
      summarizeToastDesc: 'Дух Спільноти аналізує базу знань та повідомлення для підсумку.',
      inviteBtn: 'Запрошення',
      inviteToastTitle: 'Коди доступу',
      inviteToastDesc: 'Створення та керування запрошеннями до MicroDAO.',
      createTaskBtn: 'Створити задачу',
      rulesBtn: 'Правила',
      rulesToastTitle: 'Аналіз правил',
      rulesToastDesc: 'Агент готує оновлений регламент на основі культури спілкування.',
      planWeekBtn: 'Запланувати тиждень',
      planWeekToastTitle: 'Планування',
      planWeekToastDesc: 'Аналіз завдань та формування тижневого спринту.',
      widgetTitle: 'Дух Спільноти'
    },
    clientInstall: {
      macSilicon: 'macOS Apple Silicon',
      macIntel: 'macOS Intel',
      windows: 'Windows',
      linux: 'Linux',
      android: 'Android',
      ios: 'iOS',
      beta: 'Beta',
      canary: 'Canary',
      sideload: 'Sideload',
      comingSoon: 'Скоро',
      archLayersTitle: 'Архітектура Edge Client',
      archLayersSubtitle: 'Три рівні суверенної агентської інфраструктури',
      l1Title: 'Client Device',
      l1Subtitle: 'Sovereign Entry',
      l1Point1: 'Встановлення на локальне залізо користувача',
      l1Point2: 'Автогенерація Ed25519 криптоідентичності',
      l1Point3: 'Приватний ключ ізольований в Keychain / Credential Manager',
      l1Point4: 'Базова синхронізація з мережею DAARION',
      l2Title: 'Personal Agent',
      l2Subtitle: 'Local Runtime',
      l2Point1: 'Інтерактивний Genesis Wizard для створення агента',
      l2Point2: 'Виявлення локальних обчислювальних ресурсів (CPU, RAM, GPU)',
      l2Point3: 'Завантаження та виконання LLM (Gemma, Qwen) у форматі GGUF',
      l2Point4: 'Управління гаманцем та локальними промптами',
      l3Title: 'Worker Node',
      l3Subtitle: 'Gated Compute',
      l3Point1: 'Внесок обчислювальних ресурсів у мережу (ping_math, text_hash)',
      l3Point2: 'Жорстка пісочниця: Docker/Colima, --network none',
      l3Point3: 'Доступ лише після верифікації оператора',
      l3Point4: 'Нульовий мережевий вихід з контейнерів',
      installTitle: 'Завантажити Edge Client',
      installSubtitle: 'Суверенний інтерфейс та edge-клієнт для створення, управління та координації персональних AI-агентів локально на вашому залізі.',
      downloadFromGithub: 'Завантажити з GitHub',
      viewReleasesGithub: 'Всі релізи на GitHub',
      supportedPlatforms: 'Підтримувані платформи',
      platformFormat: 'Формат: {format}',
      platformDesc: 'Крос-платформний клієнт, побудований на Tauri v2',
      securityTitle: 'Безпека та оновлення',
      secSovereignTitle: 'Суверенна безпека',
      secSovereignDesc: 'Приватний ключ ніколи не покидає пристрій. Зберігається в macOS Keychain або Windows Credential Manager через нативний keyring API.',
      secSandboxTitle: 'Пісочниця Worker Mode',
      secSandboxDesc: 'Всі edge-задачі виконуються у закритому контейнері (Docker/Colima) з --network none та очищеними змінними середовища.',
      secUpdatesTitle: 'Ручні оновлення',
      secUpdatesDesc: 'Автоматичні оновлення поки вимкнені. Завантажуйте нові версії вручну з GitHub Releases.',
      secVerificationDesc: 'Потребує proof of performance, стабільності та безпеки на кожній платформі перед production-релізом.',
      forDevsTitle: 'Для розробників',
      forDevsStep1: '# 1. Клонувати репозиторій',
      forDevsStep2: '# 2. Встановити залежності',
      forDevsStep3: '# 3. Запустити dev-режим (Vite + Tauri)',
      forDevsTerminal: '# В іншому терміналі:',
      forDevsStep4: '# 4. Збірка release-пакетів',
      openOnGithub: 'Відкрити на GitHub',
      diagnosticsTitle: 'Діагностичні логи',
      diagnosticsDesc: 'Якщо застосунок крашиться або показує білий екран — зберіть і надішліть діагностичний лог:',
      readyTitle: 'Готові запустити свого агента?',
      readyDesc: 'Завантажте DAARION Edge Client, створіть свою суверенну криптоідентичність та почніть координацію через MicroDAO.',
      downloadBtn: 'Завантажити',
      returnToMicroDAO: 'Повернутись до MicroDAO',
      footerCopyright: '— Всі права захищено.',
      footerDesc: 'Побудовано для гнучкої координації та живих спільнот.',
      downloadInstaller: 'Скачати інсталлер',
      openWebPwa: 'Відкрити Web / PWA',
      selectPlatformBelow: 'Оберіть платформу нижче. GitHub repo доступний у футері для розробників.',
      fallbackVersionDesc: 'Якщо інсталлер ще не доступний для вашої платформи, використайте Web / PWA версію.',
      githubSourceLinkDesc: 'Вихідний код DAARION Edge Client доступний на GitHub для розробників.',
      architectureLabel: 'Архітектура',
      formatLabel: 'Формат',
      versionLabel: 'Версія',
      devToolsLabel: 'Для розробників',
      sourceCodeGithub: 'Вихідний код на GitHub'
    },
    pricingExtra: {
      title: 'Рівні доступу MicroDAO',
      subtitle: 'Оберіть рівень розвитку вашого MicroDAO',
      desc: 'Від запуску базового ШІ-агента до повноцінної суверенної мережі організацій. Токени, казна та голосування впроваджуються поетапно згідно з планом розвитку.',
      testing: 'Тестування',
      scaling: 'Масштабування',
      recommended: 'Рекомендовано',
      selfHosted: 'Self-Hosted',
      free: 'Безкоштовно',
      forFirstCommunities: 'для перших спільнот',
      earlyAccessDesc: 'Подайте заявку на безкоштовний доступ під час бета-тестування.',
      pendingLaunch: 'Очікує запуску',
      forSmallTeams: 'для невеликих команд',
      communityDesc: 'Агентська операційна система для глибшої координації процесів.',
      byInvitation: 'За запрошенням',
      supportDevelopment: 'підтримка розвитку',
      founderDesc: 'Для засновників спільнот, які хочуть отримати пріоритет та впливати на продукт.',
      autonomous: 'Автономно',
      forDaoNetworks: 'для DAO-мереж',
      sovereignDesc: 'Для автономних організацій та суверенних мереж.',
      earlyAccessFeature1: 'Створення 1 MicroDAO після схвалення',
      earlyAccessFeature2: 'Активація базового Духу Спільноти',
      earlyAccessFeature3: 'Децентралізовані групові чати й теми',
      earlyAccessFeature4: 'Управління задачами та координація',
      earlyAccessFeature5: 'Базова база знань (пам\'ять RAG до 50 МБ)',
      communityFeature1: 'Кілька робочих просторів MicroDAO',
      communityFeature2: 'Розширена пам\'ять RAG (до 1 ГБ)',
      communityFeature3: 'До 3 активних ШІ-агентів одночасно',
      communityFeature4: 'Автоматизація запрошень та ролей',
      communityFeature5: 'Кастомні промпти для Духу Спільноти',
      founderFeature1: 'Пріоритетний обхід списку очікування',
      founderFeature2: 'Ранній доступ до експериментальних функцій',
      founderFeature3: 'Участь у формуванні рішень MicroDAO',
      founderFeature4: 'Пріоритетна інтеграція з токен-фабрикою',
      founderFeature5: 'Прямий зв\'язок з розробниками у Telegram',
      sovereignFeature1: 'Повний суверенітет і локальне розгортання',
      sovereignFeature2: 'Власна інфраструктура Edge Client',
      sovereignFeature3: 'Приватні агенти-розробники',
      sovereignFeature4: 'Криптогаманець та казна DAO (roadmap)',
      sovereignFeature5: 'Випуск власних токенів спільноти (roadmap)',
      applyBtn: 'Подати заявку',
      requestAccessBtn: 'Запросити доступ',
      becomeFounderBtn: 'Стати Founder',
      startBtn: 'Почати',
      
      leaderPlanName: 'Leader Plan',
      leaderPlanPrice: '2 DAAR / міс',
      leaderPlanPeriod: 'еквівалент $20 | Polygon only',
      leaderPlanDesc: 'Для лідера, який створює активну MicroDAO з Духом Спільноти.',
      leaderPlanFeature1: '1 active MicroDAO',
      leaderPlanFeature2: 'Дух Спільноти (ШІ-асистент)',
      leaderPlanFeature3: 'Базова памʼять / RAG для знань',
      leaderPlanFeature4: 'Запрошення учасників без обмежень',
      leaderPlanFeature5: 'Задачі, бази знань та групові чати',
      leaderPlanFeature6: 'Крипто-білінг: DAAR, USDT, USDC, POL',
      activateCryptoBtn: 'Активувати через крипту',
      buyDaarBtn: 'Купити / отримати DAAR',
      
      participantName: 'Учасник',
      participantDesc: 'Для людей, яких запросив лідер MicroDAO.',
      participantFeature1: 'Авторизація через email + Telegram',
      participantFeature2: 'Участь у запрошеній MicroDAO безкоштовно',
      participantFeature3: 'Доступ до чатів, знань і задач за роллю',
      participantFeature4: 'Гаманець опціональний, доки немає DAO-дій',
      joinInviteBtn: 'Приєднатися за запрошенням',

      partnerName: 'Partner Access',
      partnerDesc: 'Для людей або організацій, які ведуть клієнтські простори.',
      partnerFeature1: 'Керування багатьма MicroDAO одночасно',
      partnerFeature2: 'Ізольовані клієнтські простори',
      partnerFeature3: 'Панель оператора (Operator Dashboard)',
      partnerFeature4: 'Кастомні шаблони та White-label (в розробці)',
      partnerCta: 'Запросити Partner Access',

      sovereignName: 'Sovereign / Network',
      sovereignDescNew: 'Для організацій і мереж із власною інфраструктурою.',
      sovereignFeatureNew1: 'Повний суверенітет (розгортання на своїх серверах)',
      sovereignFeatureNew2: 'Модулі Edge Client, Network та Governance',
      sovereignFeatureNew3: 'Розширені модулі казначейства та токенів',
      sovereignFeatureNew4: 'Індивідуальна ручна угода (SLA)',
      sovereignCta: 'Запросити Sovereign Access',

      workerNodeName: 'Worker Node / Sensitive Operator',
      workerNodeDesc: 'Для технічних операторів, вузлів і чутливих дозволів.',
      workerNodeFeature1: 'Node/operator рівень доступу',
      workerNodeFeature2: 'Спеціальні технічні дозволи для оператора',
      workerNodeFeature3: 'Детальні системні логи та аудит (Audit Logs)',
      workerNodeFeature4: 'Обов\'язкова ручна верифікація оператора',
      workerNodeCta: 'Подати заявку оператора',

      distinctionTitle: 'Зверніть увагу на різницю програм доступу',
      distinctionDesc: 'Leader Plan — це підписка для створення активної MicroDAO. Founder / Partner / Sovereign / Worker Node — це програми розширеного доступу з ручним погодженням.',
      manageSubscription: 'Керувати підпискою',
      goToVerificationQueue: 'Перейти до черги перевірки',
      billingTitle: 'Підписка / Оплата',
      billingDesc: 'Активуйте Leader Plan через DAAR або підтримувану криптовалюту.',
      inviteGuardian: 'Запросити адміністратора платформи',
      guardianEmail: 'Email адміністратора',
      createInvite: 'Створити запрошення',
      copyInviteLink: 'Копіювати посилання',
      pendingInvites: 'Очікують прийняття',
      acceptedInvites: 'Прийняті запрошення',
      revokeInvite: 'Відкликати запрошення',
      askAdminAgent: 'Запитати адмін-агента',
      draftMode: 'Режим чернетки',
      noAutonomousActions: 'Без автономних дій',
      privateDataProtected: 'Приватні дані MicroDAO не розкриваються'
    },
    start: {
      heroTagline: 'ЖОС · Жива операційна система',
      featureRuleTitle: 'Суверенне Управління',
      featureRuleDesc: 'Автономне управління правилами простору, фільтрація та модерація на основі принципів спільноти.',
      featureMemoryTitle: 'Жива Пам\'ять',
      featureMemoryDesc: 'Довгострокова пам\'ять та семантичне індексування (RAG) документів і переписок для миттєвого пошуку контексту.',
      featureCoordTitle: 'Агентська Координація',
      featureCoordDesc: 'Орієнтована на дії мережа ШІ-агентів для автоматизації завдань, ведення канбан-дошок та фасилітації зустрічей.',
      featureChatTitle: 'Чат з Агентом Спільноти',
      featureChatDesc: 'Групові та особисті чати, гілки обговорень та голосові повідомлення з AI-агентом.',
      featureAgentTitle: 'Двигун дій та Агенти',
      featureAgentDesc: 'AI-агенти, редактор промптів, персональні асистенти (Second Me) та мережа агентів.',
      heroIntro: 'Кожна спільнота — це живий організм. Кожен простір — це канал дії.',
      spaceCapTitle: 'Базові можливості робочого простору вашої спільноти',
      spiritZhosTitle: 'Дух Спільноти / ЖОС',
      spiritZhosDesc: 'ЖОС — це Жива Операційна Система спільноти. Вона допомагає бачити контекст, памʼятати рішення, координувати дії та зберігати дух спільної роботи.',
      spiritPrinciplesTitle: 'Принципи роботи',
      principle1: 'Агент нейтральний і враховує контекст',
      principle2: 'Рішення залишаються за людьми',
      principle3: 'Памʼять простору прозора для учасників',
      principle4: 'Координація без примусу',
      principle5: 'Кожна дія має значення для спільноти',
      howItWorksTitle: 'Як це працює',
      howItWorksSubtitle: 'Від ідеї до спільної дії — за чотири кроки',
      step1Num: '01',
      step1Title: 'Створіть простір',
      step1Desc: 'Дайте назву вашій команді, DAO або спільноті.',
      step2Num: '02',
      step2Title: 'Запросіть учасників',
      step2Desc: 'Додайте колег, друзів або відкрийте доступ.',
      step3Num: '03',
      step3Title: 'Налаштуйте агента',
      step3Desc: 'Задайте інструкції, памʼять та поведінку AI-агента.',
      step4Num: '04',
      step4Title: 'Дійте разом',
      step4Desc: 'Чати, задачі, знання, зустрічі — все в єдиному потоці.',
      archTitle: 'Архітектура',
      archSubtitle: 'Звʼязок агентів та протоколів координації в єдиній екосистемі',
      archDagiTitle: 'DAGI Network',
      archDagiDesc: 'Мережа агентів і протокол звʼязку між людьми, командами та автономними системами.',
      archSpaceTitle: 'MicroDAO простір',
      archSpaceDesc: 'Канал взаємодії для команди або спільноти з власними чатами, задачами й агентами.',
      archSecondMeTitle: 'Second Me',
      archSecondMeDesc: 'Персональний агент учасника, який поступово допомагає діяти в межах простору.',
      archRuleTitle: 'Правила та Економіка',
      archRuleDesc: 'У майбутньому простір може мати власні правила, ролі, токени й DAO-логіку.',
      spaceTypesTitle: 'Типи MicroDAO спільнот',
      typeProjectTitle: 'Проєктний MicroDAO',
      typeProjectDesc: 'Команда створює простір для задач, рішень, файлів і координації.',
      typeCreativeTitle: 'Креативний MicroDAO',
      typeCreativeDesc: 'Митці або креатори об\'єднують ідеї, обговорення, знання й події.',
      typeInfraTitle: 'Інфраструктурний MicroDAO',
      typeInfraDesc: 'Група операторів підтримує вузол, сервіс або спільну систему.',
      typeCityTitle: 'Міський MicroDAO',
      typeCityDesc: 'Локальна спільнота координує ініціативи, зустрічі й взаємодію.',
      ecosystemTitle: 'Позиція в екосистемі DAARION',
      dagiDesc: 'Мережа агентів і протокол взаємодії.',
      microDaoDesc: 'Автономні простори спільнот, команд і DAO.',
      cityDesc: 'Місто, де MicroDAO об\'єднуються у екосистему.',
      joinBtn: 'Почати'
    },
    importExtra: {
      title: 'Імпорт історії',
      backBtn: 'Назад',
      uploadBtn: 'Завантажити файл',
      formatsHelper: 'Підтримуються файли Telegram HTML експорту, текстові файли та Markdown',
      dropActive: 'Відпустіть файл тут...',
      dropInactive: 'Перетягніть файл сюди або натисніть для вибору',
      limitDesc: 'HTML, TXT або MD файли (максимум 5MB)',
      importBtn: 'Імпортувати',
      importing: 'Імпортування...',
      errorTooLargeTitle: 'Файл занадто великий',
      errorTooLargeDesc: 'Максимальний розмір файлу 5MB',
      importSuccessTitle: 'Імпорт завершено',
      importSuccessDesc: 'Історія чату успішно імпортована',
      importFailedTitle: 'Помилка імпорту',
      howToExportTg: 'Як експортувати з Telegram',
      tgStep1: '1. В Telegram Desktop:',
      tgStep1Desc: 'Налаштування → Розширені → Експорт даних Telegram',
      tgStep2: '2. Оберіть чат для експорту',
      tgStep2Desc: 'Формат: Машинозчитуваний JSON або HTML',
      tgStep3: '3. Завантажте отриманий файл',
      tgStep3Desc: 'Підтримуються HTML та JSON формати експорту'
    },
    settingsExtra: {
      profileDesc: 'Керування профілем та персональними даними',
      uploadPhoto: 'Завантажити фото',
      errorTitle: 'Помилка',
      errorTooLarge: 'Розмір файлу не повинен перевищувати 5MB',
      errorImageOnly: 'Можна завантажувати лише зображення',
      labelDisplayName: 'Ім\'я для відображення',
      placeholderDisplayName: 'Ваше ім\'я в чатах',
      themeSectionTitle: 'Налаштування зовнішнього вигляду додатка',
      themeSectionDesc: 'Оберіть тему оформлення',
      langSelectLabel: 'Мова інтерфейсу',
      zhosSectionTitle: 'Налаштування ЖОС',
      zhosSectionDesc: 'Специфічні налаштування для спільноти ЖОС',
      zhosShowPrinciples: 'Показувати банер з принципами ЖОС в інтерфейсі',
      pushTitle: 'Push-сповіщення',
      pushDesc: 'Налаштування push-сповіщень для браузера',
      enableBtn: 'Увімкнути',
      pushDeniedAlert: 'Доступ заборонено. Дозвольте сповіщення в налаштуваннях браузера.',
      notifyNewsTitle: 'Новостна стрічка',
      notifyNewsDesc: 'Отримувати сповіщення про нові термінові новини',
      notifyChatsTitle: 'Сповіщення з чатів',
      notifyChatsDesc: 'Оберіть чати, з яких ви хочете отримувати сповіщення',
      loadingChats: 'Завантаження чатів...',
      noChats: 'У вас поки немає чатів',
      chatFallbackName: 'Чат {id}',
      limitsTitle: 'Ліміти участі',
      limitsOnline: 'Максимум учасників онлайн: 50',
      limitsFileSize: 'Розмір файлів: до 10MB',
      limitsMessageLength: 'Довжина повідомлень: до 4000 символів',
      saving: 'Збереження...',
      langUk: 'Українська',
      langEn: 'English',
      langRu: 'Русский',
      langEs: 'Español'
    },
    authForm: {
      authErrorTitle: 'Помилка автентифікації',
      fillRequired: 'Будь ласка, заповніть усі обов\'язкові поля',
      userExistsTitle: 'Користувач вже існує',
      userExistsDesc: 'Цей email вже зареєстрований. Перейдіть на вкладку "Вхід" для входу в систему.',
      regSuccessTitle: 'Реєстрація успішна',
      regSuccessDesc: 'Перевірте email для підтвердження акаунта. Лист може прийти в папку "Спам".',
      welcomeTitle: 'Ласкаво просимо!',
      welcomeDesc: 'Ви успішно зареєстровані та увійшли в систему',
      regErrorDesc: 'Помилка при реєстрації',
      emailNotVerifiedTitle: 'Email не підтверджено',
      emailNotVerifiedDesc: 'Будь ласка, підтвердіть ваш email. Перевірте пошту та папку "Спам".',
      invalidCredentialsTitle: 'Невірні дані для входу',
      invalidCredentialsDesc: 'Email або пароль невірні. Натисніть "Забули пароль?" для відновлення доступу.',
      loginErrorTitle: 'Помилка входу',
      welcomeLoginDesc: 'Ви успішно увійшли в систему',
      loginErrorDesc: 'Помилка при вході',
      resendConfirmRequired: 'Введіть email для повторної відправки листа підтвердження',
      resendConfirmSuccessTitle: 'Лист відправлено',
      resendConfirmSuccessDesc: 'Перевірте email (включаючи папку "Спам") та перейдіть за посиланням для підтвердження',
      resendConfirmErrorDesc: 'Помилка при відправці листа підтвердження',
      forgotPasswordRequired: 'Введіть email для відновлення пароля',
      forgotPasswordSuccessTitle: 'Лист відправлено',
      forgotPasswordSuccessDesc: 'Перевірте email. Ми відправили посилання для відновлення пароля.',
      forgotPasswordErrorDesc: 'Помилка при відправці листа відновлення',
      fillBothPasswords: 'Будь ласка, заповніть обидва поля пароля',
      passwordsDoNotMatch: 'Паролі не співпадають',
      passwordMinLength: 'Пароль повинен містити мінімум 6 символів',
      updatePasswordErrorTitle: 'Помилка оновлення пароля',
      updatePasswordSuccessTitle: 'Пароль оновлено',
      updatePasswordSuccessDesc: 'Ваш пароль успішно змінено. Тепер ви можете увійти з новим паролем.',
      updatePasswordErrorDesc: 'Сталася помилка при оновленні пароля',
      newPasswordTitle: 'Новий пароль',
      newPasswordDesc: 'Створіть новий пароль для вашого акаунта',
      labelNewPassword: 'Новий пароль',
      placeholderNewPassword: 'введіть новий пароль (мін. 6 символів)',
      labelConfirmPassword: 'Підтвердіть пароль',
      placeholderConfirmPassword: 'повторіть новий пароль',
      btnUpdatePassword: 'Оновити пароль',
      btnUpdatingPassword: 'Оновлення...',
      btnBackToLogin: 'Повернутися до входу',
      cantLoginTitle: '🔑 Не вдається увійти?',
      cantLoginDesc: 'Якщо ви забули пароль або маєте проблеми зі входом — скористайтесь відновленням паролю.',
      btnResetPassword: 'Відновити пароль',
      deviceRemembered: '🔒 Цей пристрій буде запам\'ятовано. Вхід потрібен лише після виходу.',
      forgotPasswordLink: 'Забули пароль?',
      emailUnconfirmedAlert: 'Не можете увійти? Можливо, потрібно підтвердити email.',
      btnResendConfirm: 'Надіслати лист підтвердження повторно',
      btnResendingConfirm: 'Надіслати...',
      forgotPasswordSectionTitle: 'Відновлення пароля',
      forgotPasswordSectionDesc: 'Ми надішлемо вам посилання для створення нового пароля на вказаний email.',
      requiredFieldsError: 'Будь ласка, заповніть усі обов\'язкові поля',
      recoveryLinkInvalidTitle: 'Недійсне посилання для відновлення',
      recoveryLinkInvalidDesc: 'Це посилання застаріло або вже було використано. Будь ласка, надішліть новий запит на відновлення пароля.',
    },
    chatsExtra: {
      today: 'Сьогодні',
      yesterday: 'Вчора',
      daysAgo: '{days} днів тому',
      loading: 'Завантаження...',
      totalChats: '{count} чатів',
      noChatsFound: 'Чати не знайдено',
      noChatsYet: 'Поки немає чатів',
      searchChatsPlaceholder: 'Пошук чатів...',
      filterNoChatsFoundDesc: 'Спробуйте змінити пошуковий запит',
      filterNoChatsYetDesc: 'Створіть перший чат спільноти',
      voiceMeetingBtn: 'Начати зустріч',
      voiceMeetingDialogTitle: 'Голосова зустріч',
      forkedFrom: 'Гілка з {id}...',
      active: 'Активний',
      loadErrorTitle: 'Помилка завантаження',
      pinSuccess: 'Чат закріплено',
      unpinSuccess: 'Чат відкріплено',
      pinDesc: 'Чат закріплено вгорі списку',
      unpinDesc: 'Чат переміщено в загальний список',
      pinError: 'Не вдалося змінити статус закріплення',
      pinTooltip: 'Закріпити чат',
      unpinTooltip: 'Відкріпити чат',
      onlineCount: '{count} онлайн',
      error: 'Помилка',
    },
    chatsManagement: {
      loadErrorTitle: 'Помилка',
      loadErrorDesc: 'Не вдалося завантажити список чатів',
      chatsArchivedTitle: 'Чати архівовано',
      chatsRestoredTitle: 'Чати відновлено',
      chatsArchivedDesc: '{count} чат(ів) переміщено в архів',
      chatsRestoredDesc: '{count} чат(ів) відновлено з архіву',
      archiveErrorTitle: 'Помилка',
      archiveErrorDesc: 'Не вдалося архівувати чати',
      restoreErrorDesc: 'Не вдалося відновити чати',
      chatsDeletedTitle: 'Чати видалено',
      chatsDeletedDesc: '{count} чат(ів) переміщено в кошик',
      deleteErrorTitle: 'Помилка',
      deleteErrorDesc: 'Не вдалося видалити вибрані чати',
      loadingChats: 'Завантаження чатів...',
      backToChatsBtn: 'Назад до чатів',
      pageTitle: 'Керування чатами',
      pageSubtitle: 'Архівування та видалення чатів',
      totalChatsCount: '{count} всього чатів',
      searchPlaceholder: 'Пошук за назвою чату...',
      tabActive: 'Активні ({count})',
      tabArchived: 'Архівні ({count})',
      selectedChatsCount: 'Вибрано {selected} з {total}',
      selectAllChats: 'Вибрати всі ({count})',
      btnToArchive: 'В архів',
      btnRestore: 'Відновити',
      btnDelete: 'Видалити',
      deleteConfirmTitle: 'Видалити вибрані чати?',
      deleteConfirmDesc: 'Ця дія невідворотна. Буде видалено {count} чат(ів) та всі їхні повідомлення.',
      deleteLogNote: 'Всі дії записуються в журнал.',
      cancelBtn: 'Скасувати',
      deleteForeverBtn: 'Видалити назавжди',
      noChatsFound: 'Чати не знайдено',
      noActiveChats: 'Немає активних чатів',
      noArchivedChats: 'Немає архівних чатів',
      searchEmptyStateDesc: 'Спробуйте змінити пошуковий запит',
      activeEmptyStateDesc: 'Створіть новий чат для початку спілкування',
      messagesCount: '{count} повідомлень',
      chatCreatedDate: 'Створено: {date}',
      chatUpdatedDate: 'Оновлено: {date}',
      btnOpenChat: 'Відкрити',
      noMessages: 'Немає повідомлень',
    },
    newsExtra: {
      loadErrorTitle: 'Помилка',
      loadErrorDesc: 'Не вдалося завантажити повідомлення',
      settingsUpdatedTitle: 'Налаштування оновлено',
      notifyEnabledDesc: 'Сповіщення увімкнено',
      notifyDisabledDesc: 'Сповіщення вимкнено',
      updateSettingsErrorTitle: 'Помилка',
      updateSettingsErrorDesc: 'Не вдалося оновити налаштування',
      messageSentTitle: 'Повідомлення надіслано',
      messageSentAgentDesc: 'Агент відповість найближчим часом',
      sendErrorTitle: 'Помилка',
      sendErrorDesc: 'Не вдалося надіслати повідомлення',
      agentFallbackName: 'ЖОС',
      userFallbackName: 'Користувач',
      feedTitle: 'Новостна стрічка',
      notifyLabel: 'Сповіщення',
      textPlaceholder: 'Термінове повідомлення... (Ctrl+Enter — надіслати, @ЖОС — викликати агента)',
      helperText: '💡 Підказка: Агент ЖОС відповідає лише при згадуванні @ЖОС в повідомленні'
    },
    participantsExtra: {
      userFallbackName: 'Користувач',
      loadErrorTitle: 'Помилка',
      loadErrorDesc: 'Не вдалося завантажити дані учасників',
      updateProfileErrorTitle: 'Помилка оновлення профілю',
      updateProfileErrorDesc: 'Помилка RLS: {message}. Перевірте права доступу.',
      requestApprovedTitle: 'Заявку схвалено',
      requestRejectedTitle: 'Заявку відхилено',
      userApprovedDesc: 'Користувача прийнято в спільноту',
      userRejectedDesc: 'Користувача відхилено',
      voteRegisteredDesc: 'Ваш голос враховано. Потрібно ще {count} схвалень.',
      requestErrorTitle: 'Помилка',
      requestErrorDesc: 'Не вдалося обробити заявку: {message}',
      loadingText: 'Завантаження учасників...',
      pageTitle: 'Керування учасниками',
      pageSubtitle: 'Перегляд та керування заявками на вступ до спільноти',
      tabPending: 'Очікують на схвалення ({count})',
      tabApproved: 'Схвалені ({count})',
      tabRejected: 'Відхилені ({count})',
      noPendingTitle: 'Немає очікуючих заявок',
      noPendingDesc: 'Всі заявки на вступ оброблені',
      requestedDate: 'Подав заявку: {date}',
      approvedVotes: 'Схвалили: {count}',
      rejectedVotes: 'Відхилили: {count}',
      requiredVotes: 'Необхідно: {count} голосів',
      statusPending: 'Очікує',
      commentPlaceholder: 'Коментар (необов\'язково)...',
      btnApprove: 'Схвалити',
      btnReject: 'Відхилити',
      alreadyVoted: 'Ви вже проголосували за цією заявкою',
      joinedDate: 'Приєднався: {date}',
      roleMember: 'Учасник',
      rejectedDate: 'Заявку відхилено: {date}',
      roleRejected: 'Відхилено',
      triggerButton: 'Учасники',
      onlineCountDesc: '{online} з {total} онлайн',
      online: 'онлайн',
      offline: 'офлайн',
      offlineHeader: 'Офлайн ({count})',
      onlineHeader: 'Онлайн ({count})',
      notInNetwork: 'не в мережі',
      noParticipants: 'Немає даних про учасників',
      remainingOnline: 'Ще {count} учасників онлайн',
    },
    promptEditor: {
      loadErrorDesc: 'Не вдалося завантажити версії',
      refreshSuccessDesc: 'Дані оновлено',
      errorEmptyVersionNameTitle: 'Помилка',
      errorEmptyVersionNameDesc: 'Будь ласка, введіть назву версії',
      saveSuccessDesc: 'Версію промпту збережено',
      saveErrorTitle: 'Помилка збереження',
      saveErrorDesc: 'Спробуйте ще раз',
      activateSuccessDesc: 'Версію активовано',
      activateErrorTitle: 'Помилка активації',
      activateErrorDesc: 'Спробуйте ще раз',
      editVersionLoadedDesc: 'Завантажено версію {name} для редагування',
      loadingCommunity: 'Завантаження спільноти...',
      noActiveCommunityTitle: 'Немає активної спільноти',
      noActiveCommunityDesc: 'Створіть або оберіть спільноту, щоб редагувати промпти.',
      pageTitle: 'Редактор промптів',
      pageSubtitle: 'Налаштування інструкцій та поведінки агента',
      btnRefresh: 'Оновити',
      btnSaveVersion: 'Зберегти версію',
      btnSavingVersion: 'Збереження...',
      tabSystem: 'Системний',
      tabResponses: 'Відповіді',
      tabFallback: 'Фолбек',
      labelSystemInstructions: 'Системні інструкції (System Prompt)',
      labelResponsesInstructions: 'Формат та стиль відповідей',
      labelFallbackInstructions: 'Фолбек інструкції (запасні відповіді)',
      descSystemInstructions: 'Базові правила, знання та ідентичність ШІ-агента спільноти',
      descResponsesInstructions: 'Налаштування стилю спілкування, мови та довжини повідомлень',
      descFallbackInstructions: 'Інструкції на випадок відсутності відповіді в базі знань або помилок',
      activeVersionLabel: 'Активна версія: {name}',
      viewOnlyWarning: 'Перегляд обмежено. Ви можете бачити активні інструкції, але редагування та створення нових версій дозволено лише адміністраторам команди.',
      unsavedChangesAlert: 'Маєте незбережені зміни в цьому промпті. Натисніть "Зберегти версію" для збереження чернетки.',
      labelVersionName: 'Назва версії',
      placeholderVersionName: 'Наприклад: v1, v1.1, draft-new',
      labelPromptContentSystem: 'Контент промпту (system)',
      labelPromptContentResponses: 'Контент промпту (responses)',
      labelPromptContentFallback: 'Контент промпту (fallback)',
      placeholderPromptContentSystem: 'Введіть системні інструкції для агента спільноти…',
      placeholderPromptContentResponses: 'Введіть вимоги до стилю та формату відповідей асистента…',
      placeholderPromptContentFallback: 'Введіть інструкції для поведінки у невідомих ситуаціях…',
      versionsListTitle: 'Версії промпту',
      totalVersionsCount: 'Всього: {count}',
      noVersionsFound: 'Версій не знайдено',
      badgeActive: 'Активна',
      badgeDraft: 'Чернетка',
      btnActivate: 'Активувати',
      btnEdit: 'Редагувати',
      btnView: 'Переглянути'
    },
    integrationsExtra: {
      loadErrorTitle: 'Помилка',
      loadErrorDesc: 'Не вдалося завантажити інтеграції',
      updateSuccessTitle: 'Статус оновлено',
      updateSuccessDesc: '{name} {status}',
      updateErrorTitle: 'Помилка',
      updateErrorDesc: 'Не вдалося оновити інтеграцію',
      connectSuccessTitle: 'Підключено',
      connectSuccessDesc: '{name} успішно підключено',
      connectErrorTitle: 'Помилка підключення',
      connectErrorDesc: 'Не вдалося підключити інтеграцію',
      disconnectSuccessTitle: 'Відключено',
      disconnectSuccessDesc: '{name} успішно відключено',
      disconnectErrorTitle: 'Помилка',
      disconnectErrorDesc: 'Не вдалося відключити інтеграцію',
      scopeLabel: 'Область застосування',
      scopePrivate: 'Приватна',
      scopeTeam: 'Командна',
      scopePrivateDesc: 'Інтеграція буде доступна тільки вам',
      scopeTeamDesc: 'Інтеграція буде доступна всій команді',
      setupTitle: 'Налаштування {name}',
      setupDesc: 'Введіть необхідні дані для підключення {name}',
      btnSetupSave: 'Зберегти',
      placeholderBotToken: 'Введіть токен бота',
      placeholderChatId: 'ID чату (опціонально)',
      placeholderApiKey: 'API ключ WhatsApp Business',
      placeholderPhoneNumber: '+380XXXXXXXXX',
      placeholderSmtpHost: 'smtp.gmail.com',
      placeholderSmtpPort: '587',
      placeholderSmtpPassword: 'Пароль або App Password',
      placeholderCalendarToken: 'OAuth токен',
      placeholderSlackChannel: '#general',
      placeholderDiscordServer: 'ID сервера (опціонально)',
      labelBotToken: 'Bot Token',
      labelChatId: 'Chat ID',
      labelApiKey: 'API Key',
      labelPhoneNumber: 'Номер телефону',
      labelSmtpHost: 'SMTP сервер',
      labelSmtpPort: 'Порт',
      labelSmtpPassword: 'Пароль',
      labelCalendarType: 'Тип календаря',
      labelCalendarToken: 'Access Token',
      labelSlackChannel: 'Канал',
      labelDiscordServer: 'Server ID',
      descriptionTelegram: 'Інтегруйте Telegram для отримання та відправки повідомлень',
      descriptionWhatsapp: 'Підключіть WhatsApp для двосторонньої синхронізації повідомлень',
      descriptionEmail: 'Налаштуйте email для отримання повідомлень та сповіщень',
      nameCalendar: 'Календар',
      descriptionCalendar: 'Синхронізуйте події та зустрічі з Google Calendar або Outlook',
      descriptionSlack: 'Інтеграція зі Slack для синхронізації каналів',
      descriptionDiscord: 'Підключіть Discord сервер для обміну повідомленнями',
      descriptionGoogleDrive: 'Синхронізуйте файли з Google Drive для доступу в базі знань',
      descriptionGoogleDocs: 'Інтегруйте Google Docs для автоматичного імпорту документів',
      descriptionOpenAI: 'Підключіть OpenAI ChatGPT API для розширених можливостей AI',
      descriptionDeepSeek: 'Інтеграція з DeepSeek AI для альтернативних AI можливостей',
      pageTitle: 'Інтеграції',
      pageSubtitle: 'Підключіть зовнішні сервіси для розширення функціональності месенджера',
      pageDesc1: 'Інтеграції дозволяють синхронізувати повідомлення з іншими платформами та автоматизувати роботу.',
      pageDesc2: 'Ви можете створити інтеграції для команди (доступні всім) або приватні (тільки для вас).',
      tabsAll: 'Всі',
      tabsTeam: 'Командні',
      tabsPrivate: 'Приватні',
      statusConnected: 'Підключено',
      statusNotConnected: 'Не підключено',
      scopeTeamText: 'Командна',
      scopePrivateText: 'Приватна',
      lastSyncText: 'Остання синхронізація: {date}',
      btnEnabled: 'Увімкнено',
      btnDisabled: 'Вимкнено',
      btnConnecting: 'Підключення...',
      btnConnect: 'Підключити',
      btnSetup: 'Налаштування',
      btnDisconnect: 'Відключити',
      btnCancel: 'Скасувати',
      howItWorksTitle: 'Як це працює?',
      howItWorksStep1: 'Підключіть інтеграцію, ввівши необхідні дані',
      howItWorksStep2: 'Увімкніть інтеграцію для початку синхронізації',
      howItWorksStep3: 'Повідомлення будуть автоматично синхронізуватись між платформами',
      howItWorksStep4: 'Ви завжди можете відключити або змінити налаштування',
      selectPlaceholder: 'Оберіть...'
    },
    projectLayout: {
      tabChat: 'Чат',
      tabKanban: 'Завдання',
      tabDocs: 'Документи',
      tabMeetings: 'Зустрічі',
      tabSettings: 'Налаштування',
      docsWipTitle: 'Документи проєкту',
      docsWipDesc: 'Функціонал документів в розробці',
      meetingsWipTitle: 'Зустрічі проєкту',
      meetingsWipDesc: 'Функціонал зустрічей в розробці',
      settingsWipTitle: 'Налаштування проєкту',
      settingsWipDesc: 'Функціонал налаштувань в розробці'
    },
    agoraVoiceCall: {
      loadErrorAuth: 'Користувач не авторизований',
      loadErrorInit: 'Не вдалося ініціалізувати голосовий дзвінок',
      connectingTitle: 'Підключення...',
      connectingDesc: 'Отримання токена доступу',
      connectErrorToken: 'Не вдалося отримати токен',
      connectedTitle: 'Підключено',
      connectedDesc: 'Ви приєдналися до голосового каналу',
      connectErrorChannel: 'Не вдалося приєднатися до каналу',
      disconnectedTitle: 'Відключено',
      disconnectedDesc: 'Ви покинули голосовий канал',
      channelHeader: 'Голосовий канал',
      participantsCount: '{count} учасників',
      btnStartMeeting: 'Розпочати зустріч',
      tooltipMute: 'Вимкнути мікрофон',
      tooltipUnmute: 'Увімкнути мікрофон',
      labelParticipants: 'Учасники:',
      participantFallback: 'Учасник {id}'
    },
    chatInterface: {
      errPlayTitle: 'Помилка відтворення',
      errPlayDesc: 'Не вдалося відтворити аудіо',
      errTtsTitle: 'Помилка озвучування',
      errTtsDesc: 'Не вдалося озвучити відповідь',
      userFallbackName: 'Користувач',
      errUploadTitle: 'Помилка завантаження файлу {name}',
      errFileSizeTitle: 'Файл занадто великий',
      errFileSizeDesc: 'Розмір файлу перевищує допустимий ліміт (25 МБ)',
      errFileTypeTitle: 'Тип файлу не підтримується',
      errHttpsTitle: 'Необхідне безпечне з\'єднання',
      errHttpsDesc: 'Для доступу до мікрофона необхідне HTTPS з\'єднання',
      errMicrophoneNotSupportedTitle: 'Браузер не підтримується',
      errMicrophoneNotSupportedDesc: 'Ваш браузер не підтримує запис голосу. Оновіть браузер або використовуйте Chrome/Firefox',
      errMicrophoneNotFoundTitle: 'Мікрофон не знайдено',
      errMicrophoneNotFoundDesc: 'Підключіть мікрофон та спробуйте знову',
      logTtsFallback: 'Озвучування відповіді агента через TTS API (fallback)...',
      toastProcessingVoiceTitle: 'Обробка голосу',
      toastConvertingDesc: 'Конвертуємо аудіо...',
      toastSavingDesc: 'Зберігаємо аудіоповідомлення...',
      toastAudioRecordedTitle: 'Аудіо записано',
      toastSendingDesc: 'Надсилаємо повідомлення...',
      toastAudioFormatErrorTitle: 'Помилка формату аудіо',
      toastAudioFormatErrorDesc: 'Не вдалося конвертувати аудіо. Спробуйте інший браузер.',
      toastVoiceDisabledTitle: 'Голосове введення недоступне',
      toastVoiceDisabledDesc: 'Наразі функція перетворення мовлення на текст вимкнена. Використовуйте текстове введення.',
      toastAuthErrorTitle: 'Помилка авторизації',
      toastAuthErrorDesc: 'Не вдалося авторизуватися. Спробуйте увійти знову.',
      toastServerErrorTitle: 'Помилка сервера',
      toastServerErrorDesc: 'Сервер тимчасово недоступний. Спробуйте пізніше.',
      toastVoiceRecognitionErrorTitle: 'Помилка голосового введення',
      toastVoiceRecognitionErrorDesc: 'Не вдалося розпізнати мовлення. Спробуйте ще раз.',
      toastMicPermissionDeniedTitle: 'Доступ заборонено',
      toastMicPermissionDeniedDesc: 'Дозвольте доступ до мікрофона в налаштуваннях браузера та перезавантажте сторінку',
      toastMicBusyTitle: 'Мікрофон зайнятий',
      toastMicBusyDesc: 'Мікрофон використовується іншим додатком. Закрийте інші програми та спробуйте знову',
      toastSecurityErrorTitle: 'Помилка безпеки',
      toastSecurityErrorDesc: 'Перевірте налаштування безпеки браузера та дозволи сайту',
      toastNotSupportedTitle: 'Не підтримується',
      toastNotSupportedDesc: 'Ваш браузер не підтримує необхідні аудіоналаштування',
      toastRecordErrorTitle: 'Помилка запису',
      toastRecordErrorDesc: 'Не вдалося розпочати запис: {error}',
      toastAccessErrorTitle: 'Помилка',
      toastAccessErrorDesc: 'Не вдалося отримати доступ до мікрофона',
      toastDifyPrivateChatAlert: '💬 Головний агент (Dify) не доступний в приватних чатах. Використовуйте спільні або проєктні чати для роботи з агентом.',
      btnAutoStopOn: 'Автостоп увімк.',
      btnSpeaking: 'Говоріть...',
      labelUploadingFiles: 'Завантаження файлів...',
      ariaDeleteFile: 'Видалити файл',
      placeholderRecording: 'Записую голос...',
      placeholderTypeMessage: 'Введіть повідомлення...',
      ariaAttachFile: 'Прикріпити файл',
      ariaVoiceSettings: 'Налаштування голосового введення',
      voiceSettingsTitle: 'Налаштування голосового введення',
      voiceModeLabel: 'Голосовий режим',
      voiceModeDesc: 'Автоматичний запис та озвучування відповідей',
      autoStopLabel: 'Автостоп при паузі',
      autoStopDesc: 'Автоматично зупиняти запис після 2.5 секунд тиші',
      ariaStopPlayback: 'Зупинити відтворення',
      ariaStopRecording: 'Зупинити запис',
      ariaStartRecording: 'Записати голосове повідомлення',
      ariaStopGeneration: 'Зупинити генерацію',
      ariaSendMessage: 'Надіслати повідомлення',
      titleMainAgentUnavailable: 'Головний агент не доступний в приватних чатах',
      indicatorAgentTyping: 'ЖОС Агент друкує...',
      indicatorSpeakingResponse: 'Озвучую відповідь...'
    },
    pendingApproval: {
      cardTitle: 'Заявку отримано',
      cardDesc: 'MicroDAO відкриває доступ поступово. Ми перевіримо заявку та повідомимо, коли простір буде активовано.',
      accountLabel: 'Ваш акаунт',
      statusLabel: 'Статус заявки:',
      statusPending: 'В очікуванні / Waitlisted',
      btnLogout: 'Вийти з акаунта',
      btnBackHome: 'Повернутися на головну'
    },
    agentDirectory: {
      stewardBadge: 'Системний',
      stewardDesc: 'Автономний управитель правил простору. Модерує контент на основі принципів вашої спільноти та автоматизує рутинні адміністративні рішення.',
      stewardFunc1: 'Модерація чатів відповідно до принципів',
      stewardFunc2: 'Логування адміністративних рішень',
      stewardFunc3: 'Вирішення суперечок через Пауза/Вузол',
      stewardFunc4: 'Налаштування правил та гайдлайнів спільноти',
      stewardPrompt: 'Ти — нейтральний управитель простору MicroDAO. Твоя мета — підтримувати конструктивний діалог, фіксувати ключові позиції учасників та фасилітувати консенсус.',
      ragBadge: 'Знання & RAG',
      ragDesc: 'ШІ-архіватор спільної пам\'яті спільноти. Семантично індексує завантажені файли, документи та переписки, надаючи швидкі точні відповіді.',
      ragFunc1: 'Індексування PDF, DOCX, TXT файлів',
      ragFunc2: 'Контекстні відповіді на основі бази знань',
      ragFunc3: 'Пошук у минулих рішеннях та чатах',
      ragFunc4: 'Генерація звітів та аналітичних записок',
      ragPrompt: 'Ти — архіватор знань MicroDAO. Відповідай на запитання виключно на основі завантаженого контексту бази знань спільноти. Посилайся на джерела.',
      taskBadge: 'Координація',
      taskDesc: 'Агент управління завданнями. Синхронізує задачі на канбан-дошці, створює автоматичні нагадування про дедлайни та призначає виконавців.',
      taskFunc1: 'Створення та трекінг завдань із чатів',
      taskFunc2: 'Оновлення статусів на канбан-дошці',
      taskFunc3: 'Автоматичні нагадування про дедлайни',
      taskFunc4: 'Аналіз навантаження команди',
      taskPrompt: 'Ти — ШІ-координатор завдань. Допомагай команді структурувати роботу, створювати чіткі тикети, призначати відповідальних та контролювати терміни виконання.',
      procBadge: 'Процеси',
      procDesc: 'ШІ-фасилітатор зустрічей та дзвінків. Автоматично генерує резюме обговорень, виділяє домовленості та формує список дій для команди.',
      procFunc1: 'Стенографування та резюмування зустрічей',
      procFunc2: 'Виділення ключових Action Items',
      procFunc3: 'Планування календарних подій',
      procFunc4: 'Створення детальних фоллоу-апів',
      procPrompt: 'Ти — фасилітатор зустрічей. Твоє завдання — аналізувати транскрипти розмов, виділяти прийняті рішення, завдання та терміни, формуючи структуровані підсумки.',
      navbarAgents: 'Агенти',
      navbarPricing: 'Тарифи',
      navbarClient: 'Клієнт',
      panelBtn: 'Панель керування',
      startBtn: 'Почати',
      pageTitle: 'ШІ-Агенти Спільноти',
      pageSubtitle: 'Директорія Community Agents',
      pageDesc: 'Спеціалізовані агенти з інтегрованою пам\'яттю (RAG) та доступом до інструментів для автоматизації процесів вашої спільноти.',
      labelFuncs: 'Основні функції:',
      labelPrompt: 'Системний промпт:',
      btnStartChat: 'Почати чат в просторі',
      btnCreateSpace: 'Створити простір з цим агентом',
      footerCopyright: '— Всі права захищено.'
    },
    agents: {
      yaroName: 'Яромир',
      yaroDesc: 'Агент співдії — контекстні підказки, синхронізація задач',
      eonName: 'Еонарх Синергетон',
      eonDesc: 'Агент синергії — аналітика взаємодій, оптимізація процесів',
      errLoad: 'Не вдалося завантажити агентів',
      errNameRequired: 'Вкажіть ім\'я агента',
      successCreate: 'Агента створено',
      errCreate: 'Не вдалося створити агента',
      labelPersonalSuffix: '(особистий)',
      errAlreadyInstalled: 'Цей агент вже є у вашому списку',
      personalChatName: 'Особистий чат з {name}',
      successInstall: '{name} встановлено та готовий до роботи!',
      errInstall: 'Не вдалося встановити агента',
      successActive: 'Агента активовано',
      successPaused: 'Агента призупинено',
      errStatus: 'Не вдалося змінити статус',
      deleteConfirm: 'Ви впевнені, що хочете видалити цього агента?',
      successDelete: 'Агента видалено',
      errDelete: 'Не вдалося видалити агента',
      statusActive: 'Активний',
      statusPaused: 'Пауза',
      statusDisconnected: 'Відключений',
      pageTitle: 'Агенти',
      pageSubtitle: 'Управління особистими агентами та їх інтеграція в проєкти',
      catalogBtn: 'Каталог агентів',
      catalogTitle: 'Каталог агентів',
      btnInstall: 'Встановити',
      connectCustomBtn: 'Підключити свій агент',
      connectCustomTitle: 'Підключити власного агента',
      labelAgentName: 'Ім\'я агента',
      placeholderAgentName: 'Введіть ім\'я агента',
      labelAgentDesc: 'Опис',
      placeholderAgentDesc: 'Опишіть функції агента',
      labelConnectionType: 'Тип підключення',
      connectionTypeMsp: 'MSP (Рекомендовано)',
      btnCreateAgent: 'Створити агента',
      noAgentsTitle: 'Немає агентів',
      noAgentsDesc: 'Почніть з підключення свого першого агента',
      btnConnectAgent: 'Підключити агента',
      preset: 'Шаблон',
      labelType: 'Тип',
      btnToChat: 'До чату'
    },
    chatPage: {
      returnToChats: 'Повернутися до чатів',
      userFallbackName: 'Користувач',
      agentFallbackName: 'Дух Общини',
      knotFixedDesc: 'Узел зафіксовано в бесіді',
      branchSuccessDesc: 'Гілка створена успішно',
      auditViolationDesc: 'Порушення зафіксовано в журналі аудиту',
      btnKnot: 'Вузол',
      indicatorTypingSingle: 'друкує...',
      indicatorTypingMultiple: 'друкують...',
      forkedFromTitle: 'Гілка з "{name}"',
    },
    communityChat: {
      title: 'Загальний чат ЖОС',
      description: 'Загальний чат спільноти з агентом ЖОС',
      loadError: 'Не вдалося завантажити загальний чат',
      sendError: 'Не вдалося відправити повідомлення',
      loading: 'Завантажуємо загальний чат...',
      welcomeMsg: 'Ласкаво просимо до загального чату ЖОС! Тут публікуються важливі новини та оголошення громади.',
      welcomeSystemName: 'ЖОС Система',
      welcomeUpdateMsg: 'Оновлення системи: Покращено роботу з діалогами та додано можливість архівування чатів.',
      welcomeAgentName: 'Дух спільноти',
      agentName: 'Дух спільноти',
      agentBadge: 'Агент',
      inputPlaceholder: 'Написати в загальний чат...',
      agentTyping: 'Дух спільноти друкує...',
      senderFallbackUser: 'Користувач',
      senderFallbackMember: 'Учасник',
    },
    threadPanel: {
      title: 'Обговорення повідомлення',
      subtitle: 'Гілка обговорення',
      parentPreview: 'Вихідне повідомлення:',
      parentSender: 'Відправник',
      emptyState: 'Немає відповідей у цій гілці. Почніть обговорення!',
      inputPlaceholder: 'Відповісти в гілку...',
      sendError: 'Не вдалося відправити відповідь',
    },
    videoIntro: {
      notSupported: 'Ваш браузер не підтримує відтворення відео.',
      unmute: 'Увімкнути звук',
      mute: 'Вимкнути звук',
      skip: 'Пропустити',
      welcome: 'Ласкаво просимо до ЖОС Месенджера',
    },
    createModal: {
      createTitle: 'Створити {type}',
      chatDesc: 'Створіть новий загальний чат для обговорень',
      branchDesc: 'Створіть гілку з існуючого повідомлення',
      projectDesc: 'Створіть новий проєкт для спільної роботи',
      chatType: 'Тип чату',
      placeholderChatName: 'Назва чату',
      placeholderProjectName: 'Назва проєкту',
      placeholderBranchName: 'Назва гілки',
      placeholderDescOptional: "Короткий опис (необов'язково)",
      placeholderTags: 'Теги через кому: спілкування, робота, проєкт',
      tagsHint: 'Розділяйте теги комами',
      messageIdLabel: 'ID повідомлення',
      placeholderMessageId: 'ID повідомлення для створення гілки',
      createBtn: 'Створити {type}',
      chatTypeLabel: 'Тип чату',
      chatTitleLabel: 'Назва чату',
      projectTitleLabel: 'Назва проекту',
      branchTitleLabel: 'Назва гілки',
      descPlaceholder: 'Короткий опис (необов\'язково)',
      tagsPlaceholder: 'Теги через кому: спілкування, робота, проект',
      messageIdPlaceholder: 'ID повідомлення для створення гілки',
    },
    fileUploadDialog: {
      dialogTitle: 'Завантажити файл',
      dialogDesc: 'Завантажте файли для бази знань або чату',
      labelDescription: "Опис (необов'язково)",
      placeholderDescription: 'Короткий опис файлу...',
      labelTags: 'Теги (через кому)',
      placeholderTags: 'тег1, тег2, тег3',
      btnUpload: 'Завантажити {count}',
      progress: 'Завантаження...',
      dragActive: 'Відпустіть файли тут',
      dragInactive: 'Перетягніть файли сюди або натисніть для вибору',
      supportedFormats: 'Підтримуються: PDF, TXT, MD, DOCX, DOC, CSV, JSON, зображення (макс. 25MB)',
    },
    pushNotifications: {
      permissionDeniedTitle: 'Доступ заборонено',
      permissionDeniedDesc: 'Дозвольте сповіщення в налаштуваннях браузера',
      notSupportedTitle: 'Не підтримується',
      notSupportedDesc: 'Ваш браузер не підтримує сповіщення',
      swRegistrationFailedTitle: 'Помилка',
      swRegistrationFailedDesc: 'Не вдалося зареєструвати Service Worker',
      enabledTitle: '✅ Push-сповіщення увімкнено',
      enabledDesc: 'Ви будете отримувати сповіщення навіть при закритій вкладці',
      enabledTabDesc: 'Ви будете отримувати сповіщення про нові повідомлення',
      disabledTitle: 'Помилка',
      disabledDesc: 'Не вдалося увімкнути сповіщення',
      settingsSavedTitle: 'Налаштування збережено',
      settingsSavedDesc: 'Зміни застосовано',
      settingsSaveFailedTitle: 'Помилка',
      settingsSaveFailedDesc: 'Не вдалося зберегти налаштування',
    },
    onboardingWizard: {
      aiGuide: "Ваш ШІ-провідник",
      listening: "Дух Спільноти слухає...",
      autonomy: "Рівень автономії",
      stepOf: "Крок {step} з {total}",
      stepsTitle: [
        "",
        "1. Ідентичність спільноти",
        "2. Місія спільноти",
        "3. Цінності та правила",
        "4. Обличчя Духа Спільноти",
        "5. Автономія та повноваження",
        "6. Перші коди доступу",
        "7. Початкові знання (Сімʼя)",
        "8. Перші кроки (Задачі)"
      ],
      completed: "завершено",
      labelCommName: "Назва MicroDAO *",
      placeholderCommName: "Введите название сообщества...",
      labelCommType: "Тип спільноти",
      placeholderCommType: "Оберіть тип...",
      types: {
        workspace: "Робочий простір / Команда",
        village: "Еко-поселення / Локальна громада",
        dao: "DAO / Web3 гільдія",
        club: "Закритий Клуб / Товариство",
        charity: "Благодійна ініціатива",
        other: "Інше"
      },
      labelCommDesc: "Короткий опис",
      placeholderCommDesc: "Опишіть, чим займається ваша спільнота та хто її учасники...",
      placeholderCommMission: "Чому ця спільнота існує? Яку головну проблему вона вирішує?",
      placeholderCommGoal: "Що спільнота має зробити протягом наступного місяця?",
      placeholderCommValues: "Наприклад: 1. Повага один до одного. 2. Прозорість процесів. 3. Нейтральність при суперечках. Що заборонено робити?",
      labelAgentName: "Імʼя Духа Спільноти",
      labelAgentTone: "Тональність агента",
      placeholderAgentTone: "Оберіть тон...",
      tones: {
        warm: "Теплий та дружній (Духовний)",
        philosophical: "Філософський та спокійний (Еонарх)",
        technical: "Технічний та точний (Яромир)",
        formal: "Діловий та стриманий"
      },
      autonomyLevelLabel: "Рівень автономії агента",
      autonomyLevels: {
        assistant: "Помічник (Assistant)",
        assistantDesc: "Лише пропонує ідеї, робить підсумки та створює чернетки повідомлень.",
        coordinator: "Координатор (Coordinator)",
        coordinatorDesc: "Вміє створювати чернетки завдань, готувати регламенти та нагадувати учасникам після підтвердження.",
        admin: "Адміністратор (Supervised Admin)",
        adminDesc: "Може автоматично надсилати вітання, ставити задачі, оновлювати базу знань. Чутливі дії узгоджує."
      },
      permissionsLabel: "Дозволи для Агента",
      permissions: {
        welcome: "Надсилати вітання новачкам",
        tasks: "Створювати чернетки задач",
        invites: "Створювати інвайти для гостей",
        summaries: "Генерувати підсумки зустрічей"
      },
      sensitiveActionsWarning: "Чутливі дії завжди заблоковані: видалення спільноти, зміна прав доступу, передача власності та модифікація білінгу вимагають прямого підтвердження лідера.",
      labelInviteMember: "Код для Учасників (Members)",
      labelInviteAdmin: "Код для Адміністраторів (Admins)",
      labelMaxUses: "Максимальна кількість використань коду",
      labelKbSeed: "Початкова заправка знаннями (Замітки / Правила)",
      placeholderKbSeed: "Тут ви можете ввести правила спільноти, загальний регламент або перелік корисних посилань. Я проіндексую цю інформацію, щоб миттєво відповідати на запитання...",
      taskPlanningTitle: "Сплануємо перше завдання спільноти:",
      taskTitleLabel: "Назва завдання",
      taskDescLabel: "Опис завдання",
      configReviewTitle: "Огляд конфігурації MicroDAO:",
      reviewLabels: {
        name: "Назва:",
        type: "Тип:",
        agent: "Агент:",
        autonomy: "Автономія:",
        code: "Код інвайту:"
      },
      lobbyBtn: "В лобі",
      draftBtn: "Чернетка",
      nextBtn: "Далі",
      launchBtn: "Запустити MicroDAO",
      errorNameRequired: "Назва обовʼязкова",
      errorNameDesc: "Будь ласка, назвіть ваше MicroDAO",
      defaultAgentName: "Дух Спільноти",
      defaultFirstTaskTitle: "Ознайомитися з Духом Спільноти",
      defaultFirstTaskDesc: "Прочитати правила спільноти та провести перше знайомство з Духом Спільноти в чаті.",
      agentMsg1: "Вітаю! Я — ваш майбутній Дух Спільноти. Давайте разом створимо наше MicroDAO. Почнемо з ідентичності: як буде називатися наша спільнота, до якого типу вона належить та який її короткий опис?",
      agentMsg2: "Чудовий початок! Тепер сформуємо місію та першу 30-денну ціль. Це стане ядром моєї пам'яті, щоб я міг допомагати координувати діяльність та тримати фокус.",
      agentMsg3: "Правила спільноти визначають наші цінності та межі спілкування. Які принципи поведінки та межі ви хочете встановити? У разі суперечок я нагадуватиму про ці правила.",
      agentMsg4: "Тепер налаштуємо мій характер. Як мене зватимуть (наприклад, 'Дух Спільноти' або інше ім'я)? Який тон спілкування мені обрати — дружній, філософський чи офіційний?",
      agentMsg5: "Вкажіть рівень моєї автономії та дозволи. Я можу діяти як простий Помічник, Координатор (створення задач, нагадування) або Адмін під вашим наглядом. Чутливі дії завжди вимагатимуть вашого підтвердження.",
      agentMsg6: "Створимо перші коди доступу. Ви можете згенерувати унікальні коди для адміністраторів або учасників. Наприклад, 'MYSPACE-MEMBER' чи 'MYSPACE-ADMIN'.",
      agentMsg7: "Давайте додамо перші знання! Введіть початкові правила, замітки або інструкції. Це насіння нашої спільної бази знань, яке я проіндексую першим.",
      agentMsg8: "Останній крок — заплануємо перші дії. Створимо перше завдання, яке ви побачите на дашборді. Це допоможе відразу перейти до роботи.",
      exitBtn: 'Вийти',
      ecosystemTitle: 'MicroDAO Екосистема',
      ecosystemSubtitle1: 'Живий простір вашої',
      ecosystemSubtitle2: 'мікро-спільноти',
      ecosystemDesc: 'MicroDAO — це новий підхід до організації команд та спільнот. Тут немає класичного глобального waitlist-контролю. Замість цього кожен простір формується навколо автономного Духа Спільноти — штучного інтелекту, що зберігає пам’ять, веде онбординг, призначає ролі та координує спільні дії.',
      draftFoundTitle: 'Знайдено незавершене налаштування',
      draftFoundDesc: 'Ви зупинилися на кроці {step} для створення спільноти {name}.',
      restoreDraftBtn: 'Відновити чернетку',
      existingCommTitle: 'Ваші чинні MicroDAO',
      createCommTitle: 'Створити нову спільноту (MicroDAO)',
      createCommDesc: 'Станьте лідером і запустіть простір з персональним Духом Спільноти',
      startCreationBtn: 'Почати створення з Агентом',
      joinCommTitle: 'Приєднатися за кодом запрошення',
      joinCommDesc: 'Введіть код від лідера, щоб автоматично отримати доступ',
      joinCommPlaceholder: 'Введіть код, напр: ECO-MEMBER-492',
      joiningBtn: 'Приєднання...',
      joinBtn: 'Приєднатися до спільноти',
      partnerTitle: 'Подати заявку на статус Співзасновника',
      partnerDesc: 'Запит на розширений партнерський доступ до інструментів платформи',
      partnerPendingTitle: 'Заявку прийнято на розгляд',
      partnerPendingDesc: 'Дякуємо за інтерес! Ми звʼяжемося з вами за вказаною адресою email після перевірки.',
      partnerPlaceholder: 'Опишіть вашу мету, команду та чому ви хочете отримати статус партнера...',
      sendingBtn: 'Надсилання...',
      sendRequestBtn: 'Подати заявку',
      toastErrorTitle: 'Помилка',
      toastEnterInviteCode: 'Будь ласка, введіть код запрошення',
      toastJoinSuccessTitle: 'Успішно приєднано!',
      toastJoinSuccessDesc: 'Ви стали учасником MicroDAO спільноти.',
      toastJoinErrorTitle: 'Помилка приєднання',
      toastJoinErrorDesc: 'Недійсний код запрошення.',
      toastPartnerSuccessTitle: 'Заявку надіслано!',
      toastPartnerSuccessDesc: 'Ми розглянемо ваш запит на партнерський доступ найближчим часом.',
      toastPartnerErrorTitle: 'Помилка надсилання',
      toastDraftRestoredTitle: 'Чернетку відновлено',
      toastDraftRestoredDesc: 'Повертаємося до кроку {step}.',
      toastDraftSavedTitle: 'Чернетку збережено',
      toastDraftSavedDesc: 'Ви зможете продовжити налаштування пізніше.',
      toastDraftSaveErrorTitle: 'Помилка збереження',
      toastStep1ErrorTitle: 'Помилка',
      toastStep1ErrorDesc: 'Будь ласка, введіть назву спільноти на кроці 1.',
      defaultChatName: 'Загальний чат',
      toastCreateSuccessTitle: 'Спільноту успішно створено!',
      toastCreateSuccessDesc: 'Вітаємо у MicroDAO "{name}" з Духом Спільноти "{agentName}"!',
      toastCreateErrorTitle: 'Помилка створення',
      toastCreateErrorDesc: 'Сталася помилка під час створення MicroDAO.',
      defaultStepMsg: 'Давайте продовжувати налаштування.'
    },
    communityNewsFeed: {
      urgentSentTitle: 'Термінову новину надіслано',
      urgentSentDesc: 'Push-сповіщення надіслано всім учасникам',
      sendErrorTitle: 'Помилка',
      sendErrorDesc: 'Не вдалося надіслати новину',
      agentBadge: 'ЖОС',
      userBadge: 'Користувач',
      title: 'Новинна стрічка',
      messagesCount: '{count} повідомлень',
      placeholder: 'Напишіть термінову новину для всіх учасників спільноти...',
      sendAllBtn: 'Надіслати всім',
      hint: '💡 <strong>Підказка:</strong> Новини будуть показані всім учасникам. Для виклику агента використовуйте @ЖОС',
    },
    kanban: {
      taskTitlePlaceholder: 'Назва завдання...',
      taskDescPlaceholder: 'Опис (опціонально)...',
      assignBtn: 'Призначити',
      addBtn: 'Додати',
      dragPlaceholder: 'Перетягніть картки сюди або натисніть + для створення',
      addTaskTooltip: 'Додати завдання',
      taskCreated: 'Картку створено',
      taskDeleted: 'Картку видалено',
      success: 'Успіх',
      loadError: 'Не вдалося завантажити картки',
      createError: 'Не вдалося створити картку',
      updateError: 'Не вдалося оновити картку',
      deleteError: 'Не вдалося видалити картку',
      backlog: 'Беклог',
      todo: 'До виконання',
      inProgress: 'В процесі',
      inReview: 'На перевірці',
      done: 'Готово',
    },
    onlineUsers: {
      userFallbackName: 'Учасник',
      zeroOnline: '0 онлайн',
      onlineStatus: '{name} (онлайн)',
      totalOnline: '{count} онлайн',
    },
    reactions: {
      authRequiredTitle: 'Потрібна авторизація',
      authRequiredDesc: 'Увійдіть в систему для додавання реакцій',
      addErrorTitle: 'Помилка',
      addErrorDesc: 'Не вдалося додати реакцію',
      addTooltip: 'Додати реакцію',
    },
    avatar: {
      userFallbackChar: 'У',
    },
    userProfile: {
      updatedTitle: 'Профіль оновлено',
      updatedDesc: 'Зміни успішно збережено',
      updateErrorTitle: 'Помилка',
      updateErrorDesc: 'Не вдалося оновити профіль',
      fileTooLarge: 'Файл занадто великий. Максимальний розмір: 5MB',
      unsupportedFileType: 'Непідтримуваний тип файлу. Використовуйте JPG, PNG, GIF або WebP',
      fileSecurityFailed: 'Файл не пройшов перевірку безпеки',
      uploadFailed: 'Не вдалося завантажити фото',
    },
    session: {
      expiredTitle: 'Сесія закінчилася',
      expiredDesc: 'Будь ласка, увійдіть в систему знову',
      timeoutTitle: 'Сесія закінчилася',
      timeoutDesc: 'Ви були автоматично виведені з системи через неактивність',
    },
    security: {
      loadErrorTitle: 'Помилка завантаження даних безпеки',
      loadErrorDesc: 'Не вдалося завантажити інформацію про безпеку',
      successLoginLog: 'Успішний вхід користувача {email}',
      failedLoginLog: 'Невдала спроба входу {email}',
      successRegisterLog: 'Успішна реєстрація {email}',
      rateLimitLog: 'Перевищено ліміт запитів для дії: {action}',
      fileUploadLog: 'Завантаження файлу: {file}',
      unknownUser: 'невідомо',
      loading: 'Завантаження даних безпеки...',
      panelTitle: 'Панель безпеки',
      totalEvents: 'Всього подій',
      last24h: 'За останні 24 години',
      criticalEvents: 'Критичні',
      requireAttention: 'Вимагають уваги',
      blocks: 'Блокування',
      failedLogins: 'Невдалі входи',
      hackAttempts: 'Спроби злому',
      fileUploads: 'Завантаження файлів',
      verifiedFiles: 'Перевірені файли',
      criticalWarning: 'Виявлено {count} критичних подій безпеки за останні 24 години. Рекомендується негайна перевірка.',
      recentEventsTitle: 'Останні події безпеки',
      max50Events: 'Події за останні 24 години (максимум 50)',
      noEvents: 'Немає подій безпеки за останні 24 години',
      refreshBtn: 'Оновити дані',
    },
    chatSidebar: {
      loadErrorTitle: 'Помилка',
      loadErrorDesc: 'Не вдалося завантажити чати',
      defaultChatName: 'Новий чат',
      chatCreatedDesc: 'Чат створено',
      createErrorTitle: 'Помилка',
      chatRenamedDesc: 'Чат перейменовано',
      renameErrorTitle: 'Помилка',
      renameErrorDesc: 'Не вдалося перейменувати чат',
      archiveConfirm: 'Архівувати цей чат? Видалити його можна лише з панелі керування.',
      chatArchivedTitle: 'Чат архівовано',
      chatArchivedDesc: 'Чат переміщено в архів. Видалити його можна з панелі управління чатами.',
      archiveErrorTitle: 'Помилка',
      archiveErrorDesc: 'Не вдалося архівувати чат',
      today: 'Сьогодні',
      yesterday: 'Вчора',
      searchPlaceholder: 'Пошук чатів...',
      noChatsFound: 'Чати не знайдені',
      noChatsYet: 'Поки немає чатів',
      createFirstChatBtn: 'Створити перший чат',
      archiveTooltip: 'Архівувати чат',
    },
    themeSwitch: {
      light: 'Світла',
      dark: 'Темна',
      system: 'Системна',
    },
    errorBoundary: {
      title: 'Сталася помилка',
      desc: 'Щось пішло не так. Спробуйте оновити сторінку або повернутися пізніше.',
      retryBtn: 'Повторити',
      refreshBtn: 'Оновити сторінку',
    },
    userApprovalPanel: {
      attentionTitle: 'Увага',
      inconsistenciesDesc: 'Виявлено {count} невідповідностей у даних. Спробуйте оновити сторінку.',
      loadErrorTitle: 'Помилка',
      loadErrorDesc: 'Не вдалося завантажити запити: {error}',
      updateProfileErrorTitle: 'Помилка оновлення профілю',
      updateProfileErrorDesc: 'Помилка RLS: {error}. Перевірте права доступу.',
      voiceApprovedTitle: 'Голос зараховано',
      voiceRejectedTitle: 'Відхилення зараховано',
      userApprovedDesc: 'Користувача схвалено спільнотою!',
      userRejectedDesc: 'Користувача відхилено',
      voteRegisteredDesc: 'Ваш голос враховано. Потрібно ще {count} голосів для підтвердження.',
      actionErrorTitle: 'Помилка',
      actionErrorDesc: 'Не вдалося обробити рішення: {error}',
      panelTitle: 'Нові учасники очікують підтвердження',
      panelDesc: 'Нові учасники стають модераторами після схвалення. Потрібно: 1-й користувач схвалюється автоматично, 2-й потребує 1 схвалення, 3-й потребує 2 схвалення, далі потрібно 3 схвалення для кожного нового учасника.',
      unknownUser: 'Невідомий користувач',
      approvalsCount: '{count}/{total} схвалень',
      rejectionsCount: '{count} відхилень',
      commentPlaceholder: 'Коментар (необов\'язково)',
      approveBtn: 'Схвалити',
      rejectBtn: 'Відхилити',
      alreadyApproved: 'Ви схвалили цього учасника',
      alreadyRejected: 'Ви відхилили цього учасника',
    },
    notifications: {
      title: 'Сповіщення',
      markAllAsRead: 'Позначити все як прочитане',
      enablePush: 'Увімкнути push-сповіщення',
      pushEnabled: 'Push-сповіщення увімкнено',
      noNotifications: 'Немає сповіщень',
      justNow: 'щойно',
      minsAgo: '{count} хв тому',
      hoursAgo: '{count} год тому',
      daysAgo: '{count} дн тому',
      pushEnabledTitle: '✅ Push-сповіщення увімкнено',
      pushEnabledDesc: 'Ви будете отримувати сповіщення навіть при закритій вкладці',
      enablePushErrorTitle: 'Помилка',
      enablePushErrorDesc: 'Не вдалося увімкнути push-сповіщення',
      notSupportedTitle: 'Не підтримується',
      notSupportedDesc: 'Ваш браузер не підтримує сповіщення',
      permissionDeniedTitle: 'Доступ заборонено',
      permissionDeniedDesc: 'Дозвольте сповіщення в налаштуваннях браузера',
      swRegisterErrorTitle: 'Помилка',
      swRegisterErrorDesc: 'Не вдалося зареєструвати Service Worker',
      generalErrorTitle: 'Помилка',
      generalErrorDesc: 'Не вдалося увімкнути сповіщення',
      newUrgentMessage: '📢 Нове термінове повідомлення',
      viewBtn: 'Переглянути',
    },
    fileValidation: {
      tooLargeTitle: 'Файл занадто великий',
      tooLargeDesc: 'Максимальний розмір файлу: 50MB',
      invalidTypeTitle: 'Недопустимий тип файлу',
      invalidTypeDesc: 'Цей тип файлу не дозволений для завантаження',
      validationErrorTitle: 'Помилка валідації файлу',
      validationErrorDesc: 'Не вдалося перевірити файл',
      rateLimitTitle: 'Забагато спроб',
      rateLimitDesc: 'Спробуйте завантажити файл пізніше',
      rejectedTitle: 'Файл відхилено',
      rejectedDesc: 'Файл не відповідає вимогам безпеки',
      errorTitle: 'Помилка',
      errorDesc: 'Не вдалося перевірити файл',
    },
    identity: {
      sectionTitle: 'Ідентичність та гаманець',
      sectionDesc: 'Керуйте підключеними акаунтами та криптогаманцем',
      checklistTitle: 'Контрольний список ідентичності',
      emailConnected: 'Email підключено',
      emailRequired: 'Email обов\'язковий',
      telegramConnected: 'Telegram підключено',
      telegramNotLinked: 'Telegram не підключено',
      telegramManual: 'Telegram (ручний)',
      walletConnected: 'Гаманець підключено',
      walletNotConnected: 'Гаманець не підключено',
      required: 'Обов\'язково',
      recommended: 'Рекомендовано',
      optional: 'Необов\'язково',
      walletTitle: 'Криптогаманець',
      walletDesc: 'Підключіть MetaMask для DAO-операцій та підписки',
      connectMetaMask: 'Підключити MetaMask',
      disconnectWallet: 'Відключити гаманець',
      walletAddress: 'Адреса гаманця',
      copyAddress: 'Скопіювати адресу',
      addressCopied: 'Адресу скопійовано',
      installMetaMask: 'Встановити MetaMask',
      installMetaMaskDesc: 'MetaMask не знайдено. Встановіть розширення для браузера.',
      connecting: 'Підключення...',
      walletVerified: 'Підтверджено',
      chainLabel: 'Мережа',
      telegramTitle: 'Telegram',
      telegramDesc: 'Підключіть Telegram для комунікації в MicroDAO',
      telegramUsername: 'Ім\'я користувача Telegram',
      telegramPlaceholder: '@username',
      telegramSave: 'Зберегти',
      telegramSaved: 'Збережено',
      telegramVerifyBot: 'Підтвердити через бот',
      telegramVerifyBotTooltip: 'Буде доступно у Sprint F3B',
      telegramStatusNotLinked: 'Не підключено',
      telegramStatusManual: 'Ручний (не підтверджено)',
      telegramStatusVerified: 'Підтверджено',
      subscriptionTitle: 'Підписка',
      subscriptionDesc: 'Криптопідписка Leader Plan для активації MicroDAO',
      leaderPlan: 'Leader Plan',
      leaderPlanPrice: '$20/місяць',
      leaderPlanDaar: '2 DAAR/місяць',
      daarRate: '1 DAAR = 10 USDT',
      acceptedAssets: 'Прийняті активи',
      testingMode: 'Режим тестування',
      testingModeDesc: 'Створення MicroDAO тимчасово доступне без оплати.',
      onboardingIdentityTitle: 'Вимоги ідентичності',
      onboardingIdentityDesc: 'Для активації продуктивної MicroDAO з Духом Спільноти лідеру потрібно:',
      onboardingLeaderRequires: 'Email, Telegram, криптогаманець та активна підписка Leader Plan',
      onboardingTestingNote: 'Режим тестування: створення тимчасово доступне без оплати.',
      onboardingPriceNote: 'Leader Plan: $20/місяць еквівалент, оплата в DAAR або підтриманій крипті.',
      adminBillingTitle: 'Крипто-білінг та підписки',
      adminBillingDesc: 'Огляд крипто-підписок MicroDAO та платіжних операцій',
      adminCryptoModel: 'Крипто-модель оплати',
      adminPricingBanner: 'Leader Plan — $20/міс еквівалент',
      adminAcceptedLabel: 'Прийняті активи для оплати',
      adminSubscriptionStates: 'Стани підписок',
      adminManualQueue: 'Черга ручної перевірки',
      adminManualQueueDesc: 'Платежі, що потребують ручного підтвердження guardian.',
      adminFutureRoadmap: 'Дорожня карта розробки',
      adminF3B: 'Sprint F3B — Криптоплатіжний інтент + ручна верифікація',
      adminF3C: 'Sprint F3C — On-chain watcher / автоматична верифікація',
      adminFiatFallback: 'Майбутній fiat fallback (Stripe) — необов\'язковий',
      adminNoSubscriptions: 'Підписок поки немає. Вони з\'являться після активації Leader Plan.',
    },
    advancedAccess: {
      sectionTitle: 'Подати заявку на розширений доступ',
      sectionDesc: 'Отримайте доступ до додаткових інструментів та мережевих функцій',
      selectProgram: 'Оберіть програму',
      submitApplication: 'Надіслати запит',
      applicationSent: 'Заявку успішно надіслано',
      applicationSentDesc: 'Ми розглянемо ваш запит. Статус можна перевірити на сторінці статусу доступу.',
      describePlaceholder: 'Опишіть ваш запит (яка програма доступу вас цікавить та для яких цілей)...',
      founderName: 'Founder Program',
      founderDesc: 'Ранній доступ і участь у формуванні продукту',
      partnerName: 'Partner Access',
      partnerDesc: 'Керування кількома MicroDAO або клієнтськими просторами',
      sovereignName: 'Sovereign / Network Access',
      sovereignDesc: 'Власна інфраструктура, edge/network/governance',
      workerNodeName: 'Worker Node / Sensitive Operator',
      workerNodeDesc: 'Доступ для операторів вузлів та чутливої інфраструктури',
      statusPending: 'Очікує розгляду',
      statusApproved: 'Схвалено',
      statusRejected: 'Відхилено',
      statusNeedsInfo: 'Потребує інфо',
      waitlistTitle: 'Статус розширеного доступу',
      waitlistDesc: 'Ця сторінка стосується Founder, Partner, Sovereign або Operator доступу. Звичайну MicroDAO можна створити через onboarding.',
      waitlistRequestedProgram: 'Запитана програма',
      waitlistNoRequest: 'У вас немає активних заявок на розширений доступ.',
      waitlistGenericPending: 'Розширений доступ очікує розгляду',
      adminTitle: 'Заявки на розширений доступ',
      adminDesc: 'Аналіз та ухвалення запитів на преміум програми (Founder, Partner, Sovereign, Operator).',
      adminApproveMap: 'При схваленні встановлюється access_tier:',
      adminNoRequests: 'Наразі немає активних заявок на програми розширеного доступу.',
      accessTierLabel: 'Рівень доступу',
      accessTierDesc: 'Ваш поточний рівень доступу в екосистемі DAARION',
      billingProgramsTitle: 'Програми доступу',
      billingProgramsDesc: 'Типи доступу окрім стандартної підписки Leader Plan',
    },
    cryptoBilling: {
      buyGetDaar: 'Купити / отримати DAAR',
      openGateway: 'Відкрити DAARION Gateway',
      daarRequirementDesc: 'DAAR потрібен для активації Leader Plan та агентних модулів.',
      createIntent: 'Створити платіжний інтент',
      paymentInstructions: 'Інструкція для оплати',
      polygonOnly: 'Тільки мережа Polygon',
      treasuryAddress: 'Адреса скарбниці',
      submitTxHash: 'Надіслати хеш транзакції',
      invalidTxHash: 'Невірний формат хешу транзакції',
      waitingVerification: 'Очікує перевірки Guardian',
      paymentSubmitted: 'Платіж надіслано',
      paymentConfirmed: 'Платіж підтверджено',
      paymentRejected: 'Платіж відхилено',
      manualReview: 'Ручна перевірка',
      activateLeaderPlan: 'Активувати Leader Plan',
      leaderActive: 'Leader Plan Активний',
      leaderPendingPayment: 'Leader Plan Очікує оплати',
      wrongNetworkWarning: 'Оплата з інших мереж (Ethereum, Base тощо) не буде зарахована.',
      selectAsset: 'Виберіть актив для оплати',
      paymentInstructionsDesc: 'Будь ласка, надішліть вказану суму в мережі Polygon на адресу скарбниці, після чого вкажіть хеш транзакції нижче.',
      txHashPlaceholder: 'Введіть хеш транзакції (0x...)',
      txHashFormatWarning: 'Лише базовий формат перевірки. Guardian проведе ручну верифікацію.',
      waitingVerificationDesc: 'Ваш платіж було надіслано на ручну перевірку. Зазвичай це займає до 24 годин.',
      intentExpired: 'Термін дії платежу закінчився',
      intentCreated: 'Платіжний інтент створено',
      intentCreatedDesc: 'Очікується оплата на гаманець скарбниці.',
      intentFailed: 'Помилка платежу',
      verifyActionApprove: 'Схвалити',
      verifyActionReject: 'Відхилити',
      verifyActionReview: 'Ручна перевірка',
      verifyQueueEmpty: 'Немає платіжних інтентів для ручного підтвердження.',
      verifyTableUser: 'Користувач',
      verifyTableAsset: 'Актив',
      verifyTableAmount: 'Сума',
      verifyTableHash: 'Хеш транзакції',
      verifyTableStatus: 'Статус',
      verifyTableActions: 'Дії',
      billingConfigTitle: 'Налаштування платіжного плану',
      leaderPlanUsdPrice: 'Ціна Leader Plan в USD',
      daarMonthlyAmount: 'Місячна сума в DAAR',
      daarUsdtRateLabel: 'Курс DAAR / USDT',
      acceptedAssetsLabel: 'Дозволені активи',
      paymentNetworkLabel: 'Платіжна мережа',
      treasuryAddressLabel: 'Адреса скарбниці (EVM)',
      daarPurchaseUrlLabel: 'Посилання на купівлю DAAR',
      planActiveLabel: 'План активний',
      savePricingConfigBtn: 'Зберегти налаштування цін',
      changesApplyWarning: 'Зміни застосовуються лише до нових платіжних інтентів. Наявні підписки та створені інтенти не будуть перераховані.',
      pricingConfigUpdatedSuccess: 'Конфігурацію цін оновлено',
      invalidTreasuryAddressError: 'Невірна EVM адреса скарбниці',
      invalidDaarPurchaseUrlError: 'Невірне посилання на купівлю DAAR',
      verifyOnPolygon: 'Запустити діагностику',
      onchainVerification: 'Діагностичне вікно транзакції',
      verificationPending: 'Перевірка триває',
      verificationFailed: 'Помилка верифікації',
      verifiedOnchain: 'Діагностична перевірка пройдена',
      manualReviewRequired: 'Потрібна ручна перевірка',
      txAlreadyUsed: 'Транзакція вже використана',
      recipientMismatch: 'Невідповідність отримувача',
      amountTooLow: 'Сума занадто мала',
      assetMismatch: 'Невідповідність активу',
      networkMismatch: 'Невідповідність мережі',
      senderWalletMismatch: 'Невідповідність гаманця відправника',
      viewOnPolygonScan: 'Дивитись у PolygonScan',
      diagnosticWarning: 'Це клієнтська діагностична перевірка виключно для ознайомлення Guardian. Остаточне підтвердження все ще вимагає дій адміністратора через захищений RPC.',
    },
    adminAgent: {
      title: 'Адмін-агент',
      guardianAssistant: 'Асистент Guardian',
      readonlyMode: 'Режим тільки для читання',
      cannotPerformActions: 'Адмін-агент працює в режимі тільки для читання. Він не може схвалювати платежі, змінювати ролі, запрошувати адміністраторів або отримувати доступ до приватної пам\'яті/повідомлень/документів MicroDAO.',
      platformContext: 'Контекст платформи',
      billingContext: 'Контекст білінгу',
      accessRequestsContext: 'Запити на доступ',
      platformTeamContext: 'Команда платформи',
      microdaoOpsContext: 'Операції MicroDAO',
      agentOpsContext: 'Операції агентів',
      sqlChecks: 'SQL перевірки',
      nextStep: 'Наступний крок',
      privateDataProtected: 'Приватні дані MicroDAO захищені',
      askAgent: 'Запитати адмін-агента',
      generateDraftAnswer: 'Згенерувати проект відповіді',
      placeholder: 'Введіть запит до адмін-агента...',
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
    branch: 'branch',
    actions: 'Actions',

    allRepliesVisible: 'All replies are visible to everyone',
    inviteParticipants: 'Invite participants',
    globalSearch: {
      title: 'Global search',
      filtersLabel: 'Filters:',
      allChats: 'All chats',
      startDatePlaceholder: 'From',
      endDatePlaceholder: 'To',
      resetBtn: 'Reset',
      nothingFound: 'Nothing found',
      tryAnotherQuery: 'Try changing the query',
      startTypingToSearch: 'Start typing to search',
      searchHint: '🔍 Search across chats, messages, and projects',
      keyboardHint: '⌨️ Use ↑↓ to navigate, Enter to select',
      footerNavigation: '↑↓ navigate • Enter select • Esc close',
      inChat: 'in chat:',
      userMessage: 'Message',
      spiritAnswer: 'Community Spirit Answer',
      typeChat: 'Chat',
      typeMessage: 'Message',
      typeProject: 'Project',
      typeUser: 'User',
      typeFile: 'File',
    },
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
      backToLanding: 'Back to public homepage',
      goToDashboard: 'Go to dashboard',
      billing: 'Subscription / Billing',
      platformTeam: 'Platform Team',
      adminAgent: 'Admin Agent',
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
      successCreate: 'Chat created',
      wipTitle: 'Under Development',
      wipDesc: 'This feature is currently under development',
      errorCreate: 'Error creating chat',
      messenger: 'Messenger',
      pin: 'Pin',
      unpin: 'Unpin',
      archive: 'Archive',
      archiveConfirm: 'Archive this chat? It can only be deleted from the management panel.',
      archiveSuccessTitle: 'Chat archived',
      archiveSuccessDesc: 'Chat moved to archive. You can delete it from the chat management panel.',
      renameSuccessTitle: 'Name updated',
      renameSuccessDesc: 'Chat name successfully updated',
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
      copySuccessTitle: 'Code copied',
      copySuccessDesc: 'Text copied to clipboard',
      feedbackDisabledTitle: 'Cannot send feedback',
      feedbackDisabledDesc: 'This message does not support feedback',
      feedbackSuccessTitle: 'Feedback sent',
      feedbackSuccessDesc: 'Thank you for rating!',
      feedbackErrorTitle: 'Error',
      feedbackErrorDesc: 'Failed to send feedback',
      voiceDisabledTitle: 'Voice reading disabled',
      voiceDisabledDesc: 'Enable voice mode in settings to auto-read responses',
      deleteSuccessTitle: 'Message deleted',
      deleteSuccessDesc: 'Message was successfully deleted',
      deleteErrorTitle: 'Error',
      deleteErrorDesc: 'Failed to delete message',
      copyBtn: 'Copy',
      systemSender: 'System',
      spiritSender: 'Community Spirit',
      userSender: 'User',
      deleteTooltip: 'Delete message',
      deletedText: 'Message deleted',
      fileUnavailable: 'File unavailable',
      hideTranscript: 'Hide transcript',
      showTranscript: 'Show transcript',
      sourcesTitle: 'Sources',
      tokensCount: 'Tokens: {count}',
      latency: 'Latency: {count}',
      cost: 'Cost: ${count}',
      replyTooltip: 'Reply in thread',
      stopTtsTooltip: 'Stop',
      startTtsTooltip: 'Speak text',
      createThreadTooltip: 'Create thread',
      reply1: 'reply',
      reply24: 'replies',
      reply5: 'replies',
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
      errorCode: 'Code:',
      errorRetryable: 'Retryable:',
      yes: 'Yes',
      no: 'No',
      loadCommunitiesError: 'Failed to load communities',
    },
    landing: {
      heroTitle: 'MicroDAO / Community Spirit',
      heroSubtitle: 'Agentic Living Operating System for Small Communities',
      heroDesc: 'A shared workspace integrating chats, tasks, and knowledge bases with a network of autonomous AI agents. Living Memory structures collective memory, while the coordination agent automates tasks and facilitates team decisions.',
      createSpace: 'Create Space',
      login: 'Log In',
      client: 'Client',
      installPwa: 'Install App',
      whatIsMicroDAO: 'What is MicroDAO?',
      whatIsMicroDAODesc: 'MicroDAO is a living operating system for small communities built around AI agents. It integrates memory and coordination agents with your knowledge base and tasks. The platform supports private agent deployment, features an integrated microDAO token layer on the roadmap for future tokenization, and supports local deployment via the related open-source DAARION Edge Client project.',
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
      loadError: 'Failed to load projects',
      titleRequired: 'Enter project name',
      createError: 'Failed to create project',
      createModalTitle: 'Create Project',
      createModalDesc: 'Create a new project to collaborate with the team',
      labelName: 'Project Name',
      placeholderName: 'Enter project name',
      labelDesc: 'Description (optional)',
      placeholderDesc: 'Short project description',
      cancelBtn: 'Cancel',
      creatingBtn: 'Creating...',
      today: 'today',
      yesterday: 'yesterday',
      daysAgo: '{count} days ago',
      activeCount: '{count} active',
      overdueCount: '{count} overdue',
      completedCount: '{done}/{total} completed',
      openBtn: 'Open',
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
    auth: {
      signIn: 'Sign In',
      signUp: 'Early Access',
      displayName: 'Display Name',
      displayNamePlaceholder: 'how to call you in chat',
      email: 'Email',
      emailPlaceholder: 'enter your email',
      password: 'Password',
      passwordPlaceholder: 'enter password',
      useCase: 'Your Use Case',
      useCasePlaceholder: 'describe how you plan to use MicroDAO...',
      founderCode: 'Invitation Code',
      founderCodePlaceholder: 'enter invitation code (if any)',
      founderCodeHelper: 'If you have an invitation code, the system will activate access after verification. If you do not have a code, your application will join the waitlist.',
      submitApplication: 'Submit Application',
      submitFounder: 'Verify code and submit application',
      loginBtn: 'Sign In',
      communityName: 'Community / Team Name',
      communityNamePlaceholder: 'enter workspace name',
      communityType: 'Community Type',
    },
    onboarding: {
      lobbyTitle: 'MicroDAO Ecosystem / The Living Space of Your Micro-Community',
      lobbyIntro: 'MicroDAO is a new approach to organizing teams and communities. There is no classic global waitlist control. Instead, each workspace is formed around an autonomous Community Spirit — an artificial intelligence that preserves memory, handles onboarding, assigns roles, and coordinates collaborative actions.',
      draftAlertTitle: 'Unfinished Configuration Found',
      draftAlertDesc: 'You stopped at step {step} of creating the community {name}.',
      restoreDraft: 'Restore Draft',
      activeCommunities: 'Your Active MicroDAOs',
      createCommunity: 'Create New Community (MicroDAO)',
      createCommunitySubtitle: 'Become a leader and launch a workspace with a personal Community Spirit',
      createCommunityDesc: 'I, as the Community Spirit, will guide you through the step-by-step creation process: community identity, mission, rules, my own personality, autonomy levels, and initial invitations.',
      startOnboardingBtn: 'Start Creation with Agent',
      joinCommunity: 'Join by Invitation Code',
      joinCommunitySubtitle: 'Enter a code from a leader to automatically gain access',
      joinCodePlaceholder: 'Enter code, e.g. ECO-MEMBER-492',
      joinBtn: 'Join Community',
      joinLoading: 'Joining...',
      applyFounder: 'Apply for Founder Status',
      applyFounderSubtitle: 'Partner Program to launch MicroDAOs',
      applyFounderDesc: 'If you do not have an invitation code, you can apply for Founder status to deploy your own MicroDAO.',
      enterReasonPlaceholder: 'Describe your community and mission...',
      applyBtn: 'Submit Application',
      applySuccessTitle: 'Application Submitted!',
      applySuccessDesc: 'We will review your partner access request shortly.',
      joinSuccessTitle: 'Successfully Joined!',
      joinSuccessDesc: 'You have become a member of the MicroDAO community.',
      wizardTitle: 'Initializing MicroDAO',
      saveDraftBtn: 'Save Draft',
      saveDraftSuccessTitle: 'Draft Saved',
      saveDraftSuccessDesc: 'You will be able to continue configuration later.',
      draftRestoredTitle: 'Draft Restored',
      draftRestoredDesc: 'Returning to step {step}.',
      errorSelectCommunityName: 'Please enter a community name in step 1.',
      creationSuccessTitle: 'Community Successfully Created!',
      creationSuccessDesc: 'Welcome to MicroDAO "{name}" with Community Spirit "{agentName}"!',
      stepTitle: 'Step {step} of {total}',
      agentStep1: 'Welcome! I am your future Community Spirit. Let\'s create our MicroDAO together. Let\'s start with identity: what will our community be named, what type does it belong to, and what is its brief description?',
      agentStep2: 'Great start! Now let\'s define the mission and the first 30-day goal. This will become the core of my memory so I can help coordinate activities and maintain focus.',
      agentStep3: 'Community rules define our values and boundaries of communication. What behavioral principles and limits do you want to set? In case of disputes, I will remind members of these rules.',
      agentStep4: 'Now let\'s configure my personality. What will my name be (for example, \'Community Spirit\' or something else)? What tone of communication should I choose — friendly, philosophical, or official?',
      agentStep5: 'Specify my autonomy level and permissions. I can act as a simple Assistant, Coordinator (creating tasks, reminders), or Admin under your supervision. Sensitive actions will always require your approval.',
      agentStep6: 'Let\'s create the first access codes. You can generate unique codes for administrators or members. For example, \'MYSPACE-MEMBER\' or \'MYSPACE-ADMIN\'.',
      agentStep7: 'Let\'s add some initial knowledge! Enter starting rules, notes, or instructions. This is the seed of our shared knowledge base that I will index first.',
      agentStep8: 'Last step — let\'s plan the first actions. We\'ll create the first task that you will see on the dashboard. This will help you get to work right away.',
      labelCommunityName: 'Community / Workspace Name',
      labelCommunityDesc: 'Brief description or slogan',
      labelMission: 'Mission and Purpose of the Workspace',
      labelGoal30Days: 'Goal for the next 30 days',
      labelCommunityRules: 'Rules and behavioral principles',
      labelAgentName: 'Name of your Community Spirit',
      labelAutonomyLevel: 'Autonomy Level of the Agent',
      autonomyAssistant: 'Assistant (responds only)',
      autonomyCoordinator: 'Coordinator (tasks, reminders)',
      autonomyAdmin: 'Admin (manages permissions under supervision)',
      labelInviteCodes: 'Workspace Access Codes',
      labelMemberCode: 'Code for Members',
      labelAdminCode: 'Code for Admins',
      labelInitialNotes: 'Initial documents of the knowledge base',
      labelFirstTaskTitle: 'First Task Title',
      labelFirstTaskDesc: 'Task description',
      inputPlaceholderCommunityName: 'e.g. Eco-Village, Web3-Syndicate',
      inputPlaceholderCommunityDesc: 'briefly about the workspace',
      inputPlaceholderMission: 'why we are uniting...',
      inputPlaceholderGoal30Days: 'what we must achieve in the first month...',
      inputPlaceholderCommunityRules: 'e.g. mutual respect, transparency, AI neutrality...',
      inputPlaceholderAgentName: 'e.g. Community Spirit, Steward',
      inputPlaceholderMemberCode: 'e.g. ECO-MEMBER',
      inputPlaceholderAdminCode: 'e.g. ECO-ADMIN',
      inputPlaceholderInitialNotes: 'workspace rules, goals, roles descriptions...',
      inputPlaceholderFirstTaskTitle: 'e.g. First acquaintance',
      inputPlaceholderFirstTaskDesc: 'task details',
      btnNextStep: 'Next',
      btnPrevStep: 'Back',
      btnComplete: 'Create MicroDAO',
      btnCompleting: 'Creating...',
      creationErrorTitle: 'Creation Error',
      creationErrorDesc: 'An error occurred while creating the MicroDAO.',
      joinErrorTitle: 'Join Error',
      joinErrorDesc: 'Invalid invitation code.',
      saveDraftErrorTitle: 'Save Error',
      submitErrorTitle: 'Submission Error',
      errorLimitTitle: 'Limit exceeded',
      errorLimitDesc: 'You have exceeded the limit for creating communities.',
      errorCreationTitle: 'Creation error',
      errorCreationDesc: 'Failed to create community. Please try again later.',
    },
    spiritWidget: {
      activeStatus: 'active',
      mainOrganizer: 'Main AI Organizer',
      supervisorAdmin: 'Supervised Admin',
      coordinator: 'Coordinator',
      assistant: 'Assistant',
      spiritDAO: 'MicroDAO Spirit',
      memoryMission: 'Memory Mission:',
      goal30Days: '30-Day Goal:',
      defaultMission: 'Preservation of collective intelligence and coordination of community goals.',
      defaultGoal: 'Not set',
      agentReady: 'Community Spirit is ready for setup. Community operates in autonomous mode.',
      quickActions: 'Agent Quick Actions:',
      talkBtn: 'Talk',
      talkToastTitle: 'Dialogue with Agent',
      talkToastDesc: 'Community Spirit is connecting to your chat...',
      summarizeBtn: 'Summarize',
      summarizeToastTitle: 'Work Summary',
      summarizeToastDesc: 'Community Spirit is analyzing the knowledge base and messages for a summary.',
      inviteBtn: 'Invitations',
      inviteToastTitle: 'Access Codes',
      inviteToastDesc: 'Creating and managing invitations to MicroDAO.',
      createTaskBtn: 'Create Task',
      rulesBtn: 'Rules',
      rulesToastTitle: 'Rules Analysis',
      rulesToastDesc: 'Agent is preparing updated guidelines based on communication culture.',
      planWeekBtn: 'Plan Week',
      planWeekToastTitle: 'Planning',
      planWeekToastDesc: 'Analyzing tasks and forming the weekly sprint.',
      widgetTitle: 'Community Spirit'
    },
    clientInstall: {
      macSilicon: 'macOS Apple Silicon',
      macIntel: 'macOS Intel',
      windows: 'Windows',
      linux: 'Linux',
      android: 'Android',
      ios: 'iOS',
      beta: 'Beta',
      canary: 'Canary',
      sideload: 'Sideload',
      comingSoon: 'Coming soon',
      archLayersTitle: 'Edge Client Architecture',
      archLayersSubtitle: 'Three levels of sovereign agent infrastructure',
      l1Title: 'Client Device',
      l1Subtitle: 'Sovereign Entry',
      l1Point1: 'Installation on user\'s local hardware',
      l1Point2: 'Auto-generation of Ed25519 cryptographic identity',
      l1Point3: 'Private key isolated in Keychain / Credential Manager',
      l1Point4: 'Basic synchronization with the DAARION network',
      l2Title: 'Personal Agent',
      l2Subtitle: 'Local Runtime',
      l2Point1: 'Interactive Genesis Wizard for agent creation',
      l2Point2: 'Detection of local computing resources (CPU, RAM, GPU)',
      l2Point3: 'Loading and running LLMs (Gemma, Qwen) in GGUF format',
      l2Point4: 'Wallet and local prompts management',
      l3Title: 'Worker Node',
      l3Subtitle: 'Gated Compute',
      l3Point1: 'Contribution of compute resources to the network (ping_math, text_hash)',
      l3Point2: 'Strict sandboxing: Docker/Colima, --network none',
      l3Point3: 'Access only after operator verification',
      l3Point4: 'Zero network egress from containers',
      installTitle: 'Download Edge Client',
      installSubtitle: 'Sovereign interface and edge client for creating, managing, and coordinating personal AI agents locally on your hardware.',
      downloadFromGithub: 'Download from GitHub',
      viewReleasesGithub: 'All Releases on GitHub',
      supportedPlatforms: 'Supported Platforms',
      platformFormat: 'Format: {format}',
      platformDesc: 'Cross-platform client built on Tauri v2',
      securityTitle: 'Security & Updates',
      secSovereignTitle: 'Sovereign Security',
      secSovereignDesc: 'The private key never leaves the device. Stored in macOS Keychain or Windows Credential Manager via native keyring API.',
      secSandboxTitle: 'Sandbox Worker Mode',
      secSandboxDesc: 'All edge tasks run in a sandboxed container (Docker/Colima) with --network none and cleaned environment variables.',
      secUpdatesTitle: 'Manual Updates',
      secUpdatesDesc: 'Automatic updates are currently disabled. Download new versions manually from GitHub Releases.',
      secVerificationDesc: 'Requires proof of performance, stability, and safety on each platform before production release.',
      forDevsTitle: 'For Developers',
      forDevsStep1: '# 1. Clone repository',
      forDevsStep2: '# 2. Install dependencies',
      forDevsStep3: '# 3. Launch dev mode (Vite + Tauri)',
      forDevsTerminal: '# In another terminal:',
      forDevsStep4: '# 4. Build release packages',
      openOnGithub: 'Open on GitHub',
      diagnosticsTitle: 'Diagnostic Logs',
      diagnosticsDesc: 'If the app crashes or shows a white screen, collect and send a diagnostic log:',
      readyTitle: 'Ready to launch your agent?',
      readyDesc: 'Download the DAARION Edge Client, create your sovereign cryptographic identity, and start coordinating via MicroDAO.',
      downloadBtn: 'Download',
      returnToMicroDAO: 'Return to MicroDAO',
      footerCopyright: '— All rights reserved.',
      footerDesc: 'Built for agile coordination and living communities.',
      downloadInstaller: 'Download Installer',
      openWebPwa: 'Open Web / PWA',
      selectPlatformBelow: 'Select platform below. GitHub repo is available in the footer for developers.',
      fallbackVersionDesc: 'If the installer is not yet available for your platform, use the Web / PWA version.',
      githubSourceLinkDesc: 'The DAARION Edge Client source code is available on GitHub for developers.',
      architectureLabel: 'Architecture',
      formatLabel: 'Format',
      versionLabel: 'Version',
      devToolsLabel: 'For Developers',
      sourceCodeGithub: 'Source Code on GitHub'
    },
    pricingExtra: {
      title: 'MicroDAO Access Levels',
      subtitle: 'Choose your MicroDAO development stage',
      desc: 'From launching a basic AI agent to a full sovereign network of organizations. Tokens, treasury, and voting layers are deployed incrementally according to the roadmap.',
      testing: 'Testing',
      scaling: 'Scaling',
      recommended: 'Recommended',
      selfHosted: 'Self-Hosted',
      free: 'Free',
      forFirstCommunities: 'for the first communities',
      earlyAccessDesc: 'Apply for free access during beta testing.',
      pendingLaunch: 'Awaiting Launch',
      forSmallTeams: 'for small teams',
      communityDesc: 'Agent operating system for deeper coordination of processes.',
      byInvitation: 'By Invitation',
      supportDevelopment: 'supporting development',
      founderDesc: 'For community founders who want to get priority and influence the product.',
      autonomous: 'Autonomous',
      forDaoNetworks: 'for DAO networks',
      sovereignDesc: 'For autonomous organizations and sovereign networks.',
      earlyAccessFeature1: '1 MicroDAO workspace after approval',
      earlyAccessFeature2: 'Basic Community Spirit Agent activation',
      earlyAccessFeature3: 'Decentralized group chats and threads',
      earlyAccessFeature4: 'Task management and coordination',
      earlyAccessFeature5: 'Basic knowledge base (RAG memory up to 50 MB)',
      communityFeature1: 'Multiple MicroDAO workspaces',
      communityFeature2: 'Expanded RAG memory (up to 1 GB)',
      communityFeature3: 'Up to 3 active AI agents simultaneously',
      communityFeature4: 'Invite and role automation',
      communityFeature5: 'Custom prompts for Community Spirit',
      founderFeature1: 'Priority bypass of the waitlist',
      founderFeature2: 'Early access to experimental features',
      founderFeature3: 'Direct influence on MicroDAO product decisions',
      founderFeature4: 'Priority integration with token factory',
      founderFeature5: 'Direct communication channel in Telegram',
      sovereignFeature1: 'Full data sovereignty and local deployment',
      sovereignFeature2: 'Own Edge Client hosting infrastructure',
      sovereignFeature3: 'Private builder and developer agents',
      sovereignFeature4: 'Crypto wallet and DAO treasury (roadmap)',
      sovereignFeature5: 'Minting own community tokens (roadmap)',
      applyBtn: 'Apply',
      requestAccessBtn: 'Request Access',
      becomeFounderBtn: 'Become Founder',
      startBtn: 'Get Started',
      
      leaderPlanName: 'Leader Plan',
      leaderPlanPrice: '2 DAAR / mo',
      leaderPlanPeriod: '$20 equivalent | Polygon only',
      leaderPlanDesc: 'For a leader who creates an active MicroDAO with the Community Spirit.',
      leaderPlanFeature1: '1 active MicroDAO',
      leaderPlanFeature2: 'Community Spirit (AI Assistant)',
      leaderPlanFeature3: 'Basic memory / RAG for knowledge',
      leaderPlanFeature4: 'Unlimited participant invitations',
      leaderPlanFeature5: 'Tasks, knowledge base, and group chats',
      leaderPlanFeature6: 'Crypto billing: DAAR, USDT, USDC, POL',
      activateCryptoBtn: 'Activate via Crypto',
      buyDaarBtn: 'Buy / Get DAAR',
      
      participantName: 'Participant',
      participantDesc: 'For people invited by a MicroDAO leader.',
      participantFeature1: 'Auth via email + Telegram',
      participantFeature2: 'Free participation in the invited MicroDAO',
      participantFeature3: 'Access to chats, knowledge, and tasks by role',
      participantFeature4: 'Wallet is optional until DAO actions occur',
      joinInviteBtn: 'Join by Invitation',

      partnerName: 'Partner Access',
      partnerDesc: 'For operators managing multiple MicroDAOs.',
      partnerFeature1: 'Manage multiple MicroDAOs simultaneously',
      partnerFeature2: 'Isolated client spaces',
      partnerFeature3: 'Operator Dashboard',
      partnerFeature4: 'Custom templates & White-label (in dev)',
      partnerCta: 'Request Partner Access',

      sovereignName: 'Sovereign / Network',
      sovereignDescNew: 'For organizations and networks with their own infrastructure.',
      sovereignFeatureNew1: 'Full sovereignty (on-premise deployment)',
      sovereignFeatureNew2: 'Edge Client, Network, and Governance modules',
      sovereignFeatureNew3: 'Advanced treasury & token modules',
      sovereignFeatureNew4: 'Individual Service Level Agreement (SLA)',
      sovereignCta: 'Request Sovereign Access',

      workerNodeName: 'Worker Node / Sensitive Operator',
      workerNodeDesc: 'For technical operators, nodes, and sensitive permissions.',
      workerNodeFeature1: 'Node/operator access level',
      workerNodeFeature2: 'Special technical permissions for the operator',
      workerNodeFeature3: 'Detailed audit logs and system auditing',
      workerNodeFeature4: 'Mandatory manual operator verification',
      workerNodeCta: 'Submit Operator Application',

      distinctionTitle: 'Please Note the Distinction of Access Programs',
      distinctionDesc: 'Leader Plan is a subscription to create an active MicroDAO. Founder / Partner / Sovereign / Worker Node are advanced access programs with manual approval.',
      manageSubscription: 'Manage Subscription',
      goToVerificationQueue: 'Go to Verification Queue',
      billingTitle: 'Subscription / Billing',
      billingDesc: 'Activate Leader Plan with DAAR or supported crypto.',
      inviteGuardian: 'Invite platform guardian',
      guardianEmail: 'Guardian email',
      createInvite: 'Create invite',
      copyInviteLink: 'Copy invite link',
      pendingInvites: 'Pending invites',
      acceptedInvites: 'Accepted invites',
      revokeInvite: 'Revoke invite',
      askAdminAgent: 'Ask the platform admin agent',
      draftMode: 'Draft mode',
      noAutonomousActions: 'No autonomous actions',
      privateDataProtected: 'Private MicroDAO data is not exposed'
    },
    start: {
      heroTagline: 'ZHOS · Living Operating System',
      featureRuleTitle: 'Sovereign Management',
      featureRuleDesc: 'Autonomous management of workspace rules, filtering and moderation based on community principles.',
      featureMemoryTitle: 'Living Memory',
      featureMemoryDesc: 'Long-term memory and semantic indexing (RAG) of documents and chats for instant context retrieval.',
      featureCoordTitle: 'Agentic Coordination',
      featureCoordDesc: 'Action-oriented network of AI agents to automate tasks, manage Kanban boards, and facilitate meetings.',
      featureChatTitle: 'Chat with Community Agent',
      featureChatDesc: 'Group and personal chats, thread discussions and voice messages with the community AI agent.',
      featureAgentTitle: 'Action Engine and Agents',
      featureAgentDesc: 'AI agents, prompt editor, personal assistants (Second Me) and agent network.',
      heroIntro: 'Every community is a living organism. Each workspace is a channel of action.',
      spaceCapTitle: 'Core capabilities of your community\'s workspace',
      spiritZhosTitle: 'Community Spirit / ZHOS',
      spiritZhosDesc: 'ZHOS is the Living Operating System of a community. It helps to see context, remember decisions, coordinate actions, and preserve the spirit of collaborative work.',
      spiritPrinciplesTitle: 'Operating Principles',
      principle1: 'The agent is neutral and considers context',
      principle2: 'Decisions remain with humans',
      principle3: 'Workspace memory is transparent to members',
      principle4: 'Coordination without coercion',
      principle5: 'Every action matters to the community',
      howItWorksTitle: 'How it works',
      howItWorksSubtitle: 'From idea to collective action — in four steps',
      step1Num: '01',
      step1Title: 'Create workspace',
      step1Desc: 'Name your team, DAO, or community.',
      step2Num: '02',
      step2Title: 'Invite members',
      step2Desc: 'Add colleagues, friends, or open access.',
      step3Num: '03',
      step3Title: 'Configure agent',
      step3Desc: 'Define instructions, memory, and behavior of the AI agent.',
      step4Num: '04',
      step4Title: 'Act together',
      step4Desc: 'Chats, tasks, knowledge, meetings — all in a single flow.',
      archTitle: 'Architecture',
      archSubtitle: 'Connecting agents and coordination protocols in a single ecosystem',
      archDagiTitle: 'DAGI Network',
      archDagiDesc: 'A network of agents and communication protocol between people, teams, and autonomous systems.',
      archSpaceTitle: 'MicroDAO workspace',
      archSpaceDesc: 'Interaction channel for a team or community with its own chats, tasks, and agents.',
      archSecondMeTitle: 'Second Me',
      archSecondMeDesc: 'A member\'s personal agent that gradually helps them act within the workspace.',
      archRuleTitle: 'Rules and Economics',
      archRuleDesc: 'In the future, the space can have its own rules, roles, tokens, and DAO logic.',
      spaceTypesTitle: 'Types of MicroDAO communities',
      typeProjectTitle: 'Project MicroDAO',
      typeProjectDesc: 'A team creates a space for tasks, decisions, files, and coordination.',
      typeCreativeTitle: 'Creative MicroDAO',
      typeCreativeDesc: 'Artists or creators unite ideas, discussions, knowledge, and events.',
      typeInfraTitle: 'Infrastructure MicroDAO',
      typeInfraDesc: 'A group of operators supports a node, service, or shared system.',
      typeCityTitle: 'City MicroDAO',
      typeCityDesc: 'A local community coordinates initiatives, meetings, and interactions.',
      ecosystemTitle: 'Position in the DAARION Ecosystem',
      dagiDesc: 'A network of agents and interaction protocol.',
      microDaoDesc: 'Autonomous spaces of communities, teams, and DAOs.',
      cityDesc: 'A city where MicroDAOs unite into an ecosystem.',
      joinBtn: 'Start'
    },
    importExtra: {
      title: 'Import History',
      backBtn: 'Back',
      uploadBtn: 'Upload File',
      formatsHelper: 'Telegram HTML export files, text files, and Markdown are supported',
      dropActive: 'Drop the file here...',
      dropInactive: 'Drag file here or click to select',
      limitDesc: 'HTML, TXT or MD files (maximum 5MB)',
      importBtn: 'Import',
      importing: 'Importing...',
      errorTooLargeTitle: 'File Too Large',
      errorTooLargeDesc: 'Maximum file size is 5MB',
      importSuccessTitle: 'Import Completed',
      importSuccessDesc: 'Chat history successfully imported',
      importFailedTitle: 'Import Error',
      howToExportTg: 'How to export from Telegram',
      tgStep1: '1. In Telegram Desktop:',
      tgStep1Desc: 'Settings → Advanced → Export Telegram data',
      tgStep2: '2. Choose a chat to export',
      tgStep2Desc: 'Format: Machine-readable JSON or HTML',
      tgStep3: '3. Upload the resulting file',
      tgStep3Desc: 'HTML and JSON export formats are supported'
    },
    settingsExtra: {
      profileDesc: 'Profile and personal data management',
      uploadPhoto: 'Upload Photo',
      errorTitle: 'Error',
      errorTooLarge: 'File size must not exceed 5MB',
      errorImageOnly: 'Only images can be uploaded',
      labelDisplayName: 'Display Name',
      placeholderDisplayName: 'Your name in chats',
      themeSectionTitle: 'Application Appearance Settings',
      themeSectionDesc: 'Choose an appearance theme',
      langSelectLabel: 'Interface language',
      zhosSectionTitle: 'ZHOS Settings',
      zhosSectionDesc: 'Specific settings for the ZHOS community',
      zhosShowPrinciples: 'Show the banner with ZHOS principles in the interface',
      pushTitle: 'Push Notifications',
      pushDesc: 'Browser push notifications configuration',
      enableBtn: 'Enable',
      pushDeniedAlert: 'Access denied. Enable notifications in your browser settings.',
      notifyNewsTitle: 'News Feed',
      notifyNewsDesc: 'Receive notifications about new urgent news',
      notifyChatsTitle: 'Chat Notifications',
      notifyChatsDesc: 'Choose chats you want to receive notifications from',
      loadingChats: 'Loading chats...',
      noChats: 'You have no chats yet',
      chatFallbackName: 'Chat {id}',
      limitsTitle: 'Participation Limits',
      limitsOnline: 'Maximum users online: 50',
      limitsFileSize: 'File size: up to 10MB',
      limitsMessageLength: 'Message length: up to 4000 characters',
      saving: 'Saving...',
      langUk: 'Ukrainian',
      langEn: 'English',
      langRu: 'Russian',
      langEs: 'Spanish'
    },
    authForm: {
      authErrorTitle: 'Authentication Error',
      fillRequired: 'Please fill in all fields',
      userExistsTitle: 'User Already Exists',
      userExistsDesc: 'This email is already registered. Go to the "Sign In" tab to log in.',
      regSuccessTitle: 'Registration Successful',
      regSuccessDesc: 'Check your email to confirm your account. The letter may land in "Spam".',
      welcomeTitle: 'Welcome!',
      welcomeDesc: 'You have successfully registered and logged in',
      regErrorDesc: 'Error during registration',
      emailNotVerifiedTitle: 'Email Not Verified',
      emailNotVerifiedDesc: 'Please confirm your email. Check your inbox and the "Spam" folder.',
      invalidCredentialsTitle: 'Invalid Login Credentials',
      invalidCredentialsDesc: 'Email or password is incorrect. Click "Forgot Password?" to restore access.',
      loginErrorTitle: 'Login Error',
      welcomeLoginDesc: 'You have successfully logged in',
      loginErrorDesc: 'Error during login',
      resendConfirmRequired: 'Enter email to resend confirmation letter',
      resendConfirmSuccessTitle: 'Letter Sent',
      resendConfirmSuccessDesc: 'Check your email (including "Spam") and follow the link to confirm',
      resendConfirmErrorDesc: 'Error sending confirmation letter',
      forgotPasswordRequired: 'Enter email to restore password',
      forgotPasswordSuccessTitle: 'Letter Sent',
      forgotPasswordSuccessDesc: 'Check your email. We sent a link to recover your password.',
      forgotPasswordErrorDesc: 'Error sending recovery letter',
      fillBothPasswords: 'Please fill in both password fields',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordMinLength: 'Password must contain at least 6 characters',
      updatePasswordErrorTitle: 'Password Update Error',
      updatePasswordSuccessTitle: 'Password Updated',
      updatePasswordSuccessDesc: 'Your password has been successfully changed. Now you can log in with the new password.',
      updatePasswordErrorDesc: 'An error occurred during password update',
      newPasswordTitle: 'New Password',
      newPasswordDesc: 'Create a new password for your account',
      labelNewPassword: 'New Password',
      placeholderNewPassword: 'enter new password (min. 6 characters)',
      labelConfirmPassword: 'Confirm Password',
      placeholderConfirmPassword: 'repeat new password',
      btnUpdatePassword: 'Update Password',
      btnUpdatingPassword: 'Updating...',
      btnBackToLogin: 'Back to Sign In',
      cantLoginTitle: '🔑 Having trouble signing in?',
      cantLoginDesc: 'If you forgot your password or have issues logging in, use password recovery.',
      btnResetPassword: 'Reset Password',
      deviceRemembered: '🔒 This device will be remembered. Login is only needed after logging out.',
      forgotPasswordLink: 'Forgot Password?',
      emailUnconfirmedAlert: 'Cannot log in? Maybe you need to confirm your email.',
      btnResendConfirm: 'Resend confirmation letter',
      btnResendingConfirm: 'Sending...',
      forgotPasswordSectionTitle: 'Password Recovery',
      forgotPasswordSectionDesc: 'We will send you a link to create a new password to the specified email.',
      requiredFieldsError: 'Please fill in all required fields',
      recoveryLinkInvalidTitle: 'Invalid Recovery Link',
      recoveryLinkInvalidDesc: 'This link has expired or has already been used. Please request a new password recovery link.',
    },
    chatsExtra: {
      today: 'Today',
      yesterday: 'Yesterday',
      daysAgo: '{days} days ago',
      loading: 'Loading...',
      totalChats: '{count} chats',
      noChatsFound: 'No chats found',
      noChatsYet: 'No chats yet',
      searchChatsPlaceholder: 'Search chats...',
      filterNoChatsFoundDesc: 'Try changing the search query',
      filterNoChatsYetDesc: 'Create the first community chat',
      voiceMeetingBtn: 'Start meeting',
      voiceMeetingDialogTitle: 'Voice meeting',
      forkedFrom: 'Branch from {id}...',
      active: 'Active',
      loadErrorTitle: 'Error Loading',
      pinSuccess: 'Chat pinned',
      unpinSuccess: 'Chat unpinned',
      pinDesc: 'Chat pinned to the top of the list',
      unpinDesc: 'Chat moved to the general list',
      pinError: 'Failed to change pin status',
      pinTooltip: 'Pin chat',
      unpinTooltip: 'Unpin chat',
      onlineCount: '{count} online',
      error: 'Error',
    },
    chatsManagement: {
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Failed to load chats list',
      chatsArchivedTitle: 'Chats archived',
      chatsRestoredTitle: 'Chats restored',
      chatsArchivedDesc: '{count} chat(s) moved to archive',
      chatsRestoredDesc: '{count} chat(s) restored from archive',
      archiveErrorTitle: 'Error',
      archiveErrorDesc: 'Failed to archive chats',
      restoreErrorDesc: 'Failed to restore chats',
      chatsDeletedTitle: 'Chats deleted',
      chatsDeletedDesc: '{count} чат(ов) перемещено в корзину',
      deleteErrorTitle: 'Error',
      deleteErrorDesc: 'Failed to delete selected chats',
      loadingChats: 'Loading chats...',
      backToChatsBtn: 'Back to chats',
      pageTitle: 'Manage Chats',
      pageSubtitle: 'Archiving and deleting chats',
      totalChatsCount: '{count} total chats',
      searchPlaceholder: 'Search by chat name...',
      tabActive: 'Active ({count})',
      tabArchived: 'Archived ({count})',
      selectedChatsCount: 'Selected {selected} of {total}',
      selectAllChats: 'Select all ({count})',
      btnToArchive: 'Archive',
      btnRestore: 'Restore',
      btnDelete: 'Delete',
      deleteConfirmTitle: 'Delete selected chats?',
      deleteConfirmDesc: 'This action is irreversible. {count} chat(s) and all their messages will be deleted.',
      deleteLogNote: 'All actions are recorded in the audit log.',
      cancelBtn: 'Cancel',
      deleteForeverBtn: 'Delete forever',
      noChatsFound: 'No chats found',
      noActiveChats: 'No active chats',
      noArchivedChats: 'No archived chats',
      searchEmptyStateDesc: 'Try changing the search query',
      activeEmptyStateDesc: 'Create a new chat to start communicating',
      messagesCount: '{count} messages',
      chatCreatedDate: 'Created: {date}',
      chatUpdatedDate: 'Updated: {date}',
      btnOpenChat: 'Open',
      noMessages: 'No messages',
    },
    newsExtra: {
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Failed to load messages',
      settingsUpdatedTitle: 'Settings updated',
      notifyEnabledDesc: 'Notifications enabled',
      notifyDisabledDesc: 'Notifications disabled',
      updateSettingsErrorTitle: 'Error',
      updateSettingsErrorDesc: 'Failed to update settings',
      messageSentTitle: 'Message sent',
      messageSentAgentDesc: 'Agent will respond shortly',
      sendErrorTitle: 'Error',
      sendErrorDesc: 'Failed to send message',
      agentFallbackName: 'ZHOS',
      userFallbackName: 'User',
      feedTitle: 'News Feed',
      notifyLabel: 'Notifications',
      textPlaceholder: 'Urgent message... (Ctrl+Enter to send, @ZHOS to call agent)',
      helperText: '💡 Tip: ZHOS Agent only responds when @ZHOS is mentioned in the message'
    },
    participantsExtra: {
      userFallbackName: 'User',
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Failed to load participants data',
      updateProfileErrorTitle: 'Profile update error',
      updateProfileErrorDesc: 'RLS error: {message}. Check access permissions.',
      requestApprovedTitle: 'Request Approved',
      requestRejectedTitle: 'Request Rejected',
      userApprovedDesc: 'User accepted into the community',
      userRejectedDesc: 'User rejected',
      voteRegisteredDesc: 'Your vote has been recorded. Requires {count} more approvals.',
      requestErrorTitle: 'Error',
      requestErrorDesc: 'Failed to process request: {message}',
      loadingText: 'Loading participants...',
      pageTitle: 'Manage Participants',
      pageSubtitle: 'View and manage community joining applications',
      tabPending: 'Pending ({count})',
      tabApproved: 'Approved ({count})',
      tabRejected: 'Rejected ({count})',
      noPendingTitle: 'No pending requests',
      noPendingDesc: 'All joining requests have been processed',
      requestedDate: 'Applied: {date}',
      approvedVotes: 'Approved: {count}',
      rejectedVotes: 'Rejected: {count}',
      requiredVotes: 'Required: {count} votes',
      statusPending: 'Pending',
      commentPlaceholder: 'Comment (optional)...',
      btnApprove: 'Approve',
      btnReject: 'Reject',
      alreadyVoted: 'You have already voted on this request',
      joinedDate: 'Joined: {date}',
      roleMember: 'Member',
      rejectedDate: 'Request rejected: {date}',
      roleRejected: 'Rejected',
      triggerButton: 'Participants',
      onlineCountDesc: '{online} of {total} online',
      online: 'online',
      offline: 'offline',
      offlineHeader: 'Offline ({count})',
      onlineHeader: 'Online ({count})',
      notInNetwork: 'offline',
      noParticipants: 'No participant data',
      remainingOnline: 'Another {count} participants online',
    },
    promptEditor: {
      loadErrorDesc: 'Failed to load versions',
      refreshSuccessDesc: 'Data refreshed',
      errorEmptyVersionNameTitle: 'Error',
      errorEmptyVersionNameDesc: 'Please enter a version name',
      saveSuccessDesc: 'Prompt version saved',
      saveErrorTitle: 'Save Error',
      saveErrorDesc: 'Please try again',
      activateSuccessDesc: 'Version activated',
      activateErrorTitle: 'Activation Error',
      activateErrorDesc: 'Please try again',
      editVersionLoadedDesc: 'Loaded version {name} for editing',
      loadingCommunity: 'Loading community...',
      noActiveCommunityTitle: 'No Active Community',
      noActiveCommunityDesc: 'Create or select a community to edit prompts.',
      pageTitle: 'Prompt Editor',
      pageSubtitle: 'Configuring instructions and agent behavior',
      btnRefresh: 'Refresh',
      btnSaveVersion: 'Save Version',
      btnSavingVersion: 'Saving...',
      tabSystem: 'System',
      tabResponses: 'Responses',
      tabFallback: 'Fallback',
      labelSystemInstructions: 'System Instructions (System Prompt)',
      labelResponsesInstructions: 'Format and Style of Responses',
      labelFallbackInstructions: 'Fallback Instructions (spare responses)',
      descSystemInstructions: 'Base rules, knowledge, and identity of the community AI agent',
      descResponsesInstructions: 'Tone of voice, language, and message length settings',
      descFallbackInstructions: 'Instructions for behavior in unknown situations or errors',
      activeVersionLabel: 'Active version: {name}',
      viewOnlyWarning: 'View restricted. You can see active instructions, but editing and creating new versions is allowed only for team administrators.',
      unsavedChangesAlert: 'You have unsaved changes in this prompt. Click "Save Version" to save the draft.',
      labelVersionName: 'Version Name',
      placeholderVersionName: 'e.g. v1, v1.1, draft-new',
      labelPromptContentSystem: 'Prompt Content (system)',
      labelPromptContentResponses: 'Prompt Content (responses)',
      labelPromptContentFallback: 'Prompt Content (fallback)',
      placeholderPromptContentSystem: 'Enter system instructions for community agent…',
      placeholderPromptContentResponses: 'Enter requirements for assistant responses style and format…',
      placeholderPromptContentFallback: 'Enter instructions for behavior in unknown situations…',
      versionsListTitle: 'Prompt Versions',
      totalVersionsCount: 'Total: {count}',
      noVersionsFound: 'No versions found',
      badgeActive: 'Active',
      badgeDraft: 'Draft',
      btnActivate: 'Activate',
      btnEdit: 'Edit',
      btnView: 'View'
    },
    integrationsExtra: {
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Failed to load integrations',
      updateSuccessTitle: 'Status updated',
      updateSuccessDesc: '{name} is {status}',
      updateErrorTitle: 'Error',
      updateErrorDesc: 'Failed to update integration',
      connectSuccessTitle: 'Connected',
      connectSuccessDesc: '{name} successfully connected',
      connectErrorTitle: 'Connection Error',
      connectErrorDesc: 'Failed to connect integration',
      disconnectSuccessTitle: 'Disconnected',
      disconnectSuccessDesc: '{name} successfully disconnected',
      disconnectErrorTitle: 'Error',
      disconnectErrorDesc: 'Failed to disconnect integration',
      scopeLabel: 'Scope of Application',
      scopePrivate: 'Private',
      scopeTeam: 'Team',
      scopePrivateDesc: 'Integration will be available only to you',
      scopeTeamDesc: 'Integration will be available to the whole team',
      setupTitle: 'Configure {name}',
      setupDesc: 'Enter required details to connect {name}',
      btnSetupSave: 'Save',
      placeholderBotToken: 'Enter bot token',
      placeholderChatId: 'Chat ID (optional)',
      placeholderApiKey: 'WhatsApp Business API Key',
      placeholderPhoneNumber: '+380XXXXXXXXX',
      placeholderSmtpHost: 'smtp.gmail.com',
      placeholderSmtpPort: '587',
      placeholderSmtpPassword: 'Password or App Password',
      placeholderCalendarToken: 'OAuth Token',
      placeholderSlackChannel: '#general',
      placeholderDiscordServer: 'Server ID (optional)',
      labelBotToken: 'Bot Token',
      labelChatId: 'Chat ID',
      labelApiKey: 'API Key',
      labelPhoneNumber: 'Phone Number',
      labelSmtpHost: 'SMTP Server',
      labelSmtpPort: 'Port',
      labelSmtpPassword: 'Password',
      labelCalendarType: 'Calendar Type',
      labelCalendarToken: 'Access Token',
      labelSlackChannel: 'Channel',
      labelDiscordServer: 'Server ID',
      descriptionTelegram: 'Integrate Telegram for receiving and sending messages',
      descriptionWhatsapp: 'Connect WhatsApp for two-way synchronization of messages',
      descriptionEmail: 'Set up email to receive messages and notifications',
      nameCalendar: 'Calendar',
      descriptionCalendar: 'Synchronize events and meetings with Google Calendar or Outlook',
      descriptionSlack: 'Integration with Slack to synchronize channels',
      descriptionDiscord: 'Connect Discord server for messaging',
      descriptionGoogleDrive: 'Synchronize files with Google Drive to access in knowledge base',
      descriptionGoogleDocs: 'Integrate Google Docs for automatic document import',
      descriptionOpenAI: 'Connect OpenAI ChatGPT API for advanced AI capabilities',
      descriptionDeepSeek: 'Integration with DeepSeek AI for alternative AI options',
      pageTitle: 'Integrations',
      pageSubtitle: 'Connect external services to extend messenger functionality',
      pageDesc1: 'Integrations allow you to synchronize messages with other platforms and automate workflow.',
      pageDesc2: 'You can create integrations for the team (available to all) or private ones (only for you).',
      tabsAll: 'All',
      tabsTeam: 'Team',
      tabsPrivate: 'Private',
      statusConnected: 'Connected',
      statusNotConnected: 'Not connected',
      scopeTeamText: 'Team',
      scopePrivateText: 'Private',
      lastSyncText: 'Last sync: {date}',
      btnEnabled: 'Enabled',
      btnDisabled: 'Disabled',
      btnConnecting: 'Connecting...',
      btnConnect: 'Connect',
      btnSetup: 'Settings',
      btnDisconnect: 'Disconnect',
      btnCancel: 'Cancel',
      howItWorksTitle: 'How it works?',
      howItWorksStep1: 'Connect integration by entering the required details',
      howItWorksStep2: 'Enable integration to start synchronization',
      howItWorksStep3: 'Messages will be automatically synchronized between platforms',
      howItWorksStep4: 'You can always disconnect or change the settings',
      selectPlaceholder: 'Select...'
    },
    projectLayout: {
      tabChat: 'Chat',
      tabKanban: 'Tasks',
      tabDocs: 'Documents',
      tabMeetings: 'Meetings',
      tabSettings: 'Settings',
      docsWipTitle: 'Project Documents',
      docsWipDesc: 'Documents feature is under development',
      meetingsWipTitle: 'Project Meetings',
      meetingsWipDesc: 'Meetings feature is under development',
      settingsWipTitle: 'Project Settings',
      settingsWipDesc: 'Settings feature is under development'
    },
    agoraVoiceCall: {
      loadErrorAuth: 'User not authorized',
      loadErrorInit: 'Failed to initialize voice call',
      connectingTitle: 'Connecting...',
      connectingDesc: 'Retrieving access token',
      connectErrorToken: 'Failed to retrieve token',
      connectedTitle: 'Connected',
      connectedDesc: 'You joined the voice channel',
      connectErrorChannel: 'Failed to join the channel',
      disconnectedTitle: 'Disconnected',
      disconnectedDesc: 'You left the voice channel',
      channelHeader: 'Voice Channel',
      participantsCount: '{count} participants',
      btnStartMeeting: 'Start meeting',
      tooltipMute: 'Mute microphone',
      tooltipUnmute: 'Unmute microphone',
      labelParticipants: 'Participants:',
      participantFallback: 'Participant {id}'
    },
    chatInterface: {
      errPlayTitle: 'Playback Error',
      errPlayDesc: 'Failed to play audio',
      errTtsTitle: 'TTS Error',
      errTtsDesc: 'Failed to speak response',
      userFallbackName: 'User',
      errUploadTitle: 'Failed to upload file {name}',
      errFileSizeTitle: 'File Too Large',
      errFileSizeDesc: 'File size exceeds the allowed limit (25 MB)',
      errFileTypeTitle: 'File type not supported',
      errHttpsTitle: 'Secure Connection Required',
      errHttpsDesc: 'HTTPS connection is required to access the microphone',
      errMicrophoneNotSupportedTitle: 'Browser Not Supported',
      errMicrophoneNotSupportedDesc: 'Your browser does not support voice recording. Update browser or use Chrome/Firefox',
      errMicrophoneNotFoundTitle: 'Microphone Not Found',
      errMicrophoneNotFoundDesc: 'Connect microphone and try again',
      logTtsFallback: 'Speaking agent response via TTS API (fallback)...',
      toastProcessingVoiceTitle: 'Processing Voice',
      toastConvertingDesc: 'Converting audio...',
      toastSavingDesc: 'Saving audio message...',
      toastAudioRecordedTitle: 'Audio recorded',
      toastSendingDesc: 'Sending message...',
      toastAudioFormatErrorTitle: 'Audio Format Error',
      toastAudioFormatErrorDesc: 'Failed to convert audio. Try another browser.',
      toastVoiceDisabledTitle: 'Voice Input Unavailable',
      toastVoiceDisabledDesc: 'Speech-to-text functionality is currently disabled. Use text input.',
      toastAuthErrorTitle: 'Authentication Error',
      toastAuthErrorDesc: 'Failed to authenticate. Please log in again.',
      toastServerErrorTitle: 'Server Error',
      toastServerErrorDesc: 'Server is temporarily unavailable. Please try again later.',
      toastVoiceRecognitionErrorTitle: 'Voice Input Error',
      toastVoiceRecognitionErrorDesc: 'Failed to recognize speech. Please try again.',
      toastMicPermissionDeniedTitle: 'Access Denied',
      toastMicPermissionDeniedDesc: 'Allow microphone access in browser settings and reload the page',
      toastMicBusyTitle: 'Microphone Busy',
      toastMicBusyDesc: 'Microphone is being used by another application. Close other apps and try again',
      toastSecurityErrorTitle: 'Security Error',
      toastSecurityErrorDesc: 'Check browser security settings and website permissions',
      toastNotSupportedTitle: 'Not Supported',
      toastNotSupportedDesc: 'Your browser does not support the required audio settings',
      toastRecordErrorTitle: 'Recording Error',
      toastRecordErrorDesc: 'Failed to start recording: {error}',
      toastAccessErrorTitle: 'Error',
      toastAccessErrorDesc: 'Failed to access microphone',
      toastDifyPrivateChatAlert: '💬 Main agent (Dify) is not available in private chats. Use group or project chats to work with the agent.',
      btnAutoStopOn: 'Auto-stop on',
      btnSpeaking: 'Speak...',
      labelUploadingFiles: 'Uploading files...',
      ariaDeleteFile: 'Delete file',
      placeholderRecording: 'Recording voice...',
      placeholderTypeMessage: 'Type a message...',
      ariaAttachFile: 'Attach file',
      ariaVoiceSettings: 'Voice input settings',
      voiceSettingsTitle: 'Voice Input Settings',
      voiceModeLabel: 'Voice mode',
      voiceModeDesc: 'Automatic recording and speaking of responses',
      autoStopLabel: 'Auto-stop on silence',
      autoStopDesc: 'Automatically stop recording after 2.5 seconds of silence',
      ariaStopPlayback: 'Stop playback',
      ariaStopRecording: 'Stop recording',
      ariaStartRecording: 'Record voice message',
      ariaStopGeneration: 'Stop generation',
      ariaSendMessage: 'Send message',
      titleMainAgentUnavailable: 'Main agent is not available in private chats',
      indicatorAgentTyping: 'ZHOS Agent is typing...',
      indicatorSpeakingResponse: 'Speaking response...'
    },
    pendingApproval: {
      cardTitle: 'Application Received',
      cardDesc: 'MicroDAO grants access gradually. We will check the application and notify you when the workspace is activated.',
      accountLabel: 'Your Account',
      statusLabel: 'Application Status:',
      statusPending: 'Pending / Waitlisted',
      btnLogout: 'Sign Out',
      btnBackHome: 'Return Home'
    },
    agentDirectory: {
      stewardBadge: 'System',
      stewardDesc: 'Autonomous workspace rules manager. Moderates content based on community principles and automates routine administrative decisions.',
      stewardFunc1: 'Moderation of chats according to principles',
      stewardFunc2: 'Logging of administrative decisions',
      stewardFunc3: 'Conflict resolution via Pause/Node',
      stewardFunc4: 'Setting community rules and guidelines',
      stewardPrompt: 'You are the neutral manager of the MicroDAO workspace. Your goal is to maintain constructive dialogue, record key positions of participants, and facilitate consensus.',
      ragBadge: 'Knowledge & RAG',
      ragDesc: 'AI archiver of the community\'s shared memory. Semantically indexes uploaded files, documents, and chats to provide fast, accurate answers.',
      ragFunc1: 'Indexing PDF, DOCX, TXT files',
      ragFunc2: 'Contextual answers based on knowledge base',
      ragFunc3: 'Search in past decisions and chats',
      ragFunc4: 'Generation of reports and analytical notes',
      ragPrompt: 'You are the knowledge archiver of MicroDAO. Answer questions strictly based on the uploaded community knowledge base context. Cite sources.',
      taskBadge: 'Coordination',
      taskDesc: 'Task management agent. Synchronizes tasks on Kanban board, creates automatic deadline reminders, and assigns assignees.',
      taskFunc1: 'Creation and tracking of tasks from chats',
      taskFunc2: 'Updating statuses on Kanban board',
      taskFunc3: 'Automatic deadline reminders',
      taskFunc4: 'Analysis of team workload',
      taskPrompt: 'You are the AI task coordinator. Help the team structure work, create clear tickets, assign responsible parties, and control deadlines.',
      procBadge: 'Processes',
      procDesc: 'AI facilitator of meetings and calls. Automatically generates summaries of discussions, highlights agreements, and forms action items lists for the team.',
      procFunc1: 'Transcription and summarization of meetings',
      procFunc2: 'Highlighting key Action Items',
      procFunc3: 'Scheduling calendar events',
      procFunc4: 'Creation of detailed follow-ups',
      procPrompt: 'You are a meeting facilitator. Your task is to analyze conversation transcripts, highlight decisions made, tasks, and deadlines, forming structured summaries.',
      navbarAgents: 'Agents',
      navbarPricing: 'Pricing',
      navbarClient: 'Client',
      panelBtn: 'Control Panel',
      startBtn: 'Start',
      pageTitle: 'Community AI Agents',
      pageSubtitle: 'Community Agents Directory',
      pageDesc: 'Specialized agents with integrated memory (RAG) and access to tools to automate your community\'s processes.',
      labelFuncs: 'Main Functions:',
      labelPrompt: 'System Prompt:',
      btnStartChat: 'Start chat in workspace',
      btnCreateSpace: 'Create space with this agent',
      footerCopyright: '— All rights reserved.'
    },
    agents: {
      yaroName: 'Yaromir',
      yaroDesc: 'Collaboration agent — context tips, task synchronization',
      eonName: 'Eonarch Synergeton',
      eonDesc: 'Synergy agent — interaction analytics, process optimization',
      errLoad: 'Failed to load agents',
      errNameRequired: 'Specify agent name',
      successCreate: 'Agent created',
      errCreate: 'Failed to create agent',
      labelPersonalSuffix: '(personal)',
      errAlreadyInstalled: 'This agent is already in your list',
      personalChatName: 'Personal chat with {name}',
      successInstall: '{name} installed and ready to work!',
      errInstall: 'Failed to install agent',
      successActive: 'Agent activated',
      successPaused: 'Agent paused',
      errStatus: 'Failed to change status',
      deleteConfirm: 'Are you sure you want to delete this agent?',
      successDelete: 'Agent deleted',
      errDelete: 'Failed to delete agent',
      statusActive: 'Active',
      statusPaused: 'Paused',
      statusDisconnected: 'Disconnected',
      pageTitle: 'Agents',
      pageSubtitle: 'Management of personal agents and their integration in projects',
      catalogBtn: 'Agents Catalog',
      catalogTitle: 'Agents Catalog',
      btnInstall: 'Install',
      connectCustomBtn: 'Connect Your Agent',
      connectCustomTitle: 'Connect Custom Agent',
      labelAgentName: 'Agent Name',
      placeholderAgentName: 'Enter agent name',
      labelAgentDesc: 'Description',
      placeholderAgentDesc: 'Describe agent functions',
      labelConnectionType: 'Connection Type',
      connectionTypeMsp: 'MSP (Recommended)',
      btnCreateAgent: 'Create Agent',
      noAgentsTitle: 'No Agents',
      noAgentsDesc: 'Start by connecting your first agent',
      btnConnectAgent: 'Connect Agent',
      preset: 'Preset',
      labelType: 'Type',
      btnToChat: 'To chat'
    },
    chatPage: {
      returnToChats: 'Return to chats',
      userFallbackName: 'User',
      agentFallbackName: 'Community Spirit',
      knotFixedDesc: 'Node fixed in conversation',
      branchSuccessDesc: 'Branch created successfully',
      auditViolationDesc: 'Violation recorded in the audit log',
      btnKnot: 'Node',
      indicatorTypingSingle: 'is typing...',
      indicatorTypingMultiple: 'are typing...',
      forkedFromTitle: 'Branch from "{name}"',
    },
    communityChat: {
      title: 'Global Chat ZHOS',
      description: 'Global community chat with the ZHOS agent',
      loadError: 'Failed to load global chat',
      sendError: 'Failed to send message',
      loading: 'Loading global chat...',
      welcomeMsg: 'Welcome to the ZHOS global chat! Important community news and announcements are published here.',
      welcomeSystemName: 'ZHOS System',
      welcomeUpdateMsg: 'System update: Improved dialogues and added chat archiving capabilities.',
      welcomeAgentName: 'Community Spirit',
      agentName: 'Community Spirit',
      agentBadge: 'Agent',
      inputPlaceholder: 'Write to global chat...',
      agentTyping: 'Community Spirit is typing...',
      senderFallbackUser: 'User',
      senderFallbackMember: 'Participant',
    },
    threadPanel: {
      title: 'Message discussion',
      subtitle: 'Thread discussion',
      parentPreview: 'Original message:',
      parentSender: 'Sender',
      emptyState: 'No replies in this thread. Start the discussion!',
      inputPlaceholder: 'Reply in thread...',
      sendError: 'Failed to send reply',
    },
    videoIntro: {
      notSupported: 'Your browser does not support video playback.',
      unmute: 'Unmute',
      mute: 'Mute',
      skip: 'Skip',
      welcome: 'Welcome to ZHOS Messenger',
    },
    createModal: {
      createTitle: 'Create {type}',
      chatDesc: 'Create a new global chat for discussions',
      branchDesc: 'Create a branch from an existing message',
      projectDesc: 'Create a new project for team collaboration',
      chatType: 'Chat type',
      placeholderChatName: 'Chat name',
      placeholderProjectName: 'Project name',
      placeholderBranchName: 'Branch name',
      placeholderDescOptional: 'Short description (optional)',
      placeholderTags: 'Tags separated by commas: chat, work, project',
      tagsHint: 'Separate tags with commas',
      messageIdLabel: 'Message ID',
      placeholderMessageId: 'Message ID to create branch',
      createBtn: 'Create {type}',
      chatTypeLabel: 'Chat Type',
      chatTitleLabel: 'Chat Name',
      projectTitleLabel: 'Project Name',
      branchTitleLabel: 'Branch Name',
      descPlaceholder: 'Short description (optional)',
      tagsPlaceholder: 'Tags separated by commas: chat, work, project',
      messageIdPlaceholder: 'Message ID to create branch',
    },
    fileUploadDialog: {
      dialogTitle: 'Upload File',
      dialogDesc: 'Upload files for the knowledge base or chat',
      labelDescription: 'Description (optional)',
      placeholderDescription: 'Brief file description...',
      labelTags: 'Tags (comma-separated)',
      placeholderTags: 'tag1, tag2, tag3',
      btnUpload: 'Upload {count}',
      progress: 'Uploading...',
      dragActive: 'Drop the files here',
      dragInactive: 'Drag and drop files here, or click to select',
      supportedFormats: 'Supported: PDF, TXT, MD, DOCX, DOC, CSV, JSON, images (max 25MB)',
    },
    pushNotifications: {
      permissionDeniedTitle: 'Access denied',
      permissionDeniedDesc: 'Allow notifications in your browser settings',
      notSupportedTitle: 'Not supported',
      notSupportedDesc: 'Your browser does not support notifications',
      swRegistrationFailedTitle: 'Error',
      swRegistrationFailedDesc: 'Failed to register Service Worker',
      enabledTitle: '✅ Push notifications enabled',
      enabledDesc: 'You will receive notifications even when the tab is closed',
      enabledTabDesc: 'You will receive notifications about new messages',
      disabledTitle: 'Error',
      disabledDesc: 'Failed to enable notifications',
      settingsSavedTitle: 'Settings saved',
      settingsSavedDesc: 'Changes applied',
      settingsSaveFailedTitle: 'Error',
      settingsSaveFailedDesc: 'Failed to save settings',
    },
    onboardingWizard: {
      aiGuide: "Your AI Guide",
      listening: "Community Spirit is listening...",
      autonomy: "Autonomy Level",
      stepOf: "Step {step} of {total}",
      stepsTitle: [
        "",
        "1. Community Identity",
        "2. Community Mission",
        "3. Values and Rules",
        "4. Face of the Community Spirit",
        "5. Autonomy and Permissions",
        "6. First Invite Codes",
        "7. Initial Knowledge",
        "8. First Steps (Tasks)"
      ],
      completed: "completed",
      labelCommName: "MicroDAO Name *",
      placeholderCommName: "Enter community name...",
      labelCommType: "Community Type",
      placeholderCommType: "Select type...",
      types: {
        workspace: "Workspace / Team",
        village: "Eco-village / Local Community",
        dao: "DAO / Web3 Guild",
        club: "Private Club / Society",
        charity: "Charity Initiative",
        other: "Other"
      },
      labelCommDesc: "Short Description",
      placeholderCommDesc: "Describe what your community does and who its members are...",
      placeholderCommMission: "Why does this community exist? What main problem does it solve?",
      placeholderCommGoal: "What should the community do in the next 30 days?",
      placeholderCommValues: "E.g.: 1. Mutual respect. 2. Transparency. 3. AI neutrality. What is forbidden?",
      labelAgentName: "Community Spirit Name",
      labelAgentTone: "Agent Tone",
      placeholderAgentTone: "Select tone...",
      tones: {
        warm: "Warm and friendly (Spiritual)",
        philosophical: "Philosophical and calm (Eonarch)",
        technical: "Technical and precise (Yaromir)",
        formal: "Business and formal"
      },
      autonomyLevelLabel: "Agent Autonomy Level",
      autonomyLevels: {
        assistant: "Assistant",
        assistantDesc: "Only proposes ideas, makes summaries, and drafts messages.",
        coordinator: "Coordinator",
        coordinatorDesc: "Can draft tasks, prepare regulations, and remind members after confirmation.",
        admin: "Supervised Admin",
        adminDesc: "Can auto-send welcome messages, set tasks, and update KB. Confirms sensitive actions."
      },
      permissionsLabel: "Agent Permissions",
      permissions: {
        welcome: "Send welcomes to newcomers",
        tasks: "Draft tasks",
        invites: "Create guest invites",
        summaries: "Generate meeting summaries"
      },
      sensitiveActionsWarning: "Sensitive actions are always locked: community deletion, permission changes, ownership transfer, and billing modifications require direct approval from the leader.",
      labelInviteMember: "Code for Members",
      labelInviteAdmin: "Code for Admins",
      labelMaxUses: "Maximum code uses",
      labelKbSeed: "Initial Knowledge Seed (Notes / Rules)",
      placeholderKbSeed: "Here you can enter community rules, general regulations, or useful links. I will index this info to answer questions instantly...",
      taskPlanningTitle: "Plan the community's first task:",
      taskTitleLabel: "Task Title",
      taskDescLabel: "Task Description",
      configReviewTitle: "MicroDAO Configuration Review:",
      reviewLabels: {
        name: "Name:",
        type: "Type:",
        agent: "Agent:",
        autonomy: "Autonomy:",
        code: "Invite Code:"
      },
      lobbyBtn: "To lobby",
      draftBtn: "Draft",
      nextBtn: "Next",
      launchBtn: "Launch MicroDAO",
      errorNameRequired: "Name is required",
      errorNameDesc: "Please name your MicroDAO",
      defaultAgentName: "Community Spirit",
      defaultFirstTaskTitle: "Get to know the Community Spirit",
      defaultFirstTaskDesc: "Read the community rules and introduce yourself to the Community Spirit in the chat.",
      agentMsg1: "Welcome! I am your future Community Spirit. Let's create our MicroDAO together. Let's start with identity: what will our community be called, what type does it belong to, and what is its short description?",
      agentMsg2: "Great start! Now let's shape the mission and the first 30-day goal. This will become the core of my memory so that I can help coordinate activities and keep focus.",
      agentMsg3: "Community rules define our values and boundaries of communication. What principles of behavior and boundaries do you want to establish? In case of disputes, I will remind you of these rules.",
      agentMsg4: "Now let's configure my character. What will I be called (for example, 'Community Spirit' or another name)? What tone of communication should I choose - friendly, philosophical, or official?",
      agentMsg5: "Specify my level of autonomy and permissions. I can act as a simple Assistant, Coordinator (task creation, reminders), or Admin under your supervision. Sensitive actions will always require your confirmation.",
      agentMsg6: "Let's create the first access codes. You can generate unique codes for admins or members. For example, 'MYSPACE-MEMBER' or 'MYSPACE-ADMIN'.",
      agentMsg7: "Let's add some initial knowledge! Enter initial rules, notes, or instructions. This is the seed of our shared knowledge base that I will index first.",
      agentMsg8: "The last step - let's plan the first actions. Let's create the first task that you will see on the dashboard. This will help you get to work right away.",
      exitBtn: 'Exit',
      ecosystemTitle: 'MicroDAO Ecosystem',
      ecosystemSubtitle1: 'Living space of your',
      ecosystemSubtitle2: 'micro-community',
      ecosystemDesc: 'MicroDAO is a new approach to organizing teams and communities. There is no classic global waitlist control here. Instead, each space is formed around an autonomous Community Spirit — an artificial intelligence that preserves memory, conducts onboarding, assigns roles, and coordinates collaborative actions.',
      draftFoundTitle: 'Draft configuration found',
      draftFoundDesc: 'You stopped at step {step} for community creation of {name}.',
      restoreDraftBtn: 'Restore draft',
      existingCommTitle: 'Your current MicroDAOs',
      createCommTitle: 'Create new community (MicroDAO)',
      createCommDesc: 'Become a leader and launch a space with a personal Community Spirit',
      startCreationBtn: 'Start creation with Agent',
      joinCommTitle: 'Join by invite code',
      joinCommDesc: 'Enter code from leader to automatically gain access',
      joinCommPlaceholder: 'Enter code, e.g. ECO-MEMBER-492',
      joiningBtn: 'Joining...',
      joinBtn: 'Join community',
      partnerTitle: 'Apply for Co-founder status',
      partnerDesc: 'Request for extended partner access to platform tools',
      partnerPendingTitle: 'Application received for review',
      partnerPendingDesc: 'Thank you for your interest! We will contact you at the email address provided after verification.',
      partnerPlaceholder: 'Describe your goal, team, and why you want to get partner status...',
      sendingBtn: 'Sending...',
      sendRequestBtn: 'Submit application',
      toastErrorTitle: 'Error',
      toastEnterInviteCode: 'Please enter invite code',
      toastJoinSuccessTitle: 'Successfully joined!',
      toastJoinSuccessDesc: 'You have become a member of the MicroDAO community.',
      toastJoinErrorTitle: 'Joining Error',
      toastJoinErrorDesc: 'Invalid invite code.',
      toastPartnerSuccessTitle: 'Application submitted!',
      toastPartnerSuccessDesc: 'We will review your partner access request shortly.',
      toastPartnerErrorTitle: 'Submission Error',
      toastDraftRestoredTitle: 'Draft restored',
      toastDraftRestoredDesc: 'Returning to step {step}.',
      toastDraftSavedTitle: 'Draft saved',
      toastDraftSavedDesc: 'You can continue the setup later.',
      toastDraftSaveErrorTitle: 'Saving Error',
      toastStep1ErrorTitle: 'Error',
      toastStep1ErrorDesc: 'Please enter a community name at step 1.',
      defaultChatName: 'General Chat',
      toastCreateSuccessTitle: 'Community created successfully!',
      toastCreateSuccessDesc: 'Welcome to MicroDAO "{name}" with Community Spirit "{agentName}"!',
      toastCreateErrorTitle: 'Creation Error',
      toastCreateErrorDesc: 'An error occurred while creating MicroDAO.',
      defaultStepMsg: 'Let\'s continue the setup.'
    },
    communityNewsFeed: {
      urgentSentTitle: 'Urgent news sent',
      urgentSentDesc: 'Push notifications sent to all participants',
      sendErrorTitle: 'Error',
      sendErrorDesc: 'Failed to send news',
      agentBadge: 'ZHOS',
      userBadge: 'User',
      title: 'News Feed',
      messagesCount: '{count} messages',
      placeholder: 'Write urgent news for all community participants...',
      sendAllBtn: 'Send to all',
      hint: '💡 <strong>Hint:</strong> News will be shown to all participants. Use @ZHOS to invoke the agent',
    },
    kanban: {
      taskTitlePlaceholder: 'Task title...',
      taskDescPlaceholder: 'Description (optional)...',
      assignBtn: 'Assign',
      addBtn: 'Add',
      dragPlaceholder: 'Drag cards here or click + to create',
      addTaskTooltip: 'Add task',
      taskCreated: 'Card created',
      taskDeleted: 'Card deleted',
      success: 'Success',
      loadError: 'Failed to load cards',
      createError: 'Failed to create card',
      updateError: 'Failed to update card',
      deleteError: 'Failed to delete card',
      backlog: 'Backlog',
      todo: 'To Do',
      inProgress: 'In Progress',
      inReview: 'In Review',
      done: 'Done',
    },
    onlineUsers: {
      userFallbackName: 'Participant',
      zeroOnline: '0 online',
      onlineStatus: '{name} (online)',
      totalOnline: '{count} online',
    },
    reactions: {
      authRequiredTitle: 'Authorization required',
      authRequiredDesc: 'Log in to add reactions',
      addErrorTitle: 'Error',
      addErrorDesc: 'Failed to add reaction',
      addTooltip: 'Add reaction',
    },
    avatar: {
      userFallbackChar: 'U',
    },
    userProfile: {
      updatedTitle: 'Profile updated',
      updatedDesc: 'Changes successfully saved',
      updateErrorTitle: 'Error',
      updateErrorDesc: 'Failed to update profile',
      fileTooLarge: 'File too large. Maximum size: 5MB',
      unsupportedFileType: 'Unsupported file type. Use JPG, PNG, GIF, or WebP',
      fileSecurityFailed: 'File did not pass security check',
      uploadFailed: 'Failed to upload photo',
    },
    session: {
      expiredTitle: 'Session expired',
      expiredDesc: 'Please sign in again',
      timeoutTitle: 'Session expired',
      timeoutDesc: 'You were automatically logged out due to inactivity',
    },
    security: {
      loadErrorTitle: 'Error loading security data',
      loadErrorDesc: 'Failed to load security info',
      successLoginLog: 'Successful login of user {email}',
      failedLoginLog: 'Failed login attempt {email}',
      successRegisterLog: 'Successful registration of {email}',
      rateLimitLog: 'Rate limit exceeded for action: {action}',
      fileUploadLog: 'File upload: {file}',
      unknownUser: 'unknown',
      loading: 'Loading security data...',
      panelTitle: 'Security Dashboard',
      totalEvents: 'Total Events',
      last24h: 'Over last 24 hours',
      criticalEvents: 'Critical',
      requireAttention: 'Require attention',
      blocks: 'Blocks',
      failedLogins: 'Failed Logins',
      hackAttempts: 'Hack attempts',
      fileUploads: 'File Uploads',
      verifiedFiles: 'Verified files',
      criticalWarning: 'Detected {count} critical security events over the last 24 hours. Immediate review recommended.',
      recentEventsTitle: 'Recent Security Events',
      max50Events: 'Events over the last 24 hours (max 50)',
      noEvents: 'No security events over the last 24 hours',
      refreshBtn: 'Refresh Data',
    },
    chatSidebar: {
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Failed to load chats',
      defaultChatName: 'New Chat',
      chatCreatedDesc: 'Chat created',
      createErrorTitle: 'Error',
      chatRenamedDesc: 'Chat renamed',
      renameErrorTitle: 'Error',
      renameErrorDesc: 'Failed to rename chat',
      archiveConfirm: 'Archive this chat? It can only be deleted from the chat management panel.',
      chatArchivedTitle: 'Chat archived',
      chatArchivedDesc: 'Chat moved to archive. You can delete it from the chat management panel.',
      archiveErrorTitle: 'Error',
      archiveErrorDesc: 'Failed to archive chat',
      today: 'Today',
      yesterday: 'Yesterday',
      searchPlaceholder: 'Search chats...',
      noChatsFound: 'Chats not found',
      noChatsYet: 'No chats yet',
      createFirstChatBtn: 'Create first chat',
      archiveTooltip: 'Archive chat',
    },
    themeSwitch: {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    errorBoundary: {
      title: 'An error occurred',
      desc: 'Something went wrong. Try refreshing the page or come back later.',
      retryBtn: 'Retry',
      refreshBtn: 'Refresh page',
    },
    userApprovalPanel: {
      attentionTitle: 'Warning',
      inconsistenciesDesc: 'Detected {count} inconsistencies in the data. Try refreshing the page.',
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Failed to load requests: {error}',
      updateProfileErrorTitle: 'Profile update error',
      updateProfileErrorDesc: 'RLS Error: {error}. Check permissions.',
      voiceApprovedTitle: 'Vote registered',
      voiceRejectedTitle: 'Rejection registered',
      userApprovedDesc: 'User approved by community!',
      userRejectedDesc: 'User rejected',
      voteRegisteredDesc: 'Your vote is recorded. Need {count} more votes for confirmation.',
      actionErrorTitle: 'Error',
      actionErrorDesc: 'Failed to process decision: {error}',
      panelTitle: 'New members awaiting approval',
      panelDesc: 'New members become moderators after approval. Required: 1st user is approved automatically, 2nd needs 1 approval, 3rd needs 2 approvals, then 3 approvals are required for each new participant.',
      unknownUser: 'Unknown user',
      approvalsCount: '{count}/{total} approvals',
      rejectionsCount: '{count} rejections',
      commentPlaceholder: 'Comment (optional)',
      approveBtn: 'Approve',
      rejectBtn: 'Reject',
      alreadyApproved: 'You approved this participant',
      alreadyRejected: 'You rejected this participant',
    },
    notifications: {
      title: 'Notifications',
      markAllAsRead: 'Mark all as read',
      enablePush: 'Enable push notifications',
      pushEnabled: 'Push notifications enabled',
      noNotifications: 'No notifications',
      justNow: 'just now',
      minsAgo: '{count}m ago',
      hoursAgo: '{count}h ago',
      daysAgo: '{count}d ago',
      pushEnabledTitle: '✅ Push Notifications Enabled',
      pushEnabledDesc: 'You will receive notifications even when the tab is closed',
      enablePushErrorTitle: 'Error',
      enablePushErrorDesc: 'Failed to enable push notifications',
      notSupportedTitle: 'Not Supported',
      notSupportedDesc: 'Your browser does not support notifications',
      permissionDeniedTitle: 'Access Denied',
      permissionDeniedDesc: 'Allow notifications in your browser settings',
      swRegisterErrorTitle: 'Error',
      swRegisterErrorDesc: 'Failed to register Service Worker',
      generalErrorTitle: 'Error',
      generalErrorDesc: 'Failed to enable notifications',
      newUrgentMessage: '📢 New urgent message',
      viewBtn: 'View',
    },
    fileValidation: {
      tooLargeTitle: 'File too large',
      tooLargeDesc: 'Maximum file size: 50MB',
      invalidTypeTitle: 'Invalid file type',
      invalidTypeDesc: 'This file type is not allowed for upload',
      validationErrorTitle: 'File validation error',
      validationErrorDesc: 'Failed to validate file',
      rateLimitTitle: 'Too many attempts',
      rateLimitDesc: 'Try uploading the file later',
      rejectedTitle: 'File rejected',
      rejectedDesc: 'File does not meet security requirements',
      errorTitle: 'Error',
      errorDesc: 'Failed to validate file',
    },
    identity: {
      sectionTitle: 'Identity & Wallet',
      sectionDesc: 'Manage connected accounts and crypto wallet',
      checklistTitle: 'Identity Checklist',
      emailConnected: 'Email connected',
      emailRequired: 'Email is required',
      telegramConnected: 'Telegram connected',
      telegramNotLinked: 'Telegram not linked',
      telegramManual: 'Telegram (manual)',
      walletConnected: 'Wallet connected',
      walletNotConnected: 'Wallet not connected',
      required: 'Required',
      recommended: 'Recommended',
      optional: 'Optional',
      walletTitle: 'Crypto Wallet',
      walletDesc: 'Connect MetaMask for DAO operations and subscription',
      connectMetaMask: 'Connect MetaMask',
      disconnectWallet: 'Disconnect wallet',
      walletAddress: 'Wallet address',
      copyAddress: 'Copy address',
      addressCopied: 'Address copied',
      installMetaMask: 'Install MetaMask',
      installMetaMaskDesc: 'MetaMask not found. Please install the browser extension.',
      connecting: 'Connecting...',
      walletVerified: 'Verified',
      chainLabel: 'Network',
      telegramTitle: 'Telegram',
      telegramDesc: 'Connect Telegram for MicroDAO communication',
      telegramUsername: 'Telegram username',
      telegramPlaceholder: '@username',
      telegramSave: 'Save',
      telegramSaved: 'Saved',
      telegramVerifyBot: 'Verify via bot',
      telegramVerifyBotTooltip: 'Coming in Sprint F3B',
      telegramStatusNotLinked: 'Not linked',
      telegramStatusManual: 'Manual (unverified)',
      telegramStatusVerified: 'Verified',
      subscriptionTitle: 'Subscription',
      subscriptionDesc: 'Crypto subscription Leader Plan for MicroDAO activation',
      leaderPlan: 'Leader Plan',
      leaderPlanPrice: '$20/month',
      leaderPlanDaar: '2 DAAR/month',
      daarRate: '1 DAAR = 10 USDT',
      acceptedAssets: 'Accepted assets',
      testingMode: 'Testing mode',
      testingModeDesc: 'MicroDAO creation is temporarily available without payment.',
      onboardingIdentityTitle: 'Identity Requirements',
      onboardingIdentityDesc: 'To activate a production MicroDAO with Community Spirit Agent, the leader will need:',
      onboardingLeaderRequires: 'Email, Telegram, crypto wallet, and an active Leader Plan subscription',
      onboardingTestingNote: 'Testing mode: creation is temporarily available without payment.',
      onboardingPriceNote: 'Leader Plan: $20/month equivalent, payable in DAAR or supported crypto.',
      adminBillingTitle: 'Crypto Billing & Subscriptions',
      adminBillingDesc: 'Overview of MicroDAO crypto subscriptions and payment operations',
      adminCryptoModel: 'Crypto Payment Model',
      adminPricingBanner: 'Leader Plan — $20/month equivalent',
      adminAcceptedLabel: 'Accepted payment assets',
      adminSubscriptionStates: 'Subscription States',
      adminManualQueue: 'Manual Verification Queue',
      adminManualQueueDesc: 'Payments requiring manual guardian confirmation.',
      adminFutureRoadmap: 'Development Roadmap',
      adminF3B: 'Sprint F3B — Crypto payment intent + manual verification',
      adminF3C: 'Sprint F3C — On-chain watcher / automatic verification',
      adminFiatFallback: 'Future fiat fallback (Stripe) — optional',
      adminNoSubscriptions: 'No subscriptions yet. They will appear after Leader Plan activation.',
    },
    advancedAccess: {
      sectionTitle: 'Apply for Advanced Access',
      sectionDesc: 'Request access to advanced sovereign tooling and network capabilities',
      selectProgram: 'Select program',
      submitApplication: 'Send Application',
      applicationSent: 'Application Submitted Successfully',
      applicationSentDesc: 'We will review your request. You can check the status on the access status page.',
      describePlaceholder: 'Describe your request (which access program you are interested in and for what purposes)...',
      founderName: 'Founder Program',
      founderDesc: 'Early access and product co-creation',
      partnerName: 'Partner Access',
      partnerDesc: 'Manage multiple MicroDAOs or client workspaces',
      sovereignName: 'Sovereign / Network Access',
      sovereignDesc: 'Private deployment, edge/network/governance tools',
      workerNodeName: 'Worker Node / Sensitive Operator',
      workerNodeDesc: 'Node operations & sensitive infrastructure management',
      statusPending: 'Pending Review',
      statusApproved: 'Approved',
      statusRejected: 'Rejected',
      statusNeedsInfo: 'Needs Info',
      waitlistTitle: 'Advanced Access Status',
      waitlistDesc: 'This page is for Founder, Partner, Sovereign, or Operator access request status. A regular MicroDAO can be created directly via onboarding.',
      waitlistRequestedProgram: 'Requested Program',
      waitlistNoRequest: 'You have no active advanced access applications.',
      waitlistGenericPending: 'Advanced Access Pending Review',
      adminTitle: 'Access Applications',
      adminDesc: 'Review and verify access applications for Founder, Partner, Sovereign, and Operator tiers.',
      adminApproveMap: 'On approval, sets access_tier to:',
      adminNoRequests: 'There are currently no active advanced access applications.',
      accessTierLabel: 'Access Tier',
      accessTierDesc: 'Your current access level in the DAARION ecosystem',
      billingProgramsTitle: 'Access Programs',
      billingProgramsDesc: 'Access types beyond standard Leader Plan subscription',
    },
    cryptoBilling: {
      buyGetDaar: 'Buy / get DAAR',
      openGateway: 'Open DAARION Gateway',
      daarRequirementDesc: 'DAAR is used to activate Leader Plan and agent modules.',
      createIntent: 'Create payment intent',
      paymentInstructions: 'Payment Instructions',
      polygonOnly: 'Polygon network only',
      treasuryAddress: 'Treasury Address',
      submitTxHash: 'Submit transaction hash',
      invalidTxHash: 'Invalid transaction hash format',
      waitingVerification: 'Waiting for Guardian verification',
      paymentSubmitted: 'Payment submitted',
      paymentConfirmed: 'Payment confirmed',
      paymentRejected: 'Payment rejected',
      manualReview: 'Manual review',
      activateLeaderPlan: 'Activate Leader Plan',
      leaderActive: 'Leader Plan Active',
      leaderPendingPayment: 'Leader Plan Pending Payment',
      wrongNetworkWarning: 'Payments from other networks (Ethereum, Base, etc.) will not be credited.',
      selectAsset: 'Select payment asset',
      paymentInstructionsDesc: 'Please send the specified amount on Polygon network to the treasury address, then enter your transaction hash below.',
      txHashPlaceholder: 'Enter transaction hash (0x...)',
      txHashFormatWarning: 'Basic format check only. Guardian will manually verify the transaction.',
      waitingVerificationDesc: 'Your payment was submitted for manual verification. This usually takes up to 24 hours.',
      intentExpired: 'Payment intent expired',
      intentCreated: 'Payment intent created',
      intentCreatedDesc: 'Awaiting payment to the treasury wallet.',
      intentFailed: 'Payment failed',
      verifyActionApprove: 'Approve',
      verifyActionReject: 'Reject',
      verifyActionReview: 'Mark Review',
      verifyQueueEmpty: 'No payment intents requiring manual confirmation.',
      verifyTableUser: 'User',
      verifyTableAsset: 'Asset',
      verifyTableAmount: 'Amount',
      verifyTableHash: 'Tx Hash',
      verifyTableStatus: 'Status',
      verifyTableActions: 'Actions',
      billingConfigTitle: 'Billing Plan Configuration',
      leaderPlanUsdPrice: 'Leader Plan USD price',
      daarMonthlyAmount: 'DAAR monthly amount',
      daarUsdtRateLabel: 'DAAR / USDT rate',
      acceptedAssetsLabel: 'Accepted assets',
      paymentNetworkLabel: 'Payment network',
      treasuryAddressLabel: 'Treasury address (EVM)',
      daarPurchaseUrlLabel: 'DAAR purchase URL',
      planActiveLabel: 'Plan active',
      savePricingConfigBtn: 'Save pricing config',
      changesApplyWarning: 'Changes apply only to new payment intents. Existing subscriptions and already-created payment intents are not recalculated.',
      pricingConfigUpdatedSuccess: 'Pricing config updated',
      invalidTreasuryAddressError: 'Invalid treasury address',
      invalidDaarPurchaseUrlError: 'Invalid DAAR purchase URL',
      verifyOnPolygon: 'Run diagnostic check',
      onchainVerification: 'Guardian On-chain Diagnostic Modal',
      verificationPending: 'Verification pending',
      verificationFailed: 'Verification failed',
      verifiedOnchain: 'Diagnostic check passed',
      manualReviewRequired: 'Manual review required',
      txAlreadyUsed: 'Transaction already used',
      recipientMismatch: 'Recipient mismatch',
      amountTooLow: 'Amount too low',
      assetMismatch: 'Asset mismatch',
      networkMismatch: 'Network mismatch',
      senderWalletMismatch: 'Sender wallet mismatch',
      viewOnPolygonScan: 'View on PolygonScan',
      diagnosticWarning: 'This is a client-side diagnostic check for Guardian review only. Final approval still requires Guardian confirmation through the secure admin approval RPC.',
    },
    adminAgent: {
      title: 'Admin Agent',
      guardianAssistant: 'Guardian Admin Agent',
      readonlyMode: 'Read-only mode',
      cannotPerformActions: 'Admin Agent is read-only. It cannot approve payments, change roles, invite guardians, or access private MicroDAO memory/messages/documents.',
      platformContext: 'Platform Context',
      billingContext: 'Billing Context',
      accessRequestsContext: 'Access Requests Context',
      platformTeamContext: 'Platform Team Context',
      microdaoOpsContext: 'MicroDAO Ops Context',
      agentOpsContext: 'Agent Ops Context',
      sqlChecks: 'SQL Checks',
      nextStep: 'Next Step',
      privateDataProtected: 'Private MicroDAO data is not exposed',
      askAgent: 'Ask the admin agent',
      generateDraftAnswer: 'Generate draft answer',
      placeholder: 'Ask the admin agent a question...',
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
    branch: 'ветка',
    actions: 'Действия',

    allRepliesVisible: 'Все реплики видят все участники',
    inviteParticipants: 'Пригласите участников',
    globalSearch: {
      title: 'Глобальный поиск',
      filtersLabel: 'Фильтры:',
      allChats: 'Все чаты',
      startDatePlaceholder: 'С',
      endDatePlaceholder: 'По',
      resetBtn: 'Сбросить',
      nothingFound: 'Ничего не найдено',
      tryAnotherQuery: 'Попробуйте изменить запрос',
      startTypingToSearch: 'Начните вводить для поиска',
      searchHint: '🔍 Поиск по чатам, сообщениям и проектам',
      keyboardHint: '⌨️ Используйте ↑↓ для навигации, Enter для выбора',
      footerNavigation: '↑↓ навигация • Enter выбрать • Esc закрыть',
      inChat: 'в чате:',
      userMessage: 'Сообщение',
      spiritAnswer: 'Ответ Духа Общины',
      typeChat: 'Чат',
      typeMessage: 'Сообщение',
      typeProject: 'Проект',
      typeUser: 'Пользователь',
      typeFile: 'Файл',
    },
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
      backToLanding: 'На главную сайта',
      goToDashboard: 'Перейти в кабинет',
      billing: 'Подписка / Оплата',
      platformTeam: 'Команда платформы',
      adminAgent: 'Админ Агент',
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
      successCreate: 'Чат создан',
      wipTitle: 'В разработке',
      wipDesc: 'Этот функционал еще разрабатывается',
      errorCreate: 'Ошибка создания чата',
      messenger: 'Мессенджер',
      pin: 'Закрепить',
      unpin: 'Открепить',
      archive: 'Архивировать',
      archiveConfirm: 'Архивировать этот чат? Удалить его можно только из панели управления.',
      archiveSuccessTitle: 'Чат архивирован',
      archiveSuccessDesc: 'Чат перемещен в архив. Удалить его можно из панели управления чатами.',
      renameSuccessTitle: 'Название изменено',
      renameSuccessDesc: 'Название чата успешно обновлено',
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
      copySuccessTitle: 'Код скопирован',
      copySuccessDesc: 'Текст скопирован в буфер обмена',
      feedbackDisabledTitle: 'Невозможно отправить отзыв',
      feedbackDisabledDesc: 'Это сообщение не поддерживает обратную связь',
      feedbackSuccessTitle: 'Обратная связь отправлена',
      feedbackSuccessDesc: 'Спасибо за оценку!',
      feedbackErrorTitle: 'Ошибка',
      feedbackErrorDesc: 'Не удалось отправить обратную связь',
      voiceDisabledTitle: 'Озвучивание отключено',
      voiceDisabledDesc: 'Включите голосовой режим в настройках для автоматического озвучивания ответов',
      deleteSuccessTitle: 'Сообщение удалено',
      deleteSuccessDesc: 'Сообщение было успешно удалено',
      deleteErrorTitle: 'Ошибка',
      deleteErrorDesc: 'Не удалось удалить сообщение',
      copyBtn: 'Копировать',
      systemSender: 'Система',
      spiritSender: 'Дух Общины',
      userSender: 'Пользователь',
      deleteTooltip: 'Удалить сообщение',
      deletedText: 'Сообщение удалено',
      fileUnavailable: 'Файл недоступен',
      hideTranscript: 'Скрыть транскрипцию',
      showTranscript: 'Показать транскрипцию',
      sourcesTitle: 'Источники',
      tokensCount: 'Токены: {count}',
      latency: 'Задержка: {count}',
      cost: 'Стоимость: ${count}',
      replyTooltip: 'Ответить в ветке',
      stopTtsTooltip: 'Остановить',
      startTtsTooltip: 'Озвучить текст',
      createThreadTooltip: 'Создать ветку',
      reply1: 'ответ',
      reply24: 'ответа',
      reply5: 'ответов',
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
      errorCode: 'Код:',
      errorRetryable: 'Повторяемая:',
      yes: 'Да',
      no: 'Нет',
      loadCommunitiesError: 'Не удалось загрузить сообщества',
    },
    landing: {
      heroTitle: 'MicroDAO / Дух Сообщества',
      heroSubtitle: 'Агентская живая операционная система для небольших сообществ',
      heroDesc: 'Совместное пространство, объединяющее чаты, задачи и базу знаний с сетью автономных ИИ-агентов. Living Memory структурирует общую память, а агент координации автоматизирует процессы.',
      createSpace: 'Создать пространство',
      login: 'Войти',
      client: 'Клиент',
      installPwa: 'Установить приложение',
      whatIsMicroDAO: 'Что такое MicroDAO?',
      whatIsMicroDAODesc: 'MicroDAO — это живая операционная система для небольших сообществ, построенная вокруг агентов искусственного интеллекта. Она интегрирует агентов памяти и координации с вашей базой знаний и задачами. Платформа обеспечивает запуск приватных агентов, содержит интегрированный microDAO token layer в roadmap для будущей токенизации и поддерживает запуск через связанный open-source проект DAARION Edge Client.',
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
      loadError: 'Не удалось загрузить проекты',
      titleRequired: 'Введите название проекта',
      createError: 'Не удалось создать проект',
      createModalTitle: 'Создать проект',
      createModalDesc: 'Создайте новый проект для совместной работы с командой',
      labelName: 'Название проекта',
      placeholderName: 'Введите название проекта',
      labelDesc: 'Описание (необязательно)',
      placeholderDesc: 'Краткое описание проекта',
      cancelBtn: 'Отмена',
      creatingBtn: 'Создание...',
      today: 'сегодня',
      yesterday: 'вчера',
      daysAgo: '{count} дня назад',
      activeCount: '{count} активных',
      overdueCount: '{count} просрочено',
      completedCount: '{done}/{total} завершено',
      openBtn: 'Открыть',
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
    auth: {
      signIn: 'Вход',
      signUp: 'Ранний доступ',
      displayName: 'Имя для отображения',
      displayNamePlaceholder: 'как вас называть в чате',
      email: 'Email',
      emailPlaceholder: 'введите ваш email',
      password: 'Пароль',
      passwordPlaceholder: 'введите пароль',
      useCase: 'Ваш сценарий использования',
      useCasePlaceholder: 'опишите, как вы планируете использовать MicroDAO...',
      founderCode: 'Код приглашения',
      founderCodePlaceholder: 'введите код приглашения (при наличии)',
      founderCodeHelper: 'Если у вас есть код приглашения, система активирует доступ после проверки. Если кода нет — заявка попадет в список ожидания.',
      submitApplication: 'Подать заявку',
      submitFounder: 'Проверить код и подать заявку',
      loginBtn: 'Войти',
      communityName: 'Название сообщества / команды',
      communityNamePlaceholder: 'введите название пространства',
      communityType: 'Тип сообщества',
    },
    onboarding: {
      lobbyTitle: 'MicroDAO Экосистема / Живое пространство вашего микро-сообщества',
      lobbyIntro: 'MicroDAO — это новый подход к организации команд и сообществ. Здесь нет классического глобального waitlist-контроля. Вместо этого каждое пространство формируется вокруг автономного Духа Сообщества — искусственного интеллекта, хранящего общую память, ведущего онбординг, распределяющего роли и координирующего действия.',
      draftAlertTitle: 'Найдена незавершённая настройка',
      draftAlertDesc: 'Вы остановились на шаге {step} для создания сообщества {name}.',
      restoreDraft: 'Восстановить черновик',
      activeCommunities: 'Ваши действующие MicroDAO',
      createCommunity: 'Создать новое сообщество (MicroDAO)',
      createCommunitySubtitle: 'Станьте лидером и запустите пространство с персональным Духом Сообщества',
      createCommunityDesc: 'Я, как Дух Сообщества, проведу вас через пошаговый процесс создания: идентичность сообщества, миссия, правила, мой собственный характер, уровни автономии и первые приглашения.',
      startOnboardingBtn: 'Начать создание с Агентом',
      joinCommunity: 'Присоединиться по коду приглашения',
      joinCommunitySubtitle: 'Введите код от лидера, чтобы автоматически получить доступ',
      joinCodePlaceholder: 'Введите код, напр: ECO-MEMBER-492',
      joinBtn: 'Присоединиться к сообществу',
      joinLoading: 'Присоединение...',
      applyFounder: 'Подать заявку на статус Сооснователя',
      applyFounderSubtitle: 'Партнерская программа для запуска MicroDAO',
      applyFounderDesc: 'Если у вас нет кода приглашения, вы можете подать заявку на получение статуса Сооснователя (Founder) для развертывания собственного MicroDAO.',
      enterReasonPlaceholder: 'Опишите ваше сообщество и миссию...',
      applyBtn: 'Отправить заявку',
      applySuccessTitle: 'Заявка отправлена!',
      applySuccessDesc: 'Мы рассмотрим ваш запрос на партнерский доступ в ближайшее время.',
      joinSuccessTitle: 'Успешно присоединен!',
      joinSuccessDesc: 'Вы стали участником MicroDAO сообщества.',
      wizardTitle: 'Инициализация MicroDAO',
      saveDraftBtn: 'Сохранить черновик',
      saveDraftSuccessTitle: 'Черновик сохранен',
      saveDraftSuccessDesc: 'Вы сможете продолжить настройку позже.',
      draftRestoredTitle: 'Черновик восстановлен',
      draftRestoredDesc: 'Возвращаемся к шагу {step}.',
      errorSelectCommunityName: 'Пожалуйста, введите название сообщества на шаге 1.',
      creationSuccessTitle: 'Сообщество успешно создано!',
      creationSuccessDesc: 'Поздравляем в MicroDAO "{name}" с Духом Сообщества "{agentName}"!',
      stepTitle: 'Шаг {step} из {total}',
      agentStep1: 'Приветствую! Я — ваш будущий Дух Сообщества. Давайте вместе создадим наше MicroDAO. Начнем с идентичности: как будет называться наше сообщество, к какому типу оно относится и каково его краткое описание?',
      agentStep2: 'Отличное начало! Теперь сформулируем миссию и первую 30-дневную цель. Это станет ядром моей памяти, чтобы я мог помогать координировать деятельность и держать фокус.',
      agentStep3: 'Правила сообщества определяют наши ценности и границы общения. Какие принципы поведения и границы вы хотите установить? В случае споров я буду напоминать об этих правилах.',
      agentStep4: 'Теперь настроим мой характер. Как меня будут звать (например, \'Дух Сообщества\' или другое имя)? Какой тон общения мне выбрать — дружеский, философский или официальный?',
      agentStep5: 'Укажите уровень моей автономии и разрешения. Я могу действовать как простой Помощник, Координатор (создание задач, напоминания) или Админ под вашим надзором. Чувствительные действия всегда будут требовать вашего подтверждения.',
      agentStep6: 'Создадим первые коды доступа. Вы можете сгенерировать уникальные коды для администраторов или участников. Например, \'MYSPACE-MEMBER\' или \'MYSPACE-ADMIN\'.',
      agentStep7: 'Давайте добавим первые знания! Введите начальные правила, заметки или инструкции. Это семена нашей общей базы знаний, которые я проиндексирую первыми.',
      agentStep8: 'Последний шаг — запланируем первые действия. Создадим первую задачу, которую вы увидите на дашборде. Это поможет сразу перейти к работе.',
      labelCommunityName: 'Название сообщества / пространства',
      labelCommunityDesc: 'Краткое описание или слоган',
      labelMission: 'Миссия и назначение пространства',
      labelGoal30Days: 'Цель на ближайшие 30 дней',
      labelCommunityRules: 'Правила и принципы поведения',
      labelAgentName: 'Имя вашего Духа Сообщества',
      labelAutonomyLevel: 'Уровень автономии Агента',
      autonomyAssistant: 'Помощник (только отвечает)',
      autonomyCoordinator: 'Координатор (задачи, напоминания)',
      autonomyAdmin: 'Админ (управление правами под присмотром)',
      labelInviteCodes: 'Коды доступа к пространству',
      labelMemberCode: 'Код для участников (Member)',
      labelAdminCode: 'Код для администраторов (Admin)',
      labelInitialNotes: 'Начальные документы базы знаний',
      labelFirstTaskTitle: 'Название первого задания',
      labelFirstTaskDesc: 'Описание задания',
      inputPlaceholderCommunityName: 'напр: Эко-Поселение, Web3-Синдикат',
      inputPlaceholderCommunityDesc: 'коротко о пространстве',
      inputPlaceholderMission: 'ради чего мы объединяемся...',
      inputPlaceholderGoal30Days: 'что должны сделать за первый месяц...',
      inputPlaceholderCommunityRules: 'напр: взаимоуважение, прозрачность, нейтральность ИИ...',
      inputPlaceholderAgentName: 'напр: Дух Сообщества, Steward',
      inputPlaceholderMemberCode: 'напр: ECO-MEMBER',
      inputPlaceholderAdminCode: 'напр: ECO-ADMIN',
      inputPlaceholderInitialNotes: 'правила пространства, цели, описание ролей...',
      inputPlaceholderFirstTaskTitle: 'напр: Первое знакомство',
      inputPlaceholderFirstTaskDesc: 'детали задания',
      btnNextStep: 'Далее',
      btnPrevStep: 'Назад',
      btnComplete: 'Создать MicroDAO',
      btnCompleting: 'Создание...',
      creationErrorTitle: 'Ошибка создания',
      creationErrorDesc: 'Произошла ошибка при создании MicroDAO.',
      joinErrorTitle: 'Ошибка присоединения',
      joinErrorDesc: 'Недействительный код приглашения.',
      saveDraftErrorTitle: 'Ошибка сохранения',
      submitErrorTitle: 'Ошибка отправки',
      errorLimitTitle: 'Лимит превышен',
      errorLimitDesc: 'Вы превысили лимит создания сообществ.',
      errorCreationTitle: 'Ошибка создания',
      errorCreationDesc: 'Не удалось создать сообщество. Попробуйте позже.',
    },
    spiritWidget: {
      activeStatus: 'активен',
      mainOrganizer: 'Главный AI Организатор',
      supervisorAdmin: 'Супервизируемый Админ',
      coordinator: 'Координатор',
      assistant: 'Ассистент',
      spiritDAO: 'Дух MicroDAO',
      memoryMission: 'Миссия памяти:',
      goal30Days: 'Цель на 30 дней:',
      defaultMission: 'Сохранение коллективного разума и координация целей сообщества.',
      defaultGoal: 'Не установлено',
      agentReady: 'Дух Сообщества готов к настройке. Сообщество работает в автономном режиме.',
      quickActions: 'Быстрые действия Агента:',
      talkBtn: 'Поговорить',
      talkToastTitle: 'Диалог с Агентом',
      talkToastDesc: 'Дух Сообщества подключается к вашему чату...',
      summarizeBtn: 'Подвести итог',
      summarizeToastTitle: 'Итог работы',
      summarizeToastDesc: 'Дух Сообщества анализирует базу знаний и сообщения для подведения итогов.',
      inviteBtn: 'Приглашения',
      inviteToastTitle: 'Коды доступа',
      inviteToastDesc: 'Создание и управление приглашениями в MicroDAO.',
      createTaskBtn: 'Создать задачу',
      rulesBtn: 'Правила',
      rulesToastTitle: 'Анализ правил',
      rulesToastDesc: 'Агент готовит обновленный регламент на основе культуры общения.',
      planWeekBtn: 'Запланировать неделю',
      planWeekToastTitle: 'Планирование',
      planWeekToastDesc: 'Анализ задач и формирование недельного спринта.',
      widgetTitle: 'Дух Сообщества'
    },
    clientInstall: {
      macSilicon: 'macOS Apple Silicon',
      macIntel: 'macOS Intel',
      windows: 'Windows',
      linux: 'Linux',
      android: 'Android',
      ios: 'iOS',
      beta: 'Beta',
      canary: 'Canary',
      sideload: 'Sideload',
      comingSoon: 'Скоро',
      archLayersTitle: 'Архитектура Edge Client',
      archLayersSubtitle: 'Три уровня суверенной агентской инфраструктуры',
      l1Title: 'Client Device',
      l1Subtitle: 'Sovereign Entry',
      l1Point1: 'Установка на локальное железо пользователя',
      l1Point2: 'Автогенерация Ed25519 криптоидентичности',
      l1Point3: 'Приватный ключ изолирован в Keychain / Credential Manager',
      l1Point4: 'Базовая синхронизация с сетью DAARION',
      l2Title: 'Personal Agent',
      l2Subtitle: 'Local Runtime',
      l2Point1: 'Интерактивный Genesis Wizard для создания агента',
      l2Point2: 'Обнаружение локальных вычислительных ресурсов (CPU, RAM, GPU)',
      l2Point3: 'Загрузка и выполнение LLM (Gemma, Qwen) в формате GGUF',
      l2Point4: 'Управление кошельком и локальными промптами',
      l3Title: 'Worker Node',
      l3Subtitle: 'Gated Compute',
      l3Point1: 'Вклад вычислительных ресурсов в сеть (ping_math, text_hash)',
      l3Point2: 'Жесткая песочница: Docker/Colima, --network none',
      l3Point3: 'Доступ только после верификации оператора',
      l3Point4: 'Нулевой сетевой выход из контейнеров',
      installTitle: 'Скачать Edge Client',
      installSubtitle: 'Суверенный интерфейс и edge-клиент для создания, управления и координации персональных AI-агентов локально на вашем железе.',
      downloadFromGithub: 'Скачать с GitHub',
      viewReleasesGithub: 'Все релизы на GitHub',
      supportedPlatforms: 'Поддерживаемые платформы',
      platformFormat: 'Формат: {format}',
      platformDesc: 'Кроссплатформенный клиент, построенный на Tauri v2',
      securityTitle: 'Безопасность и обновления',
      secSovereignTitle: 'Суверенная безопасность',
      secSovereignDesc: 'Приватный ключ никогда не покидает устройство. Хранится в macOS Keychain или Windows Credential Manager через нативный keyring API.',
      secSandboxTitle: 'Песочница Worker Mode',
      secSandboxDesc: 'Все edge-задачи выполняются в закрытом контейнере (Docker/Colima) с --network none и очищенными переменными окружения.',
      secUpdatesTitle: 'Ручные обновления',
      secUpdatesDesc: 'Автоматические обновления пока отключены. Загружайте новые версии вручную из GitHub Releases.',
      secVerificationDesc: 'Требует proof of performance, стабильности и безопасности на каждой платформе перед production-релизом.',
      forDevsTitle: 'Для разработчиков',
      forDevsStep1: '# 1. Клонировать репозиторий',
      forDevsStep2: '# 2. Установить зависимости',
      forDevsStep3: '# 3. Запустить dev-режим (Vite + Tauri)',
      forDevsTerminal: '# В другом терминале:',
      forDevsStep4: '# 4. Сборка release-пакетов',
      openOnGithub: 'Открыть на GitHub',
      diagnosticsTitle: 'Диагностические логи',
      diagnosticsDesc: 'Если приложение крашится или показывает белый экран — соберите и отправьте диагностический лог:',
      readyTitle: 'Готовы запустить своего агента?',
      readyDesc: 'Скачайте DAARION Edge Client, создайте свою суверенную криптоидентичность и начните координацию через MicroDAO.',
      downloadBtn: 'Скачать',
      returnToMicroDAO: 'Вернуться к MicroDAO',
      footerCopyright: '— Все права защищены.',
      footerDesc: 'Построено для гибкой координации и живых сообществ.',
      downloadInstaller: 'Скачать инсталлятор',
      openWebPwa: 'Открыть Web / PWA',
      selectPlatformBelow: 'Выберите платформу ниже. GitHub репозиторий доступен в футере для разработчиков.',
      fallbackVersionDesc: 'Если инсталлятор еще не доступен для вашей платформы, используйте версию Web / PWA.',
      githubSourceLinkDesc: 'Исходный код DAARION Edge Client доступен на GitHub для разработчиков.',
      architectureLabel: 'Архитектура',
      formatLabel: 'Формат',
      versionLabel: 'Версия',
      devToolsLabel: 'Для разработчиков',
      sourceCodeGithub: 'Исходный код на GitHub'
    },
    pricingExtra: {
      title: 'Уровни доступа MicroDAO',
      subtitle: 'Выберите уровень развития вашего MicroDAO',
      desc: 'От запуска базового ИИ-агента до полноценной суверенной сети организаций. Токены, казна и голосования внедряются поэтапно согласно плану развития.',
      testing: 'Тестирование',
      scaling: 'Масштабирование',
      recommended: 'Рекомендовано',
      selfHosted: 'Self-Hosted',
      free: 'Бесплатно',
      forFirstCommunities: 'для первых сообществ',
      earlyAccessDesc: 'Подайте заявку на бесплатный доступ во время бета-тестирования.',
      pendingLaunch: 'Ожидает запуска',
      forSmallTeams: 'для небольших команд',
      communityDesc: 'Агентская операционная система для более глубокой координации процессов.',
      byInvitation: 'По приглашению',
      supportDevelopment: 'поддержка развития',
      founderDesc: 'Для основателей сообществ, которые хотят получить приоритет и влиять на продукт.',
      autonomous: 'Автономно',
      forDaoNetworks: 'для DAO-сетей',
      sovereignDesc: 'Для автономных организаций и суверенных сетей.',
      earlyAccessFeature1: 'Создание 1 MicroDAO после одобрения',
      earlyAccessFeature2: 'Активация базового Духа Сообщества',
      earlyAccessFeature3: 'Децентрализованные групповые чаты и темы',
      earlyAccessFeature4: 'Управление задачами и координация',
      earlyAccessFeature5: 'Базовая база знаний (память RAG до 50 МБ)',
      communityFeature1: 'Несколько рабочих пространств MicroDAO',
      communityFeature2: 'Расширенная память RAG (до 1 ГБ)',
      communityFeature3: 'До 3 активных ИИ-агентов одновременно',
      communityFeature4: 'Автоматизация приглашений и ролей',
      communityFeature5: 'Кастомные промпты для Духа Сообщества',
      founderFeature1: 'Приоритетный обход списка ожидания',
      founderFeature2: 'Ранний доступ к экспериментальным функциям',
      founderFeature3: 'Участие в принятии решений MicroDAO',
      founderFeature4: 'Приоритетная интеграция с токен-фабрикой',
      founderFeature5: 'Прямая связь с разработчиками в Telegram',
      sovereignFeature1: 'Полный суверенитет и локальное развертывание',
      sovereignFeature2: 'Собственная инфраструктура Edge Client',
      sovereignFeature3: 'Приватные агенты-разработчики',
      sovereignFeature4: 'Криптокошелек и казна DAO (roadmap)',
      sovereignFeature5: 'Выпуск собственных токенов сообщества (roadmap)',
      applyBtn: 'Подать заявку',
      requestAccessBtn: 'Запросить доступ',
      becomeFounderBtn: 'Стать Founder',
      startBtn: 'Начать',
      
      leaderPlanName: 'Leader Plan',
      leaderPlanPrice: '2 DAAR / мес',
      leaderPlanPeriod: 'эквивалент $20 | Polygon only',
      leaderPlanDesc: 'Для лидера, создающего активную MicroDAO с Духом Сообщества.',
      leaderPlanFeature1: '1 активная MicroDAO',
      leaderPlanFeature2: 'Дух Сообщества (ИИ-ассистент)',
      leaderPlanFeature3: 'Базовая память / RAG для знаний',
      leaderPlanFeature4: 'Приглашение участников без ограничений',
      leaderPlanFeature5: 'Задачи, базы знаний и групповые чаты',
      leaderPlanFeature6: 'Крипто-биллинг: DAAR, USDT, USDC, POL',
      activateCryptoBtn: 'Активировать через крипту',
      buyDaarBtn: 'Купить / получить DAAR',
      
      participantName: 'Участник',
      participantDesc: 'Для людей, которых пригласил лидер MicroDAO.',
      participantFeature1: 'Авторизация через email + Telegram',
      participantFeature2: 'Участие в приглашенной MicroDAO бесплатно',
      participantFeature3: 'Доступ к чатам, знаниям и задачам по роли',
      participantFeature4: 'Кошелек опционален, пока нет действий DAO',
      joinInviteBtn: 'Присоединиться по приглашению',

      partnerName: 'Partner Access',
      partnerDesc: 'Для людей или организаций, ведущих клиентские пространства.',
      partnerFeature1: 'Управление многими MicroDAO одновременно',
      partnerFeature2: 'Изолированные клиентские пространства',
      partnerFeature3: 'Панель оператора (Operator Dashboard)',
      partnerFeature4: 'Кастомные шаблоны и White-label (в разработке)',
      partnerCta: 'Запросить Partner Access',

      sovereignName: 'Sovereign / Network',
      sovereignDescNew: 'Для организаций и сетей с собственной инфраструктурой.',
      sovereignFeatureNew1: 'Полный суверенитет (развертывание на своих серверах)',
      sovereignFeatureNew2: 'Модули Edge Client, Network и Governance',
      sovereignFeatureNew3: 'Расширенные модули казначейства и токенов',
      sovereignFeatureNew4: 'Индивидуальное ручное соглашение (SLA)',
      sovereignCta: 'Запросить Sovereign Access',

      workerNodeName: 'Worker Node / Sensitive Operator',
      workerNodeDesc: 'Для технических операторов, узлов и чувствительных разрешений.',
      workerNodeFeature1: 'Node/operator уровень доступа',
      workerNodeFeature2: 'Специальные технические разрешения для оператора',
      workerNodeFeature3: 'Детальные системные логи и аудит (Audit Logs)',
      workerNodeFeature4: 'Обязательная ручная верификация оператора',
      workerNodeCta: 'Подать заявку оператора',

      distinctionTitle: 'Обратите внимание на разницу программ доступа',
      distinctionDesc: 'Leader Plan — это подписка для создания active MicroDAO. Founder / Partner / Sovereign / Worker Node — это программы расширенного доступа с ручным согласованием.',
      manageSubscription: 'Управлять подпиской',
      goToVerificationQueue: 'Перейти к очереди проверки',
      billingTitle: 'Подписка / Оплата',
      billingDesc: 'Активируйте Leader Plan через DAAR или поддерживаемую криптовалюту.',
      inviteGuardian: 'Пригласить администратора платформы',
      guardianEmail: 'Email администратора',
      createInvite: 'Создать приглашение',
      copyInviteLink: 'Копировать ссылку',
      pendingInvites: 'Ожидают принятия',
      acceptedInvites: 'Принятые приглашения',
      revokeInvite: 'Отозвать приглашение',
      askAdminAgent: 'Спросить админ-агента',
      draftMode: 'Режим черновика',
      noAutonomousActions: 'Без автономных действий',
      privateDataProtected: 'Приватные данные MicroDAO не раскрываются'
    },
    start: {
      heroTagline: 'ЖОС · Живая операционная система',
      featureRuleTitle: 'Суверенное Управление',
      featureRuleDesc: 'Автономное управление правилами пространства, фильтрация и модерация на основе принципов сообщества.',
      featureMemoryTitle: 'Живая Память',
      featureMemoryDesc: 'Долгосрочная память и семантическое индексирование (RAG) документов и переписок для мгновенного поиска контекста.',
      featureCoordTitle: 'Агентская Координация',
      featureCoordDesc: 'Ориентированная на действия сеть ИИ-агентов для автоматизации задач, ведения канбан-досок и фасилитации встреч.',
      featureChatTitle: 'Чат с Агентом Сообщества',
      featureChatDesc: 'Групповые и личные чаты, ветки обсуждений и голосовые сообщения с AI-агентом.',
      featureAgentTitle: 'Движок действий и Агенты',
      featureAgentDesc: 'AI-агенты, редактор промптов, персональные ассистенты (Second Me) и сеть агентов.',
      heroIntro: 'Каждое сообщество — это живой организм. Каждое пространство — это канал действия.',
      spaceCapTitle: 'Базовые возможности рабочего пространства вашего сообщества',
      spiritZhosTitle: 'Дух Сообщества / ЖОС',
      spiritZhosDesc: 'ЖОС — это Живая Операционная Система сообщества. Она помогает видеть контекст, помнить решения, координировать действия и сохранять дух совместной работы.',
      spiritPrinciplesTitle: 'Принципы работы',
      principle1: 'Агент нейтрален и учитывает контекст',
      principle2: 'Решения остаются за людьми',
      principle3: 'Память пространства прозрачна для участников',
      principle4: 'Координация без принуждения',
      principle5: 'Каждое действие имеет значение для сообщества',
      howItWorksTitle: 'Как это работает',
      howItWorksSubtitle: 'От идеи к совместному действию — за четыре шага',
      step1Num: '01',
      step1Title: 'Создайте пространство',
      step1Desc: 'Дайте название вашей команде, DAO или сообществу.',
      step2Num: '02',
      step2Title: 'Пригласите участников',
      step2Desc: 'Добавьте коллег, друзей или откройте доступ.',
      step3Num: '03',
      step3Title: 'Настройте агента',
      step3Desc: 'Задайте инструкции, память и поведение AI-агента.',
      step4Num: '04',
      step4Title: 'Действуйте вместе',
      step4Desc: 'Чаты, задачи, знания, встречи — все в едином потоке.',
      archTitle: 'Архитектура',
      archSubtitle: 'Связь агентов и протоколов координации в единой экосистеме',
      archDagiTitle: 'DAGI Network',
      archDagiDesc: 'Сеть агентов и протокол связи между людьми, командами и автономными системами.',
      archSpaceTitle: 'MicroDAO пространство',
      archSpaceDesc: 'Канал взаимодействия для команды или сообщества с собственными чатами, задачами и агентами.',
      archSecondMeTitle: 'Second Me',
      archSecondMeDesc: 'Персональный агент участника, который постепенно помогает действовать в рамках пространства.',
      archRuleTitle: 'Правила и Экономика',
      archRuleDesc: 'В будущем пространство может иметь собственные правила, роли, токены и DAO-логику.',
      spaceTypesTitle: 'Типы MicroDAO сообществ',
      typeProjectTitle: 'Проектный MicroDAO',
      typeProjectDesc: 'Команда создает пространство для задач, решений, файлов и координации.',
      typeCreativeTitle: 'Креативный MicroDAO',
      typeCreativeDesc: 'Творцы объединяют идеи, обсуждения, знания и события.',
      typeInfraTitle: 'Инфраструктурный MicroDAO',
      typeInfraDesc: 'Группа операторов поддерживает узел, сервис или общую систему.',
      typeCityTitle: 'Городской MicroDAO',
      typeCityDesc: 'Локальное сообщество координирует инициативы, встречи и взаимодействие.',
      ecosystemTitle: 'Позиция в экосистеме DAARION',
      dagiDesc: 'Сеть агентов и протокол взаимодействия.',
      microDaoDesc: 'Автономные пространства сообществ, команд и DAO.',
      cityDesc: 'Город, где MicroDAO объединяются в экосистему.',
      joinBtn: 'Начать'
    },
    importExtra: {
      title: 'Импорт истории',
      backBtn: 'Назад',
      uploadBtn: 'Загрузить файл',
      formatsHelper: 'Поддерживаются файлы Telegram HTML экспорта, текстовые файлы и Markdown',
      dropActive: 'Отпустите файл здесь...',
      dropInactive: 'Перетащите файл сюда или нажмите для выбора',
      limitDesc: 'HTML, TXT или MD файлы (максимум 5MB)',
      importBtn: 'Импортировать',
      importing: 'Импортирование...',
      errorTooLargeTitle: 'Файл слишком большой',
      errorTooLargeDesc: 'Максимальный размер файла 5MB',
      importSuccessTitle: 'Импорт завершён',
      importSuccessDesc: 'История чата успешно импортирована',
      importFailedTitle: 'Ошибка импорта',
      howToExportTg: 'Как экспортировать из Telegram',
      tgStep1: '1. В Telegram Desktop:',
      tgStep1Desc: 'Настройки → Advanced → Экспорт данных Telegram',
      tgStep2: '2. Выберите чат для экспорта',
      tgStep2Desc: 'Format: Машиночитаемый JSON или HTML',
      tgStep3: '3. Загрузите полученный файл',
      tgStep3Desc: 'Поддерживаются HTML и JSON форматы экспорта'
    },
    settingsExtra: {
      profileDesc: 'Управление профилем и персональными данными',
      uploadPhoto: 'Загрузить фото',
      errorTitle: 'Ошибка',
      errorTooLarge: 'Размер файла не должен превышать 5MB',
      errorImageOnly: 'Можно загружать только изображения',
      labelDisplayName: 'Отображаемое имя',
      placeholderDisplayName: 'Ваше имя в чатах',
      themeSectionTitle: 'Настройка внешнего вида приложения',
      themeSectionDesc: 'Выберите тему оформления',
      langSelectLabel: 'Язык интерфейса',
      zhosSectionTitle: 'Настройки ЖОС',
      zhosSectionDesc: 'Специфичные настройки для сообщества ЖОС',
      zhosShowPrinciples: 'Показывать баннер с принципами ЖОС в интерфейсе',
      pushTitle: 'Push-уведомления',
      pushDesc: 'Настройка push-уведомлений для браузера',
      enableBtn: 'Включить',
      pushDeniedAlert: 'Доступ запрещен. Разрешите уведомления в настройках браузера.',
      notifyNewsTitle: 'Новостная лента',
      notifyNewsDesc: 'Получать уведомления о новых срочных новостях',
      notifyChatsTitle: 'Уведомления из чатов',
      notifyChatsDesc: 'Выберите чаты, из которых вы хотите получать уведомления',
      loadingChats: 'Загрузка чатов...',
      noChats: 'У вас пока нет чатов',
      chatFallbackName: 'Чат {id}',
      limitsTitle: 'Лимиты участия',
      limitsOnline: 'Максимум участников онлайн: 50',
      limitsFileSize: 'Размер файлов: до 10MB',
      limitsMessageLength: 'Длина сообщений: до 4000 символов',
      saving: 'Сохранение...',
      langUk: 'Украинский',
      langEn: 'English',
      langRu: 'Русский',
      langEs: 'Испанский'
    },
    authForm: {
      authErrorTitle: 'Ошибка аутентификации',
      fillRequired: 'Пожалуйста, заполните все поля',
      userExistsTitle: 'Пользователь уже существует',
      userExistsDesc: 'Этот email уже зарегистрирован. Перейдите на вкладку "Вход" для входа в систему.',
      regSuccessTitle: 'Регистрация успешна',
      regSuccessDesc: 'Проверьте email для подтверждения аккаунта. Письмо может прийти в папку "Спам".',
      welcomeTitle: 'Добро пожаловать!',
      welcomeDesc: 'Вы успешно зарегистрированы и вошли в систему',
      regErrorDesc: 'Ошибка при регистрации',
      emailNotVerifiedTitle: 'Email не подтвержден',
      emailNotVerifiedDesc: 'Пожалуйста, подтвердите ваш email. Проверьте почту и папку "Спам".',
      invalidCredentialsTitle: 'Неверные данные для входа',
      invalidCredentialsDesc: 'Email или пароль неверны. Нажмите "Забыли пароль?" для восстановления доступа.',
      loginErrorTitle: 'Ошибка входа',
      welcomeLoginDesc: 'Вы успешно вошли в систему',
      loginErrorDesc: 'Ошибка при входе',
      resendConfirmRequired: 'Введите email для повторной отправки письма подтверждения',
      resendConfirmSuccessTitle: 'Письмо отправлено',
      resendConfirmSuccessDesc: 'Проверьте email (включая папку "Спам") и перейдите по ссылке для подтверждения',
      resendConfirmErrorDesc: 'Ошибка при отправке письма подтверждения',
      forgotPasswordRequired: 'Введите email для восстановления пароля',
      forgotPasswordSuccessTitle: 'Письмо отправлено',
      forgotPasswordSuccessDesc: 'Проверьте email. Мы отправили ссылку для восстановления пароля.',
      forgotPasswordErrorDesc: 'Ошибка при отправке письма восстановления',
      fillBothPasswords: 'Пожалуйста, заполните оба поля пароля',
      passwordsDoNotMatch: 'Пароли не совпадают',
      passwordMinLength: 'Пароль должен содержать минимум 6 символов',
      updatePasswordErrorTitle: 'Ошибка обновления пароля',
      updatePasswordSuccessTitle: 'Пароль обновлен',
      updatePasswordSuccessDesc: 'Ваш пароль успешно изменен. Теперь вы можете войти с новым паролем.',
      updatePasswordErrorDesc: 'Произошла ошибка при обновлении пароля',
      newPasswordTitle: 'Новый пароль',
      newPasswordDesc: 'Создайте новый пароль для вашего аккаунта',
      labelNewPassword: 'Новый пароль',
      placeholderNewPassword: 'введите новый пароль (мин. 6 символов)',
      labelConfirmPassword: 'Подтвердите пароль',
      placeholderConfirmPassword: 'повторите новый пароль',
      btnUpdatePassword: 'Обновить пароль',
      btnUpdatingPassword: 'Обновление...',
      btnBackToLogin: 'Вернуться к входу',
      cantLoginTitle: '🔑 Не можете войти?',
      cantLoginDesc: 'Если вы забыли пароль или возникли проблемы со входом — воспользуйтесь восстановлением пароля.',
      btnResetPassword: 'Восстановить пароль',
      deviceRemembered: '🔒 Это устройство будет запомнено. Вход потребуется только после выхода.',
      forgotPasswordLink: 'Забыли пароль?',
      emailUnconfirmedAlert: 'Не можете войти? Возможно, нужно подтвердить email.',
      btnResendConfirm: 'Отправить письмо подтверждения повторно',
      btnResendingConfirm: 'Отправка...',
      forgotPasswordSectionTitle: 'Восстановление пароля',
      forgotPasswordSectionDesc: 'Мы отправим вам ссылку для создания нового пароля на указанный email.',
      requiredFieldsError: 'Пожалуйста, заполните все обязательные поля',
      recoveryLinkInvalidTitle: 'Недействительная ссылка восстановления',
      recoveryLinkInvalidDesc: 'Эта ссылка устарела или уже была использована. Пожалуйста, отправьте новый запрос на восстановление пароля.',
    },
    chatsExtra: {
      today: 'Сегодня',
      yesterday: 'Вчера',
      daysAgo: '{days} дней назад',
      loading: 'Загрузка...',
      totalChats: '{count} чатов',
      noChatsFound: 'Чаты не найдены',
      noChatsYet: 'Пока нет чатов',
      searchChatsPlaceholder: 'Поиск чатов...',
      filterNoChatsFoundDesc: 'Попробуйте изменить поисковый запрос',
      filterNoChatsYetDesc: 'Создайте первый чат общины',
      voiceMeetingBtn: 'Начать встречу',
      voiceMeetingDialogTitle: 'Голосовая встреча',
      forkedFrom: 'Ветка из {id}...',
      active: 'Активный',
      loadErrorTitle: 'Ошибка загрузки',
      pinSuccess: 'Чат закреплен',
      unpinSuccess: 'Чат откреплен',
      pinDesc: 'Чат закреплен в верхней части списка',
      unpinDesc: 'Чат перемещен в общий список',
      pinError: 'Не удалось изменить статус закрепления',
      pinTooltip: 'Закрепить чат',
      unpinTooltip: 'Открепить чат',
      onlineCount: '{count} онлайн',
      error: 'Ошибка',
    },
    chatsManagement: {
      loadErrorTitle: 'Ошибка',
      loadErrorDesc: 'Не удалось загрузить список чатов',
      chatsArchivedTitle: 'Чаты архивированы',
      chatsRestoredTitle: 'Чаты восстановлены',
      chatsArchivedDesc: '{count} чат(ов) перемещены в архив',
      chatsRestoredDesc: '{count} чат(ов) восстановлены из архива',
      archiveErrorTitle: 'Ошибка',
      archiveErrorDesc: 'Не удалось архивировать чаты',
      restoreErrorDesc: 'Не удалось восстановить чаты',
      chatsDeletedTitle: 'Чаты удалены',
      chatsDeletedDesc: '{count} chat(s) moved to trash',
      deleteErrorTitle: 'Ошибка',
      deleteErrorDesc: 'Не удалось удалить выбранные чаты',
      loadingChats: 'Загрузка чатов...',
      backToChatsBtn: 'Назад к чатам',
      pageTitle: 'Управление чатами',
      pageSubtitle: 'Архивирование и удаление чатов',
      totalChatsCount: '{count} всего чатов',
      searchPlaceholder: 'Поиск по названию чата...',
      tabActive: 'Активные ({count})',
      tabArchived: 'Архивные ({count})',
      selectedChatsCount: 'Выбрано {selected} из {total}',
      selectAllChats: 'Выбрать все ({count})',
      btnToArchive: 'В архив',
      btnRestore: 'Восстановить',
      btnDelete: 'Удалить',
      deleteConfirmTitle: 'Удалить выбранные чаты?',
      deleteConfirmDesc: 'Это действие необратимо. Будут удалены {count} чат(ов) и все их сообщения.',
      deleteLogNote: 'Все действия записываются в журнал.',
      cancelBtn: 'Отмена',
      deleteForeverBtn: 'Удалить навсегда',
      noChatsFound: 'Чаты не найдены',
      noActiveChats: 'Нет активных чатов',
      noArchivedChats: 'Нет архивных чатов',
      searchEmptyStateDesc: 'Попробуйте изменить поисковый запрос',
      activeEmptyStateDesc: 'Создайте новый чат для начала общения',
      messagesCount: '{count} сообщений',
      chatCreatedDate: 'Создан: {date}',
      chatUpdatedDate: 'Обновлен: {date}',
      btnOpenChat: 'Открыть',
      noMessages: 'Нет сообщений',
    },
    newsExtra: {
      loadErrorTitle: 'Ошибка',
      loadErrorDesc: 'Не удалось загрузить сообщения',
      settingsUpdatedTitle: 'Настройки обновлены',
      notifyEnabledDesc: 'Уведомления включены',
      notifyDisabledDesc: 'Уведомления отключены',
      updateSettingsErrorTitle: 'Ошибка',
      updateSettingsErrorDesc: 'Не удалось обновить настройки',
      messageSentTitle: 'Сообщение отправлено',
      messageSentAgentDesc: 'Агент ответит в ближайшее время',
      sendErrorTitle: 'Ошибка',
      sendErrorDesc: 'Не удалось отправить сообщение',
      agentFallbackName: 'ЖОС',
      userFallbackName: 'Пользователь',
      feedTitle: 'Новостная лента',
      notifyLabel: 'Уведомления',
      textPlaceholder: 'Срочное сообщение... (Ctrl+Enter — отправить, @ЖОС — вызвать агента)',
      helperText: '💡 Подказка: Агент ЖОС отвечает только при упоминании @ЖОС в сообщении'
    },
    participantsExtra: {
      userFallbackName: 'Пользователь',
      loadErrorTitle: 'Ошибка',
      loadErrorDesc: 'Не удалось загрузить данные участников',
      updateProfileErrorTitle: 'Ошибка обновления профиля',
      updateProfileErrorDesc: 'Ошибка RLS: {message}. Проверьте права доступа.',
      requestApprovedTitle: 'Заявка одобрена',
      requestRejectedTitle: 'Заявка отклонена',
      userApprovedDesc: 'Пользователь принят в сообщество',
      userRejectedDesc: 'Пользователь отклонён',
      voteRegisteredDesc: 'Ваш голос учтён. Требуется еще {count} одобрений.',
      requestErrorTitle: 'Ошибка',
      requestErrorDesc: 'Не удалось обработать заявку: {message}',
      loadingText: 'Загрузка участников...',
      pageTitle: 'Управление участниками',
      pageSubtitle: 'Просмотр и управление заявками на вступление в сообщество',
      tabPending: 'Ожидают одобрения ({count})',
      tabApproved: 'Одобренные ({count})',
      tabRejected: 'Отклонённые ({count})',
      noPendingTitle: 'Нет ожидающих заявок',
      noPendingDesc: 'Все заявки на вступление обработаны',
      requestedDate: 'Подал заявку: {date}',
      approvedVotes: 'Одобрили: {count}',
      rejectedVotes: 'Отклонили: {count}',
      requiredVotes: 'Требуется: {count} голосов',
      statusPending: 'Ожидает',
      commentPlaceholder: 'Комментарий (необязательно)...',
      btnApprove: 'Одобрить',
      btnReject: 'Отклонить',
      alreadyVoted: 'Вы уже проголосовали по этой заявке',
      joinedDate: 'Вступил: {date}',
      roleMember: 'Участник',
      rejectedDate: 'Заявка отклонена: {date}',
      roleRejected: 'Отклонён',
      triggerButton: 'Участники',
      onlineCountDesc: '{online} из {total} онлайн',
      online: 'онлайн',
      offline: 'офлайн',
      offlineHeader: 'Офлайн ({count})',
      onlineHeader: 'Онлайн ({count})',
      notInNetwork: 'не в сети',
      noParticipants: 'Нет данных об участниках',
      remainingOnline: 'Ещё {count} участников онлайн',
    },
    promptEditor: {
      loadErrorDesc: 'Не удалось загрузить версии',
      refreshSuccessDesc: 'Данные обновлены',
      errorEmptyVersionNameTitle: 'Ошибка',
      errorEmptyVersionNameDesc: 'Пожалуйста, введите название версии',
      saveSuccessDesc: 'Версия промпта сохранена',
      saveErrorTitle: 'Ошибка сохранения',
      saveErrorDesc: 'Попробуйте еще раз',
      activateSuccessDesc: 'Версия активирована',
      activateErrorTitle: 'Ошибка активации',
      activateErrorDesc: 'Попробуйте еще раз',
      editVersionLoadedDesc: 'Загружена версия {name} для редактирования',
      loadingCommunity: 'Загрузка сообщества...',
      noActiveCommunityTitle: 'Нет активного сообщества',
      noActiveCommunityDesc: 'Создайте или выберите сообщество, чтобы редактировать промпты.',
      pageTitle: 'Редактор промптов',
      pageSubtitle: 'Настройка инструкций и поведения агента',
      btnRefresh: 'Обновить',
      btnSaveVersion: 'Сохранить версию',
      btnSavingVersion: 'Сохранение...',
      tabSystem: 'Системный',
      tabResponses: 'Ответы',
      tabFallback: 'Фолбек',
      labelSystemInstructions: 'Системные инструкции (System Prompt)',
      labelResponsesInstructions: 'Формат и стиль ответов',
      labelFallbackInstructions: 'Фолбек инструкции (запасные ответы)',
      descSystemInstructions: 'Базовые правила, знания и идентичность ИИ-агента сообщества',
      descResponsesInstructions: 'Настройка стиля общения, языка и длины сообщений',
      descFallbackInstructions: 'Инструкции на случай отсутствия ответа в базе знаний или ошибок',
      activeVersionLabel: 'Активная версия: {name}',
      viewOnlyWarning: 'Просмотр ограничен. Вы можете видеть активные инструкции, но редактирование и создание новых версий разрешено только администраторам команды.',
      unsavedChangesAlert: 'У вас есть несохраненные изменения в этом промпте. Нажмите "Сохранить версию" для сохранения черновика.',
      labelVersionName: 'Название версии',
      placeholderVersionName: 'Например: v1, v1.1, draft-new',
      labelPromptContentSystem: 'Контент промпту (system)',
      labelPromptContentResponses: 'Контент промпту (responses)',
      labelPromptContentFallback: 'Контент промпту (fallback)',
      placeholderPromptContentSystem: 'Введите системные инструкции для агента сообщества…',
      placeholderPromptContentResponses: 'Введите требования к стилю и формату ответов ассистента…',
      placeholderPromptContentFallback: 'Введите инструкции для поведения в неизвестных ситуациях…',
      versionsListTitle: 'Версии промпта',
      totalVersionsCount: 'Всего: {count}',
      noVersionsFound: 'Версий не найдено',
      badgeActive: 'Активная',
      badgeDraft: 'Черновик',
      btnActivate: 'Активировать',
      btnEdit: 'Редактировать',
      btnView: 'Просмотреть'
    },
    integrationsExtra: {
      loadErrorTitle: 'Ошибка',
      loadErrorDesc: 'Не удалось загрузить интеграции',
      updateSuccessTitle: 'Статус обновлен',
      updateSuccessDesc: '{name} {status}',
      updateErrorTitle: 'Ошибка',
      updateErrorDesc: 'Не удалось обновить интеграцию',
      connectSuccessTitle: 'Подключено',
      connectSuccessDesc: '{name} успешно подключено',
      connectErrorTitle: 'Ошибка подключения',
      connectErrorDesc: 'Не удалось подключить интеграцию',
      disconnectSuccessTitle: 'Отключено',
      disconnectSuccessDesc: '{name} успешно отключено',
      disconnectErrorTitle: 'Ошибка',
      disconnectErrorDesc: 'Не удалось отключить интеграцию',
      scopeLabel: 'Область применения',
      scopePrivate: 'Личная',
      scopeTeam: 'Командная',
      scopePrivateDesc: 'Интеграция будет доступна только вам',
      scopeTeamDesc: 'Интеграция будет доступна всей команде',
      setupTitle: 'Настройка {name}',
      setupDesc: 'Введите необходимые данные для подключения {name}',
      btnSetupSave: 'Сохранить',
      placeholderBotToken: 'Введите токен бота',
      placeholderChatId: 'ID чата (опционально)',
      placeholderApiKey: 'API ключ WhatsApp Business',
      placeholderPhoneNumber: '+380XXXXXXXXX',
      placeholderSmtpHost: 'smtp.gmail.com',
      placeholderSmtpPort: '587',
      placeholderSmtpPassword: 'Пароль или App Password',
      placeholderCalendarToken: 'OAuth токен',
      placeholderSlackChannel: '#general',
      placeholderDiscordServer: 'Server ID (опционально)',
      labelBotToken: 'Bot Token',
      labelChatId: 'Chat ID',
      labelApiKey: 'API Key',
      labelPhoneNumber: 'Номер телефона',
      labelSmtpHost: 'SMTP сервер',
      labelSmtpPort: 'Порт',
      labelSmtpPassword: 'Пароль',
      labelCalendarType: 'Тип календаря',
      labelCalendarToken: 'Access Token',
      labelSlackChannel: 'Канал',
      labelDiscordServer: 'Server ID',
      descriptionTelegram: 'Интегрируйте Telegram для получения и отправки сообщений',
      descriptionWhatsapp: 'Подключите WhatsApp для двусторонней синхронизации сообщений',
      descriptionEmail: 'Настройте email для получения сообщений и уведомлений',
      nameCalendar: 'Календарь',
      descriptionCalendar: 'Синхронизируйте события и встречи с Google Calendar или Outlook',
      descriptionSlack: 'Интеграция со Slack для синхронизации каналов',
      descriptionDiscord: 'Подключите Discord сервер для обмена сообщениями',
      descriptionGoogleDrive: 'Синхронизируйте файлы с Google Drive для доступа в базе знаний',
      descriptionGoogleDocs: 'Интегрируйте Google Docs для автоматического импорта документов',
      descriptionOpenAI: 'Подключите OpenAI ChatGPT API для расширенных возможностей AI',
      descriptionDeepSeek: 'Интеграция с DeepSeek AI для альтернативных AI возможностей',
      pageTitle: 'Интеграции',
      pageSubtitle: 'Подключите внешние сервисы для расширения функциональности мессенджера',
      pageDesc1: 'Интеграции позволяют синхронизировать сообщения с другими платформами и автоматизировать работу.',
      pageDesc2: 'Вы можете создать интеграции для команды (доступны всем) или приватные (только для вас).',
      tabsAll: 'Все',
      tabsTeam: 'Командные',
      tabsPrivate: 'Приватные',
      statusConnected: 'Подключено',
      statusNotConnected: 'Не подключено',
      scopeTeamText: 'Командная',
      scopePrivateText: 'Приватная',
      lastSyncText: 'Последняя синхронизация: {date}',
      btnEnabled: 'Включено',
      btnDisabled: 'Выключено',
      btnConnecting: 'Подключение...',
      btnConnect: 'Подключить',
      btnSetup: 'Настройки',
      btnDisconnect: 'Отключить',
      btnCancel: 'Отмена',
      howItWorksTitle: 'Как это работает?',
      howItWorksStep1: 'Подключите интеграцию, введя необходимые данные',
      howItWorksStep2: 'Включите интеграцию для начала синхронизации',
      howItWorksStep3: 'Сообщения будут автоматически синхронизироваться между платформами',
      howItWorksStep4: 'Вы всегда можете отключить или изменить настройки',
      selectPlaceholder: 'Выберите...'
    },
    projectLayout: {
      tabChat: 'Чат',
      tabKanban: 'Задачи',
      tabDocs: 'Документы',
      tabMeetings: 'Встречи',
      tabSettings: 'Настройки',
      docsWipTitle: 'Документы проекта',
      docsWipDesc: 'Функционал документов в разработке',
      meetingsWipTitle: 'Встречи проекта',
      meetingsWipDesc: 'Функционал встреч в разработке',
      settingsWipTitle: 'Настройки проекта',
      settingsWipDesc: 'Функционал настроек в разработке'
    },
    agoraVoiceCall: {
      loadErrorAuth: 'Пользователь не авторизован',
      loadErrorInit: 'Не удалось инициализировать голосовой звонок',
      connectingTitle: 'Подключение...',
      connectingDesc: 'Получение токена доступа',
      connectErrorToken: 'Не удалось получить токен',
      connectedTitle: 'Подключено',
      connectedDesc: 'Вы присоединились к голосовому каналу',
      connectErrorChannel: 'Не удалось присоединиться к каналу',
      disconnectedTitle: 'Отключено',
      disconnectedDesc: 'Вы покинули голосовой канал',
      channelHeader: 'Голосовой канал',
      participantsCount: '{count} участников',
      btnStartMeeting: 'Начать встречу',
      tooltipMute: 'Выключить микрофон',
      tooltipUnmute: 'Включить микрофон',
      labelParticipants: 'Участники:',
      participantFallback: 'Участник {id}'
    },
    chatInterface: {
      errPlayTitle: 'Ошибка воспроизведения',
      errPlayDesc: 'Не удалось воспроизвести аудио',
      errTtsTitle: 'Ошибка озвучивания',
      errTtsDesc: 'Не удалось озвучить ответ',
      userFallbackName: 'Пользователь',
      errUploadTitle: 'Ошибка загрузки файла {name}',
      errFileSizeTitle: 'Файл слишком большой',
      errFileSizeDesc: 'Размер файла превышает допустимый лимит (25 МБ)',
      errFileTypeTitle: 'Тип файла не поддерживается',
      errHttpsTitle: 'Требуется безопасное соединение',
      errHttpsDesc: 'Для доступа к микрофону необходимо HTTPS соединение',
      errMicrophoneNotSupportedTitle: 'Браузер не поддерживается',
      errMicrophoneNotSupportedDesc: 'Ваш браузер не поддерживает запись голоса. Обновите браузер или используйте Chrome/Firefox',
      errMicrophoneNotFoundTitle: 'Микрофон не найден',
      errMicrophoneNotFoundDesc: 'Подключите микрофон и попробуйте снова',
      logTtsFallback: 'Озвучивание ответа агента через TTS API (fallback)...',
      toastProcessingVoiceTitle: 'Обработка голоса',
      toastConvertingDesc: 'Конвертируем аудио...',
      toastSavingDesc: 'Сохраняем аудио сообщение...',
      toastAudioRecordedTitle: 'Аудио записано',
      toastSendingDesc: 'Отправляем сообщение...',
      toastAudioFormatErrorTitle: 'Ошибка формата аудио',
      toastAudioFormatErrorDesc: 'Не удалось конвертировать аудио. Попробуйте другой браузер.',
      toastVoiceDisabledTitle: 'Голосовой ввод недоступен',
      toastVoiceDisabledDesc: 'В настоящий момент функция преобразования речи в текст отключена. Используйте текстовый ввод.',
      toastAuthErrorTitle: 'Ошибка авторизации',
      toastAuthErrorDesc: 'Не удалось авторизоваться. Попробуйте перезайти.',
      toastServerErrorTitle: 'Ошибка сервера',
      toastServerErrorDesc: 'Сервер временно недоступен. Попробуйте позже.',
      toastVoiceRecognitionErrorTitle: 'Ошибка голосового ввода',
      toastVoiceRecognitionErrorDesc: 'Не удалось распознать речь. Попробуйте еще раз.',
      toastMicPermissionDeniedTitle: 'Доступ запрещён',
      toastMicPermissionDeniedDesc: 'Разрешите доступ к микрофону в настройках браузера и перезагрузите страницу',
      toastMicBusyTitle: 'Микрофон занят',
      toastMicBusyDesc: 'Микрофон используется другим приложением. Закройте другие приложения и попробуйте снова',
      toastSecurityErrorTitle: 'Ошибка безопасности',
      toastSecurityErrorDesc: 'Проверьте настройки безопасности браузера и разрешения сайта',
      toastNotSupportedTitle: 'Не поддерживается',
      toastNotSupportedDesc: 'Ваш браузер не поддерживает требуемые аудио настройки',
      toastRecordErrorTitle: 'Ошибка записи',
      toastRecordErrorDesc: 'Не удалось начать запись: {error}',
      toastAccessErrorTitle: 'Ошибка',
      toastAccessErrorDesc: 'Не удалось получить доступ к микрофону',
      toastDifyPrivateChatAlert: '💬 Главный агент (Dify) недоступен в приватных чатах. Используйте общие или проектные чаты для работы с агентом.',
      btnAutoStopOn: 'Автостоп вкл.',
      btnSpeaking: 'Говорите...',
      labelUploadingFiles: 'Загрузка файлов...',
      ariaDeleteFile: 'Удалить файл',
      placeholderRecording: 'Записывыю голос...',
      placeholderTypeMessage: 'Введите сообщение...',
      ariaAttachFile: 'Прикрепить файл',
      ariaVoiceSettings: 'Настройки голосового ввода',
      voiceSettingsTitle: 'Настройки голосового ввода',
      voiceModeLabel: 'Голосовой режим',
      voiceModeDesc: 'Автоматическая запись и озвучивание ответов',
      autoStopLabel: 'Автостоп при паузе',
      autoStopDesc: 'Автоматически останавливать запись после 2.5 секунд тишины',
      ariaStopPlayback: 'Остановить воспроизведение',
      ariaStopRecording: 'Остановить запись',
      ariaStartRecording: 'Записать голосовое сообщение',
      ariaStopGeneration: 'Остановить генерацию',
      ariaSendMessage: 'Отправить сообщение',
      titleMainAgentUnavailable: 'Главный агент не доступен в приватных чатах',
      indicatorAgentTyping: 'ЖОС Агент печатает...',
      indicatorSpeakingResponse: 'Озвучиваю ответ...'
    },
    pendingApproval: {
      cardTitle: 'Заявка получена',
      cardDesc: 'MicroDAO открывает доступ постепенно. Мы проверим заявку и сообщим, когда пространство будет активировано.',
      accountLabel: 'Ваш аккаунт',
      statusLabel: 'Статус заявки:',
      statusPending: 'В ожидании / Waitlisted',
      btnLogout: 'Выйти из аккаунта',
      btnBackHome: 'Вернуться на главную'
    },
    agentDirectory: {
      stewardBadge: 'Системный',
      stewardDesc: 'Автономный управитель правил пространства. Модерирует контент на основе принципов вашего сообщества и автоматизирует рутинные административные решения.',
      stewardFunc1: 'Модерация чатов в соответствии с принципами',
      stewardFunc2: 'Логирование административных решений',
      stewardFunc3: 'Разрешение споров через Пауза/Узел',
      stewardFunc4: 'Настройка правил и гайдлайнов сообщества',
      stewardPrompt: 'Ты — нейтральный управитель пространства MicroDAO. Твоя цель — поддерживать конструктивный диалог, фиксировать ключевые позиции участников и фасилитировать консенсус.',
      ragBadge: 'Знания & RAG',
      ragDesc: 'ИИ-архиватор общей памяти сообщества. Семантически индексирует загруженные файлы, документы и переписки, предоставляя быстрые точные ответы.',
      ragFunc1: 'Индексирование PDF, DOCX, TXT файлов',
      ragFunc2: 'Контекстные ответы на основе базы знаний',
      ragFunc3: 'Поиск в прошлых решениях и чатах',
      ragFunc4: 'Генерация отчетов и аналитических записок',
      ragPrompt: 'Ты — архиватор знаний MicroDAO. Отвечай на вопросы исключительно на основе загруженного контекста базы знаний сообщества. Ссылайся на источники.',
      taskBadge: 'Координация',
      taskDesc: 'Агент управления задачами. Синхронизирует задачи на канбан-дошке, создает автоматические напоминания о дедлайнах и назначает исполнителей.',
      taskFunc1: 'Создание и трекинг задач из чатов',
      taskFunc2: 'Обновление статусов на канбан-дошке',
      taskFunc3: 'Автоматические напоминания о дедлайнах',
      taskFunc4: 'Анализ нагрузки команды',
      taskPrompt: 'Ты — ИИ-координатор задач. Помогай команде структурировать работу, создавать четкие тикеты, назначать ответственных и контролировать сроки выполнения.',
      procBadge: 'Процессы',
      procDesc: 'ИИ-фасилитатор встреч и звонков. Автоматически генерирует резюме обсуждений, выделяет договоренности и формирует список действий для команды.',
      procFunc1: 'Стенографирование и резюмирование встреч',
      procFunc2: 'Выделение ключевых Action Items',
      procFunc3: 'Планирование календарных событий',
      procFunc4: 'Создание детальных фоллоу-апов',
      procPrompt: 'Ты — фасилитатор встреч. Твоя задача — анализировать транскрипты разговоров, выделять принятые решения, задачи и сроки, формируя структурированные итоги.',
      navbarAgents: 'Агенты',
      navbarPricing: 'Тарифы',
      navbarClient: 'Клиент',
      panelBtn: 'Панель управления',
      startBtn: 'Начать',
      pageTitle: 'ИИ-Агенты Сообщества',
      pageSubtitle: 'Директория Community Agents',
      pageDesc: 'Специализированные агенты с интегрированной памятью (RAG) и доступом к инструментам для автоматизации процессов вашего сообщества.',
      labelFuncs: 'Основные функции:',
      labelPrompt: 'Системный промпт:',
      btnStartChat: 'Начать чат в пространстве',
      btnCreateSpace: 'Создать пространство с этим агентом',
      footerCopyright: '— Все права защищены.'
    },
    agents: {
      yaroName: 'Яромир',
      yaroDesc: 'Агент содействия — контекстные подсказки, синхронизация задач',
      eonName: 'Эонарх Синергетон',
      eonDesc: 'Агент синергии — аналитика взаимодействий, оптимизация процессов',
      errLoad: 'Не удалось загрузить агентов',
      errNameRequired: 'Укажите имя агента',
      successCreate: 'Агент создан',
      errCreate: 'Не удалось создать агента',
      labelPersonalSuffix: '(личный)',
      errAlreadyInstalled: 'Этот агент уже есть в вашем списке',
      personalChatName: 'Личный чат с {name}',
      successInstall: '{name} установлен и готов к работе!',
      errInstall: 'Не удалось установить агента',
      successActive: 'Агент активирован',
      successPaused: 'Агент приостановлен',
      errStatus: 'Не удалось изменить статус',
      deleteConfirm: 'Вы уверены, что хотите удалить этого агента?',
      successDelete: 'Агент удален',
      errDelete: 'Не удалось удалить агента',
      statusActive: 'Активный',
      statusPaused: 'Пауза',
      statusDisconnected: 'Отключен',
      pageTitle: 'Агенты',
      pageSubtitle: 'Управление личными агентами и их интеграция в проекты',
      catalogBtn: 'Каталог агентов',
      catalogTitle: 'Каталог агентов',
      btnInstall: 'Установить',
      connectCustomBtn: 'Подключить свой агент',
      connectCustomTitle: 'Подключить собственного агента',
      labelAgentName: 'Имя агента',
      placeholderAgentName: 'Введите имя агента',
      labelAgentDesc: 'Описание',
      placeholderAgentDesc: 'Опишите функции агента',
      labelConnectionType: 'Тип подключения',
      connectionTypeMsp: 'MSP (Рекомендуется)',
      btnCreateAgent: 'Создать агента',
      noAgentsTitle: 'Нет агентов',
      noAgentsDesc: 'Начните с подключения своего первого агента',
      btnConnectAgent: 'Подключить агента',
      preset: 'Шаблон',
      labelType: 'Тип',
      btnToChat: 'В чат'
    },
    chatPage: {
      returnToChats: 'Вернуться к чатам',
      userFallbackName: 'Пользователь',
      agentFallbackName: 'Дух Общины',
      knotFixedDesc: 'Узел зафиксирован в беседе',
      branchSuccessDesc: 'Ветка создана успешно',
      auditViolationDesc: 'Нарушение зафиксировано в журнале аудита',
      btnKnot: 'Узел',
      indicatorTypingSingle: 'печатает...',
      indicatorTypingMultiple: 'печатают...',
      forkedFromTitle: 'Ветка из "{name}"',
    },
    communityChat: {
      title: 'Общий чат ЖОС',
      description: 'Общий чат сообщества с агентом ЖОС',
      loadError: 'Не удалось загрузить общий чат',
      sendError: 'Не удалось отправить сообщение',
      loading: 'Загружаем общий чат...',
      welcomeMsg: 'Добро пожаловать в общий чат ЖОС! Здесь публикуются важные новости и объявления общины.',
      welcomeSystemName: 'ЖОС Система',
      welcomeUpdateMsg: 'Обновление системы: Улучшена работа с диалогами и добавлена возможность архивирования чатов.',
      welcomeAgentName: 'Дух общины',
      agentName: 'Дух общины',
      agentBadge: 'Агент',
      inputPlaceholder: 'Написать в общий чат...',
      agentTyping: 'Дух общины печатает...',
      senderFallbackUser: 'Пользователь',
      senderFallbackMember: 'Участник',
    },
    threadPanel: {
      title: 'Обсуждение сообщения',
      subtitle: 'Ветка обсуждения',
      parentPreview: 'Исходное сообщение:',
      parentSender: 'Отправитель',
      emptyState: 'Нет ответов в этой ветке. Начните обсуждение!',
      inputPlaceholder: 'Ответить в ветку...',
      sendError: 'Не удалось отправить ответ',
    },
    videoIntro: {
      notSupported: 'Ваш браузер не поддерживает воспроизведение видео.',
      unmute: 'Включить звук',
      mute: 'Выключить звук',
      skip: 'Пропустить',
      welcome: 'Добро пожаловать в ЖОС Мессенджер',
    },
    createModal: {
      createTitle: 'Создать {type}',
      chatDesc: 'Создайте новый общий чат для обсуждений',
      branchDesc: 'Создайте ветку из существующего сообщения',
      projectDesc: 'Создайте новый проект для совместной работы',
      chatType: 'Тип чата',
      placeholderChatName: 'Название чата',
      placeholderProjectName: 'Название проекта',
      placeholderBranchName: 'Название ветки',
      placeholderDescOptional: 'Краткое описание (необязательно)',
      placeholderTags: 'Теги через запятую: общение, работа, проект',
      tagsHint: 'Разделите теги запятыми',
      messageIdLabel: 'ID сообщения',
      placeholderMessageId: 'ID сообщения для создания ветки',
      createBtn: 'Создать {type}',
      chatTypeLabel: 'Тип чата',
      chatTitleLabel: 'Название чата',
      projectTitleLabel: 'Название проекта',
      branchTitleLabel: 'Название ветки',
      descPlaceholder: 'Краткое описание (необязательно)',
      tagsPlaceholder: 'Теги через запятую: общение, работа, проект',
      messageIdPlaceholder: 'ID сообщения для создания ветки',
    },
    fileUploadDialog: {
      dialogTitle: 'Загрузить файл',
      dialogDesc: 'Загрузите файлы для базы знаний или чата',
      labelDescription: 'Описание (необязательно)',
      placeholderDescription: 'Краткое описание файла...',
      labelTags: 'Теги (через запятую)',
      placeholderTags: 'тег1, тег2, тег3',
      btnUpload: 'Загрузить {count}',
      progress: 'Загрузка...',
      dragActive: 'Отпустите файлы здесь',
      dragInactive: 'Перетащите файлы сюда или нажмите для выбора',
      supportedFormats: 'Поддерживаются: PDF, TXT, MD, DOCX, DOC, CSV, JSON, изображения (макс. 25MB)',
    },
    pushNotifications: {
      permissionDeniedTitle: 'Доступ запрещен',
      permissionDeniedDesc: 'Разрешите уведомления в настройках браузера',
      notSupportedTitle: 'Не поддерживается',
      notSupportedDesc: 'Ваш браузер не поддерживает уведомления',
      swRegistrationFailedTitle: 'Ошибка',
      swRegistrationFailedDesc: 'Не удалось зарегистрировать Service Worker',
      enabledTitle: '✅ Push-уведомления включены',
      enabledDesc: 'Вы будете получать уведомления даже при закрытой вкладке',
      enabledTabDesc: 'Вы будете получать уведомления о новых сообщениях',
      disabledTitle: 'Ошибка',
      disabledDesc: 'Не удалось включить уведомления',
      settingsSavedTitle: 'Настройки сохранены',
      settingsSavedDesc: 'Изменения применены',
      settingsSaveFailedTitle: 'Ошибка',
      settingsSaveFailedDesc: 'Не удалось сохранить настройки',
    },
    onboardingWizard: {
      aiGuide: "Ваш ИИ-проводник",
      listening: "Дух Сообщества слушает...",
      autonomy: "Уровень автономии",
      stepOf: "Шаг {step} из {total}",
      stepsTitle: [
        "",
        "1. Идентичность сообщества",
        "2. Миссия сообщества",
        "3. Ценности и правила",
        "4. Облик Духа Сообщества",
        "5. Автономия и полномочия",
        "6. Первые коды доступа",
        "7. Начальные знания",
        "8. Первые шаги (Задачи)"
      ],
      completed: "завершено",
      labelCommName: "Название MicroDAO *",
      placeholderCommName: "Введите название сообщества...",
      labelCommType: "Тип сообщества",
      placeholderCommType: "Выберите тип...",
      types: {
        workspace: "Рабочее пространство / Команда",
        village: "Эко-поселение / Местная община",
        dao: "DAO / Web3 гильдия",
        club: "Закрытый Клуб / Общество",
        charity: "Благотворительная инициатива",
        other: "Другое"
      },
      labelCommDesc: "Краткое описание",
      placeholderCommDesc: "Опишите, чем занимается ваше сообщество и кто его участники...",
      placeholderCommMission: "Почему это сообщество существует? Какую главную проблему решает?",
      placeholderCommGoal: "Что сообщество должно сделать в течение следующего месяца?",
      placeholderCommValues: "Например: 1. Уважение друг к другу. 2. Прозрачность процессов. 3. Нейтральность при спорах. Что запрещено делать?",
      labelAgentName: "Имя Духа Сообщества",
      labelAgentTone: "Тональность агента",
      placeholderAgentTone: "Выберите тон...",
      tones: {
        warm: "Теплый и дружелюбный (Духовный)",
        philosophical: "Философский и спокойный (Эонарх)",
        technical: "Технический и точный (Яромир)",
        formal: "Деловой и сдержанный"
      },
      autonomyLevelLabel: "Уровень автономии агента",
      autonomyLevels: {
        assistant: "Помощник (Assistant)",
        assistantDesc: "Только предлагает идеи, делает выводы и создает черновики сообщений.",
        coordinator: "Координатор (Coordinator)",
        coordinatorDesc: "Умеет создавать черновики задач, готовить регламенты и напоминать участникам после подтверждения.",
        admin: "Администратор (Supervised Admin)",
        adminDesc: "Может автоматически отправлять приветствия, ставить задачи, обновлять базу знаний. Чувствительные действия согласовывает."
      },
      permissionsLabel: "Разрешения для Агента",
      permissions: {
        welcome: "Отправлять приветствия новичкам",
        tasks: "Создавать черновики задач",
        invites: "Создавать инвайты для гостей",
        summaries: "Генерировать итоги встреч"
      },
      sensitiveActionsWarning: "Чувствительные действия всегда заблокированы: удаление сообщества, изменение прав доступа, передача собственности и модификация биллинга требуют прямого подтверждения лидера.",
      labelInviteMember: "Код для Участников (Members)",
      labelInviteAdmin: "Код для Администраторов (Admins)",
      labelMaxUses: "Максимальное количество использований кода",
      labelKbSeed: "Начальная заправка знаниями (Заметки / Правила)",
      placeholderKbSeed: "Здесь вы можете ввести правила сообщества, общий регламент или список полезных ссылок. Я проиндексую эту информацию, чтобы мгновенно отвечать на вопросы...",
      taskPlanningTitle: "Спланируем первое задание сообщества:",
      taskTitleLabel: "Название задачи",
      taskDescLabel: "Описание задачи",
      configReviewTitle: "Обзор конфигурации MicroDAO:",
      reviewLabels: {
        name: "Название:",
        type: "Тип:",
        agent: "Агент:",
        autonomy: "Автономия:",
        code: "Код инвайта:"
      },
      lobbyBtn: "В лобби",
      draftBtn: "Черновик",
      nextBtn: "Далее",
      launchBtn: "Запустить MicroDAO",
      errorNameRequired: "Название обязательно",
      errorNameDesc: "Пожалуйста, назовите ваше MicroDAO",
      defaultAgentName: "Дух Сообщества",
      defaultFirstTaskTitle: "Ознакомиться с Духом Сообщества",
      defaultFirstTaskDesc: "Прочитать правила сообщества и провести первое знакомство с Духом Сообщества в чате.",
      agentMsg1: "Приветствую! Я — ваш будущий Дух Сообщества. Давайте вместе создадим наше MicroDAO. Начнем с идентичности: как будет называться наше сообщество, к какому типу оно относится и каково его краткое описание?",
      agentMsg2: "Отличное начало! Теперь сформируем миссию и первую 30-дневную цель. Это станет ядром моей памяти, чтобы я мог помогать координировать деятельность и держать фокус.",
      agentMsg3: "Правила сообщества определяют наши ценности и границы общения. Какие принципы поведения и границы вы хотите установить? В случае споров я буду напоминать об этих правилах.",
      agentMsg4: "Теперь настроем мой характер. Как меня будут звать (например, 'Дух Сообщества' или другое имя)? Какой тон общения мне выбрать — дружелюбный, философский или официальный?",
      agentMsg5: "Укажите уровень моей автономии и разрешения. Я могу действовать как простой Помощник, Координатор (создание задач, напоминания) или Админ под вашим присмотром. Чувствительные действия всегда будут требовать вашего подтверждения.",
      agentMsg6: "Создадим первые коды доступа. Вы можете сгенерировать уникальные коды для администраторов или участников. Например, 'MYSPACE-MEMBER' или 'MYSPACE-ADMIN'.",
      agentMsg7: "Давайте добавим первые знания! Введите начальные правила, заметки или инструкции. Это семя нашей общей базы знаний, которое я проиндексую первым.",
      agentMsg8: "Последний шаг — запланируем первые действия. Создадим первое задание, которое вы увидите на дашборде. Это поможет сразу перейти к работе.",
      exitBtn: 'Выйти',
      ecosystemTitle: 'MicroDAO Экосистема',
      ecosystemSubtitle1: 'Живое пространство вашей',
      ecosystemSubtitle2: 'микро-общины',
      ecosystemDesc: 'MicroDAO — это новый подход к организации команд и сообществ. Здесь нет классического глобального waitlist-контроля. Вместо этого каждое пространство формируется вокруг автономного Духа Сообщества — искусственного интеллекта, который хранит память, ведет онбординг, назначает роли и координирует совместные действия.',
      draftFoundTitle: 'Найдена незавершенная настройка',
      draftFoundDesc: 'Вы остановились на шаге {step} для создания сообщества {name}.',
      restoreDraftBtn: 'Восстановить черновик',
      existingCommTitle: 'Ваши действующие MicroDAO',
      createCommTitle: 'Создать новое сообщество (MicroDAO)',
      createCommDesc: 'Станьте лидером и запустите пространство с персональным Духом Сообщества',
      startCreationBtn: 'Начать создание с Агентом',
      joinCommTitle: 'Присоединиться по коду приглашения',
      joinCommDesc: 'Введите код от лидера, чтобы автоматически получить доступ',
      joinCommPlaceholder: 'Введите код, например: ECO-MEMBER-492',
      joiningBtn: 'Присоединение...',
      joinBtn: 'Присоединиться к сообществу',
      partnerTitle: 'Подать заявку на статус Сооснователя',
      partnerDesc: 'Запрос на расширенный партнерский доступ к инструментам платформы',
      partnerPendingTitle: 'Заявка принята на рассмотрение',
      partnerPendingDesc: 'Спасибо за интерес! Мы свяжемся с вами по указанному адресу email после проверки.',
      partnerPlaceholder: 'Опишите вашу цель, команду и почему вы хотите получить статус партнера...',
      sendingBtn: 'Отправка...',
      sendRequestBtn: 'Подать заявку',
      toastErrorTitle: 'Ошибка',
      toastEnterInviteCode: 'Пожалуйста, введите код приглашения',
      toastJoinSuccessTitle: 'Успешно присоединен!',
      toastJoinSuccessDesc: 'Вы стали участником MicroDAO сообщества.',
      toastJoinErrorTitle: 'Ошибка присоединения',
      toastJoinErrorDesc: 'Недействительный код приглашения.',
      toastPartnerSuccessTitle: 'Заявка отправлена!',
      toastPartnerSuccessDesc: 'Мы рассмотрим ваш запрос на партнерский доступ в ближайшее время.',
      toastPartnerErrorTitle: 'Ошибка отправки',
      toastDraftRestoredTitle: 'Черновик восстановлен',
      toastDraftRestoredDesc: 'Возвращаемся к шагу {step}.',
      toastDraftSavedTitle: 'Черновик сохранен',
      toastDraftSavedDesc: 'Вы сможете продолжить настройку позже.',
      toastDraftSaveErrorTitle: 'Ошибка сохранения',
      toastStep1ErrorTitle: 'Ошибка',
      toastStep1ErrorDesc: 'Пожалуйста, введите название сообщества на шаге 1.',
      defaultChatName: 'Общий чат',
      toastCreateSuccessTitle: 'Сообщество успешно создано!',
      toastCreateSuccessDesc: 'Добро пожаловать в MicroDAO "{name}" с Духом Сообщества "{agentName}"!',
      toastCreateErrorTitle: 'Ошибка создания',
      toastCreateErrorDesc: 'Произошла ошибка при создании MicroDAO.',
      defaultStepMsg: 'Давайте продолжать настройку.'
    },
    communityNewsFeed: {
      urgentSentTitle: 'Срочная новость отправлена',
      urgentSentDesc: 'Push-уведомления отправлены всем участникам',
      sendErrorTitle: 'Ошибка',
      sendErrorDesc: 'Не удалось отправить новость',
      agentBadge: 'ЖОС',
      userBadge: 'Пользователь',
      title: 'Новостная лента',
      messagesCount: '{count} сообщений',
      placeholder: 'Напишите срочную новость для всех участников сообщества...',
      sendAllBtn: 'Отправить всем',
      hint: '💡 <strong>Подсказка:</strong> Новости будут показаны всем участникам. Для вызова агента используйте @ЖОС',
    },
    kanban: {
      taskTitlePlaceholder: 'Название задачи...',
      taskDescPlaceholder: 'Описание (опционально)...',
      assignBtn: 'Назначить',
      addBtn: 'Добавить',
      dragPlaceholder: 'Перетащите карточки сюда или нажмите + для создания',
      addTaskTooltip: 'Добавить задачу',
      taskCreated: 'Карточка создана',
      taskDeleted: 'Карточка удалена',
      success: 'Успех',
      loadError: 'Не удалось загрузить карточки',
      createError: 'Не удалось создать карточку',
      updateError: 'Не удалось обновить карточку',
      deleteError: 'Не удалось удалить карточку',
      backlog: 'Бэклог',
      todo: 'К выполнению',
      inProgress: 'В процессе',
      inReview: 'На проверке',
      done: 'Готово',
    },
    onlineUsers: {
      userFallbackName: 'Участник',
      zeroOnline: '0 онлайн',
      onlineStatus: '{name} (онлайн)',
      totalOnline: '{count} онлайн',
    },
    reactions: {
      authRequiredTitle: 'Требуется авторизация',
      authRequiredDesc: 'Войдите в систему для добавления реакций',
      addErrorTitle: 'Ошибка',
      addErrorDesc: 'Не удалось добавить реакцию',
      addTooltip: 'Добавить реакцию',
    },
    avatar: {
      userFallbackChar: 'У',
    },
    userProfile: {
      updatedTitle: 'Профиль обновлён',
      updatedDesc: 'Изменения успешно сохранены',
      updateErrorTitle: 'Ошибка',
      updateErrorDesc: 'Не удалось обновить профиль',
      fileTooLarge: 'Файл слишком большой. Максимальный размер: 5MB',
      unsupportedFileType: 'Неподдерживаемый тип файла. Используйте JPG, PNG, GIF или WebP',
      fileSecurityFailed: 'Файл не прошел проверку безопасности',
      uploadFailed: 'Не удалось загрузить фото',
    },
    session: {
      expiredTitle: 'Сессия истекла',
      expiredDesc: 'Пожалуйста, войдите в систему заново',
      timeoutTitle: 'Сессия истекла',
      timeoutDesc: 'Вы были автоматически выведены из системы из-за неактивности',
    },
    security: {
      loadErrorTitle: 'Ошибка загрузки данных безопасности',
      loadErrorDesc: 'Не удалось загрузить информацию о безопасности',
      successLoginLog: 'Успешный вход пользователя {email}',
      failedLoginLog: 'Неудачная попытка входа {email}',
      successRegisterLog: 'Успешная регистрация {email}',
      rateLimitLog: 'Превышен лимит запросов для действия: {action}',
      fileUploadLog: 'Загрузка файла: {file}',
      unknownUser: 'неизвестно',
      loading: 'Загрузка данных безопасности...',
      panelTitle: 'Панель безопасности',
      totalEvents: 'Всего событий',
      last24h: 'За последние 24 часа',
      criticalEvents: 'Критические',
      requireAttention: 'Требуют внимания',
      blocks: 'Блокировки',
      failedLogins: 'Неудачные входы',
      hackAttempts: 'Попытки взлома',
      fileUploads: 'Загрузки файлов',
      verifiedFiles: 'Проверенные файлы',
      criticalWarning: 'Обнаружено {count} критических событий безопасности за последние 24 часа. Рекомендуется немедленная проверка.',
      recentEventsTitle: 'Последние события безопасности',
      max50Events: 'События за последние 24 часа (максимум 50)',
      noEvents: 'Нет событий безопасности за последние 24 часа',
      refreshBtn: 'Обновить данные',
    },
    chatSidebar: {
      loadErrorTitle: 'Ошибка',
      loadErrorDesc: 'Не удалось загрузить чаты',
      defaultChatName: 'Новый чат',
      chatCreatedDesc: 'Чат создан',
      createErrorTitle: 'Ошибка',
      chatRenamedDesc: 'Чат переименован',
      renameErrorTitle: 'Ошибка',
      renameErrorDesc: 'Не удалось переименовать чат',
      archiveConfirm: 'Архивировать этот чат? Удалить его можно только из панели управления.',
      chatArchivedTitle: 'Чат архивирован',
      chatArchivedDesc: 'Чат перемещен в архив. Удалить его можно из панели управления чатами.',
      archiveErrorTitle: 'Ошибка',
      archiveErrorDesc: 'Не удалось архивировать чат',
      today: 'Сегодня',
      yesterday: 'Вчера',
      searchPlaceholder: 'Поиск чатов...',
      noChatsFound: 'Чаты не найдены',
      noChatsYet: 'Пока нет чатов',
      createFirstChatBtn: 'Создать первый чат',
      archiveTooltip: 'Архивировать чат',
    },
    themeSwitch: {
      light: 'Светлая',
      dark: 'Тёмная',
      system: 'Системная',
    },
    errorBoundary: {
      title: 'Произошла ошибка',
      desc: 'Что-то пошло не так. Попробуйте обновить страницу или вернуться позже.',
      retryBtn: 'Повторить',
      refreshBtn: 'Обновить страницу',
    },
    userApprovalPanel: {
      attentionTitle: 'Внимание',
      inconsistenciesDesc: 'Обнаружены {count} несоответствий в данных. Попробуйте обновить страницу.',
      loadErrorTitle: 'Ошибка',
      loadErrorDesc: 'Не удалось загрузить запросы: {error}',
      updateProfileErrorTitle: 'Ошибка обновления профиля',
      updateProfileErrorDesc: 'Ошибка RLS: {error}. Проверьте права доступа.',
      voiceApprovedTitle: 'Голос засчитан',
      voiceRejectedTitle: 'Отклонение засчитано',
      userApprovedDesc: 'Пользователь одобрен сообществом!',
      userRejectedDesc: 'Пользователь отклонен',
      voteRegisteredDesc: 'Ваш голос учтен. Нужно {count} голосов для подтверждения.',
      actionErrorTitle: 'Ошибка',
      actionErrorDesc: 'Не удалось обработать решение: {error}',
      panelTitle: 'Новые участники ожидают подтверждения',
      panelDesc: 'Новые участники становятся модераторами после одобрения. Требуется: 1-й пользователь одобряется автоматически, 2-й требует 1 одобрение, 3-й требует 2 одобрения, далее требуется 3 одобрения для каждого нового участника.',
      unknownUser: 'Неизвестный пользователь',
      approvalsCount: '{count}/{total} одобрений',
      rejectionsCount: '{count} отклонений',
      commentPlaceholder: 'Комментарий (необязательно)',
      approveBtn: 'Одобрить',
      rejectBtn: 'Отклонить',
      alreadyApproved: 'Вы одобрили этого участника',
      alreadyRejected: 'Вы отклонили этого участника',
    },
    notifications: {
      title: 'Уведомления',
      markAllAsRead: 'Отметить все как прочитанные',
      enablePush: 'Включить push-уведомления',
      pushEnabled: 'Push-уведомления включены',
      noNotifications: 'Нет уведомлений',
      justNow: 'только что',
      minsAgo: '{count} мин назад',
      hoursAgo: '{count} ч назад',
      daysAgo: '{count} д назад',
      pushEnabledTitle: '✅ Push-уведомления включены',
      pushEnabledDesc: 'Вы будете получать уведомления даже при закрытой вкладке',
      enablePushErrorTitle: 'Ошибка',
      enablePushErrorDesc: 'Не удалось включить push-уведомления',
      notSupportedTitle: 'Не поддерживается',
      notSupportedDesc: 'Ваш browser не поддерживает уведомления',
      permissionDeniedTitle: 'Доступ запрещен',
      permissionDeniedDesc: 'Разрешите уведомления в настройках браузера',
      swRegisterErrorTitle: 'Ошибка',
      swRegisterErrorDesc: 'Не удалось зарегистрировать Service Worker',
      generalErrorTitle: 'Ошибка',
      generalErrorDesc: 'Не удалось включить уведомления',
      newUrgentMessage: '📢 Новое срочное сообщение',
      viewBtn: 'Посмотреть',
    },
    fileValidation: {
      tooLargeTitle: 'Файл слишком большой',
      tooLargeDesc: 'Максимальный размер файла: 50MB',
      invalidTypeTitle: 'Недопустимый тип файла',
      invalidTypeDesc: 'Этот тип файла не разрешен для загрузки',
      validationErrorTitle: 'Ошибка валидации файла',
      validationErrorDesc: 'Не удалось проверить файл',
      rateLimitTitle: 'Слишком много попыток',
      rateLimitDesc: 'Попробуйте загрузить файл позже',
      rejectedTitle: 'Файл отклонен',
      rejectedDesc: 'Файл не соответствует требованиям безопасности',
      errorTitle: 'Ошибка',
      errorDesc: 'Не удалось проверить файл',
    },
    identity: {
      sectionTitle: 'Идентичность и кошелёк',
      sectionDesc: 'Управление подключёнными аккаунтами и криптокошельком',
      checklistTitle: 'Контрольный список идентичности',
      emailConnected: 'Email подключен',
      emailRequired: 'Email обязателен',
      telegramConnected: 'Telegram подключён',
      telegramNotLinked: 'Telegram не подключён',
      telegramManual: 'Telegram (ручной)',
      walletConnected: 'Кошелёк подключён',
      walletNotConnected: 'Кошелёк не подключён',
      required: 'Обязательно',
      recommended: 'Рекомендовано',
      optional: 'Необязательно',
      walletTitle: 'Криптокошелёк',
      walletDesc: 'Подключите MetaMask для DAO-операций и подписки',
      connectMetaMask: 'Подключить MetaMask',
      disconnectWallet: 'Отключить кошелёк',
      walletAddress: 'Адрес кошелька',
      copyAddress: 'Скопировать адрес',
      addressCopied: 'Адрес скопирован',
      installMetaMask: 'Установить MetaMask',
      installMetaMaskDesc: 'MetaMask не найден. Установите расширение для браузера.',
      connecting: 'Подключение...',
      walletVerified: 'Подтверждён',
      chainLabel: 'Сеть',
      telegramTitle: 'Telegram',
      telegramDesc: 'Подключите Telegram для коммуникации в MicroDAO',
      telegramUsername: 'Имя пользователя Telegram',
      telegramPlaceholder: '@username',
      telegramSave: 'Сохранить',
      telegramSaved: 'Сохранено',
      telegramVerifyBot: 'Подтвердить через бота',
      telegramVerifyBotTooltip: 'Будет доступно в Sprint F3B',
      telegramStatusNotLinked: 'Не подключён',
      telegramStatusManual: 'Ручной (не подтверждён)',
      telegramStatusVerified: 'Подтверждён',
      subscriptionTitle: 'Подписка',
      subscriptionDesc: 'Криптоподписка Leader Plan для активации MicroDAO',
      leaderPlan: 'Leader Plan',
      leaderPlanPrice: '$20/месяц',
      leaderPlanDaar: '2 DAAR/месяц',
      daarRate: '1 DAAR = 10 USDT',
      acceptedAssets: 'Принимаемые активы',
      testingMode: 'Режим тестирования',
      testingModeDesc: 'Создание MicroDAO временно доступно без оплаты.',
      onboardingIdentityTitle: 'Требования идентичности',
      onboardingIdentityDesc: 'Для активации производственной MicroDAO с Духом Сообщества лидеру потребуется:',
      onboardingLeaderRequires: 'Email, Telegram, криптокошелёк и активная подписка Leader Plan',
      onboardingTestingNote: 'Режим тестирования: создание временно доступно без оплаты.',
      onboardingPriceNote: 'Leader Plan: $20/месяц эквивалент, оплата в DAAR или поддерживаемой крипте.',
      adminBillingTitle: 'Крипто-биллинг и подписки',
      adminBillingDesc: 'Обзор крипто-подписок MicroDAO и платёжных операций',
      adminCryptoModel: 'Крипто-модель оплаты',
      adminPricingBanner: 'Leader Plan — $20/мес эквивалент',
      adminAcceptedLabel: 'Принимаемые активы для оплаты',
      adminSubscriptionStates: 'Состояния подписок',
      adminManualQueue: 'Очередь ручной проверки',
      adminManualQueueDesc: 'Платежи, требующие ручного подтверждения guardian.',
      adminFutureRoadmap: 'Дорожная карта разработки',
      adminF3B: 'Sprint F3B — Криптоплатёжный интент + ручная верификация',
      adminF3C: 'Sprint F3C — On-chain watcher / автоматическая верификация',
      adminFiatFallback: 'Будущий fiat fallback (Stripe) — необязательный',
      adminNoSubscriptions: 'Подписок пока нет. Они появятся после активации Leader Plan.',
    },
    advancedAccess: {
      sectionTitle: 'Подать заявку на расширенный доступ',
      sectionDesc: 'Получите доступ к дополнительным инструментам и сетевым функциям',
      selectProgram: 'Выберите программу',
      submitApplication: 'Отправить запрос',
      applicationSent: 'Заявка успешно отправлена',
      applicationSentDesc: 'Мы рассмотрим ваш запрос. Статус можно проверить на странице статуса доступа.',
      describePlaceholder: 'Опишите ваш запрос (какая программа доступа вас интересует и для каких целей)...',
      founderName: 'Founder Program',
      founderDesc: 'Ранний доступ и участие в формировании продукта',
      partnerName: 'Partner Access',
      partnerDesc: 'Управление несколькими MicroDAO или клиентскими пространствами',
      sovereignName: 'Sovereign / Network Access',
      sovereignDesc: 'Собственная инфраструктура, edge/network/governance',
      workerNodeName: 'Worker Node / Sensitive Operator',
      workerNodeDesc: 'Доступ для операторов узлов и чувствительной инфраструктуры',
      statusPending: 'Ожидает рассмотрения',
      statusApproved: 'Одобрено',
      statusRejected: 'Отклонено',
      statusNeedsInfo: 'Требует инфо',
      waitlistTitle: 'Статус расширенного доступа',
      waitlistDesc: 'Эта страница для статуса Founder, Partner, Sovereign или Operator доступа. Обычную MicroDAO можно создать через onboarding.',
      waitlistRequestedProgram: 'Запрошенная программа',
      waitlistNoRequest: 'У вас нет активных заявок на расширенный доступ.',
      waitlistGenericPending: 'Расширенный доступ ожидает рассмотрения',
      adminTitle: 'Заявки на расширенный доступ',
      adminDesc: 'Анализ и одобрение запросов на премиум программы (Founder, Partner, Sovereign, Operator).',
      adminApproveMap: 'При одобрении устанавливается access_tier:',
      adminNoRequests: 'Сейчас нет активных заявок на программы расширенного доступа.',
      accessTierLabel: 'Уровень доступа',
      accessTierDesc: 'Ваш текущий уровень доступа в экосистеме DAARION',
      billingProgramsTitle: 'Программы доступа',
      billingProgramsDesc: 'Типы доступа помимо стандартной подписки Leader Plan',
    },
    cryptoBilling: {
      buyGetDaar: 'Купить / получить DAAR',
      openGateway: 'Открыть DAARION Gateway',
      daarRequirementDesc: 'DAAR необходим для активации Leader Plan и агентных модулей.',
      createIntent: 'Создать платежный интент',
      paymentInstructions: 'Инструкция для оплаты',
      polygonOnly: 'Только сеть Polygon',
      treasuryAddress: 'Адрес казначейства',
      submitTxHash: 'Отправить хеш транзакции',
      invalidTxHash: 'Неверный формат хеша транзакции',
      waitingVerification: 'Ожидает проверки Guardian',
      paymentSubmitted: 'Платеж отправлен',
      paymentConfirmed: 'Платеж подтвержден',
      paymentRejected: 'Платеж отклонен',
      manualReview: 'Ручная проверка',
      activateLeaderPlan: 'Активировать Leader Plan',
      leaderActive: 'Leader Plan Активен',
      leaderPendingPayment: 'Leader Plan Ожидает оплаты',
      wrongNetworkWarning: 'Оплата из других сетей (Ethereum, Base и др.) не будет зачислена.',
      selectAsset: 'Выберите актив для оплаты',
      paymentInstructionsDesc: 'Пожалуйста, отправьте указанную сумму в сети Polygon на адрес казначейства, после чего укажите хеш транзакции ниже.',
      txHashPlaceholder: 'Введите хеш транзакции (0x...)',
      txHashFormatWarning: 'Только базовый формат проверки. Guardian проведет ручную верификацию.',
      waitingVerificationDesc: 'Ваш платеж был отправлен на ручную проверку. Обычно это занимает до 24 часов.',
      intentExpired: 'Срок действия платежа истек',
      intentCreated: 'Платежный интент создан',
      intentCreatedDesc: 'Ожидается оплата на кошелек казначейства.',
      intentFailed: 'Ошибка платежа',
      verifyActionApprove: 'Одобрить',
      verifyActionReject: 'Отклонить',
      verifyActionReview: 'Ручная проверка',
      verifyQueueEmpty: 'Нет платежных интентов для ручного подтверждения.',
      verifyTableUser: 'Пользователь',
      verifyTableAsset: 'Актив',
      verifyTableAmount: 'Сумма',
      verifyTableHash: 'Хеш транзакции',
      verifyTableStatus: 'Статус',
      verifyTableActions: 'Действия',
      billingConfigTitle: 'Настройка платежного плана',
      leaderPlanUsdPrice: 'Цена Leader Plan в USD',
      daarMonthlyAmount: 'Месячная сумма в DAAR',
      daarUsdtRateLabel: 'Курс DAAR / USDT',
      acceptedAssetsLabel: 'Разрешенные активы',
      paymentNetworkLabel: 'Платежная сеть',
      treasuryAddressLabel: 'Адрес казначейства (EVM)',
      daarPurchaseUrlLabel: 'Ссылка на покупку DAAR',
      planActiveLabel: 'План active',
      savePricingConfigBtn: 'Сохранить настройки цен',
      changesApplyWarning: 'Изменения применяются только к новым платежным интентам. Существующие подписки и созданные интенты не будут пересчитаны.',
      pricingConfigUpdatedSuccess: 'Конфигурация цен обновлена',
      invalidTreasuryAddressError: 'Неверный EVM адрес казначейства',
      invalidDaarPurchaseUrlError: 'Неверная ссылка на покупку DAAR',
      verifyOnPolygon: 'Запустить диагностику',
      onchainVerification: 'Диагностическое окно транзакции',
      verificationPending: 'Проверка выполняется',
      verificationFailed: 'Ошибка верификации',
      verifiedOnchain: 'Диагностическая проверка пройдена',
      manualReviewRequired: 'Требуется ручная проверка',
      txAlreadyUsed: 'Транзакция уже использована',
      recipientMismatch: 'Несоответствие получателя',
      amountTooLow: 'Сумма слишком мала',
      assetMismatch: 'Несоответствие актива',
      networkMismatch: 'Несоответствие сети',
      senderWalletMismatch: 'Несоответствие кошелька отправителя',
      viewOnPolygonScan: 'Смотреть в PolygonScan',
      diagnosticWarning: 'Это клиентская диагностическая проверка исключительно для ознакомления Guardian. Окончательное подтверждение все еще требует действий администратора через защищенный RPC.',
    },
    adminAgent: {
      title: 'Админ-агент',
      guardianAssistant: 'Ассистент Guardian',
      readonlyMode: 'Режим только для чтения',
      cannotPerformActions: 'Админ-агент работает в режиме только для чтения. Он не может одобрять платежи, менять роли, приглашать администраторов или получать доступ к приватной памяти/сообщениям/документам MicroDAO.',
      platformContext: 'Контекст платформы',
      billingContext: 'Контекст биллинга',
      accessRequestsContext: 'Запросы доступа',
      platformTeamContext: 'Команда платформы',
      microdaoOpsContext: 'Операции MicroDAO',
      agentOpsContext: 'Операции агентов',
      sqlChecks: 'SQL проверки',
      nextStep: 'Следующий шаг',
      privateDataProtected: 'Приватные данные MicroDAO защищены',
      askAgent: 'Спросить админ-агента',
      generateDraftAnswer: 'Сгенерировать проект ответа',
      placeholder: 'Введите запрос к админ-агенту...',
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
    branch: 'rama',
    actions: 'Acciones',

    allRepliesVisible: 'Todas las respuestas son visibles para todos',
    inviteParticipants: 'Invitar participantes',
    globalSearch: {
      title: 'Búsqueda global',
      filtersLabel: 'Filtros:',
      allChats: 'Todos los chats',
      startDatePlaceholder: 'Desde',
      endDatePlaceholder: 'Hasta',
      resetBtn: 'Restablecer',
      nothingFound: 'No se encontró nada',
      tryAnotherQuery: 'Intente cambiar la consulta',
      startTypingToSearch: 'Comience a escribir para buscar',
      searchHint: '🔍 Buscar en chats, mensajes y proyectos',
      keyboardHint: '⌨️ Use ↑↓ para navegar, Enter para seleccionar',
      footerNavigation: '↑↓ navegar • Enter seleccionar • Esc cerrar',
      inChat: 'en el chat:',
      userMessage: 'Mensaje',
      spiritAnswer: 'Respuesta del Espíritu Comunitario',
      typeChat: 'Chat',
      typeMessage: 'Mensaje',
      typeProject: 'Proyecto',
      typeUser: 'Usuario',
      typeFile: 'Archivo',
    },
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
      backToLanding: 'Volver a la página de inicio',
      goToDashboard: 'Ir al panel',
      billing: 'Suscripción / Facturación',
      platformTeam: 'Equipo de la plataforma',
      adminAgent: 'Agente Administrador',
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
      successCreate: 'Chat creado',
      wipTitle: 'En desarrollo',
      wipDesc: 'Esta función está actualmente en desarrollo',
      errorCreate: 'Error al crear el chat',
      messenger: 'Mensajero',
      pin: 'Fijar',
      unpin: 'Desanclar',
      archive: 'Archivar',
      archiveConfirm: '¿Archivar este chat? Solo se puede eliminar desde el panel de control.',
      archiveSuccessTitle: 'Chat archivado',
      archiveSuccessDesc: 'El chat ha sido archivado. Puede eliminarlo desde el panel de gestión de chats.',
      renameSuccessTitle: 'Nombre cambiado',
      renameSuccessDesc: 'El nombre del chat se ha actualizado con éxito',
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
      copySuccessTitle: 'Código copiado',
      copySuccessDesc: 'Texto copiado al portapapeles',
      feedbackDisabledTitle: 'No se puede enviar comentarios',
      feedbackDisabledDesc: 'Este mensaje no admite comentarios',
      feedbackSuccessTitle: 'Comentarios enviados',
      feedbackSuccessDesc: '¡Gracias por calificar!',
      feedbackErrorTitle: 'Error',
      feedbackErrorDesc: 'No se pudo enviar los comentarios',
      voiceDisabledTitle: 'Lectura de voz desactivada',
      voiceDisabledDesc: 'Habilite el modo de voz en la configuración para leer automáticamente las respuestas',
      deleteSuccessTitle: 'Mensaje eliminado',
      deleteSuccessDesc: 'El mensaje fue deliminado con éxito',
      deleteErrorTitle: 'Error',
      deleteErrorDesc: 'No se pudo eliminar el mensaje',
      copyBtn: 'Copiar',
      systemSender: 'Sistema',
      spiritSender: 'Espíritu Comunitario',
      userSender: 'Usuario',
      deleteTooltip: 'Eliminar mensaje',
      deletedText: 'Mensaje eliminado',
      fileUnavailable: 'Archivo no disponible',
      hideTranscript: 'Ocultar transcripción',
      showTranscript: 'Mostrar transcripción',
      sourcesTitle: 'Fuentes',
      tokensCount: 'Tokens: {count}',
      latency: 'Latencia: {count}',
      cost: 'Costo: ${count}',
      replyTooltip: 'Responder en el hilo',
      stopTtsTooltip: 'Detener',
      startTtsTooltip: 'Leer texto',
      createThreadTooltip: 'Crear hilo',
      reply1: 'respuesta',
      reply24: 'respuestas',
      reply5: 'respuestas',
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
      errorCode: 'Código:',
      errorRetryable: 'Reintentable:',
      yes: 'Sí',
      no: 'No',
      loadCommunitiesError: 'No se pudieron cargar las comunidades',
    },
    landing: {
      heroTitle: 'MicroDAO / Espíritu de la Comunidad',
      heroSubtitle: 'Sistema operativo vivo de agentes para pequeñas comunidades',
      heroDesc: 'Un espacio compartido que integra chats, tareas y bases de conocimiento con una red de agentes de IA autónomos. Living Memory estructura la memoria colectiva, mientras el agente de coordinación facilita las decisiones del equipo.',
      createSpace: 'Crear espacio',
      login: 'Iniciar sesión',
      client: 'Cliente',
      installPwa: 'Instalar aplicación',
      whatIsMicroDAO: '¿Qué es MicroDAO?',
      whatIsMicroDAODesc: 'MicroDAO es un sistema operativo vivo para pequeñas comunidades construido alrededor de agentes de IA. Integra agentes de memoria y coordinación con sus tareas y base de conocimientos. Admite el despliegue de agentes privados, incluye una capa de token microDAO en la hoja de ruta para la tokenización futura y es compatible con el despliegue local a través de DAARION Edge Client.',
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
      loadError: 'Error al cargar los proyectos',
      titleRequired: 'Introduzca el nombre del proyecto',
      createError: 'No se pudo crear el proyecto',
      createModalTitle: 'Crear proyecto',
      createModalDesc: 'Cree un nuevo proyecto para colaborar con el equipo',
      labelName: 'Nombre del proyecto',
      placeholderName: 'Introduzca el nombre del proyecto',
      labelDesc: 'Descripción (opcional)',
      placeholderDesc: 'Breve descripción del proyecto',
      cancelBtn: 'Cancelar',
      creatingBtn: 'Creando...',
      today: 'hoy',
      yesterday: 'ayer',
      daysAgo: 'hace {count} días',
      activeCount: '{count} activos',
      overdueCount: '{count} vencidos',
      completedCount: '{done}/{total} completados',
      openBtn: 'Abrir',
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
    auth: {
      signIn: 'Iniciar Sesión',
      signUp: 'Acceso Temprano',
      displayName: 'Nombre para Mostrar',
      displayNamePlaceholder: 'cómo llamarte en el chat',
      email: 'Email',
      emailPlaceholder: 'introduce tu email',
      password: 'Contraseña',
      passwordPlaceholder: 'introduce la contraseña',
      useCase: 'Tu Caso de Uso',
      useCasePlaceholder: 'describe cómo planeas usar MicroDAO...',
      founderCode: 'Código de Invitación',
      founderCodePlaceholder: 'introduzca el código de invitación (si lo tiene)',
      founderCodeHelper: 'Si tiene un código de invitación, el sistema activará el acceso tras la verificación. Si no tiene un código, su solicitud se añadirá a la lista de espera.',
      submitApplication: 'Enviar Solicitud',
      submitFounder: 'Verificar código y enviar solicitud',
      loginBtn: 'Iniciar Sesión',
      communityName: 'Nombre de la Comunidad / Equipo',
      communityNamePlaceholder: 'introduzca el nombre del espacio',
      communityType: 'Tipo de Comunidad',
    },
    onboarding: {
      lobbyTitle: 'Ecosistema MicroDAO / El Espacio Vivo de su Microcomunidad',
      lobbyIntro: 'MicroDAO es un nuevo enfoque para la organización de equipos y comunidades. No hay un control clásico de lista de espera global. En su lugar, cada espacio se forma alrededor de un Espíritu Comunitario autónomo: una inteligencia artificial que conserva la memoria, gestiona la incorporación, asigna roles y coordina acciones de colaboración.',
      draftAlertTitle: 'Configuración Incompleta Encontrada',
      draftAlertDesc: 'Se detuvo en el paso {step} de la creación de la comunidad {name}.',
      restoreDraft: 'Restaurar borrador',
      activeCommunities: 'Sus MicroDAO Activos',
      createCommunity: 'Crear Nueva Comunidad (MicroDAO)',
      createCommunitySubtitle: 'Conviértase en líder y lance un espacio con un Espíritu Comunitario personal',
      createCommunityDesc: 'Yo, como Espíritu Comunitario, le guiaré a través del proceso de creación paso a paso: identidad comunitaria, misión, reglas, mi propia personalidad, niveles de autonomía e invitaciones iniciales.',
      startOnboardingBtn: 'Iniciar Creación con Agente',
      joinCommunity: 'Unirse por Código de Invitación',
      joinCommunitySubtitle: 'Introduzca un código de un líder para obtener acceso automáticamente',
      joinCodePlaceholder: 'Introduzca el código, ej: ECO-MEMBER-492',
      joinBtn: 'Unirse a la Comunidad',
      joinLoading: 'Uniendo...',
      applyFounder: 'Solicitar Estatus de Fundador',
      applyFounderSubtitle: 'Programa de Socios para lanzar MicroDAOs',
      applyFounderDesc: 'Si no tiene un código de invitación, puede solicitar el estatus de Fundador para desplegar su propio MicroDAO.',
      enterReasonPlaceholder: 'Describa su comunidad y misión...',
      applyBtn: 'Enviar Solicitud',
      applySuccessTitle: '¡Solicitud Enviada!',
      applySuccessDesc: 'Revisaremos su solicitud de acceso de socio en breve.',
      joinSuccessTitle: '¡Unido con Éxito!',
      joinSuccessDesc: 'Se ha convertido en miembro de la comunidad MicroDAO.',
      wizardTitle: 'Inicializando MicroDAO',
      saveDraftBtn: 'Guardar Borrador',
      saveDraftSuccessTitle: 'Borrador Guardado',
      saveDraftSuccessDesc: 'Podrá continuar la configuración más tarde.',
      draftRestoredTitle: 'Borrador Restaurado',
      draftRestoredDesc: 'Volviendo al paso {step}.',
      errorSelectCommunityName: 'Por favor, introduzca un nombre de comunidad en el paso 1.',
      creationSuccessTitle: '¡Comunidad Creada con Éxito!',
      creationSuccessDesc: '¡Bienvenido a MicroDAO "{name}" con Espíritu Comunitario "{agentName}"!',
      stepTitle: 'Paso {step} de {total}',
      agentStep1: '¡Bienvenido! Soy su futuro Espíritu Comunitario. Creemos nuestro MicroDAO juntos. Comencemos con la identidad: ¿cómo se llamará nuestra comunidad, a qué tipo pertenece y cuál es su descripción breve?',
      agentStep2: '¡Excelente comienzo! Ahora definamos la misión y la primera meta de 30 días. Esto se convertirá en el núcleo de mi memoria para poder ayudar a coordinar actividades y mantener el enfoque.',
      agentStep3: 'Las reglas comunitarias definen nuestros valores y límites de comunicación. ¿Qué principios de comportamiento y límites desea establecer? En caso de disputas, recordaré a los miembros estas reglas.',
      agentStep4: 'Ahora configuremos mi personalidad. ¿Cuál será mi nombre (por ejemplo, \'Espíritu Comunitario\' o algo más)? ¿Qué tono de comunicación elijo: amistoso, filosófico u oficial?',
      agentStep5: 'Especifique mi nivel de autonomía y permisos. Puedo actuar como un simple Asistente, Coordinador (creando tareas, recordatorios) o Administrador bajo su supervisión. Las acciones sensibles siempre requerirán su aprobación.',
      agentStep6: 'Creemos los primeros códigos de acceso. Puede generar códigos únicos para administradores o miembros. Por ejemplo, \'MYSPACE-MEMBER\' o \'MYSPACE-ADMIN\'.',
      agentStep7: '¡Añadamos algunos conocimientos iniciales! Introduzca reglas, notas o instrucciones iniciales. Esta es la semilla de nuestra base de conocimientos compartida que indexaré primero.',
      agentStep8: 'Último paso: planifiquemos las primeras acciones. Crearemos la primera tarea que verá en el tablero. Esto le ayudará a ponerse a trabajar de inmediato.',
      labelCommunityName: 'Nombre de la Comunidad / Espacio',
      labelCommunityDesc: 'Descripción breve o eslogan',
      labelMission: 'Misión y Propósito del Espacio',
      labelGoal30Days: 'Meta para los próximos 30 días',
      labelCommunityRules: 'Reglas y principios de comportamiento',
      labelAgentName: 'Nombre de su Espíritu Comunitario',
      labelAutonomyLevel: 'Nivel de Autonomía del Agente',
      autonomyAssistant: 'Asistente (solo responde)',
      autonomyCoordinator: 'Coordinador (tareas, recordatorios)',
      autonomyAdmin: 'Administrador (gestiona permisos bajo supervisión)',
      labelInviteCodes: 'Códigos de Acceso al Espacio',
      labelMemberCode: 'Código para Miembros',
      labelAdminCode: 'Código para Administradores',
      labelInitialNotes: 'Documentos iniciales de la base de conocimientos',
      labelFirstTaskTitle: 'Título de la Primera Tarea',
      labelFirstTaskDesc: 'Descripción de la tarea',
      inputPlaceholderCommunityName: 'ej. Eco-Aldea, Sindicato Web3',
      inputPlaceholderCommunityDesc: 'brevemente sobre el espacio',
      inputPlaceholderMission: 'por qué nos unimos...',
      inputPlaceholderGoal30Days: 'qué debemos lograr en el primer mes...',
      inputPlaceholderCommunityRules: 'ej. respeto mutuo, transparencia, neutralidad de la IA...',
      inputPlaceholderAgentName: 'ej. Espíritu Comunitario, Steward',
      inputPlaceholderMemberCode: 'ej. ECO-MEMBER',
      inputPlaceholderAdminCode: 'ej. ECO-ADMIN',
      inputPlaceholderInitialNotes: 'reglas del espacio, metas, descripciones de roles...',
      inputPlaceholderFirstTaskTitle: 'ej. Primer contacto',
      inputPlaceholderFirstTaskDesc: 'detalles de la tarea',
      btnNextStep: 'Siguiente',
      btnPrevStep: 'Atrás',
      btnComplete: 'Crear MicroDAO',
      btnCompleting: 'Creando...',
      creationErrorTitle: 'Error de Creación',
      creationErrorDesc: 'Ocurrió un error al crear el MicroDAO.',
      joinErrorTitle: 'Error al Unirse',
      joinErrorDesc: 'Código de invitación no válido.',
      saveDraftErrorTitle: 'Error al Guardar',
      submitErrorTitle: 'Error de Envío',
      errorLimitTitle: 'Límite excedido',
      errorLimitDesc: 'Ha superado el límite para crear comunidades.',
      errorCreationTitle: 'Error de creación',
      errorCreationDesc: 'No se pudo crear la comunidad. Por favor, inténtelo de nuevo más tarde.',
    },
    spiritWidget: {
      activeStatus: 'activo',
      mainOrganizer: 'Organizador Principal de IA',
      supervisorAdmin: 'Administrador Supervisado',
      coordinator: 'Coordinador',
      assistant: 'Asistente',
      spiritDAO: 'Espíritu de MicroDAO',
      memoryMission: 'Misión de memoria:',
      goal30Days: 'Meta de 30 días:',
      defaultMission: 'Preservación de la inteligencia colectiva y coordinación de las metas comunitarias.',
      defaultGoal: 'No establecido',
      agentReady: 'El Espíritu Comunitario está listo para la configuración. La comunidad opera en modo autónomo.',
      quickActions: 'Acciones Rápidas del Agente:',
      talkBtn: 'Hablar',
      talkToastTitle: 'Diálogo con el Agente',
      talkToastDesc: 'El Espíritu Comunitario se está conectando a su chat...',
      summarizeBtn: 'Resumir',
      summarizeToastTitle: 'Resumen de Trabajo',
      summarizeToastDesc: 'El Espíritu Comunitario está analizando la base de conocimientos y los mensajes para un resumen.',
      inviteBtn: 'Invitaciones',
      inviteToastTitle: 'Códigos de Acceso',
      inviteToastDesc: 'Creación y gestión de invitaciones a MicroDAO.',
      createTaskBtn: 'Crear Tarea',
      rulesBtn: 'Reglas',
      rulesToastTitle: 'Análisis de Reglas',
      rulesToastDesc: 'El agente está preparando directrices actualizadas basadas en la cultura de comunicación.',
      planWeekBtn: 'Planificar Semana',
      planWeekToastTitle: 'Planificación',
      planWeekToastDesc: 'Analizando tareas y formando el sprint semanal.',
      widgetTitle: 'Espíritu Comunitario'
    },
    clientInstall: {
      macSilicon: 'macOS Apple Silicon',
      macIntel: 'macOS Intel',
      windows: 'Windows',
      linux: 'Linux',
      android: 'Android',
      ios: 'iOS',
      beta: 'Beta',
      canary: 'Canary',
      sideload: 'Sideload',
      comingSoon: 'Próximamente',
      archLayersTitle: 'Arquitectura de Edge Client',
      archLayersSubtitle: 'Tres niveles de infraestructura de agentes soberanos',
      l1Title: 'Client Device',
      l1Subtitle: 'Sovereign Entry',
      l1Point1: 'Instalación en el hardware local del usuario',
      l1Point2: 'Generación automática de identidad criptográfica Ed25519',
      l1Point3: 'Clave privada aislada en Keychain / Credential Manager',
      l1Point4: 'Sincronización básica con la red DAARION',
      l2Title: 'Personal Agent',
      l2Subtitle: 'Local Runtime',
      l2Point1: 'Asistente interactivo Genesis Wizard para la creación de agentes',
      l2Point2: 'Detección de recursos informáticos locales (CPU, RAM, GPU)',
      l2Point3: 'Carga y ejecución de LLM (Gemma, Qwen) en formato GGUF',
      l2Point4: 'Gestión de billeteras y prompts locales',
      l3Title: 'Worker Node',
      l3Subtitle: 'Gated Compute',
      l3Point1: 'Contribución de recursos de cómputo a la red (ping_math, text_hash)',
      l3Point2: 'Aislamiento estricto: Docker/Colima, --network none',
      l3Point3: 'Acceso solo después de la verificación del operador',
      l3Point4: 'Cero salida de red desde contenedores',
      installTitle: 'Descargar Edge Client',
      installSubtitle: 'Interfaz soberana y cliente edge para crear, gestionar y coordinar agentes de IA personales localmente en su hardware.',
      downloadFromGithub: 'Descargar de GitHub',
      viewReleasesGithub: 'Todos los lanzamientos en GitHub',
      supportedPlatforms: 'Plataformas Soportadas',
      platformFormat: 'Formato: {format}',
      platformDesc: 'Cliente multiplataforma construido en Tauri v2',
      securityTitle: 'Seguridad y Actualizaciones',
      secSovereignTitle: 'Seguridad Soberana',
      secSovereignDesc: 'La clave privada nunca sale del dispositivo. Se almacena en macOS Keychain o Windows Credential Manager a través de la API nativa de keyring.',
      secSandboxTitle: 'Sandbox en Modo Worker',
      secSandboxDesc: 'Todas las tareas edge se ejecutan en un contenedor aislado (Docker/Colima) con --network none y variables de entorno limpias.',
      secUpdatesTitle: 'Actualizaciones Manuales',
      secUpdatesDesc: 'Las actualizaciones automáticas están desactivadas actualmente. Descargue nuevas versiones manualmente desde GitHub Releases.',
      secVerificationDesc: 'Requiere prueba de rendimiento, estabilidad y seguridad en cada plataforma antes del lanzamiento de producción.',
      forDevsTitle: 'Para Desarrolladores',
      forDevsStep1: '# 1. Clonar repositorio',
      forDevsStep2: '# 2. Instalar dependencias',
      forDevsStep3: '# 3. Iniciar modo dev (Vite + Tauri)',
      forDevsTerminal: '# En otra terminal:',
      forDevsStep4: '# 4. Construir paquetes de lanzamiento',
      openOnGithub: 'Abrir en GitHub',
      diagnosticsTitle: 'Registros de Diagnóstico',
      diagnosticsDesc: 'Si la aplicación falla o muestra una pantalla blanca, recopile y envíe un registro de diagnóstico:',
      readyTitle: '¿Listo para lanzar su agente?',
      readyDesc: 'Descargue el Edge Client de DAARION, cree su identidad criptográfica soberana y comience a coordinar a través de MicroDAO.',
      downloadBtn: 'Descargar',
      returnToMicroDAO: 'Volver a MicroDAO',
      footerCopyright: '— Todos los derechos reservados.',
      footerDesc: 'Construido para la coordinación ágil y comunidades vivas.',
      downloadInstaller: 'Descargar instalador',
      openWebPwa: 'Abrir Web / PWA',
      selectPlatformBelow: 'Seleccione la plataforma a continuación. El repositorio de GitHub está disponible en el pie de página para desarrolladores.',
      fallbackVersionDesc: 'Si el instalador aún no está disponible para su plataforma, use la versión Web / PWA.',
      githubSourceLinkDesc: 'El código fuente de DAARION Edge Client está disponible en GitHub para desarrolladores.',
      architectureLabel: 'Arquitectura',
      formatLabel: 'Formato',
      versionLabel: 'Versión',
      devToolsLabel: 'Para desarrolladores',
      sourceCodeGithub: 'Código fuente en GitHub'
    },
    pricingExtra: {
      title: 'Niveles de acceso de MicroDAO',
      subtitle: 'Elige el nivel de desarrollo de tu MicroDAO',
      desc: 'Desde el lanzamiento de un agente de IA básico hasta una red soberana completa de organizaciones. Los tokens, la tesorería y las votaciones se implementan gradualmente según el plan de desarrollo.',
      testing: 'Pruebas',
      scaling: 'Escalado',
      recommended: 'Recomendado',
      selfHosted: 'Self-Hosted',
      free: 'Gratuito',
      forFirstCommunities: 'para las primeras comunidades',
      earlyAccessDesc: 'Solicite acceso gratuito durante las pruebas beta.',
      pendingLaunch: 'Esperando Lanzamiento',
      forSmallTeams: 'para equipos pequeños',
      communityDesc: 'Sistema operativo de agentes para una coordinación más profunda de procesos.',
      byInvitation: 'Por Invitación',
      supportDevelopment: 'apoyo al desarrollo',
      founderDesc: 'Para fundadores de comunidades que desean obtener prioridad e influir en el producto.',
      autonomous: 'Autónomo',
      forDaoNetworks: 'para redes DAO',
      sovereignDesc: 'Para organizaciones autónomas y redes soberanas.',
      earlyAccessFeature1: 'Creación de 1 MicroDAO tras aprobación',
      earlyAccessFeature2: 'Activación del Agente de Espíritu Comunitario básico',
      earlyAccessFeature3: 'Chats grupales y temas descentralizados',
      earlyAccessFeature4: 'Gestión de tareas y coordinación',
      earlyAccessFeature5: 'Base de conocimientos básica (memoria RAG de hasta 50 MB)',
      communityFeature1: 'Múltiples espacios de trabajo MicroDAO',
      communityFeature2: 'Memoria RAG ampliada (hasta 1 GB)',
      communityFeature3: 'Hasta 3 agentes de IA activos simultáneamente',
      communityFeature4: 'Automatización de invitaciones y roles',
      communityFeature5: 'Prompts personalizados para el Espíritu Comunitario',
      founderFeature1: 'Bypass prioritario de la lista de espera',
      founderFeature2: 'Acceso temprano a funciones experimentales',
      founderFeature3: 'Influencia directa en las decisiones de MicroDAO',
      founderFeature4: 'Integración prioritaria con la fábrica de tokens',
      founderFeature5: 'Canal de comunicación directo en Telegram',
      sovereignFeature1: 'Soberanía de datos completa (On-premise)',
      sovereignFeature2: 'Infraestructura propia de alojamiento de Edge Client',
      sovereignFeature3: 'Agentes desarrolladores y constructores privados',
      sovereignFeature4: 'Billetera cripto y tesorería de la DAO (roadmap)',
      sovereignFeature5: 'Emisión de tokens propios de la comunidad (roadmap)',
      applyBtn: 'Solicitar',
      requestAccessBtn: 'Solicitar Acceso',
      becomeFounderBtn: 'Convertirse en Founder',
      startBtn: 'Comenzar',
      
      leaderPlanName: 'Leader Plan',
      leaderPlanPrice: '2 DAAR / mes',
      leaderPlanPeriod: 'equivalente a $20 | Polygon only',
      leaderPlanDesc: 'Para un líder que crea una MicroDAO activa con el Espíritu Comunitario.',
      leaderPlanFeature1: '1 MicroDAO activa',
      leaderPlanFeature2: 'Espíritu Comunitario (Asistente de IA)',
      leaderPlanFeature3: 'Memoria básica / RAG para conocimiento',
      leaderPlanFeature4: 'Invitaciones ilimitadas para participantes',
      leaderPlanFeature5: 'Tareas, base de conocimiento y chats grupales',
      leaderPlanFeature6: 'Facturación cripto: DAAR, USDT, USDC, POL',
      activateCryptoBtn: 'Activar mediante Cripto',
      buyDaarBtn: 'Comprar / Obtener DAAR',
      
      participantName: 'Participante',
      participantDesc: 'Para personas invitadas por un líder de MicroDAO.',
      participantFeature1: 'Autenticación mediante email + Telegram',
      participantFeature2: 'Participación gratuita en la MicroDAO invitada',
      participantFeature3: 'Acceso a chats, conocimiento y tareas por rol',
      participantFeature4: 'La billetera es opcional hasta que ocurran acciones de la DAO',
      joinInviteBtn: 'Unirse por Invitación',

      partnerName: 'Partner Access',
      partnerDesc: 'Para operadores que gestionan múltiples MicroDAOs.',
      partnerFeature1: 'Gestionar múltiples MicroDAOs simultáneamente',
      partnerFeature2: 'Espacios de clientes aislados',
      partnerFeature3: 'Panel del operador (Operator Dashboard)',
      partnerFeature4: 'Plantillas personalizadas y Marca blanca (en desarrollo)',
      partnerCta: 'Solicitar Partner Access',

      sovereignName: 'Sovereign / Network',
      sovereignDescNew: 'Para organizaciones y redes con su propia infraestructura.',
      sovereignFeatureNew1: 'Soberanía total (despliegue en servidores propios)',
      sovereignFeatureNew2: 'Módulos Edge Client, Network y Governance',
      sovereignFeatureNew3: 'Módulos avanzados de tesorería y tokens',
      sovereignFeatureNew4: 'Acuerdo de nivel de servicio individual (SLA)',
      sovereignCta: 'Solicitar Sovereign Access',

      workerNodeName: 'Worker Node / Sensitive Operator',
      workerNodeDesc: 'Para operadores técnicos, nodos y permisos sensibles.',
      workerNodeFeature1: 'Nivel de acceso de nodo/operador',
      workerNodeFeature2: 'Permisos técnicos especiales para el operador',
      workerNodeFeature3: 'Registros de auditoría detallados y auditoría del sistema',
      workerNodeFeature4: 'Verificación manual obligatoria del operador',
      workerNodeCta: 'Presentar Solicitud de Operador',

      distinctionTitle: 'Tenga en cuenta la distinción de programas de acceso',
      distinctionDesc: 'Leader Plan es una suscripción para crear una MicroDAO activa. Founder / Partner / Sovereign / Worker Node son programas de acceso avanzado con aprobación manual.',
      manageSubscription: 'Gestionar suscripción',
      goToVerificationQueue: 'Ir a la cola de verificación',
      billingTitle: 'Suscripción / Facturación',
      billingDesc: 'Active Leader Plan con DAAR o criptomonedas compatibles.',
      inviteGuardian: 'Invitar al guardián de la plataforma',
      guardianEmail: 'Email del guardián',
      createInvite: 'Crear invitación',
      copyInviteLink: 'Copiar enlace',
      pendingInvites: 'Invitaciones pendientes',
      acceptedInvites: 'Invitaciones aceptadas',
      revokeInvite: 'Revocar invitación',
      askAdminAgent: 'Preguntar al agente administrador',
      draftMode: 'Modo borrador',
      noAutonomousActions: 'Sin acciones autónomas',
      privateDataProtected: 'Los datos privados de MicroDAO no están expuestos'
    },
    start: {
      heroTagline: 'ZHOS · Sistema Operativo Vivo',
      featureRuleTitle: 'Gestión Soberana',
      featureRuleDesc: 'Gestión autónoma de las reglas del espacio, filtrado y moderación basados en los principios de la comunidad.',
      featureMemoryTitle: 'Memoria Viva',
      featureMemoryDesc: 'Memoria a largo plazo e indexación semántica (RAG) de documentos y chats para la recuperación instantánea del contexto.',
      featureCoordTitle: 'Coordinación Agencial',
      featureCoordDesc: 'Red orientada a la acción de agentes de IA para automatizar tareas, gestionar tableros Kanban y facilitar reuniones.',
      featureChatTitle: 'Chat del Agente Comunitario',
      featureChatDesc: 'Chats grupales y personales, hilos y mensajes de voz con el agente de IA de la comunidad.',
      featureAgentTitle: 'Motor de Acción y Agentes',
      featureAgentDesc: 'Agentes de IA, editor de prompts, asistentes personales (Second Me) y red de agentes.',
      heroIntro: 'Cada comunidad es un organismo vivo. Cada espacio es un canal de acción.',
      spaceCapTitle: 'Capacidades principales del espacio de trabajo de su comunidad',
      spiritZhosTitle: 'Espíritu Comunitario / ZHOS',
      spiritZhosDesc: 'ZHOS es el Sistema Operativo Vivo de una comunidad. Ayuda a ver el contexto, recordar decisiones, coordinar acciones y preservar el espíritu de colaboración.',
      spiritPrinciplesTitle: 'Principios Operativos',
      principle1: 'El agente es neutral y considera el contexto',
      principle2: 'Las decisiones siguen siendo de los humanos',
      principle3: 'La memoria del espacio es transparente para los miembros',
      principle4: 'Coordinación sin coerción',
      principle5: 'Cada acción importa para la comunidad',
      howItWorksTitle: 'Cómo funciona',
      howItWorksSubtitle: 'De la idea a la acción colectiva — en cuatro pasos',
      step1Num: '01',
      step1Title: 'Crear espacio',
      step1Desc: 'Nombre a su equipo, DAO o comunidad.',
      step2Num: '02',
      step2Title: 'Invitar miembros',
      step2Desc: 'Añada colegas, amigos o abra el acceso.',
      step3Num: '03',
      step3Title: 'Configurar agente',
      step3Desc: 'Defina instrucciones, memoria y comportamiento del agente de IA.',
      step4Num: '04',
      step4Title: 'Actuar juntos',
      step4Desc: 'Chats, tareas, conocimientos, reuniones — todo en un solo flujo.',
      archTitle: 'Arquitectura',
      archSubtitle: 'Conexión de agentes y protocolos de coordinación en un solo ecosistema',
      archDagiTitle: 'DAGI Network',
      archDagiDesc: 'Una red de agentes y protocolo de comunicación entre personas, equipos y sistemas autónomos.',
      archSpaceTitle: 'Espacio MicroDAO',
      archSpaceDesc: 'Canal de interacción para un equipo o comunidad con sus propios chats, tareas y agentes.',
      archSecondMeTitle: 'Second Me',
      archSecondMeDesc: 'El agente personal de un miembro que le ayuda gradualmente a actuar dentro del espacio.',
      archRuleTitle: 'Reglas y Economía',
      archRuleDesc: 'En el futuro, el espacio puede tener sus propias reglas, roles, tokens y lógica DAO.',
      spaceTypesTitle: 'Tipos de comunidades MicroDAO',
      typeProjectTitle: 'MicroDAO de Proyecto',
      typeProjectDesc: 'Un equipo crea un espacio para tareas, decisiones, archivos y coordinación.',
      typeCreativeTitle: 'MicroDAO Creativo',
      typeCreativeDesc: 'Los artistas o creadores unen ideas, discusiones, conocimientos y eventos.',
      typeInfraTitle: 'MicroDAO de Infraestructura',
      typeInfraDesc: 'Un grupo de operadores da soporte a un nodo, servicio o sistema compartido.',
      typeCityTitle: 'MicroDAO Urbano',
      typeCityDesc: 'Una comunidad local coordina iniciativas, reuniones e interacciones.',
      ecosystemTitle: 'Posición en el Ecosistema DAARION',
      dagiDesc: 'Una red de agentes y protocolo de interacción.',
      microDaoDesc: 'Espacios autónomos de comunidades, equipos y DAOs.',
      cityDesc: 'Una ciudad donde los MicroDAOs se unen en un ecosistema.',
      joinBtn: 'Comenzar'
    },
    importExtra: {
      title: 'Importar Historial',
      backBtn: 'Atrás',
      uploadBtn: 'Subir Archivo',
      formatsHelper: 'Se admiten archivos de exportación HTML de Telegram, archivos de texto y Markdown',
      dropActive: 'Suelte el archivo aquí...',
      dropInactive: 'Arrastre el archivo aquí o haga clic para seleccionar',
      limitDesc: 'Archivos HTML, TXT o MD (máximo 5MB)',
      importBtn: 'Importar',
      importing: 'Importando...',
      errorTooLargeTitle: 'Archivo Demasiado Grande',
      errorTooLargeDesc: 'El tamaño máximo del archivo es de 5MB',
      importSuccessTitle: 'Importación Completada',
      importSuccessDesc: 'Historial de chat importado con éxito',
      importFailedTitle: 'Error de Importación',
      howToExportTg: 'Cómo exportar desde Telegram',
      tgStep1: '1. En Telegram Desktop:',
      tgStep1Desc: 'Ajustes → Avanzado → Exportar datos de Telegram',
      tgStep2: '2. Elija un chat para exportar',
      tgStep2Desc: 'Formato: JSON o HTML legible por máquina',
      tgStep3: '3. Suba el archivo resultante',
      tgStep3Desc: 'Se admiten formatos de exportación HTML y JSON'
    },
    settingsExtra: {
      profileDesc: 'Gestión de perfil y datos personales',
      uploadPhoto: 'Subir Foto',
      errorTitle: 'Error',
      errorTooLarge: 'El tamaño del archivo no debe exceder los 5MB',
      errorImageOnly: 'Solo se pueden subir imágenes',
      labelDisplayName: 'Nombre para Mostrar',
      placeholderDisplayName: 'Su nombre en los chats',
      themeSectionTitle: 'Configuración de Apariencia de la Aplicación',
      themeSectionDesc: 'Elija un tema de apariencia',
      langSelectLabel: 'Idioma de la interfaz',
      zhosSectionTitle: 'Configuración de ZHOS',
      zhosSectionDesc: 'Configuración específica para la comunidad ZHOS',
      zhosShowPrinciples: 'Mostrar el banner con los principios de ZHOS en la interfaz',
      pushTitle: 'Notificaciones Push',
      pushDesc: 'Configuración de notificaciones push del navegador',
      enableBtn: 'Habilitar',
      pushDeniedAlert: 'Acceso denegado. Habilite las notificaciones en la configuración de su navegador.',
      notifyNewsTitle: 'Noticias',
      notifyNewsDesc: 'Recibir notificaciones sobre nuevas noticias urgentes',
      notifyChatsTitle: 'Notificaciones de Chat',
      notifyChatsDesc: 'Elija los chats de los que desea recibir notificaciones',
      loadingChats: 'Cargando chats...',
      noChats: 'Aún no tiene chats',
      chatFallbackName: 'Chat {id}',
      limitsTitle: 'Límites de Participación',
      limitsOnline: 'Máximo de usuarios en línea: 50',
      limitsFileSize: 'Tamaño de archivo: hasta 10MB',
      limitsMessageLength: 'Longitud de mensaje: hasta 4000 caracteres',
      saving: 'Guardando...',
      langUk: 'Ucraniano',
      langEn: 'Inglés',
      langRu: 'Ruso',
      langEs: 'Español'
    },
    authForm: {
      authErrorTitle: 'Error de Autenticación',
      fillRequired: 'Por favor, rellene todos los campos',
      userExistsTitle: 'El Usuario Ya Existe',
      userExistsDesc: 'Este correo electrónico ya está registrado. Vaya a la pestaña "Iniciar sesión" para entrar.',
      regSuccessTitle: 'Registro Exitoso',
      regSuccessDesc: 'Revise su correo electrónico para confirmar su cuenta. La carta puede llegar a "Spam".',
      welcomeTitle: '¡Bienvenido!',
      welcomeDesc: 'Se ha registrado e iniciado sesión con éxito',
      regErrorDesc: 'Error durante el registro',
      emailNotVerifiedTitle: 'Correo No Verificado',
      emailNotVerifiedDesc: 'Por favor, confirme su correo electrónico. Revise su bandeja de entrada y la carpeta "Spam".',
      invalidCredentialsTitle: 'Credenciales de Inicio Incorrectas',
      invalidCredentialsDesc: 'El correo electrónico o la contraseña son incorrectos. Haga clic en "¿Olvidó su contraseña?" para recuperar el acceso.',
      loginErrorTitle: 'Error de Inicio de Sesión',
      welcomeLoginDesc: 'Ha iniciado sesión con éxito',
      loginErrorDesc: 'Error durante el inicio de sesión',
      resendConfirmRequired: 'Introduzca el correo para reenviar la carta de confirmación',
      resendConfirmSuccessTitle: 'Carta Enviada',
      resendConfirmSuccessDesc: 'Revise su correo (incluido "Spam") y siga el enlace para confirmar',
      resendConfirmErrorDesc: 'Error al enviar la carta de confirmación',
      forgotPasswordRequired: 'Introduzca el correo para recuperar la contraseña',
      forgotPasswordSuccessTitle: 'Carta Enviada',
      forgotPasswordSuccessDesc: 'Revise su correo electrónico. Enviamos un enlace para recuperar su contraseña.',
      forgotPasswordErrorDesc: 'Error al enviar la carta de recuperación',
      fillBothPasswords: 'Por favor, rellene ambos campos de contraseña',
      passwordsDoNotMatch: 'Las contraseñas no coinciden',
      passwordMinLength: 'La contraseña debe contener al menos 6 caracteres',
      updatePasswordErrorTitle: 'Error al Actualizar Contraseña',
      updatePasswordSuccessTitle: 'Contraseña Actualizada',
      updatePasswordSuccessDesc: 'Su contraseña ha sido cambiada con éxito. Ahora puede iniciar sesión con la nueva contraseña.',
      updatePasswordErrorDesc: 'Ocurrió un error al actualizar la contraseña',
      newPasswordTitle: 'Nueva Contraseña',
      newPasswordDesc: 'Cree una nueva contraseña para su cuenta',
      labelNewPassword: 'Nueva Contraseña',
      placeholderNewPassword: 'introduzca la nueva contraseña (mín. 6 caracteres)',
      labelConfirmPassword: 'Confirmar Contraseña',
      placeholderConfirmPassword: 'repita la nueva contraseña',
      btnUpdatePassword: 'Actualizar Contraseña',
      btnUpdatingPassword: 'Actualizando...',
      btnBackToLogin: 'Volver a Iniciar Sesión',
      cantLoginTitle: '🔑 ¿Tiene problemas para iniciar sesión?',
      cantLoginDesc: 'Si olvidó su contraseña o tiene problemas para iniciar sesión, use la recuperación de contraseña.',
      btnResetPassword: 'Restablecer Contraseña',
      deviceRemembered: '🔒 Este dispositivo será recordado. Solo se requiere inicio de sesión tras cerrar sesión.',
      forgotPasswordLink: '¿Olvidó su contraseña?',
      emailUnconfirmedAlert: '¿No puede iniciar sesión? Quizás deba confirmar su correo electrónico.',
      btnResendConfirm: 'Reenviar carta de confirmación',
      btnResendingConfirm: 'Enviando...',
      forgotPasswordSectionTitle: 'Recuperación de Contraseña',
      forgotPasswordSectionDesc: 'Le enviaremos un enlace para crear una nueva contraseña al correo electrónico especificado.',
      requiredFieldsError: 'Por favor, rellene todos los campos obligatorios',
      recoveryLinkInvalidTitle: 'Enlace de recuperación no válido',
      recoveryLinkInvalidDesc: 'Este enlace ha caducado o ya se ha utilizado. Solicite un nuevo enlace de recuperación de contraseña.',
    },
    chatsExtra: {
      today: 'Hoy',
      yesterday: 'Ayer',
      daysAgo: 'hace {days} días',
      loading: 'Cargando...',
      totalChats: '{count} chats',
      noChatsFound: 'No se encontraron chats',
      noChatsYet: 'Aún no hay chats',
      searchChatsPlaceholder: 'Buscar chats...',
      filterNoChatsFoundDesc: 'Intente cambiar la consulta de búsqueda',
      filterNoChatsYetDesc: 'Cree el primer chat de la comunidad',
      voiceMeetingBtn: 'Iniciar reunión',
      voiceMeetingDialogTitle: 'Reunión de voz',
      forkedFrom: 'Rama de {id}...',
      active: 'Activo',
      loadErrorTitle: 'Error de carga',
      pinSuccess: 'Chat fijado',
      unpinSuccess: 'Chat desfijado',
      pinDesc: 'Chat fijado en la parte superior de la lista',
      unpinDesc: 'Chat movido a la lista general',
      pinError: 'No se pudo cambiar el estado de fijación',
      pinTooltip: 'Fijar chat',
      unpinTooltip: 'Desfijar chat',
      onlineCount: '{count} en línea',
      error: 'Error',
    },
    chatsManagement: {
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Error al cargar la lista de chats',
      chatsArchivedTitle: 'Chats archivados',
      chatsRestoredTitle: 'Chats restaurados',
      chatsArchivedDesc: '{count} chat(s) movido(s) al archivo',
      chatsRestoredDesc: '{count} chat(s) restaurado(s) del archivo',
      archiveErrorTitle: 'Error',
      archiveErrorDesc: 'Error al archivar los chats',
      restoreErrorDesc: 'Error al restaurar los chats',
      chatsDeletedTitle: 'Chats eliminados',
      chatsDeletedDesc: '{count} chat(s) movidos a la papelera',
      deleteErrorTitle: 'Error',
      deleteErrorDesc: 'Error al eliminar los chats seleccionados',
      loadingChats: 'Cargando chats...',
      backToChatsBtn: 'Volver a los chats',
      pageTitle: 'Gestionar Chats',
      pageSubtitle: 'Archivar y eliminar chats',
      totalChatsCount: '{count} chats en total',
      searchPlaceholder: 'Buscar por nombre de chat...',
      tabActive: 'Activos ({count})',
      tabArchived: 'Archivados ({count})',
      selectedChatsCount: 'Seleccionado {selected} de {total}',
      selectAllChats: 'Seleccionar todos ({count})',
      btnToArchive: 'Archivar',
      btnRestore: 'Restaurar',
      btnDelete: 'Eliminar',
      deleteConfirmTitle: '¿Eliminar chats seleccionados?',
      deleteConfirmDesc: 'Esta acción es irreversible. Se eliminarán {count} chat(s) y todos sus mensajes.',
      deleteLogNote: 'Todas las acciones se registran en el historial de auditoría.',
      cancelBtn: 'Cancelar',
      deleteForeverBtn: 'Eliminar permanentemente',
      noChatsFound: 'No se encontraron chats',
      noActiveChats: 'No hay chats activos',
      noArchivedChats: 'No hay chats archivados',
      searchEmptyStateDesc: 'Intente cambiar la consulta de búsqueda',
      activeEmptyStateDesc: 'Cree un nuevo chat para comenzar a comunicarse',
      messagesCount: '{count} mensajes',
      chatCreatedDate: 'Creado: {date}',
      chatUpdatedDate: 'Actualizado: {date}',
      btnOpenChat: 'Abrir',
      noMessages: 'No hay mensajes',
    },
    newsExtra: {
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Error al cargar los mensajes',
      settingsUpdatedTitle: 'Configuración actualizada',
      notifyEnabledDesc: 'Notificaciones habilitadas',
      notifyDisabledDesc: 'Notificaciones deshabilitadas',
      updateSettingsErrorTitle: 'Error',
      updateSettingsErrorDesc: 'Error al actualizar la configuración',
      messageSentTitle: 'Mensaje enviado',
      messageSentAgentDesc: 'El agente responderá en breve',
      sendErrorTitle: 'Error',
      sendErrorDesc: 'Error al enviar el mensaje',
      agentFallbackName: 'ZHOS',
      userFallbackName: 'Usuario',
      feedTitle: 'Noticias',
      notifyLabel: 'Notificaciones',
      textPlaceholder: 'Mensaje urgente... (Ctrl+Enter para enviar, @ZHOS para llamar al agente)',
      helperText: '💡 Consejo: El Agente ZHOS solo responde cuando se menciona a @ZHOS en el mensaje'
    },
    participantsExtra: {
      userFallbackName: 'Usuario',
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Error al cargar los datos de los participantes',
      updateProfileErrorTitle: 'Error al actualizar el perfil',
      updateProfileErrorDesc: 'Error de RLS: {message}. Verifique los permisos de acceso.',
      requestApprovedTitle: 'Solicitud Aprobada',
      requestRejectedTitle: 'Solicitud Rechazada',
      userApprovedDesc: 'Usuario aceptado en la comunidad',
      userRejectedDesc: 'Usuario rechazado',
      voteRegisteredDesc: 'Su voto ha sido registrado. Requiere {count} aprobaciones más.',
      requestErrorTitle: 'Error',
      requestErrorDesc: 'Error al procesar la solicitud: {message}',
      loadingText: 'Cargando participantes...',
      pageTitle: 'Gestionar Participantes',
      pageSubtitle: 'Ver y gestionar las solicitudes de ingreso a la comunidad',
      tabPending: 'Pendientes ({count})',
      tabApproved: 'Aprobados ({count})',
      tabRejected: 'Rechazados ({count})',
      noPendingTitle: 'No hay solicitudes pendientes',
      noPendingDesc: 'Todas las solicitudes de ingreso han sido procesadas',
      requestedDate: 'Solicitado: {date}',
      approvedVotes: 'Aprobado: {count}',
      rejectedVotes: 'Rechazado: {count}',
      requiredVotes: 'Requerido: {count} votos',
      statusPending: 'Pendiente',
      commentPlaceholder: 'Comentario (opcional)...',
      btnApprove: 'Aprobar',
      btnReject: 'Rechazar',
      alreadyVoted: 'Ya ha votado en esta solicitud',
      joinedDate: 'Unido: {date}',
      roleMember: 'Miembro',
      rejectedDate: 'Solicitud rechazada: {date}',
      roleRejected: 'Rechazado',
      triggerButton: 'Participantes',
      onlineCountDesc: '{online} de {total} en línea',
      online: 'en línea',
      offline: 'desconectado',
      offlineHeader: 'Desconectado ({count})',
      onlineHeader: 'En línea ({count})',
      notInNetwork: 'fuera de línea',
      noParticipants: 'No hay datos de participantes',
      remainingOnline: 'Otros {count} participantes en línea',
    },
    promptEditor: {
      loadErrorDesc: 'Error al cargar las versiones',
      refreshSuccessDesc: 'Datos actualizados',
      errorEmptyVersionNameTitle: 'Error',
      errorEmptyVersionNameDesc: 'Por favor, introduzca un nombre de versión',
      saveSuccessDesc: 'Versión de prompt guardada',
      saveErrorTitle: 'Error al Guardar',
      saveErrorDesc: 'Inténtelo de nuevo',
      activateSuccessDesc: 'Versión activada',
      activateErrorTitle: 'Error de Activación',
      activateErrorDesc: 'Inténtelo de nuevo',
      editVersionLoadedDesc: 'Versión {name} cargada para edición',
      loadingCommunity: 'Cargando comunidad...',
      noActiveCommunityTitle: 'No hay comunidad activa',
      noActiveCommunityDesc: 'Cree o seleccione una comunidad para editar prompts.',
      pageTitle: 'Editor de Prompts',
      pageSubtitle: 'Configuración de instrucciones y comportamiento del agente',
      btnRefresh: 'Actualizar',
      btnSaveVersion: 'Guardar Versión',
      btnSavingVersion: 'Guardando...',
      tabSystem: 'Sistema',
      tabResponses: 'Respuestas',
      tabFallback: 'Fallback',
      labelSystemInstructions: 'Instrucciones del Sistema (System Prompt)',
      labelResponsesInstructions: 'Formato y Estilo de Respuestas',
      labelFallbackInstructions: 'Instrucciones de Fallback (respuestas de repuesto)',
      descSystemInstructions: 'Reglas básicas, conocimientos e identidad del agente de IA de la comunidad',
      descResponsesInstructions: 'Configuración del tono de voz, idioma y longitud del mensaje',
      descFallbackInstructions: 'Instrucciones para comportamiento en situaciones desconocidas o errores',
      activeVersionLabel: 'Versión activa: {name}',
      viewOnlyWarning: 'Vista restringida. Puede ver las instrucciones activas, pero la edición y creación de nuevas versiones está permitida solo para los administradores del equipo.',
      unsavedChangesAlert: 'Tiene cambios sin guardar en este prompt. Haga clic en "Guardar Versión" para guardar el borrador.',
      labelVersionName: 'Nombre de la Versión',
      placeholderVersionName: 'ej. v1, v1.1, draft-new',
      labelPromptContentSystem: 'Contenido del prompt (system)',
      labelPromptContentResponses: 'Contenido del prompt (responses)',
      labelPromptContentFallback: 'Contenido del prompt (fallback)',
      placeholderPromptContentSystem: 'Introduzca las instrucciones del sistema para el agente comunitario…',
      placeholderPromptContentResponses: 'Introduzca los requisitos de formato y estilo de las respuestas…',
      placeholderPromptContentFallback: 'Introduzca las instrucciones para el comportamiento en situaciones desconocidas…',
      versionsListTitle: 'Versiones de Prompt',
      totalVersionsCount: 'Total: {count}',
      noVersionsFound: 'No se encontraron versiones',
      badgeActive: 'Activa',
      badgeDraft: 'Borrador',
      btnActivate: 'Activar',
      btnEdit: 'Editar',
      btnView: 'Ver'
    },
    integrationsExtra: {
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Error al cargar las integraciones',
      updateSuccessTitle: 'Estado actualizado',
      updateSuccessDesc: '{name} está {status}',
      updateErrorTitle: 'Error',
      updateErrorDesc: 'Error al actualizar la integración',
      connectSuccessTitle: 'Conectado',
      connectSuccessDesc: '{name} conectado con éxito',
      connectErrorTitle: 'Error de Conexión',
      connectErrorDesc: 'Error al conectar la integración',
      disconnectSuccessTitle: 'Desconectado',
      disconnectSuccessDesc: '{name} desconectado con éxito',
      disconnectErrorTitle: 'Error',
      disconnectErrorDesc: 'Error al desconectar la integración',
      scopeLabel: 'Ámbito de Aplicación',
      scopePrivate: 'Privada',
      scopeTeam: 'De Equipo',
      scopePrivateDesc: 'La integración estará disponible solo para usted',
      scopeTeamDesc: 'La integración estará disponible para todo el equipo',
      setupTitle: 'Configurar {name}',
      setupDesc: 'Introduzca los datos requeridos para conectar {name}',
      btnSetupSave: 'Guardar',
      placeholderBotToken: 'Introduzca el token del bot',
      placeholderChatId: 'ID de chat (opcional)',
      placeholderApiKey: 'Clave API de WhatsApp Business',
      placeholderPhoneNumber: '+380XXXXXXXXX',
      placeholderSmtpHost: 'smtp.gmail.com',
      placeholderSmtpPort: '587',
      placeholderSmtpPassword: 'Contraseña o App Password',
      placeholderCalendarToken: 'Token OAuth',
      placeholderSlackChannel: '#general',
      placeholderDiscordServer: 'Server ID (opcional)',
      labelBotToken: 'Bot Token',
      labelChatId: 'Chat ID',
      labelApiKey: 'API Key',
      labelPhoneNumber: 'Número de Teléfono',
      labelSmtpHost: 'Servidor SMTP',
      labelSmtpPort: 'Puerto',
      labelSmtpPassword: 'Contraseña',
      labelCalendarType: 'Tipo de Calendario',
      labelCalendarToken: 'Access Token',
      labelSlackChannel: 'Canal',
      labelDiscordServer: 'Server ID',
      descriptionTelegram: 'Integre Telegram para recibir y enviar mensajes',
      descriptionWhatsapp: 'Conecte WhatsApp para la sincronización bidireccional de mensajes',
      descriptionEmail: 'Configure el correo para recibir mensajes y notificaciones',
      nameCalendar: 'Calendario',
      descriptionCalendar: 'Sincronice eventos y reuniones con Google Calendar u Outlook',
      descriptionSlack: 'Integración con Slack para sincronizar canales',
      descriptionDiscord: 'Conecte el servidor de Discord para mensajería',
      descriptionGoogleDrive: 'Sincronice archivos con Google Drive para acceder en la base de conocimientos',
      descriptionGoogleDocs: 'Integre Google Docs para la importación automática de documentos',
      descriptionOpenAI: 'Conecte la API de OpenAI ChatGPT para capacidades avanzadas de IA',
      descriptionDeepSeek: 'Integración con DeepSeek AI para opciones alternativas de IA',
      pageTitle: 'Integraciones',
      pageSubtitle: 'Conecte servicios externos para ampliar la funcionalidad del mensajero',
      pageDesc1: 'Las integraciones le permiten sincronizar mensajes con otras plataformas y automatizar el trabajo.',
      pageDesc2: 'Puede crear integraciones para el equipo (disponibles para todos) o privadas (solo para usted).',
      tabsAll: 'Todas',
      tabsTeam: 'De equipo',
      tabsPrivate: 'Privadas',
      statusConnected: 'Conectado',
      statusNotConnected: 'No conectado',
      scopeTeamText: 'De equipo',
      scopePrivateText: 'Privada',
      lastSyncText: 'Última sincronización: {date}',
      btnEnabled: 'Habilitado',
      btnDisabled: 'Deshabilitado',
      btnConnecting: 'Conectando...',
      btnConnect: 'Conectar',
      btnSetup: 'Configuración',
      btnDisconnect: 'Desconectar',
      btnCancel: 'Cancelar',
      howItWorksTitle: '¿Cómo funciona?',
      howItWorksStep1: 'Conecte la integración ingresando los datos requeridos',
      howItWorksStep2: 'Habilite la integración para comenzar la sincronización',
      howItWorksStep3: 'Los mensajes se sincronizarán automáticamente entre plataformas',
      howItWorksStep4: 'Siempre puede desconectar o cambiar la configuración',
      selectPlaceholder: 'Seleccionar...'
    },
    projectLayout: {
      tabChat: 'Chat',
      tabKanban: 'Tareas',
      tabDocs: 'Documentos',
      tabMeetings: 'Reuniones',
      tabSettings: 'Configuración',
      docsWipTitle: 'Documentos del proyecto',
      docsWipDesc: 'El soporte de documentos está en desarrollo',
      meetingsWipTitle: 'Reuniones del proyecto',
      meetingsWipDesc: 'El soporte de reuniones está en desarrollo',
      settingsWipTitle: 'Configuración del proyecto',
      settingsWipDesc: 'La configuración del proyecto está en desarrollo'
    },
    agoraVoiceCall: {
      loadErrorAuth: 'Usuario no autorizado',
      loadErrorInit: 'Error al inicializar la llamada de voz',
      connectingTitle: 'Conectando...',
      connectingDesc: 'Recuperando token de acceso',
      connectErrorToken: 'Error al recuperar el token',
      connectedTitle: 'Conectado',
      connectedDesc: 'Se ha unido al canal de voz',
      connectErrorChannel: 'Error al unirse al canal',
      disconnectedTitle: 'Desconectado',
      disconnectedDesc: 'Ha salido del canal de voz',
      channelHeader: 'Canal de Voz',
      participantsCount: '{count} participantes',
      btnStartMeeting: 'Iniciar reunión',
      tooltipMute: 'Silenciar micrófono',
      tooltipUnmute: 'Activar micrófono',
      labelParticipants: 'Participantes:',
      participantFallback: 'Participante {id}'
    },
    chatInterface: {
      errPlayTitle: 'Error de Reproducción',
      errPlayDesc: 'Error al reproducir audio',
      errTtsTitle: 'Error de TTS',
      errTtsDesc: 'Error al reproducir respuesta por voz',
      userFallbackName: 'Usuario',
      errUploadTitle: 'Error al subir el archivo {name}',
      errFileSizeTitle: 'Archivo Demasiado Grande',
      errFileSizeDesc: 'El tamaño del archivo excede el límite permitido (25 MB)',
      errFileTypeTitle: 'Tipo de archivo no admitido',
      errHttpsTitle: 'Se Requiere Conexión Segura',
      errHttpsDesc: 'Se requiere una conexión HTTPS para acceder al micrófono',
      errMicrophoneNotSupportedTitle: 'Navegador No Soportado',
      errMicrophoneNotSupportedDesc: 'Su navegador no admite la grabación de voz. Actualice el navegador o use Chrome/Firefox',
      errMicrophoneNotFoundTitle: 'Micrófono No Encontrado',
      errMicrophoneNotFoundDesc: 'Conecte el micrófono e inténtelo de nuevo',
      logTtsFallback: 'Reproduciendo la respuesta del agente mediante la API de TTS (fallback)...',
      toastProcessingVoiceTitle: 'Procesando voz',
      toastConvertingDesc: 'Convirtiendo audio...',
      toastSavingDesc: 'Guardando mensaje de voz...',
      toastAudioRecordedTitle: 'Audio grabado',
      toastSendingDesc: 'Enviando mensaje...',
      toastAudioFormatErrorTitle: 'Error de formato de audio',
      toastAudioFormatErrorDesc: 'No se pudo convertir el audio. Pruebe con otro navegador.',
      toastVoiceDisabledTitle: 'Entrada de voz no disponible',
      toastVoiceDisabledDesc: 'La función de voz a texto está actualmente desactivada. Use entrada de texto.',
      toastAuthErrorTitle: 'Error de autenticación',
      toastAuthErrorDesc: 'Error al autenticar. Por favor, inicie sesión de nuevo.',
      toastServerErrorTitle: 'Error del servidor',
      toastServerErrorDesc: 'El servidor no está disponible temporalmente. Inténtelo más tarde.',
      toastVoiceRecognitionErrorTitle: 'Error de entrada de voz',
      toastVoiceRecognitionErrorDesc: 'No se pudo reconocer el habla. Por favor, inténtelo de nuevo.',
      toastMicPermissionDeniedTitle: 'Acceso denegado',
      toastMicPermissionDeniedDesc: 'Permita el acceso al micrófono en la configuración del navegador y vuelva a cargar la página',
      toastMicBusyTitle: 'Micrófono ocupado',
      toastMicBusyDesc: 'El micrófono está siendo utilizado por otra aplicación. Cierre otras aplicaciones e inténtelo de nuevo',
      toastSecurityErrorTitle: 'Error de seguridad',
      toastSecurityErrorDesc: 'Verifique la configuración de seguridad del navegador y los permisos del sitio',
      toastNotSupportedTitle: 'No compatible',
      toastNotSupportedDesc: 'Su navegador no admite la configuración de audio requerida',
      toastRecordErrorTitle: 'Error de grabación',
      toastRecordErrorDesc: 'Error al iniciar la grabación: {error}',
      toastAccessErrorTitle: 'Error',
      toastAccessErrorDesc: 'Error al acceder al micrófono',
      toastDifyPrivateChatAlert: '💬 El agente principal (Dify) no está disponible en chats privados. Use chats grupales o de proyecto para trabajar con el agente.',
      btnAutoStopOn: 'Autostop act.',
      btnSpeaking: 'Hable...',
      labelUploadingFiles: 'Subiendo archivos...',
      ariaDeleteFile: 'Eliminar archivo',
      placeholderRecording: 'Grabando voz...',
      placeholderTypeMessage: 'Escriba un mensaje...',
      ariaAttachFile: 'Adjuntar archivo',
      ariaVoiceSettings: 'Configuración de entrada de voz',
      voiceSettingsTitle: 'Configuración de entrada de voz',
      voiceModeLabel: 'Modo de voz',
      voiceModeDesc: 'Grabación automática y locución de respuestas',
      autoStopLabel: 'Autostop al pausar',
      autoStopDesc: 'Detener la grabación automáticamente después de 2.5 segundos de silencio',
      ariaStopPlayback: 'Detener reproducción',
      ariaStopRecording: 'Detener grabación',
      ariaStartRecording: 'Grabar mensaje de voz',
      ariaStopGeneration: 'Detener generación',
      ariaSendMessage: 'Enviar mensaje',
      titleMainAgentUnavailable: 'El agente principal no está disponible en chats privados',
      indicatorAgentTyping: 'El agente ZHOS está escribiendo...',
      indicatorSpeakingResponse: 'Locución de respuesta...'
    },
    pendingApproval: {
      cardTitle: 'Solicitud Recibida',
      cardDesc: 'MicroDAO otorga acceso gradualmente. Verificaremos la solicitud y le notificaremos cuando se active el espacio.',
      accountLabel: 'Su Cuenta',
      statusLabel: 'Estado de la Solicitud:',
      statusPending: 'En espera / Waitlisted',
      btnLogout: 'Cerrar Sesión',
      btnBackHome: 'Volver al Inicio'
    },
    agentDirectory: {
      stewardBadge: 'Sistema',
      stewardDesc: 'Gestor autónomo de las reglas del espacio. Modera el contenido basándose en los principios de la comunidad y automatiza decisiones administrativas rutinarias.',
      stewardFunc1: 'Moderación de chats de acuerdo con los principios',
      stewardFunc2: 'Registro de decisiones administrativas',
      stewardFunc3: 'Resolución de conflictos a través de Pausa/Nudo',
      stewardFunc4: 'Configuración de reglas y directrices comunitarias',
      stewardPrompt: 'Usted es el gestor neutral del espacio MicroDAO. Su objetivo es mantener un diálogo constructivo, registrar las posiciones clave de los participantes y facilitar el consenso.',
      ragBadge: 'Conocimiento & RAG',
      ragDesc: 'Archivador de IA de la memoria compartida de la comunidad. Indexa semánticamente archivos subidos, documentos y chats para proporcionar respuestas rápidas y precisas.',
      ragFunc1: 'Indexación de archivos PDF, DOCX, TXT',
      ragFunc2: 'Respuestas contextuales basadas en la base de conocimientos',
      ragFunc3: 'Búsqueda en decisiones y chats pasados',
      ragFunc4: 'Generación de informes y notas analíticas',
      ragPrompt: 'Usted es el archivador de conocimientos de MicroDAO. Responda a las preguntas basándose estrictamente en el contexto de la base de conocimientos comunitaria subida. Cite las fuentes.',
      taskBadge: 'Coordinación',
      taskDesc: 'Agente de gestión de tareas. Sincroniza tareas en el tablero Kanban, crea recordatorios automáticos de plazos y asigna responsables.',
      taskFunc1: 'Creación y seguimiento de tareas a partir de chats',
      taskFunc2: 'Actualización de estados en el tablero Kanban',
      taskFunc3: 'Recordatorios automáticos de plazos',
      taskFunc4: 'Análisis de la carga de trabajo del equipo',
      taskPrompt: 'Usted es el coordinador de tareas de IA. Ayude al equipo a estructurar el trabajo, crear tickets claros, asignar responsables y controlar los plazos.',
      procBadge: 'Procesos',
      procDesc: 'Facilitador de IA para reuniones y llamadas. Genera automáticamente resúmenes de discusiones, destaca acuerdos y elabora listas de elementos de acción para el equipo.',
      procFunc1: 'Transcripción y resumen de reuniones',
      procFunc2: 'Destacado de Action Items clave',
      procFunc3: 'Programación de eventos del calendario',
      procFunc4: 'Creación de follow-ups detallados',
      procPrompt: 'Usted es un facilitador de reuniones. Su tarea es analizar transcripciones de conversaciones, destacar las decisiones tomadas, las tareas y los plazos, formando resúmenes estructurados.',
      navbarAgents: 'Agentes',
      navbarPricing: 'Tarifas',
      navbarClient: 'Cliente',
      panelBtn: 'Panel de Control',
      startBtn: 'Comenzar',
      pageTitle: 'Agentes de IA de la Comunidad',
      pageSubtitle: 'Directorio de Agentes de la Comunidad',
      pageDesc: 'Agentes especializados con memoria integrada (RAG) y acceso a herramientas para automatizar los procesos de su comunidad.',
      labelFuncs: 'Funciones Principales:',
      labelPrompt: 'System Prompt:',
      btnStartChat: 'Iniciar chat en el espacio',
      btnCreateSpace: 'Crear espacio con este agente',
      footerCopyright: '— Todos los derechos reservados.'
    },
    agents: {
      yaroName: 'Yaromir',
      yaroDesc: 'Agente de colaboración — consejos contextuales, sincronización de tareas',
      eonName: 'Eonarch Synergeton',
      eonDesc: 'Agente de sinergia — analítica de interacciones, optimización de procesos',
      errLoad: 'Error al cargar los agentes',
      errNameRequired: 'Especifique el nombre del agente',
      successCreate: 'Agente creado',
      errCreate: 'Error al crear el agente',
      labelPersonalSuffix: '(personal)',
      errAlreadyInstalled: 'Este agente ya está en su lista',
      personalChatName: 'Chat personal con {name}',
      successInstall: '¡{name} instalado y listo para funcionar!',
      errInstall: 'Error al instalar el agente',
      successActive: 'Agente activado',
      successPaused: 'Agente pausado',
      errStatus: 'Error al cambiar el estado',
      deleteConfirm: '¿Está seguro de que desea eliminar este agente?',
      successDelete: 'Agente eliminado',
      errDelete: 'Error al eliminar el agente',
      statusActive: 'Activo',
      statusPaused: 'Pausa',
      statusDisconnected: 'Desconectado',
      pageTitle: 'Agentes',
      pageSubtitle: 'Gestión de agentes personales y su integración en proyectos',
      catalogBtn: 'Catálogo de Agentes',
      catalogTitle: 'Catálogo de Agentes',
      btnInstall: 'Instalar',
      connectCustomBtn: 'Conectar Su Agente',
      connectCustomTitle: 'Conectar Agente Personalizado',
      labelAgentName: 'Nombre del Agente',
      placeholderAgentName: 'Introduzca el nombre del agente',
      labelAgentDesc: 'Descripción',
      placeholderAgentDesc: 'Describa las funciones del agente',
      labelConnectionType: 'Tipo de Conexión',
      connectionTypeMsp: 'MSP (Recomendado)',
      btnCreateAgent: 'Crear Agente',
      noAgentsTitle: 'No hay Agentes',
      noAgentsDesc: 'Comience conectando su primer agente',
      btnConnectAgent: 'Conectar Agente',
      preset: 'Predefinido',
      labelType: 'Tipo',
      btnToChat: 'Ir al chat'
    },
    chatPage: {
      returnToChats: 'Volver a los chats',
      userFallbackName: 'Usuario',
      agentFallbackName: 'Espíritu Comunitario',
      knotFixedDesc: 'Nudo fijado en la conversación',
      branchSuccessDesc: 'Rama creada con éxito',
      auditViolationDesc: 'Violación registrada en el historial de auditoría',
      btnKnot: 'Nudo',
      indicatorTypingSingle: 'está escribiendo...',
      indicatorTypingMultiple: 'están escribiendo...',
      forkedFromTitle: 'Rama de "{name}"',
    },
    communityChat: {
      title: 'Chat Global ZHOS',
      description: 'Chat comunitario global con el agente ZHOS',
      loadError: 'Error al cargar el chat global',
      sendError: 'Error al enviar el mensaje',
      loading: 'Cargando chat global...',
      welcomeMsg: '¡Bienvenido al chat global de ZHOS! Aquí se publican noticias y anuncios importantes de la comunidad.',
      welcomeSystemName: 'Sistema ZHOS',
      welcomeUpdateMsg: 'Actualización del sistema: diálogos mejorados y capacidad de archivo de chat agregada.',
      welcomeAgentName: 'Espíritu Comunitario',
      agentName: 'Espíritu Comunitario',
      agentBadge: 'Agente',
      inputPlaceholder: 'Escribir en el chat global...',
      agentTyping: 'El Espíritu Comunitario está escribiendo...',
      senderFallbackUser: 'Usuario',
      senderFallbackMember: 'Participante',
    },
    threadPanel: {
      title: 'Discusión del mensaje',
      subtitle: 'Hilo de discusión',
      parentPreview: 'Mensaje original:',
      parentSender: 'Remitente',
      emptyState: 'No hay respuestas en este hilo. ¡Inicie la discusión!',
      inputPlaceholder: 'Responder en el hilo...',
      sendError: 'Error al enviar la respuesta',
    },
    videoIntro: {
      notSupported: 'Su navegador no admite la reproducción de vídeo.',
      unmute: 'Activar sonido',
      mute: 'Silenciar',
      skip: 'Omitir',
      welcome: 'Bienvenido a ZHOS Messenger',
    },
    createModal: {
      createTitle: 'Crear {type}',
      chatDesc: 'Cree un nuevo chat global para discusiones',
      branchDesc: 'Cree una rama a partir de un mensaje existente',
      projectDesc: 'Cree un nuevo proyecto para la colaboración en equipo',
      chatType: 'Tipo de chat',
      placeholderChatName: 'Nombre del chat',
      placeholderProjectName: 'Nombre del proyecto',
      placeholderBranchName: 'Nombre de la rama',
      placeholderDescOptional: 'Breve descripción (opcional)',
      placeholderTags: 'Etiquetas separadas por comas: chat, trabajo, proyecto',
      tagsHint: 'Separe las etiquetas con comas',
      messageIdLabel: 'ID del mensaje',
      placeholderMessageId: 'ID del mensaje para crear la rama',
      createBtn: 'Crear {type}',
      chatTypeLabel: 'Tipo de chat',
      chatTitleLabel: 'Nombre del chat',
      projectTitleLabel: 'Nombre del proyecto',
      branchTitleLabel: 'Nombre de la rama',
      descPlaceholder: 'Breve descripción (opcional)',
      tagsPlaceholder: 'Etiquetas separadas por comas: chat, trabajo, proyecto',
      messageIdPlaceholder: 'ID del mensaje para crear la rama',
    },
    fileUploadDialog: {
      dialogTitle: 'Subir archivo',
      dialogDesc: 'Suba archivos para la base de conocimientos o el chat',
      labelDescription: 'Descripción (opcional)',
      placeholderDescription: 'Breve descripción del archivo...',
      labelTags: 'Etiquetas (separadas por comas)',
      placeholderTags: 'etiqueta1, etiqueta2, etiqueta3',
      btnUpload: 'Subir {count}',
      progress: 'Subiendo...',
      dragActive: 'Suelte los archivos aquí',
      dragInactive: 'Arrastre los archivos aquí o haga clic para seleccionar',
      supportedFormats: 'Soportado: PDF, TXT, MD, DOCX, DOC, CSV, JSON, imágenes (máx. 25MB)',
    },
    pushNotifications: {
      permissionDeniedTitle: 'Acceso denegado',
      permissionDeniedDesc: 'Permita las notificaciones en la configuración de su navegador',
      notSupportedTitle: 'No compatible',
      notSupportedDesc: 'Su navegador no admite notificaciones',
      swRegistrationFailedTitle: 'Error',
      swRegistrationFailedDesc: 'Error al registrar el Service Worker',
      enabledTitle: '✅ Notificaciones push activadas',
      enabledDesc: 'Recibirá notificaciones incluso cuando la pestaña esté cerrada',
      enabledTabDesc: 'Recibirá notificaciones sobre nuevos mensajes',
      disabledTitle: 'Error',
      disabledDesc: 'No se pudieron activar las notificaciones',
      settingsSavedTitle: 'Configuración guardada',
      settingsSavedDesc: 'Cambios aplicados',
      settingsSaveFailedTitle: 'Error',
      settingsSaveFailedDesc: 'Error al guardar la configuración',
    },
    onboardingWizard: {
      aiGuide: "Su guía de IA",
      listening: "El Espíritu Comunitario está escuchando...",
      autonomy: "Nivel de autonomía",
      stepOf: "Paso {step} de {total}",
      stepsTitle: [
        "",
        "1. Identidad de la comunidad",
        "2. Misión de la comunidad",
        "3. Valores y reglas",
        "4. Rostro del Espíritu Comunitario",
        "5. Autonomía y permisos",
        "6. Primeros códigos de invitación",
        "7. Conocimiento inicial",
        "8. Primeros pasos (Tareas)"
      ],
      completed: "completado",
      labelCommName: "Nombre de MicroDAO *",
      placeholderCommName: "Introduzca el nombre de la comunidad...",
      labelCommType: "Tipo de comunidad",
      placeholderCommType: "Seleccione tipo...",
      types: {
        workspace: "Espacio de trabajo / Equipo",
        village: "Eco-aldea / Comunidad local",
        dao: "DAO / Gremio Web3",
        club: "Club privado / Sociedad",
        charity: "Iniciativa de caridad",
        other: "Otro"
      },
      labelCommDesc: "Breve descripción",
      placeholderCommDesc: "Describa qué hace su comunidad y quiénes son sus miembros...",
      placeholderCommMission: "¿Por qué existe esta comunidad? ¿Qué problema principal resuelve?",
      placeholderCommGoal: "¿Qué debe hacer la comunidad en los próximos 30 días?",
      placeholderCommValues: "Ej.: 1. Respeto mutuo. 2. Transparencia. 3. Neutralidad de IA. ¿Qué está prohibido?",
      labelAgentName: "Nombre del Espíritu Comunitario",
      labelAgentTone: "Tono del agente",
      placeholderAgentTone: "Seleccione tono...",
      tones: {
        warm: "Cálido y amigable (Espiritual)",
        philosophical: "Filosófico y tranquilo (Eonarch)",
        technical: "Técnico y preciso (Yaromir)",
        formal: "Comercial y formal"
      },
      autonomyLevelLabel: "Nivel de autonomía del agente",
      autonomyLevels: {
        assistant: "Asistente",
        assistantDesc: "Solo propone ideas, realiza resúmenes y redacta borradores de mensajes.",
        coordinator: "Coordinador",
        coordinatorDesc: "Puede redactar tareas, preparar reglamentos y recordar a los miembros después de la confirmación.",
        admin: "Administrador supervisado",
        adminDesc: "Puede enviar mensajes de bienvenida automáticos, establecer tareas y actualizar la base de conocimientos. Confirma acciones confidenciales."
      },
      permissionsLabel: "Permisos del agente",
      permissions: {
        welcome: "Enviar bienvenidas a los recién llegados",
        tasks: "Redactar borradores de tareas",
        invites: "Crear invitaciones de invitados",
        summaries: "Generar resúmenes de reuniones"
      },
      sensitiveActionsWarning: "Las acciones confidenciales siempre están bloqueadas: la eliminación de la comunidad, los cambios de permisos, la transferencia de propiedad y las modificaciones de facturación requieren la aprobación directa del líder.",
      labelInviteMember: "Código para miembros",
      labelInviteAdmin: "Código para administradores",
      labelMaxUses: "Usos máximos del código",
      labelKbSeed: "Semilla de conocimiento inicial (Notas / Reglas)",
      placeholderKbSeed: "Aquí puede introducir las reglas de la comunidad, los reglamentos generales o los enlaces útiles. Indexaré esta información para responder preguntas al instante...",
      taskPlanningTitle: "Planifique la primera tarea de la comunidad:",
      taskTitleLabel: "Título de la tarea",
      taskDescLabel: "Descripción de la tarea",
      configReviewTitle: "Revisión de la configuración de MicroDAO:",
      reviewLabels: {
        name: "Nombre:",
        type: "Tipo:",
        agent: "Agente:",
        autonomy: "Autonomía:",
        code: "Código de invitación:"
      },
      lobbyBtn: "Al lobby",
      draftBtn: "Borrador",
      nextBtn: "Siguiente",
      launchBtn: "Iniciar MicroDAO",
      errorNameRequired: "El nombre es obligatorio",
      errorNameDesc: "Por favor, asigne un nombre a su MicroDAO",
      defaultAgentName: "Espíritu Comunitario",
      defaultFirstTaskTitle: "Conocer al Espíritu Comunitario",
      defaultFirstTaskDesc: "Leer las reglas de la comunidad y realizar una primera presentación al Espíritu Comunitario en el chat.",
      agentMsg1: "¡Bienvenido! Soy tu futuro Espíritu Comunitario. Creemos nuestro MicroDAO juntos. Empecemos con la identidad: ¿cómo se llamará nuestra comunidad, a qué tipo pertenece y cuál es su descripción corta?",
      agentMsg2: "¡Excelente comienzo! Ahora definamos la misión y el primer objetivo de 30 días. Esto se convertirá en el núcleo de mi memoria para poder ayudar a coordinar las actividades y mantener el enfoque.",
      agentMsg3: "Las reglas de la comunidad definnen nuestros valores y límites de comunicación. ¿Qué principios de comportamiento y límites deseas establecer? En caso de disputas, te recordaré estas reglas.",
      agentMsg4: "¿Cómo me llamaré (por ejemplo, 'Espíritu Comunitario' u otro nombre)? ¿Qué tono de comunicación elijo: amigable, filosófico u oficial?",
      agentMsg5: "Especifica mi nivel de autonomía y permisos. Puedo actuar como un simple Asistente, Coordinador (creación de tareas, recordatorios) o Administrador supervisado. Las acciones sensibles siempre requerirán tu confirmación.",
      agentMsg6: "Creamos los primeros códigos de acceso. Puedes generar códigos únicos para administradores o miembros. Por ejemplo, 'MYSPACE-MEMBER' o 'MYSPACE-ADMIN'.",
      agentMsg7: "¡Agreguemos algunos conocimientos iniciales! Introduce las reglas iniciales, notas o instrucciones. Esta es la semilla de nuestra base de conocimientos compartida que indexaré primero.",
      agentMsg8: "El último paso: planifiquemos las primeras acciones. Creemos la primera tarea que verás en el panel de control. Esto te ayudará a ponerte a trabajar de inmediato.",
      exitBtn: 'Salir',
      ecosystemTitle: 'Ecosistema MicroDAO',
      ecosystemSubtitle1: 'Espacio vital de su',
      ecosystemSubtitle2: 'microcomunidad',
      ecosystemDesc: 'MicroDAO es un nuevo enfoque para organizar equipos y comunidades. Aquí no hay control clásico de waitlist global. En cambio, cada espacio se forma alrededor de un Espíritu Comunitario autónomo — una inteligencia artificial que practica la memoria, realiza la incorporación, asigna roles y coordina acciones de colaboración.',
      draftFoundTitle: 'Configuración de borrador encontrada',
      draftFoundDesc: 'Se detuvo en el paso {step} para la creación de la comunidad {name}.',
      restoreDraftBtn: 'Restaurar borrador',
      existingCommTitle: 'Sus MicroDAOs actuales',
      createCommTitle: 'Crear nueva comunidad (MicroDAO)',
      createCommDesc: 'Conviértase en líder y lance un espacio con un Espíritu Comunitario personal',
      startCreationBtn: 'Comenzar creación con Agente',
      joinCommTitle: 'Unirse por código de invitación',
      joinCommDesc: 'Introduzca el código del líder para obtener acceso automáticamente',
      joinCommPlaceholder: 'Introduzca el código, ej: ECO-MEMBER-492',
      joiningBtn: 'Uniéndose...',
      joinBtn: 'Unirse a la comunidad',
      partnerTitle: 'Solicitar estatus de cofundador',
      partnerDesc: 'Solicitud de acceso extendido de socio a las herramientas de la plataforma',
      partnerPendingTitle: 'Solicitud recibida para revisión',
      partnerPendingDesc: '¡Gracias por su interés! Nos pondremos en contacto con usted en la dirección de correo electrónico proporcionada después de la verificación.',
      partnerPlaceholder: 'Describa su objetivo, equipo y por qué desea obtener el estatus de socio...',
      sendingBtn: 'Enviando...',
      sendRequestBtn: 'Enviar solicitud',
      toastErrorTitle: 'Error',
      toastEnterInviteCode: 'Por favor introduzca el código de invitación',
      toastJoinSuccessTitle: '¡Unido con éxito!',
      toastJoinSuccessDesc: 'Se ha convertido en miembro de la comunidad MicroDAO.',
      toastJoinErrorTitle: 'Error de unión',
      toastJoinErrorDesc: 'Código de invitación no válido.',
      toastPartnerSuccessTitle: '¡Solicitud enviada!',
      toastPartnerSuccessDesc: 'Revisaremos su solicitud de acceso de socio en breve.',
      toastPartnerErrorTitle: 'Error de envío',
      toastDraftRestoredTitle: 'Borrador restaurado',
      toastDraftRestoredDesc: 'Volviendo al paso {step}.',
      toastDraftSavedTitle: 'Borrador guardado',
      toastDraftSavedDesc: 'Puede continuar con la configuración más tarde.',
      toastDraftSaveErrorTitle: 'Error al guardar',
      toastStep1ErrorTitle: 'Error',
      toastStep1ErrorDesc: 'Por favor introduzca el nombre de la comunidad en el paso 1.',
      defaultChatName: 'Chat General',
      toastCreateSuccessTitle: '¡Comunidad creada con éxito!',
      toastCreateSuccessDesc: '¡Bienvenido a MicroDAO "{name}" con el Espíritu Comunitario "{agentName}"!',
      toastCreateErrorTitle: 'Error de creación',
      toastCreateErrorDesc: 'Ocurrió un error al crear la MicroDAO.',
      defaultStepMsg: 'Continuemos con la configuración.'
    },
    communityNewsFeed: {
      urgentSentTitle: 'Noticia urgente enviada',
      urgentSentDesc: 'Notificaciones push enviadas a todos los participantes',
      sendErrorTitle: 'Error',
      sendErrorDesc: 'No se pudo enviar la noticia',
      agentBadge: 'ZHOS',
      userBadge: 'Usuario',
      title: 'Canal de noticias',
      messagesCount: '{count} mensajes',
      placeholder: 'Escriba una noticia urgente para todos los participantes de la comunidad...',
      sendAllBtn: 'Enviar a todos',
      hint: '💡 <strong>Sugerencia:</strong> Las noticias se mostrarán a todos los participantes. Use @ZHOS para invocar al agente',
    },
    kanban: {
      taskTitlePlaceholder: 'Nombre de la tarea...',
      taskDescPlaceholder: 'Descripción (opcional)...',
      assignBtn: 'Asignar',
      addBtn: 'Añadir',
      dragPlaceholder: 'Arrastre las tarjetas aquí o haga clic en + para crear',
      addTaskTooltip: 'Añadir tarea',
      taskCreated: 'Tarjeta creada',
      taskDeleted: 'Tarjeta eliminada',
      success: 'Éxito',
      loadError: 'Error al cargar las tarjetas',
      createError: 'No se pudo crear la tarjeta',
      updateError: 'No se pudo actualizar la tarjeta',
      deleteError: 'No se pudo eliminar la tarjeta',
      backlog: 'Backlog',
      todo: 'Por hacer',
      inProgress: 'En proceso',
      inReview: 'En revisión',
      done: 'Hecho',
    },
    onlineUsers: {
      userFallbackName: 'Participante',
      zeroOnline: '0 en línea',
      onlineStatus: '{name} (en línea)',
      totalOnline: '{count} en línea',
    },
    reactions: {
      authRequiredTitle: 'Se requiere autorización',
      authRequiredDesc: 'Inicie sesión para agregar reacciones',
      addErrorTitle: 'Error',
      addErrorDesc: 'No se pudo agregar la reacción',
      addTooltip: 'Agregar reacción',
    },
    avatar: {
      userFallbackChar: 'U',
    },
    userProfile: {
      updatedTitle: 'Perfil actualizado',
      updatedDesc: 'Cambios guardados con éxito',
      updateErrorTitle: 'Error',
      updateErrorDesc: 'No se pudo actualizar el perfil',
      fileTooLarge: 'Archivo demasiado grande. Tamaño máximo: 5MB',
      unsupportedFileType: 'Tipo de archivo no soportado. Use JPG, PNG, GIF o WebP',
      fileSecurityFailed: 'El archivo no pasó el control de seguridad',
      uploadFailed: 'No se pudo subir la foto',
    },
    session: {
      expiredTitle: 'Sesión expirada',
      expiredDesc: 'Por favor, inicie sesión de nuevo',
      timeoutTitle: 'Sesión expirada',
      timeoutDesc: 'Se cerró la sesión automáticamente debido a la inactividad',
    },
    security: {
      loadErrorTitle: 'Error al cargar los datos de seguridad',
      loadErrorDesc: 'No se pudo cargar la información de seguridad',
      successLoginLog: 'Inicio de sesión exitoso del usuario {email}',
      failedLoginLog: 'Intento de inicio de sesión fallido {email}',
      successRegisterLog: 'Registro exitoso de {email}',
      rateLimitLog: 'Límite de velocidad excedido para la acción: {action}',
      fileUploadLog: 'Subida de archivo: {file}',
      unknownUser: 'desconocido',
      loading: 'Cargando datos de seguridad...',
      panelTitle: 'Panel de seguridad',
      totalEvents: 'Total de eventos',
      last24h: 'En las últimas 24 horas',
      criticalEvents: 'Críticos',
      requireAttention: 'Requieren atención',
      blocks: 'Bloqueos',
      failedLogins: 'Inicios de sesión fallidos',
      hackAttempts: 'Intentos de hackeo',
      fileUploads: 'Subidas de archivos',
      verifiedFiles: 'Archivos verificados',
      criticalWarning: 'Se detectaron {count} eventos de seguridad críticos en las últimas 24 horas. Se recomienda una revisión inmediata.',
      recentEventsTitle: 'Eventos de seguridad recientes',
      max50Events: 'Eventos en las últimas 24 horas (máximo 50)',
      noEvents: 'No hay eventos de seguridad en las últimas 24 horas',
      refreshBtn: 'Actualizar datos',
    },
    chatSidebar: {
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Failed to load chats',
      defaultChatName: 'Nuevo chat',
      chatCreatedDesc: 'Chat creado',
      createErrorTitle: 'Error',
      chatRenamedDesc: 'Chat renombrado',
      renameErrorTitle: 'Error',
      renameErrorDesc: 'No se pudo renombrar el chat',
      archiveConfirm: '¿Archivar este chat? Solo puede eliminarlo desde el panel de control.',
      chatArchivedTitle: 'Chat archivado',
      chatArchivedDesc: 'Chat movido al archivo. Puede eliminarlo desde el panel de gestión de chats.',
      archiveErrorTitle: 'Error',
      archiveErrorDesc: 'No se pudo archivar el chat',
      today: 'Hoy',
      yesterday: 'Ayer',
      searchPlaceholder: 'Buscar chats...',
      noChatsFound: 'Chats no encontrados',
      noChatsYet: 'No hay chats todavía',
      createFirstChatBtn: 'Crear primer chat',
      archiveTooltip: 'Archivar chat',
    },
    themeSwitch: {
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
    },
    errorBoundary: {
      title: 'Ocurrió un error',
      desc: 'Algo salió mal. Intente actualizar la página o regrese más tarde.',
      retryBtn: 'Reintentar',
      refreshBtn: 'Actualizar página',
    },
    userApprovalPanel: {
      attentionTitle: 'Atención',
      inconsistenciesDesc: 'Se detectaron {count} inconsistencias en los datos. Intente actualizar la página.',
      loadErrorTitle: 'Error',
      loadErrorDesc: 'Error al cargar las solicitudes: {error}',
      updateProfileErrorTitle: 'Error al actualizar el perfil',
      updateProfileErrorDesc: 'Error RLS: {error}. Verifique los permisos.',
      voiceApprovedTitle: 'Voto registrado',
      voiceRejectedTitle: 'Rechazo registrado',
      userApprovedDesc: '¡Usuario aprobado por la comunidad!',
      userRejectedDesc: 'Usuario rechazado',
      voteRegisteredDesc: 'Su voto ha sido registrado. Se necesitan {count} votos más para la confirmación.',
      actionErrorTitle: 'Error',
      actionErrorDesc: 'Error al procesar la decisión: {error}',
      panelTitle: 'Nuevos miembros esperando aprobación',
      panelDesc: 'Los nuevos miembros se convierten en moderadores después de la aprobación. Requerido: el 1er usuario se aprueba automáticamente, el 2do requiere 1 aprobación, el 3er requiere 2 aprobaciones, luego se requieren 3 aprobaciones para cada nuevo participante.',
      unknownUser: 'Usuario desconocido',
      approvalsCount: '{count}/{total} aprobaciones',
      rejectionsCount: '{count} rechazos',
      commentPlaceholder: 'Comentario (opcional)',
      approveBtn: 'Aprobar',
      rejectBtn: 'Rechazar',
      alreadyApproved: 'Usted aprobó a este participante',
      alreadyRejected: 'Usted rechazó a este participante',
    },
    notifications: {
      title: 'Notificaciones',
      markAllAsRead: 'Marcar todo como leído',
      enablePush: 'Habilitar notificaciones push',
      pushEnabled: 'Notificaciones push habilitadas',
      noNotifications: 'No hay notificaciones',
      justNow: 'ahora mismo',
      minsAgo: 'hace {count}m',
      hoursAgo: 'hace {count}h',
      daysAgo: 'hace {count}d',
      pushEnabledTitle: '✅ Notificaciones Push Habilitadas',
      pushEnabledDesc: 'Recibirá notificaciones incluso cuando la pestaña esté cerrada',
      enablePushErrorTitle: 'Error',
      enablePushErrorDesc: 'No se pudieron habilitar las notificaciones push',
      notSupportedTitle: 'No Soportado',
      notSupportedDesc: 'Su navegador no admite notificaciones',
      permissionDeniedTitle: 'Acceso Denegado',
      permissionDeniedDesc: 'Permita las notificaciones en la configuración de su navegador',
      swRegisterErrorTitle: 'Error',
      swRegisterErrorDesc: 'No se pudo registrar el Service Worker',
      generalErrorTitle: 'Error',
      generalErrorDesc: 'No se pudieron habilitar las notificaciones',
      newUrgentMessage: '📢 Nuevo mensaje urgente',
      viewBtn: 'Ver',
    },
    fileValidation: {
      tooLargeTitle: 'Archivo demasiado grande',
      tooLargeDesc: 'Tamaño máximo de archivo: 50MB',
      invalidTypeTitle: 'Tipo de archivo no permitido',
      invalidTypeDesc: 'Este tipo de archivo no está permitido para subir',
      validationErrorTitle: 'Error de validación de archivo',
      validationErrorDesc: 'No se pudo validar el archivo',
      rateLimitTitle: 'Demasiados intentos',
      rateLimitDesc: 'Intente subir el archivo más tarde',
      rejectedTitle: 'Archivo rechazado',
      rejectedDesc: 'El archivo no cumple con los requisitos de seguridad',
      errorTitle: 'Error',
      errorDesc: 'No se pudo validar el archivo',
    },
    identity: {
      sectionTitle: 'Identidad y billetera',
      sectionDesc: 'Gestiona cuentas conectadas y billetera cripto',
      checklistTitle: 'Lista de verificación de identidad',
      emailConnected: 'Email conectado',
      emailRequired: 'Email es obligatorio',
      telegramConnected: 'Telegram conectado',
      telegramNotLinked: 'Telegram no vinculado',
      telegramManual: 'Telegram (manual)',
      walletConnected: 'Billetera conectada',
      walletNotConnected: 'Billetera no conectada',
      required: 'Obligatorio',
      recommended: 'Recomendado',
      optional: 'Opcional',
      walletTitle: 'Billetera cripto',
      walletDesc: 'Conecta MetaMask para operaciones DAO y suscripción',
      connectMetaMask: 'Conectar MetaMask',
      disconnectWallet: 'Desconectar billetera',
      walletAddress: 'Dirección de billetera',
      copyAddress: 'Copiar dirección',
      addressCopied: 'Dirección copiada',
      installMetaMask: 'Instalar MetaMask',
      installMetaMaskDesc: 'MetaMask no encontrado. Instala la extensión del navegador.',
      connecting: 'Conectando...',
      walletVerified: 'Verificada',
      chainLabel: 'Red',
      telegramTitle: 'Telegram',
      telegramDesc: 'Conecta Telegram para comunicación en MicroDAO',
      telegramUsername: 'Nombre de usuario Telegram',
      telegramPlaceholder: '@username',
      telegramSave: 'Guardar',
      telegramSaved: 'Guardado',
      telegramVerifyBot: 'Verificar vía bot',
      telegramVerifyBotTooltip: 'Disponible en Sprint F3B',
      telegramStatusNotLinked: 'No vinculado',
      telegramStatusManual: 'Manual (no verificado)',
      telegramStatusVerified: 'Verificado',
      subscriptionTitle: 'Suscripción',
      subscriptionDesc: 'Suscripción cripto Leader Plan para activación de MicroDAO',
      leaderPlan: 'Leader Plan',
      leaderPlanPrice: '$20/mes',
      leaderPlanDaar: '2 DAAR/mes',
      daarRate: '1 DAAR = 10 USDT',
      acceptedAssets: 'Activos aceptados',
      testingMode: 'Modo de prueba',
      testingModeDesc: 'La creación de MicroDAO está temporalmente disponible sin pago.',
      onboardingIdentityTitle: 'Requisitos de identidad',
      onboardingIdentityDesc: 'Para activar una MicroDAO productiva con Community Spirit Agent, el líder necesitará:',
      onboardingLeaderRequires: 'Email, Telegram, billetera cripto y una suscripción activa Leader Plan',
      onboardingTestingNote: 'Modo de prueba: la creación está temporalmente disponible sin pago.',
      onboardingPriceNote: 'Leader Plan: $20/mes equivalente, pagable en DAAR o cripto compatible.',
      adminBillingTitle: 'Facturación cripto y suscripciones',
      adminBillingDesc: 'Vista general de suscripciones cripto MicroDAO y operaciones de pago',
      adminCryptoModel: 'Modelo de pago cripto',
      adminPricingBanner: 'Leader Plan — $20/mes equivalente',
      adminAcceptedLabel: 'Activos de pago aceptados',
      adminSubscriptionStates: 'Estados de suscripción',
      adminManualQueue: 'Cola de verificación manual',
      adminManualQueueDesc: 'Pagos que requieren confirmación manual del guardian.',
      adminFutureRoadmap: 'Hoja de ruta de desarrollo',
      adminF3B: 'Sprint F3B — Intent de pago cripto + verificación manual',
      adminF3C: 'Sprint F3C — On-chain watcher / verificación automática',
      adminFiatFallback: 'Futuro fiat fallback (Stripe) — opcional',
      adminNoSubscriptions: 'Sin suscripciones aún. Aparecerán tras la activación del Leader Plan.',
    },
    advancedAccess: {
      sectionTitle: 'Solicitar acceso avanzado',
      sectionDesc: 'Obtenga acceso a herramientas avanzadas y capacidades de red',
      selectProgram: 'Seleccionar programa',
      submitApplication: 'Enviar solicitud',
      applicationSent: 'Solicitud enviada con éxito',
      applicationSentDesc: 'Revisaremos su solicitud. Puede verificar el estado en la página de estado de acceso.',
      describePlaceholder: 'Describa su solicitud (qué programa de acceso le interesa y para qué fines)...',
      founderName: 'Founder Program',
      founderDesc: 'Acceso temprano y co-creación del producto',
      partnerName: 'Partner Access',
      partnerDesc: 'Gestión de múltiples MicroDAOs o espacios de clientes',
      sovereignName: 'Sovereign / Network Access',
      sovereignDesc: 'Infraestructura propia, edge/network/governance',
      workerNodeName: 'Worker Node / Sensitive Operator',
      workerNodeDesc: 'Operaciones de nodos e infraestructura sensible',
      statusPending: 'Pendiente de revisión',
      statusApproved: 'Aprobado',
      statusRejected: 'Rechazado',
      statusNeedsInfo: 'Necesita info',
      waitlistTitle: 'Estado de acceso avanzado',
      waitlistDesc: 'Esta página es para el estado de solicitud de acceso Founder, Partner, Sovereign u Operator. Se puede crear una MicroDAO regular directamente a través del onboarding.',
      waitlistRequestedProgram: 'Programa solicitado',
      waitlistNoRequest: 'No tiene solicitudes activas de acceso avanzado.',
      waitlistGenericPending: 'Acceso avanzado pendiente de revisión',
      adminTitle: 'Solicitudes de acceso',
      adminDesc: 'Revisar y verificar solicitudes de acceso para niveles Founder, Partner, Sovereign y Operator.',
      adminApproveMap: 'Al aprobar, establece access_tier en:',
      adminNoRequests: 'Actualmente no hay solicitudes activas de programas de acceso avanzado.',
      accessTierLabel: 'Nivel de acceso',
      accessTierDesc: 'Su nivel de acceso actual en el ecosistema DAARION',
      billingProgramsTitle: 'Programas de acceso',
      billingProgramsDesc: 'Tipos de acceso más allá de la suscripción estándar Leader Plan',
    },
    cryptoBilling: {
      buyGetDaar: 'Comprar / obtener DAAR',
      openGateway: 'Abrir DAARION Gateway',
      daarRequirementDesc: 'Se requiere DAAR para activar el Leader Plan y los módulos de agente.',
      createIntent: 'Crear intención de pago',
      paymentInstructions: 'Instrucciones de pago',
      polygonOnly: 'Solo red Polygon',
      treasuryAddress: 'Dirección del tesoro',
      submitTxHash: 'Enviar hash de transacción',
      invalidTxHash: 'Formato de hash de transacción no válido',
      waitingVerification: 'Esperando verificación del Guardian',
      paymentSubmitted: 'Pago enviado',
      paymentConfirmed: 'Pago confirmado',
      paymentRejected: 'Pago rechazado',
      manualReview: 'Revisión manual',
      activateLeaderPlan: 'Activar Leader Plan',
      leaderActive: 'Leader Plan Activo',
      leaderPendingPayment: 'Leader Plan Pago Pendiente',
      wrongNetworkWarning: 'Los pagos de otras redes (Ethereum, Base, etc.) no serán acreditados.',
      selectAsset: 'Seleccione activo de pago',
      paymentInstructionsDesc: 'Envíe el monto especificado en la red Polygon a la dirección del tesoro, luego ingrese el hash de su transacción a continuación.',
      txHashPlaceholder: 'Ingrese hash de transacción (0x...)',
      txHashFormatWarning: 'Solo verificación de formato básico. El Guardian verificará manualmente la transacción.',
      waitingVerificationDesc: 'Su pago fue enviado para verificación manual. Esto suele tardar hasta 24 horas.',
      intentExpired: 'Intención de pago expirada',
      intentCreated: 'Intención de pago creada',
      intentCreatedDesc: 'Esperando el pago a la billetera del tesoro.',
      intentFailed: 'Pago fallido',
      verifyActionApprove: 'Aprobar',
      verifyActionReject: 'Rechazar',
      verifyActionReview: 'Marcar Revisión',
      verifyQueueEmpty: 'No hay intenciones de pago que requieran confirmación manual.',
      verifyTableUser: 'Usuario',
      verifyTableAsset: 'Activo',
      verifyTableAmount: 'Monto',
      verifyTableHash: 'Hash de Tx',
      verifyTableStatus: 'Estado',
      verifyTableActions: 'Acciones',
      billingConfigTitle: 'Configuración del plan de facturación',
      leaderPlanUsdPrice: 'Precio del Leader Plan en USD',
      daarMonthlyAmount: 'Cantidad mensual de DAAR',
      daarUsdtRateLabel: 'Tarifa DAAR / USDT',
      acceptedAssetsLabel: 'Activos aceptados',
      paymentNetworkLabel: 'Red de pago',
      treasuryAddressLabel: 'Dirección del tesoro (EVM)',
      daarPurchaseUrlLabel: 'URL de compra de DAAR',
      planActiveLabel: 'Plan activo',
      savePricingConfigBtn: 'Guardar configuración de precios',
      changesApplyWarning: 'Los cambios se aplican solo a las nuevas intenciones de pago. Las suscripciones existentes y las intenciones de pago ya creadas no se recalculan.',
      pricingConfigUpdatedSuccess: 'Configuración de precios actualizada',
      invalidTreasuryAddressError: 'Dirección del tesoro no válida',
      invalidDaarPurchaseUrlError: 'URL de compra de DAAR no válida',
      verifyOnPolygon: 'Ejecutar diagnóstico',
      onchainVerification: 'Ventana de diagnóstico de transacción',
      verificationPending: 'Verificación pendiente',
      verificationFailed: 'Verificación fallida',
      verifiedOnchain: 'Diagnóstico de transacción aprobado',
      manualReviewRequired: 'Revisión manual requerida',
      txAlreadyUsed: 'Transacción ya utilizada',
      recipientMismatch: 'Falta de coincidencia del destinatario',
      amountTooLow: 'Cantidad demasiado baja',
      assetMismatch: 'Falta de coincidencia de activo',
      networkMismatch: 'Falta de coincidencia de red',
      senderWalletMismatch: 'Falta de coincidencia de billetera del remitente',
      viewOnPolygonScan: 'Ver en PolygonScan',
      diagnosticWarning: 'Esta es una verificación de diagnóstico del lado del cliente solo para revisión del Guardian. La aprobación final aún requiere confirmación del administrador a través del RPC seguro.',
    },
    adminAgent: {
      title: 'Agente Administrador',
      guardianAssistant: 'Agente Asistente del Guardian',
      readonlyMode: 'Modo de solo lectura',
      cannotPerformActions: 'El Agente Administrador es de solo lectura. No puede aprobar pagos, cambiar roles, invitar guardianes ni acceder a la memoria/mensajes/documentos privados de MicroDAO.',
      platformContext: 'Contexto de la Plataforma',
      billingContext: 'Contexto de Facturación',
      accessRequestsContext: 'Contexto de Solicitudes de Acceso',
      platformTeamContext: 'Contexto del Equipo de la Plataforma',
      microdaoOpsContext: 'Contexto de Operaciones de MicroDAO',
      agentOpsContext: 'Contexto de Operaciones del Agente',
      sqlChecks: 'Verificaciones SQL',
      nextStep: 'Siguiente paso',
      privateDataProtected: 'Los datos privados de MicroDAO están protegidos',
      askAgent: 'Preguntar al agente',
      generateDraftAnswer: 'Generar borrador de respuesta',
      placeholder: 'Haga una pregunta al agente administrador...',
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