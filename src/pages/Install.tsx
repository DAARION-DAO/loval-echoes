import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation, Language } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { PublicHeader } from '@/components/PublicHeader';
import { decodeDeviceConnectionIntent } from '@/services/deviceConnection';
import {
  Download,
  Monitor,
  Smartphone,
  ExternalLink,
  Shield,
  Cpu,
  Globe,
  Layers,
  Zap,
  Terminal,
  HardDrive,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Apple,
  Sparkles,
  MessageSquare,
  Vote,
  Coins,
  Wallet,
} from 'lucide-react';

/* ── Scroll-reveal hook (same as landing) ── */
function useScrollReveal() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const targets = root.querySelectorAll('.landing-reveal');

    // Fallback: reveal all after 1.5s if IntersectionObserver doesn't fire
    const fallbackTimer = setTimeout(() => {
      targets.forEach((t) => t.classList.add('visible'));
    }, 1500);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01 }
    );

    targets.forEach((t) => observer.observe(t));

    return () => {
      clearTimeout(fallbackTimer);
      observer.disconnect();
    };
  }, []);

  return containerRef;
}

const EDGE_CLIENT_RELEASE_TAG = "v0.2.2-3";
const EDGE_CLIENT_VERSION = "0.2.2-3";
const GITHUB_REPO = 'https://github.com/DAARION-DAO/daarion-edge-client';

const edgeClientAssetUrl = (filename: string) =>
  `${GITHUB_REPO}/releases/download/${EDGE_CLIENT_RELEASE_TAG}/${filename}`;

