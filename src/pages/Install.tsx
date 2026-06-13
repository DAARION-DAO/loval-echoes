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
    heroSubtitle: 'Встановіть Edge Client для запуску локального інтерфейсу, агентів і майбутніх MicroDAO edge-функцій на вашому пристрої.',
    heroPrimaryCtaDevice: 'Скачати для цього пристрою',
    heroPrimaryCtaChoose: 'Оберіть платформу',
    heroSecondaryCta: 'Відкрити Web / PWA',
    heroHelper: 'Оберіть платформу нижче. GitHub repo доступний у футері для розробників.',
    heroBadge: 'Суверенний агент · Beta / Canary',
    
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
  },
  en: {
    heroTitle: 'DAARION Edge Client',
    heroSubtitle: 'Install the Edge Client to run the local interface, agents, and future MicroDAO edge functions on your device.',
    heroPrimaryCtaDevice: 'Download for this device',
    heroPrimaryCtaChoose: 'Choose your platform',
    heroSecondaryCta: 'Open Web / PWA',
    heroHelper: 'Select platform below. GitHub repo is available in the footer for developers.',
    heroBadge: 'Sovereign Agent · Beta / Canary',
    
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
  },
  ru: {
    heroTitle: 'DAARION Edge Client',
    heroSubtitle: 'Установите Edge Client для запуска локального интерфейса, агентов и будущих MicroDAO edge-функций на вашем устройстве.',
    heroPrimaryCtaDevice: 'Скачать для этого устройства',
    heroPrimaryCtaChoose: 'Выберите платформу',
    heroSecondaryCta: 'Открыть Web / PWA',
    heroHelper: 'Выберите платформу ниже. GitHub репозиторий доступен в футере для разработчиков.',
    heroBadge: 'Суверенный агент · Beta / Canary',
    
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
  },
  es: {
    heroTitle: 'DAARION Edge Client',
    heroSubtitle: 'Instale Edge Client para ejecutar la interfaz local, los agentes y las futuras funciones edge de MicroDAO en su dispositivo.',
    heroPrimaryCtaDevice: 'Descargar para este dispositivo',
    heroPrimaryCtaChoose: 'Elige tu plataforma',
    heroSecondaryCta: 'Abrir Web / PWA',
    heroHelper: 'Seleccione la plataforma a continuación. El repositorio de GitHub está disponible en el pie de página para desarrolladores.',
    heroBadge: 'Agente soberano · Beta / Canary',
    
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
      <section className="py-16 md:py-24 border-t border-border/10">
        <div className="container max-w-3xl mx-auto px-4 space-y-8">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{texts.devToolsLabel}</h2>
            <p className="text-sm text-muted-foreground">Rust stable + Node.js v20+</p>
          </div>

          <div className="landing-reveal space-y-4">
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/20 flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Terminal</span>
              </div>
              <pre className="p-5 text-sm font-mono text-foreground/80 overflow-x-auto leading-relaxed">
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
