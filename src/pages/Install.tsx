import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation, Language } from '@/lib/i18n';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
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
    heroTitle: 'DAARION Edge Client',
    heroSubtitle: 'Локальний клієнт і суверенний шлюз до вашого MicroDAO: агентів, децентралізованого месенджера, майбутнього гаманця, казни, голосувань і захищеного доступу спільноти.',
    heroPrimaryCtaDevice: 'Скачати для цього пристрою',
    heroPrimaryCtaChoose: 'Оберіть платформу',
    heroSecondaryCta: 'Відкрити Web / PWA',
    heroHelper: 'Інсталлер можна скачати одразу. Повні функції MicroDAO активуються після входу та створення або приєднання до спільноти.',
    heroBadge: 'Суверенний шлюз · Beta / Canary',
    
    headerTitleMobile: 'Edge Client',
    
    platformsTitle: 'Оберіть платформу',
    platformsSubtitle: 'Скачайте інсталятор для вашого пристрою або відкрийте Web / PWA версію.',
    quickStartTitle: 'Швидкий старт',
    nativeInstallersTitle: 'Нативні інсталятори',
    
    fallbackVersionDesc: 'Якщо інсталлер ще не доступний для вашої платформи, використайте Web / PWA версію.',
    githubSourceLinkDesc: 'Для розробників: вихідний код доступний на GitHub.',
    githubRepositoryBtn: 'GitHub репозиторій',
    architectureLabel: 'Архітектура',
    formatLabel: 'Формат',
    versionLabel: 'Версія',
    devToolsLabel: 'Для розробників',
    sourceCodeGithub: 'Вихідний код на GitHub',
    
    webDesc: 'Швидкий старт у браузері. Встановлення не потрібне.',
    webCta: 'Відкрити Web / PWA',
    
    macSiliconCta: 'Скачати для Apple Silicon',
    macIntelCta: 'Скачати для Intel Mac',
    windowsCta: 'Скачати setup.exe',
    windowsAltCta: 'Скачати MSI',
    windowsHelper: 'Використовуйте MSI тільки якщо setup.exe не запускається.',
    linuxCta: 'Скачати AppImage',
    
    androidDesc: 'Потрібне ручне встановлення APK. Версія для тестування.',
    androidCta: 'Скачати APK',
    
    iosDesc: 'iOS build буде додано пізніше.',
    iosCta: 'Скоро',
    
    statusActive: 'Активний',
    statusBeta: 'Beta',
    statusComingSoon: 'Скоро',
    statusSideload: 'Sideload',

    // New keys
    afterInstallTitle: 'Що відбувається після встановлення?',
    step1: 'Встановіть DAARION Edge Client',
    step2: 'Увійдіть або створіть акаунт DAARION',
    step3: 'Створіть MicroDAO або приєднайтеся за запрошенням',
    step4: 'Активуйте Дух Спільноти — агента вашого DAO',
    step5: 'Запросіть учасників',
    step6: 'Налаштуйте ролі, памʼять, задачі та правила',
    step7: 'Поступово підключайте гаманець, казну, голосування й токени спільноти',

    unlocksTitle: 'Що відкриває Edge Client',
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
    roadmapAvail1: 'Інсталятор Edge Client',
    roadmapAvail2: 'Доступ через Web / PWA',
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
    roadmapLater5: 'посилені локальні та edge-функції',
    roadmapFuture1: 'децентралізований браузер',
    roadmapFuture2: 'VPN та захисний шар',
    roadmapFuture3: 'агенти-розробники для створення платформ і децентралізованих соцмереж',
  },
  en: {
    heroTitle: 'DAARION Edge Client',
    heroSubtitle: 'A local client and sovereign gateway to your MicroDAO: agents, decentralized messaging, future wallet, treasury, voting, and protected community access.',
    heroPrimaryCtaDevice: 'Download for this device',
    heroPrimaryCtaChoose: 'Choose your platform',
    heroSecondaryCta: 'Open Web / PWA',
    heroHelper: 'You can download the installer now. Full MicroDAO features activate after sign-in and after creating or joining a community.',
    heroBadge: 'Sovereign Gateway · Beta / Canary',
    
    headerTitleMobile: 'Edge Client',
    
    platformsTitle: 'Choose your platform',
    platformsSubtitle: 'Download the installer for your device or open the Web / PWA version.',
    quickStartTitle: 'Quick Start',
    nativeInstallersTitle: 'Native Installers',
    
    fallbackVersionDesc: 'If the installer is not yet available for your platform, use the Web / PWA version.',
    githubSourceLinkDesc: 'For developers: source code is available on GitHub.',
    githubRepositoryBtn: 'GitHub repository',
    architectureLabel: 'Architecture',
    formatLabel: 'Format',
    versionLabel: 'Version',
    devToolsLabel: 'For Developers',
    sourceCodeGithub: 'Source Code on GitHub',
    
    webDesc: 'Quick start in the browser. No installation required.',
    webCta: 'Open Web / PWA',
    
    macSiliconCta: 'Download for Apple Silicon',
    macIntelCta: 'Download for Intel Mac',
    windowsCta: 'Download setup.exe',
    windowsAltCta: 'Download MSI',
    windowsHelper: 'Use MSI only if setup.exe does not launch.',
    linuxCta: 'Download AppImage',
    
    androidDesc: 'Manual APK installation required. Testing version.',
    androidCta: 'Download APK',
    
    iosDesc: 'iOS build will be added later.',
    iosCta: 'Soon',
    
    statusActive: 'Active',
    statusBeta: 'Beta',
    statusComingSoon: 'Soon',
    statusSideload: 'Sideload',

    // New keys
    afterInstallTitle: 'What happens after installation?',
    step1: 'Install DAARION Edge Client',
    step2: 'Sign in or create DAARION account',
    step3: 'Create or join a MicroDAO',
    step4: 'Activate Community Spirit Agent',
    step5: 'Invite members',
    step6: 'Configure roles, memory, tasks, and rules',
    step7: 'Connect future wallet, treasury, voting, and token features as they become available',

    unlocksTitle: 'What Edge Client unlocks',
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
    roadmapAvail1: 'Edge Client installer',
    roadmapAvail2: 'Web / PWA access',
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
    roadmapLater5: 'stronger local/edge features',
    roadmapFuture1: 'decentralized browser',
    roadmapFuture2: 'VPN/protection layer',
    roadmapFuture3: 'developer agents for building platforms and decentralized social networks',
  },
  ru: {
    heroTitle: 'DAARION Edge Client',
    heroSubtitle: 'Локальный клиент и суверенный шлюз к вашему MicroDAO: агентам, децентрализованному мессенджеру, будущему кошельку, казне, голосованиям и защищенному доступу сообщества.',
    heroPrimaryCtaDevice: 'Скачать для этого устройства',
    heroPrimaryCtaChoose: 'Выберите платформу',
    heroSecondaryCta: 'Открыть Web / PWA',
    heroHelper: 'Инсталлер можно скачать сразу. Полные функции MicroDAO активируются после входа и создания или присоединения к сообществу.',
    heroBadge: 'Суверенный шлюз · Beta / Canary',
    
    headerTitleMobile: 'Edge Client',
    
    platformsTitle: 'Выберите платформу',
    platformsSubtitle: 'Скачайте установщик для вашего устройства или откройте Web / PWA версию.',
    quickStartTitle: 'Быстрый старт',
    nativeInstallersTitle: 'Нативные инсталляторы',
    
    fallbackVersionDesc: 'Если инсталлятор еще не доступен для вашей платформы, используйте версию Web / PWA.',
    githubSourceLinkDesc: 'Для разработчиков: исходный код доступен на GitHub.',
    githubRepositoryBtn: 'GitHub репозиторий',
    architectureLabel: 'Архитектура',
    formatLabel: 'Format',
    versionLabel: 'Версия',
    devToolsLabel: 'Для разработчиков',
    sourceCodeGithub: 'Исходный код на GitHub',
    
    webDesc: 'Быстрый старт в браузере. Установка не требуется.',
    webCta: 'Открыть Web / PWA',
    
    macSiliconCta: 'Скачать для Apple Silicon',
    macIntelCta: 'Скачать для Intel Mac',
    windowsCta: 'Скачать setup.exe',
    windowsAltCta: 'Скачать MSI',
    windowsHelper: 'Используйте MSI только если setup.exe не запускается.',
    linuxCta: 'Скачать AppImage',
    
    androidDesc: 'Требуется ручная установка APK. Версия для тестирования.',
    androidCta: 'Скачать APK',
    
    iosDesc: 'iOS сборка будет добавлена позже.',
    iosCta: 'Скоро',
    
    statusActive: 'Активен',
    statusBeta: 'Beta',
    statusComingSoon: 'Скоро',
    statusSideload: 'Sideload',

    // New keys
    afterInstallTitle: 'Что происходит после установки?',
    step1: 'Установите DAARION Edge Client',
    step2: 'Войдите или создайте аккаунт DAARION',
    step3: 'Создайте MicroDAO или присоединитесь по приглашению',
    step4: 'Активируйте Дух Сообщества — агента вашего DAO',
    step5: 'Пригласите участников',
    step6: 'Настройте роли, память, задачи и правила',
    step7: 'Постепенно подключайте кошелек, казну, голосования и токены сообщества',

    unlocksTitle: 'Что открывает Edge Client',
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
    roadmapAvail1: 'Инсталлятор Edge Client',
    roadmapAvail2: 'Доступ через Web / PWA',
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
    roadmapLater5: 'усиленные локальные и edge-функции',
    roadmapFuture1: 'децентрализованный браузер',
    roadmapFuture2: 'VPN и защитный слой',
    roadmapFuture3: 'агенты-разработчики для создания платформ и децентрализованных соцсети',
  },
  es: {
    heroTitle: 'DAARION Edge Client',
    heroSubtitle: 'Un cliente local y puerta soberana hacia tu MicroDAO: agentes, mensajería descentralizada, futura billetera, tesorería, votaciones y acceso protegido de la comunidad.',
    heroPrimaryCtaDevice: 'Descargar para este dispositivo',
    heroPrimaryCtaChoose: 'Elige tu plataforma',
    heroSecondaryCta: 'Abrir Web / PWA',
    heroHelper: 'Puedes descargar el instalador ahora. Las funciones completas de MicroDAO se activan después de iniciar sesión y crear o unirte a una comunidad.',
    heroBadge: 'Pasarela soberana · Beta / Canary',
    
    headerTitleMobile: 'Edge Client',
    
    platformsTitle: 'Elige tu plataforma',
    platformsSubtitle: 'Descargue el instalador para su dispositivo o abra la versión Web / PWA.',
    quickStartTitle: 'Inicio rápido',
    nativeInstallersTitle: 'Instaladores nativos',
    
    fallbackVersionDesc: 'Si el instalador aún no está disponible para su plataforma, use la versión Web / PWA.',
    githubSourceLinkDesc: 'Para desarrolladores: el código fuente está disponible en GitHub.',
    githubRepositoryBtn: 'Repositorio de GitHub',
    architectureLabel: 'Arquitectura',
    formatLabel: 'Formato',
    versionLabel: 'Versión',
    devToolsLabel: 'Para desarrolladores',
    sourceCodeGithub: 'Código fuente en GitHub',
    
    webDesc: 'Inicio rápido en el navegador. No requiere instalación.',
    webCta: 'Abrir Web / PWA',
    
    macSiliconCta: 'Descargar para Apple Silicon',
    macIntelCta: 'Descargar para Intel Mac',
    windowsCta: 'Descargar setup.exe',
    windowsAltCta: 'Descargar MSI',
    windowsHelper: 'Use MSI solo si setup.exe no se ejecuta.',
    linuxCta: 'Descargar AppImage',
    
    androidDesc: 'Se requiere instalación manual de APK. Versión de prueba.',
    androidCta: 'Descargar APK',
    
    iosDesc: 'La compilación de iOS se agregará más tarde.',
    iosCta: 'Próximamente',
    
    statusActive: 'Activo',
    statusBeta: 'Beta',
    statusComingSoon: 'Próximamente',
    statusSideload: 'Sideload',

    // New keys
    afterInstallTitle: '¿Qué ocurre después de instalar?',
    step1: 'Instala DAARION Edge Client',
    step2: 'Inicia sesión o crea una cuenta de DAARION',
    step3: 'Crea o únete a una MicroDAO por invitación',
    step4: 'Activa el Agente de Espíritu Comunitario de tu DAO',
    step5: 'Invita a miembros',
    step6: 'Configura roles, memoria, tareas y reglas',
    step7: 'Conecta la billetera futura, la tesorería, las votaciones y los tokens de la comunidad a medida que estén disponibles',

    unlocksTitle: 'Lo que desbloquea Edge Client',
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
    roadmapAvail1: 'Instalador de Edge Client',
    roadmapAvail2: 'Acceso Web / PWA',
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
    roadmapLater5: 'funciones locales y edge más sólidas',
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
  const scrollRef = useScrollReveal();
  const { t, language, setLanguage } = useTranslation();
  const { isInstallable, install } = usePwaInstall();

  const texts = localTexts[language as Language] || localTexts.en;
  const platforms = getPlatforms(t, texts);
  const architectureLayers = getArchitectureLayers(t);

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

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5 mr-1">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t.importExtra.backBtn}</span>
            </Button>
            <div className="h-5 w-px bg-border/50 hidden sm:block" />
            <img src="/daarion-logo.jpg" alt="DAARION" className="h-8 w-8 rounded-lg object-cover shadow-md" />
            <span className="font-bold text-base tracking-tight hidden md:inline">{texts.heroTitle}</span>
            <span className="font-bold text-base tracking-tight md:hidden">{texts.headerTitleMobile}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/agents')} className="hidden md:inline-flex text-xs sm:text-sm font-medium h-9 px-2 sm:px-3">
              {t.agentDirectory.navbarAgents}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/pricing')} className="hidden md:inline-flex text-xs sm:text-sm font-medium h-9 px-2 sm:px-3">
              {t.agentDirectory.navbarPricing}
            </Button>
            {/* Language Selector */}
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="h-9 w-[60px] sm:w-[70px] bg-background/50 border-border/30 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uk">UA</SelectItem>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>

            {isInstallable && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={install} 
                className="text-xs sm:text-sm font-semibold gap-1.5 h-9 px-2 sm:px-3 border-primary/30 hover:bg-primary/5 text-primary"
              >
                <Download className="h-4 w-4" />
                <span className="hidden xs:inline">{t.landing.installPwa}</span>
                <span className="xs:hidden">PWA</span>
              </Button>
            )}

            <Button 
              size="sm" 
              onClick={scrollToPlatforms}
              className="hidden md:flex text-xs sm:text-sm font-semibold gap-1.5 shadow-md hover:shadow-lg transition-shadow px-3 sm:px-4 h-9 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{getHeroPrimaryCtaLabel()}</span>
            </Button>
          </div>
        </div>
      </header>

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
                <h4 className="font-extrabold text-lg sm:text-xl text-foreground">Web / PWA</h4>
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

      {/* ── What happens after installation? ── */}
      <section className="py-16 md:py-24 border-t border-border/10 bg-muted/5 relative">
        <div className="landing-orb absolute top-10 left-[10%] w-60 h-60 bg-emerald-500/5 rounded-full blur-[80px]" />
        <div className="container max-w-5xl mx-auto px-4 space-y-10 relative z-10">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.afterInstallTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {language === 'uk' ? 'Сім простих кроків для запуску суверенного локального шару вашої спільноти.' :
               language === 'ru' ? 'Семь простых шагов для запуска суверенного локального слоя вашего сообщества.' :
               language === 'es' ? 'Siete sencillos pasos para iniciar la capa soberana local de tu comunidad.' :
               'Seven simple steps to launch the sovereign local layer of your community.'}
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

      {/* ── What Edge Client unlocks ── */}
      <section className="py-16 md:py-24 border-t border-border/10 relative">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.unlocksTitle}</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {language === 'uk' ? 'Edge Client розширює можливості MicroDAO, створюючи повноцінне децентралізоване середовище.' :
               language === 'ru' ? 'Edge Client расширяет возможности MicroDAO, создавая полноценную децентрализованную среду.' :
               language === 'es' ? 'Edge Client amplía las posibilidades de MicroDAO, creando un entorno descentralizado completo.' :
               'Edge Client extends MicroDAO capabilities, creating a complete decentralized environment.'}
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
              DAARION Edge Client
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