/* ── Localized Text Mapping ── */
const localTexts = {
  uk: {
    heroTitle: 'Підключіть пристрій до DAARION',
    heroSubtitle: 'Підготуйте цей пристрій для вашого MicroDAO: локальних агентів, майбутнього приватного виконання, захищеного доступу та режимів Worker Node, коли вони потрібні.',
    heroPrimaryCtaDevice: 'Підготувати цей пристрій',
    heroPrimaryCtaChoose: 'Обрати спосіб підключення',
    heroSecondaryCta: 'Відкрити веб-налаштування пристрою',
    heroHelper: 'Почніть у DAARION PWA. Нативний застосунок потрібен лише для локальних або привілейованих можливостей пристрою.',
    heroBadge: 'Device connection · Beta / Canary',
    intentBadge: 'Контекст MicroDAO додано',
    intentTitle: 'Підготовка пристрою для {community}',
    intentDesc: 'Цей перехід прийшов із Dashboard. Живий код підключення пристрою буде доступний після активації контракту підключення.',
    intentPending: 'Це ще не живий код підключення пристрою.',
    
    headerTitleMobile: 'Пристрій',
    
    platformsTitle: 'Підготуйте пристрій',
    platformsSubtitle: 'Використайте веб-налаштування або встановіть нативний застосунок, якщо потрібні локальні можливості.',
    quickStartTitle: 'Швидкий старт',
    nativeInstallersTitle: 'Нативний застосунок, коли потрібен',
    
    fallbackVersionDesc: 'Якщо нативний застосунок ще не доступний для вашої платформи, продовжуйте через веб-налаштування пристрою.',
    githubSourceLinkDesc: 'Для розробників: вихідний код доступний на GitHub.',
    githubRepositoryBtn: 'GitHub репозиторій',
    architectureLabel: 'Архітектура',
    formatLabel: 'Формат',
    versionLabel: 'Версія',
    devToolsLabel: 'Для розробників',
    sourceCodeGithub: 'Вихідний код на GitHub',

    webTitle: 'Веб-налаштування пристрою',
    webDesc: 'Почніть у браузері. Нативне встановлення не потрібне.',
    webCta: 'Відкрити налаштування пристрою',
    
    macSiliconCta: 'Підготувати Apple Silicon',
    macIntelCta: 'Підготувати Intel Mac',
    windowsCta: 'Підготувати Windows',
    windowsAltCta: 'Альтернативний інсталятор MSI',
    windowsHelper: 'Використовуйте MSI тільки якщо setup.exe не запускається.',
    linuxCta: 'Підготувати Linux',
    
    androidDesc: 'Потрібне ручне встановлення APK. Тестовий режим підготовки пристрою.',
    androidCta: 'Підготувати Android',
    
    iosDesc: 'iOS build буде додано пізніше.',
    iosCta: 'Скоро',
    
    statusActive: 'Активний',
    statusBeta: 'Beta',
    statusComingSoon: 'Скоро',
    statusSideload: 'Sideload',

    // New keys
    afterInstallTitle: 'Що відбувається після підключення пристрою?',
    step1: 'Підготуйте цей пристрій',
    step2: 'Увійдіть або створіть акаунт DAARION',
    step3: 'Створіть MicroDAO або приєднайтеся за запрошенням',
    step4: 'Активуйте Дух Спільноти — агента вашого DAO',
    step5: 'Запросіть учасників',
    step6: 'Налаштуйте ролі, памʼять, задачі та правила',
    step7: 'Поступово підключайте гаманець, казну, голосування й токени спільноти',

    unlocksTitle: 'Що відкриває підключений пристрій',
    unlockCard1Title: 'Дух Спільноти',
    unlockCard1Desc: 'Агент спільноти допомагає онбордити учасників, пояснювати правила, памʼятати домовленості, створювати задачі та готувати рішення.',
    unlockCard2Title: 'Децентралізований месенджер',
    unlockCard2Desc: 'Месенджер для спільноти, повʼязаний із ролями, памʼяттю, задачами та агентом MicroDAO.',
    unlockCard3Title: 'Казна й гаманець DAO',
    unlockCard3Desc: 'Майбутній гаманець, казна та платіжний шар MicroDAO для внесків, витрат, доступів і спільних рішень.',
    unlockCard4Title: 'Голосування та управління',
    unlockCard4Desc: 'Голосування, ролі, правила, пропозиції та управління DAO через Дух Спільноти.',
    unlockCard5Title: 'Фабрика токенів',
    unlockCard5Desc: 'Планується можливість випуску власних токенів MicroDAO через токен-фабрику міста DAARION.',
    unlockCard6Title: 'Захищений браузер і мережа',
    unlockCard6Desc: 'Майбутній захищений браузер, VPN/мережевий шар та приватний доступ для спільнот.',
    unlockCard7Title: 'Агенти-розробники',
    unlockCard7Desc: 'Доступ до агентів-розробників DAARION для створення власних платформ, інструментів і децентралізованих соціальних мереж.',

    roadmapTitle: 'План розвитку',
    roadmapSubtitle: 'Поточний статус функцій та етапи впровадження в екосистемі.',
    roadmapAvailableTitle: 'Доступно зараз',
    roadmapComingTitle: 'Готується найближчим часом',
    roadmapLaterTitle: 'План розвитку (1-3 місяці)',
    roadmapFutureTitle: 'У майбутньому',
    roadmapAvail1: 'Підготовка пристрою',
    roadmapAvail2: 'DAARION PWA як основний вхід',
    roadmapAvail3: 'Онбординг до MicroDAO',
    roadmapAvail4: 'Налаштування агента Дух Спільноти',
    roadmapComing1: 'децентралізований месенджер спільноти',
    roadmapComing2: 'розширення памʼяті агента',
    roadmapComing3: 'автоматизація запрошень та ролей',
    roadmapComing4: 'базовий шар гаманця та казни',
    roadmapLater1: 'токен-шар MicroDAO',
    roadmapLater2: 'інтеграція з токен-фабрикою',
    roadmapLater3: 'казна DAO',
    roadmapLater4: 'процеси голосування та управління',
    roadmapLater5: 'посилені локальні можливості пристрою',
    roadmapFuture1: 'децентралізований браузер',
    roadmapFuture2: 'VPN та захисний шар',
    roadmapFuture3: 'агенти-розробники для створення платформ і децентралізованих соцмереж',
  },
  en: {
    heroTitle: 'Connect your device to DAARION',
    heroSubtitle: 'Prepare this device for your MicroDAO: local agents, future private execution, protected access, and Worker Node modes when needed.',
    heroPrimaryCtaDevice: 'Prepare this device',
    heroPrimaryCtaChoose: 'Choose connection option',
    heroSecondaryCta: 'Open device setup on web',
    heroHelper: 'Start in the DAARION PWA. The native app is only needed for local or privileged device capabilities.',
    heroBadge: 'Device connection · Beta / Canary',
    intentBadge: 'MicroDAO context attached',
    intentTitle: 'Device setup for {community}',
    intentDesc: 'This handoff came from Dashboard. A live device pairing invite will become available after the device-connection contract is active.',
    intentPending: 'This is not a live device connection code yet.',
    
    headerTitleMobile: 'Device',
    
    platformsTitle: 'Prepare your device',
    platformsSubtitle: 'Use web setup or install the native app only when local capabilities are required.',
    quickStartTitle: 'Quick Start',
    nativeInstallersTitle: 'Native app when needed',
    
    fallbackVersionDesc: 'If the native app is not yet available for your platform, continue with device setup on web.',
    githubSourceLinkDesc: 'For developers: source code is available on GitHub.',
    githubRepositoryBtn: 'GitHub repository',
    architectureLabel: 'Architecture',
    formatLabel: 'Format',
    versionLabel: 'Version',
    devToolsLabel: 'For Developers',
    sourceCodeGithub: 'Source Code on GitHub',

    webTitle: 'Device setup on web',
    webDesc: 'Start in the browser. No native install required.',
    webCta: 'Open device setup',
    
    macSiliconCta: 'Prepare Apple Silicon',
    macIntelCta: 'Prepare Intel Mac',
    windowsCta: 'Prepare Windows',
    windowsAltCta: 'Alternative MSI installer',
    windowsHelper: 'Use MSI only if setup.exe does not launch.',
    linuxCta: 'Prepare Linux',
    
    androidDesc: 'Manual APK installation required. Testing device setup mode.',
    androidCta: 'Prepare Android',
    
    iosDesc: 'iOS build will be added later.',
    iosCta: 'Soon',
    
    statusActive: 'Active',
    statusBeta: 'Beta',
    statusComingSoon: 'Soon',
    statusSideload: 'Sideload',

    // New keys
    afterInstallTitle: 'What happens after connecting a device?',
    step1: 'Prepare this device',
    step2: 'Sign in or create DAARION account',
    step3: 'Create or join a MicroDAO',
    step4: 'Activate Community Spirit Agent',
    step5: 'Invite members',
    step6: 'Configure roles, memory, tasks, and rules',
    step7: 'Connect future wallet, treasury, voting, and token features as they become available',

    unlocksTitle: 'What a connected device unlocks',
    unlockCard1Title: 'Community Spirit Agent',
    unlockCard1Desc: 'The community agent helps onboard members, explain rules, remember agreements, create tasks, and prepare decisions.',
    unlockCard2Title: 'Decentralized Messenger',
    unlockCard2Desc: 'A community messenger linked with roles, memory, tasks, and the MicroDAO agent.',
    unlockCard3Title: 'DAO Treasury & Wallet',
    unlockCard3Desc: 'Future wallet, treasury, and payment layer of MicroDAO for contributions, expenses, access, and joint decisions.',
    unlockCard4Title: 'Voting & Governance',
    unlockCard4Desc: 'Voting, roles, rules, proposals, and DAO governance through the Community Spirit.',
    unlockCard5Title: 'Token Factory',
    unlockCard5Desc: 'Planned ability to issue your own MicroDAO tokens through the DAARION city token factory.',
    unlockCard6Title: 'Protected Browser & Network',
    unlockCard6Desc: 'Future secure browser, VPN/network layer, and private access for communities.',
    unlockCard7Title: 'Developer Agents',
    unlockCard7Desc: 'Access to DAARION developer agents to create your own platforms, tools, and decentralized social networks.',

    roadmapTitle: 'Status / Roadmap',
    roadmapSubtitle: 'Current status of features and development stages.',
    roadmapAvailableTitle: 'Available now',
    roadmapComingTitle: 'Coming next',
    roadmapLaterTitle: 'Roadmap (1-3 months)',
    roadmapFutureTitle: 'Future',
    roadmapAvail1: 'Device preparation',
    roadmapAvail2: 'DAARION PWA as the main entry',
    roadmapAvail3: 'MicroDAO onboarding',
    roadmapAvail4: 'Community Spirit Agent setup',
    roadmapComing1: 'decentralized community messenger',
    roadmapComing2: 'agent memory expansion',
    roadmapComing3: 'invite and role automation',
    roadmapComing4: 'wallet / treasury foundation',
    roadmapLater1: 'MicroDAO token layer',
    roadmapLater2: 'token factory integration',
    roadmapLater3: 'DAO treasury',
    roadmapLater4: 'voting/governance flows',
    roadmapLater5: 'stronger local device capabilities',
    roadmapFuture1: 'decentralized browser',
    roadmapFuture2: 'VPN/protection layer',
    roadmapFuture3: 'developer agents for building platforms and decentralized social networks',
  },
  ru: {
    heroTitle: 'Подключите устройство к DAARION',
    heroSubtitle: 'Подготовьте это устройство для вашего MicroDAO: локальных агентов, будущего приватного выполнения, защищенного доступа и режимов Worker Node, когда они нужны.',
    heroPrimaryCtaDevice: 'Подготовить это устройство',
    heroPrimaryCtaChoose: 'Выбрать способ подключения',
    heroSecondaryCta: 'Открыть веб-настройку устройства',
    heroHelper: 'Начните в DAARION PWA. Нативное приложение нужно только для локальных или привилегированных возможностей устройства.',
    heroBadge: 'Device connection · Beta / Canary',
    intentBadge: 'Контекст MicroDAO добавлен',
    intentTitle: 'Подготовка устройства для {community}',
    intentDesc: 'Этот переход пришел из Dashboard. Живой код подключения устройства будет доступен после активации контракта подключения.',
    intentPending: 'Это еще не живой код подключения устройства.',
    
    headerTitleMobile: 'Устройство',
    
    platformsTitle: 'Подготовьте устройство',
    platformsSubtitle: 'Используйте веб-настройку или установите нативное приложение, если нужны локальные возможности.',
    quickStartTitle: 'Быстрый старт',
    nativeInstallersTitle: 'Нативное приложение, когда нужно',
    
    fallbackVersionDesc: 'Если нативное приложение еще не доступно для вашей платформы, продолжайте через веб-настройку устройства.',
    githubSourceLinkDesc: 'Для разработчиков: исходный код доступен на GitHub.',
    githubRepositoryBtn: 'GitHub репозиторий',
    architectureLabel: 'Архитектура',
    formatLabel: 'Format',
    versionLabel: 'Версия',
    devToolsLabel: 'Для разработчиков',
    sourceCodeGithub: 'Исходный код на GitHub',

    webTitle: 'Веб-настройка устройства',
    webDesc: 'Начните в браузере. Нативная установка не требуется.',
    webCta: 'Открыть настройку устройства',
    
    macSiliconCta: 'Подготовить Apple Silicon',
    macIntelCta: 'Подготовить Intel Mac',
    windowsCta: 'Подготовить Windows',
    windowsAltCta: 'Альтернативный инсталлятор MSI',
    windowsHelper: 'Используйте MSI только если setup.exe не запускается.',
    linuxCta: 'Подготовить Linux',
    
    androidDesc: 'Требуется ручная установка APK. Тестовый режим подготовки устройства.',
    androidCta: 'Подготовить Android',
    
    iosDesc: 'iOS сборка будет добавлена позже.',
    iosCta: 'Скоро',
    
    statusActive: 'Активен',
    statusBeta: 'Beta',
    statusComingSoon: 'Скоро',
    statusSideload: 'Sideload',

    // New keys
    afterInstallTitle: 'Что происходит после подключения устройства?',
    step1: 'Подготовьте это устройство',
    step2: 'Войдите или создайте аккаунт DAARION',
    step3: 'Создайте MicroDAO или присоединитесь по приглашению',
    step4: 'Активируйте Дух Сообщества — агента вашего DAO',
    step5: 'Пригласите участников',
    step6: 'Настройте роли, память, задачи и правила',
    step7: 'Постепенно подключайте кошелек, казну, голосования и токены сообщества',

    unlocksTitle: 'Что открывает подключенное устройство',
    unlockCard1Title: 'Дух Сообщества',
    unlockCard1Desc: 'Агент сообщества помогает онбордить участников, объяснять правила, помнить договоренности, создавать задачи и готовить решения.',
    unlockCard2Title: 'Децентрализованный мессенджер',
    unlockCard2Desc: 'Мессенджер для сообщества, связанный с ролями, памятью, задачами и агентом MicroDAO.',
    unlockCard3Title: 'Казна и кошелек DAO',
    unlockCard3Desc: 'Будущий кошелек, казна и платежный слой MicroDAO для взносов, расходов, доступов и совместных решений.',
    unlockCard4Title: 'Голосования и управление',
    unlockCard4Desc: 'Голосования, роли, правила, предложения и управление DAO через Дух Сообщества.',
    unlockCard5Title: 'Фабрика токенов',
    unlockCard5Desc: 'Планируется возможность выпуска собственных токенов MicroDAO через токен-фабрику города DAARION.',
    unlockCard6Title: 'Защищенный браузер и сеть',
    unlockCard6Desc: 'Будущий защищенный браузер, VPN/сетевой слой и приватный доступ для сообществ.',
    unlockCard7Title: 'Агенты-разработчики',
    unlockCard7Desc: 'Доступ к агентам-разработчикам DAARION для создания собственных платформ, инструментов и децентрализованных социальных сетей.',

    roadmapTitle: 'План развития',
    roadmapSubtitle: 'Текущий статус функций и этапы внедрения в экосистеме.',
    roadmapAvailableTitle: 'Доступно сейчас',
    roadmapComingTitle: 'Готовится в ближайшее время',
    roadmapLaterTitle: 'План развития (1-3 месяца)',
    roadmapFutureTitle: 'В будущем',
    roadmapAvail1: 'Подготовка устройства',
    roadmapAvail2: 'DAARION PWA как основной вход',
    roadmapAvail3: 'Онбординг в MicroDAO',
    roadmapAvail4: 'Настройка агента Дух Сообщества',
    roadmapComing1: 'децентрализованный мессенджер сообщества',
    roadmapComing2: 'расширение памяти агента',
    roadmapComing3: 'автоматизация приглашений и ролей',
    roadmapComing4: 'базовый слой кошелька и казны',
    roadmapLater1: 'токен-слой MicroDAO',
    roadmapLater2: 'интеграция с токен-фабрикой',
    roadmapLater3: 'казна DAO',
    roadmapLater4: 'процессы голосования и управления',
    roadmapLater5: 'усиленные локальные возможности устройства',
    roadmapFuture1: 'децентрализованный браузер',
    roadmapFuture2: 'VPN и защитный слой',
    roadmapFuture3: 'агенты-разработчики для создания платформ и децентрализованных соцсети',
  },
  es: {
    heroTitle: 'Conecta tu dispositivo a DAARION',
    heroSubtitle: 'Prepara este dispositivo para tu MicroDAO: agentes locales, futura ejecución privada, acceso protegido y modos Worker Node cuando sean necesarios.',
    heroPrimaryCtaDevice: 'Preparar este dispositivo',
    heroPrimaryCtaChoose: 'Elegir opción de conexión',
    heroSecondaryCta: 'Abrir configuración web del dispositivo',
    heroHelper: 'Empieza en la DAARION PWA. La app nativa solo se necesita para capacidades locales o privilegiadas del dispositivo.',
    heroBadge: 'Device connection · Beta / Canary',
    intentBadge: 'Contexto de MicroDAO adjunto',
    intentTitle: 'Preparación del dispositivo para {community}',
    intentDesc: 'Esta transición vino desde Dashboard. La invitación real del dispositivo estará disponible cuando el contrato de conexión esté activo.',
    intentPending: 'Esto todavía no es un código real de conexión del dispositivo.',
    
    headerTitleMobile: 'Dispositivo',
    
    platformsTitle: 'Prepara tu dispositivo',
    platformsSubtitle: 'Usa la configuración web o instala la app nativa solo cuando se requieran capacidades locales.',
    quickStartTitle: 'Inicio rápido',
    nativeInstallersTitle: 'App nativa cuando sea necesaria',
    
    fallbackVersionDesc: 'Si la app nativa aún no está disponible para su plataforma, continúe con la configuración web del dispositivo.',
    githubSourceLinkDesc: 'Para desarrolladores: el código fuente está disponible en GitHub.',
    githubRepositoryBtn: 'Repositorio de GitHub',
    architectureLabel: 'Arquitectura',
    formatLabel: 'Formato',
    versionLabel: 'Versión',
    devToolsLabel: 'Para desarrolladores',
    sourceCodeGithub: 'Código fuente en GitHub',

    webTitle: 'Configuración web del dispositivo',
    webDesc: 'Empieza en el navegador. No requiere instalación nativa.',
    webCta: 'Abrir configuración del dispositivo',
    
    macSiliconCta: 'Preparar Apple Silicon',
    macIntelCta: 'Preparar Intel Mac',
    windowsCta: 'Preparar Windows',
    windowsAltCta: 'Instalador MSI alternativo',
    windowsHelper: 'Use MSI solo si setup.exe no se ejecuta.',
    linuxCta: 'Preparar Linux',
    
    androidDesc: 'Se requiere instalación manual de APK. Modo de prueba para preparar el dispositivo.',
    androidCta: 'Preparar Android',
    
    iosDesc: 'La compilación de iOS se agregará más tarde.',
    iosCta: 'Próximamente',
    
    statusActive: 'Activo',
    statusBeta: 'Beta',
    statusComingSoon: 'Próximamente',
    statusSideload: 'Sideload',

    // New keys
    afterInstallTitle: '¿Qué ocurre después de conectar un dispositivo?',
    step1: 'Prepara este dispositivo',
    step2: 'Inicia sesión o crea una cuenta de DAARION',
    step3: 'Crea o únete a una MicroDAO por invitación',
    step4: 'Activa el Agente de Espíritu Comunitario de tu DAO',
    step5: 'Invita a miembros',
    step6: 'Configura roles, memoria, tareas y reglas',
    step7: 'Conecta la billetera futura, la tesorería, las votaciones y los tokens de la comunidad a medida que estén disponibles',

    unlocksTitle: 'Lo que desbloquea un dispositivo conectado',
    unlockCard1Title: 'Agente de Espíritu Comunitario',
    unlockCard1Desc: 'El agente comunitario ayuda a incorporar miembros, explicar reglas, recordar acuerdos, crear tareas y preparar decisiones.',
    unlockCard2Title: 'Mensajero Descentralizado',
    unlockCard2Desc: 'Mensajería comunitaria vinculada con roles, memoria, tareas y el agente de MicroDAO.',
    unlockCard3Title: 'Tesorería y Billetera de la DAO',
    unlockCard3Desc: 'Futura billetera, tesorería y capa de pago de MicroDAO para contribuciones, gastos, accesos y decisiones conjuntas.',
    unlockCard4Title: 'Votaciones y Gobernanza',
    unlockCard4Desc: 'Votaciones, roles, reglas, propuestas y gobernanza de la DAO a través del Espíritu Comunitario.',
    unlockCard5Title: 'Fábrica de Tokens',
    unlockCard5Desc: 'Capacidad planificada para emitir sus propios tokens de MicroDAO a través de la fábrica de tokens de la ciudad de DAARION.',
    unlockCard6Title: 'Navegador y Red Protegidos',
    unlockCard6Desc: 'Futuro navegador seguro, capa de red/VPN y acceso privado para comunidades.',
    unlockCard7Title: 'Agentes Desarrolladores',
    unlockCard7Desc: 'Acceso a agentes desarrolladores de DAARION para crear sus propias plataformas, herramientas y redes sociales descentralizadas.',

    roadmapTitle: 'Estado / Plan de desarrollo',
    roadmapSubtitle: 'Estado actual de las funciones y etapas de implementación en el escenario del ecosistema.',
    roadmapAvailableTitle: 'Disponible ahora',
    roadmapComingTitle: 'Próximamente',
    roadmapLaterTitle: 'Plan de desarrollo (1-3 meses)',
    roadmapFutureTitle: 'Futuro',
    roadmapAvail1: 'Preparación del dispositivo',
    roadmapAvail2: 'DAARION PWA como entrada principal',
    roadmapAvail3: 'Inducción a MicroDAO',
    roadmapAvail4: 'Configuración del Agente de Espíritu Comunitario',
    roadmapComing1: 'mensajería comunitaria descentralizada',
    roadmapComing2: 'expansión de memoria del agente',
    roadmapComing3: 'automatización de invitaciones y roles',
    roadmapComing4: 'base de billetera y tesorería',
    roadmapLater1: 'capa de tokens de MicroDAO',
    roadmapLater2: 'integración de fábrica de tokens',
    roadmapLater3: 'tesorería de la DAO',
    roadmapLater4: 'flujos de votación y gobernanza',
    roadmapLater5: 'capacidades locales del dispositivo más sólidas',
    roadmapFuture1: 'navegador descentralizado',
    roadmapFuture2: 'capa de protección/VPN',
    roadmapFuture3: 'agentes desarrolladores para crear plataformas y redes sociales descentralizadas',
  }
};

/* ── Platform data ── */
function getPlatforms(t: any, texts: any) {
  return [
    {
      id: 'mac-silicon',
      name: t.clientInstall.macSilicon || 'macOS Apple Silicon',
      arch: 'ARM64 · M1 / M2 / M3 / M4',
      format: '.dmg',
      icon: Apple,
      status: 'active' as const,
      statusLabel: texts.statusBeta,
      cta: texts.macSiliconCta,
      downloadUrl: edgeClientAssetUrl(`Daarion.Edge_${EDGE_CLIENT_VERSION}_aarch64.dmg`),
    },
    {
      id: 'mac-intel',
      name: t.clientInstall.macIntel || 'macOS Intel',
      arch: 'x64 Intel Mac',
      format: '.dmg',
      icon: Apple,
      status: 'active' as const,
      statusLabel: texts.statusBeta,
      cta: texts.macIntelCta,
      downloadUrl: edgeClientAssetUrl(`Daarion.Edge_${EDGE_CLIENT_VERSION}_x64.dmg`),
    },
    {
      id: 'windows',
      name: t.clientInstall.windows || 'Windows',
      arch: 'x64',
      format: 'setup.exe',
      icon: Monitor,
      status: 'active' as const,
      statusLabel: texts.statusBeta,
      cta: texts.windowsCta,
      downloadUrl: edgeClientAssetUrl(`Daarion.Edge_${EDGE_CLIENT_VERSION}_x64-setup.exe`),
      secondaryUrl: edgeClientAssetUrl(`Daarion.Edge_${EDGE_CLIENT_VERSION}_x64_en-US.msi`),
      secondaryCta: texts.windowsAltCta,
      helperText: texts.windowsHelper,
    },
    {
      id: 'linux',
      name: t.clientInstall.linux || 'Linux',
      arch: 'Ubuntu / Debian / compatible Linux',
      format: '.AppImage',
      icon: Terminal,
      status: 'active' as const,
      statusLabel: texts.statusBeta,
      cta: texts.linuxCta,
      downloadUrl: edgeClientAssetUrl(`Daarion.Edge_${EDGE_CLIENT_VERSION}_amd64.AppImage`),
    },
    {
      id: 'android',
      name: t.clientInstall.android || 'Android',
      arch: texts.androidDesc,
      format: '.apk',
      icon: Smartphone,
      status: 'active' as const,
      statusLabel: texts.statusSideload,
      cta: texts.androidCta,
      downloadUrl: edgeClientAssetUrl(`Daarion.Edge_${EDGE_CLIENT_VERSION}_android_universal_release.apk`),
    },
    {
      id: 'ios',
      name: 'iOS',
      arch: texts.iosDesc,
      format: 'App Store',
      icon: Smartphone,
      status: 'coming' as const,
      statusLabel: texts.statusComingSoon,
      cta: texts.iosCta,
      downloadUrl: null,
    },
  ];
}

function getArchitectureLayers(t: any) {
  return [
    {
      level: 'L1',
      title: t.clientInstall.l1Title,
      subtitle: t.clientInstall.l1Subtitle,
      icon: Shield,
      color: 'from-emerald-500/20 to-teal-500/20',
      points: [
        t.clientInstall.l1Point1,
        t.clientInstall.l1Point2,
        t.clientInstall.l1Point3,
        t.clientInstall.l1Point4,
      ],
    },
    {
      level: 'L2',
      title: t.clientInstall.l2Title,
      subtitle: t.clientInstall.l2Subtitle,
      icon: Cpu,
      color: 'from-blue-500/20 to-indigo-500/20',
      points: [
        t.clientInstall.l2Point1,
        t.clientInstall.l2Point2,
        t.clientInstall.l2Point3,
        t.clientInstall.l2Point4,
      ],
    },
    {
      level: 'L3',
      title: t.clientInstall.l3Title,
      subtitle: t.clientInstall.l3Subtitle,
      icon: HardDrive,
      color: 'from-violet-500/20 to-purple-500/20',
      points: [
        t.clientInstall.l3Point1,
        t.clientInstall.l3Point2,
        t.clientInstall.l3Point3,
        t.clientInstall.l3Point4,
      ],
    },
  ];
}

export function Install() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollRef = useScrollReveal();
  const { t, language } = useTranslation();

  const texts = localTexts[language as Language] || localTexts.en;
  const platforms = getPlatforms(t, texts);
  const architectureLayers = getArchitectureLayers(t);
  const deviceIntentToken = searchParams.get('deviceIntent');
  const deviceIntent = useMemo(
    () => decodeDeviceConnectionIntent(deviceIntentToken),
    [deviceIntentToken],
  );

  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMac = ua.includes('macintosh') || ua.includes('mac os');
    const isWindows = ua.includes('windows');
    const isAndroid = ua.includes('android');
    const isIos = ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod');
    const isLinux = ua.includes('linux') && !isAndroid;

    if (isMac) {
      const isAppleSilicon = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0) || 
                            (ua.includes('macintosh') && !ua.includes('intel'));
      if (isAppleSilicon) {
        setDetectedPlatform('mac-silicon');
      } else {
        setDetectedPlatform('mac-intel');
      }
    } else if (isWindows) {
      setDetectedPlatform('windows');
    } else if (isLinux) {
      setDetectedPlatform('linux');
    } else if (isAndroid) {
      setDetectedPlatform('android');
    } else if (isIos) {
      setDetectedPlatform('ios');
    }
  }, []);

  const getHeroPrimaryCtaLabel = () => {
    if (detectedPlatform && ['mac-silicon', 'mac-intel', 'windows', 'linux', 'android'].includes(detectedPlatform)) {
      return texts.heroPrimaryCtaDevice;
    }
    return texts.heroPrimaryCtaChoose;
  };

  const handleHeroPrimaryClick = () => {
    if (detectedPlatform) {
      const targetCard = document.getElementById(`platform-card-${detectedPlatform}`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('glow-highlight');
        setTimeout(() => {
          targetCard.classList.remove('glow-highlight');
        }, 2000);
        return;
      }
    }
    document.getElementById('platforms')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToPlatforms = () => {
    document.getElementById('platforms')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={scrollRef} className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      <style>{`
        @keyframes glow {
          0%, 100% { border-color: rgba(16, 185, 129, 0.4); box-shadow: 0 0 0 rgba(16, 185, 129, 0); }
          50% { border-color: rgb(16, 185, 129); box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
        }
        .glow-highlight {
          animation: glow 2s ease-in-out;
        }
      `}</style>

      <PublicHeader
        active="install"
        backToHome
        logoSrc="/daarion-logo.jpg"
        logoAlt="DAARION"
        title={texts.heroTitle}
        mobileTitle={texts.headerTitleMobile}
        primaryLabel={getHeroPrimaryCtaLabel()}
        primaryIcon={<Download className="h-3.5 w-3.5" />}
        onPrimaryClick={handleHeroPrimaryClick}
        primaryClassName="bg-emerald-600 text-white hover:bg-emerald-500"
        showInstallPrompt
      />

      {/* ── Hero ── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background orbs */}
        <div className="landing-orb absolute top-16 left-[20%] w-72 h-72 bg-emerald-500/6 rounded-full blur-[100px]" />
        <div className="landing-orb absolute bottom-10 right-[15%] w-80 h-80 bg-primary/6 rounded-full blur-[120px]" style={{ animationDelay: '3s' }} />

        <div className="container max-w-5xl mx-auto px-4 text-center relative z-10 landing-hero-enter">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs px-3.5 py-1 mb-6">
            <Lock className="h-3 w-3 mr-1" />
            {texts.heroBadge}
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto landing-gradient-text bg-gradient-to-r from-foreground via-emerald-400 to-foreground pb-2">
            {texts.heroTitle}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4 mb-10">
            {texts.heroSubtitle}
          </p>

          {deviceIntent && (
            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-left shadow-lg">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <Badge variant="outline" className="border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-300">
                    {texts.intentBadge}
                  </Badge>
                  <h2 className="text-base font-bold text-foreground">
                    {texts.intentTitle.replace('{community}', deviceIntent.community_name)}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {texts.intentDesc}
                  </p>
                  <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                    <span>{texts.intentPending}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
            <Button
              size="lg"
              onClick={handleHeroPrimaryClick}
              className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Download className="h-5 w-5" />
              {getHeroPrimaryCtaLabel()}
            </Button>
            <a href="https://edge.daarion.city" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-1.5 border-border/60 hover:bg-muted/30 text-foreground"
              >
                <Globe className="h-4 w-4" />
                {texts.heroSecondaryCta}
                <ExternalLink className="h-3.5 w-3.5 ml-0.5 opacity-50" />
              </Button>
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{texts.heroHelper}</p>
        </div>
      </section>

      {/* ── Platforms ── */}
      <section id="platforms" className="py-16 md:py-24 bg-gradient-to-b from-muted/5 to-muted/15 border-t border-border/10">
        <div className="container max-w-5xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.platformsTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {texts.platformsSubtitle}
            </p>
          </div>

          {/* Quick Start (Web/PWA) */}
          <div className="landing-reveal bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                <Globe className="h-6 sm:h-7 sm:w-7 w-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-0.5">{texts.quickStartTitle}</span>
                <h4 className="font-extrabold text-lg sm:text-xl text-foreground">{texts.webTitle}</h4>
                <p className="text-sm text-muted-foreground mt-0.5">{texts.webDesc}</p>
              </div>
            </div>
            <a href="https://edge.daarion.city" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
              <Button className="w-full md:w-auto h-10 px-6 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-2">
                <Globe className="h-4 w-4" />
                <span>{texts.webCta}</span>
              </Button>
            </a>
          </div>

          {/* Native Installers */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-left pt-6 border-t border-border/10 landing-reveal">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span>{texts.nativeInstallersTitle}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 landing-stagger">
              {platforms.map((platform, index) => (
                <Card
                  key={index}
                  id={`platform-card-${platform.id}`}
                  className="landing-reveal landing-card-hover group bg-card/30 backdrop-blur-md border border-border/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="space-y-3">
                    {/* Row 1: Icon, Title, Badge */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-primary/8 group-hover:bg-primary/15 transition-colors flex-shrink-0">
                          <platform.icon className="h-5 w-5 text-primary" />
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-foreground truncate">{platform.name}</h4>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-[9px] px-1.5 py-0.5 font-medium flex-shrink-0 ${
                          platform.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                            : platform.status === 'coming'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {platform.status === 'active' && <CheckCircle2 className="h-2 w-2 mr-1 inline" />}
                        {platform.statusLabel}
                      </Badge>
                    </div>

                    {/* Row 2 & 3: Architecture & Format */}
                    <div className="space-y-1 text-xs text-left pt-1">
                      <p className="text-muted-foreground text-[11px] sm:text-xs">
                        <span className="text-muted-foreground/50 mr-1">{texts.architectureLabel}:</span>
                        <span className="text-foreground/90 font-medium">{platform.arch}</span>
                      </p>
                      <p className="text-muted-foreground text-[11px] sm:text-xs">
                        <span className="text-muted-foreground/50 mr-1">{texts.formatLabel}:</span>
                        <span className="font-mono text-foreground/80">{platform.format}</span>
                      </p>
                    </div>
                  </div>

                  {/* Row 4: Buttons */}
                  <div className="mt-4 pt-3 border-t border-border/10 space-y-2">
                    {platform.downloadUrl ? (
                      <a
                        href={platform.downloadUrl}
                        className="block w-full"
                      >
                        <Button
                          className="w-full h-9 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>{platform.cta}</span>
                        </Button>
                      </a>
                    ) : (
                      <Button
                        disabled
                        className="w-full h-9 text-xs font-semibold gap-1.5"
                      >
                        <span>{platform.cta}</span>
                      </Button>
                    )}

                    {platform.secondaryUrl && (
                      <div className="pt-1 flex flex-col gap-1 items-center">
                        <a
                          href={platform.secondaryUrl}
                          className="text-[10px] text-primary hover:underline font-semibold"
                        >
                          {platform.secondaryCta}
                        </a>
                        {platform.helperText && (
                          <span className="text-[9px] text-muted-foreground/70 text-center block max-w-xs leading-normal">
                            {platform.helperText}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="p-4 bg-muted/20 border border-border/20 rounded-2xl max-w-2xl mx-auto text-center text-xs text-muted-foreground/95">
            {texts.fallbackVersionDesc}
          </div>
        </div>
      </section>

      {/* ── What happens after connecting a device? ── */}
      <section className="py-16 md:py-24 border-t border-border/10 bg-muted/5 relative">
        <div className="landing-orb absolute top-10 left-[10%] w-60 h-60 bg-emerald-500/5 rounded-full blur-[80px]" />
        <div className="container max-w-5xl mx-auto px-4 space-y-10 relative z-10">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.afterInstallTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {language === 'uk' ? 'Простий шлях від MicroDAO до готового пристрою та першої корисної дії.' :
               language === 'ru' ? 'Простой путь от MicroDAO к готовому устройству и первому полезному действию.' :
               language === 'es' ? 'Un camino simple desde MicroDAO hasta un dispositivo listo y la primera acción útil.' :
               'A simple path from MicroDAO to a ready device and the first useful action.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 landing-stagger">
            {[
              { num: '01', text: texts.step1, icon: Download },
              { num: '02', text: texts.step2, icon: Shield },
              { num: '03', text: texts.step3, icon: Layers },
              { num: '04', text: texts.step4, icon: Zap },
              { num: '05', text: texts.step5, icon: Globe },
              { num: '06', text: texts.step6, icon: Cpu },
              { num: '07', text: texts.step7, icon: Wallet },
            ].map((step, idx) => (
              <Card
                key={idx}
                className="landing-reveal landing-card-hover bg-card/30 backdrop-blur-md border border-border/40 rounded-2xl p-5 relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="absolute top-3 right-3 text-4xl font-black text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors pointer-events-none">
                  {step.num}
                </div>
                <div className="space-y-4">
                  <div className="p-2.5 bg-emerald-500/10 w-fit rounded-xl text-emerald-400">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm text-foreground/90 font-medium leading-relaxed text-left">
                    {step.text}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── What a connected device unlocks ── */}
      <section className="py-16 md:py-24 border-t border-border/10 relative">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.unlocksTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {language === 'uk' ? 'Підключений пристрій розширює можливості MicroDAO без потреби розуміти технічний runtime.' :
               language === 'ru' ? 'Подключенное устройство расширяет возможности MicroDAO без необходимости понимать технический runtime.' :
               language === 'es' ? 'Un dispositivo conectado amplía las capacidades de MicroDAO sin exigir entender el runtime técnico.' :
               'A connected device extends MicroDAO capabilities without asking users to understand the technical runtime.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 landing-stagger">
            {[
              { title: texts.unlockCard1Title, desc: texts.unlockCard1Desc, icon: Sparkles, badge: 'Agent' },
              { title: texts.unlockCard2Title, desc: texts.unlockCard2Desc, icon: MessageSquare, badge: 'P2P Messenger' },
              { title: texts.unlockCard3Title, desc: texts.unlockCard3Desc, icon: Wallet, badge: 'Treasury' },
              { title: texts.unlockCard4Title, desc: texts.unlockCard4Desc, icon: Vote, badge: 'Governance' },
              { title: texts.unlockCard5Title, desc: texts.unlockCard5Desc, icon: Coins, badge: 'Token Layer' },
              { title: texts.unlockCard6Title, desc: texts.unlockCard6Desc, icon: Globe, badge: 'Secure Net' },
              { title: texts.unlockCard7Title, desc: texts.unlockCard7Desc, icon: Cpu, badge: 'Dev Agents' },
            ].map((item, idx) => (
              <Card
                key={idx}
                className={`landing-reveal landing-card-hover bg-card/30 backdrop-blur-md border border-border/40 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-300 ${
                  idx === 6 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-semibold border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
                      {item.badge}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-base text-foreground">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Status / Roadmap ── */}
      <section className="py-16 md:py-24 border-t border-border/10 bg-muted/5 relative">
        <div className="landing-orb absolute bottom-10 right-[10%] w-64 h-64 bg-emerald-500/5 rounded-full blur-[90px]" />
        <div className="container max-w-5xl mx-auto px-4 space-y-12 relative z-10">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.roadmapTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {texts.roadmapSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 landing-stagger">
            {/* 1. Available Now */}
            <Card className="landing-reveal bg-card/20 border-emerald-500/20 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{texts.roadmapAvailableTitle}</span>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0.5">Live</Badge>
                </div>
                <ul className="space-y-2.5 pt-2">
                  {[texts.roadmapAvail1, texts.roadmapAvail2, texts.roadmapAvail3, texts.roadmapAvail4].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* 2. Coming Next */}
            <Card className="landing-reveal bg-card/20 border-blue-500/20 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-400">{texts.roadmapComingTitle}</span>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[9px] px-1.5 py-0.5">Soon</Badge>
                </div>
                <ul className="space-y-2.5 pt-2">
                  {[texts.roadmapComing1, texts.roadmapComing2, texts.roadmapComing3, texts.roadmapComing4].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* 3. Roadmap (1-3 months) */}
            <Card className="landing-reveal bg-card/20 border-violet-500/20 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400">{texts.roadmapLaterTitle}</span>
                  <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[9px] px-1.5 py-0.5">1-3M</Badge>
                </div>
                <ul className="space-y-2.5 pt-2">
                  {[texts.roadmapLater1, texts.roadmapLater2, texts.roadmapLater3, texts.roadmapLater4, texts.roadmapLater5].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>

            {/* 4. Future */}
            <Card className="landing-reveal bg-card/20 border-border/40 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between shadow-lg">
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{texts.roadmapFutureTitle}</span>
                  <Badge className="bg-muted text-muted-foreground border-border/20 text-[9px] px-1.5 py-0.5">Future</Badge>
                </div>
                <ul className="space-y-2.5 pt-2">
                  {[texts.roadmapFuture1, texts.roadmapFuture2, texts.roadmapFuture3].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-foreground/80">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 mt-1.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Architecture Layers ── */}
      <section className="py-16 md:py-24 border-t border-border/10">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.clientInstall.archLayersTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              {t.clientInstall.archLayersSubtitle}
            </p>
          </div>

          <div className="space-y-5 landing-stagger">
            {architectureLayers.map((layer, index) => (
              <div
                key={index}
                className={`landing-reveal landing-card-hover group relative bg-card/20 backdrop-blur-sm border border-border/30 rounded-2xl p-6 sm:p-8 overflow-hidden`}
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-r ${layer.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                <div className="relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-8">
                  {/* Left — icon & label */}
                  <div className="flex items-start gap-4 sm:min-w-[200px]">
                    <div className="landing-number inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 text-primary font-extrabold text-lg flex-shrink-0">
                      {layer.level}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-foreground">{layer.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{layer.subtitle}</p>
                    </div>
                  </div>

                  {/* Right — points */}
                  <ul className="flex-1 space-y-2">
                    {layer.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary/70 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground/80">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security & Updates ── */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/5 to-muted/15 border-t border-border/10">
        <div className="container max-w-4xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.clientInstall.securityTitle}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 landing-stagger">
            {[
              {
                icon: Shield,
                title: t.clientInstall.secSovereignTitle,
                desc: t.clientInstall.secSovereignDesc,
              },
              {
                icon: Lock,
                title: t.clientInstall.secSandboxTitle,
                desc: t.clientInstall.secSandboxDesc,
              },
              {
                icon: Download,
                title: t.clientInstall.secUpdatesTitle,
                desc: t.clientInstall.secUpdatesDesc,
              },
              {
                icon: Zap,
                title: 'Status: Beta / Canary',
                desc: t.clientInstall.secVerificationDesc,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="landing-reveal landing-card-hover bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 space-y-3"
              >
                <div className="p-2.5 bg-primary/10 w-fit rounded-xl">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-bold text-base text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Developer Setup ── */}
      <section className="py-12 md:py-16 border-t border-border/10">
        <div className="container max-w-3xl mx-auto px-4">
          <details className="group border border-border/30 rounded-2xl bg-card/20 backdrop-blur-sm transition-all duration-300 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer focus:outline-none select-none">
              <div className="flex items-center gap-2.5">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-sm sm:text-base text-foreground">
                  {texts.devToolsLabel} (Git & Build Commands)
                </span>
              </div>
              <span className="text-emerald-400 transition group-open:rotate-180">
                <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            
            <div className="p-5 pt-0 border-t border-border/10 space-y-4">
              <p className="text-xs text-muted-foreground text-left mt-2">
                {texts.githubSourceLinkDesc}{' '}
                <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="underline text-emerald-400 hover:text-emerald-300 font-medium">
                  GitHub
                </a>
              </p>
              <div className="bg-background/50 border border-border/20 rounded-xl overflow-hidden">
                <div className="px-4 py-2 border-b border-border/20 flex items-center gap-2 bg-muted/10">
                  <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">Terminal</span>
                </div>
                <pre className="p-4 text-xs font-mono text-foreground/80 overflow-x-auto leading-relaxed text-left">
                  <code>{`${t.clientInstall.forDevsStep1}
git clone ${GITHUB_REPO}.git
cd daarion-edge-client

${t.clientInstall.forDevsStep2}
npm install

${t.clientInstall.forDevsStep3}
npm run dev
${t.clientInstall.forDevsTerminal}
npm run tauri dev

${t.clientInstall.forDevsStep4}
npm run build
npm run tauri build`}</code>
                </pre>
              </div>
            </div>
          </details>
        </div>
      </section>

      {/* ── Diagnostic Logs ── */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-muted/5 to-muted/10 border-t border-border/10">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="landing-reveal bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="font-bold text-base">{t.clientInstall.diagnosticsTitle}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.clientInstall.diagnosticsDesc}
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 mt-0.5 flex-shrink-0">Windows</Badge>
                <code className="text-xs font-mono text-foreground/70 break-all">%APPDATA%\DAARION Edge\logs\boot.log</code>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 mt-0.5 flex-shrink-0">macOS / Linux</Badge>
                <code className="text-xs font-mono text-foreground/70 break-all">~/.daarion-edge/logs/boot.log</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-24 border-t border-border/10">
        <div className="container max-w-3xl mx-auto px-4 text-center space-y-6 landing-reveal">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t.clientInstall.readyTitle}
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            {t.clientInstall.readyDesc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              onClick={scrollToPlatforms}
              className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Download className="h-5 w-5" />
              {getHeroPrimaryCtaLabel()}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-1.5 border-border/60 hover:bg-muted/30 text-foreground"
            >
              <Layers className="h-4 w-4" />
              {t.clientInstall.returnToMicroDAO}
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border/30 py-10 bg-card/10 backdrop-blur-sm">
        <div className="container max-w-7xl mx-auto px-4 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.jpg" alt="MicroDAO" className="h-7 w-7 rounded-lg object-cover shadow-sm" />
            <span className="font-semibold text-sm text-foreground/80">MicroDAO</span>
          </div>
          <div className="flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <button onClick={() => navigate('/agents')} className="hover:text-foreground transition-colors">
              AI Agents Directory
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate('/pricing')} className="hover:text-foreground transition-colors">
              Pricing Plans
            </button>
            <span className="text-border">·</span>
            <button onClick={() => navigate('/install')} className="hover:text-foreground transition-colors text-foreground">
              Connect Device
            </button>
            <span className="text-border">·</span>
            <a href="https://github.com/DAARION-DAO/loval-echoes" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub (MicroDAO Open Source)
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground/85 max-w-md mx-auto pt-2">
            {texts.githubSourceLinkDesc}{' '}
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="underline text-foreground/80 hover:text-foreground font-medium">
              GitHub
            </a>
          </p>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap pt-2">
            <span>© {new Date().getFullYear()}</span>
            <a href="https://daarion.city/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-foreground/80 font-medium transition-all">
              <img src="/daarion-logo.jpg" alt="DAARION.city" className="h-4 w-4 rounded-sm object-cover" />
              <span>DAARION.city</span>
            </a>
            <span>— {t.clientInstall.footerCopyright}</span>
          </div>
          <div className="text-[10px] text-muted-foreground/60">{t.clientInstall.footerDesc}</div>
        </div>
      </footer>
    </div>
  );
}

export default Install;
