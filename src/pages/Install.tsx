import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

/* ── Platform data ── */
const platforms = [
  {
    name: 'macOS Apple Silicon',
    arch: 'ARM64 (M1 / M2 / M3 / M4)',
    format: '.dmg',
    icon: Apple,
    status: 'active' as const,
    statusLabel: 'Beta',
  },
  {
    name: 'macOS Intel',
    arch: 'x86_64',
    format: '.dmg',
    icon: Apple,
    status: 'active' as const,
    statusLabel: 'Beta',
  },
  {
    name: 'Windows',
    arch: 'x86_64',
    format: '.exe / .msi',
    icon: Monitor,
    status: 'pending' as const,
    statusLabel: 'Canary',
  },
  {
    name: 'Linux',
    arch: 'x86_64',
    format: '.AppImage',
    icon: Terminal,
    status: 'pending' as const,
    statusLabel: 'Canary',
  },
  {
    name: 'Android',
    arch: 'arm64-v8a',
    format: '.apk',
    icon: Smartphone,
    status: 'pending' as const,
    statusLabel: 'Sideload',
  },
  {
    name: 'iOS',
    arch: 'arm64',
    format: 'Native App',
    icon: Smartphone,
    status: 'coming' as const,
    statusLabel: 'Скоро',
  },
];

const architectureLayers = [
  {
    level: 'L1',
    title: 'Client Device',
    subtitle: 'Sovereign Entry',
    icon: Shield,
    color: 'from-emerald-500/20 to-teal-500/20',
    points: [
      'Встановлення на локальне залізо користувача',
      'Автогенерація Ed25519 криптоідентичності',
      'Приватний ключ ізольований в Keychain / Credential Manager',
      'Базова синхронізація з мережею DAARION',
    ],
  },
  {
    level: 'L2',
    title: 'Personal Agent',
    subtitle: 'Local Runtime',
    icon: Cpu,
    color: 'from-blue-500/20 to-indigo-500/20',
    points: [
      'Інтерактивний Genesis Wizard для створення агента',
      'Виявлення локальних обчислювальних ресурсів (CPU, RAM, GPU)',
      'Завантаження та виконання LLM (Gemma, Qwen) у форматі GGUF',
      'Управління гаманцем та локальними промптами',
    ],
  },
  {
    level: 'L3',
    title: 'Worker Node',
    subtitle: 'Gated Compute',
    icon: HardDrive,
    color: 'from-violet-500/20 to-purple-500/20',
    points: [
      'Внесок обчислювальних ресурсів у мережу (ping_math, text_hash)',
      'Жорстка пісочниця: Docker/Colima, --network none',
      'Доступ лише після верифікації оператора',
      'Нульовий мережевий вихід з контейнерів',
    ],
  },
];

const GITHUB_REPO = 'https://github.com/DAARION-DAO/daarion-edge-client';
const GITHUB_RELEASES = `${GITHUB_REPO}/releases`;

export function Install() {
  const navigate = useNavigate();
  const scrollRef = useScrollReveal();

  return (
    <div ref={scrollRef} className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1.5 mr-1">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
            <div className="h-5 w-px bg-border/50 hidden sm:block" />
            <img src="/daarion-logo.jpg" alt="DAARION" className="h-8 w-8 rounded-lg object-cover shadow-md" />
            <span className="font-bold text-base tracking-tight">DAARION Edge Client</span>
          </div>

          <a
            href={GITHUB_RELEASES}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="text-sm font-semibold gap-1.5 shadow-md hover:shadow-lg transition-shadow">
              <Download className="h-3.5 w-3.5" />
              Завантажити
            </Button>
          </a>
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
            Sovereign Agent · Beta / Canary
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-4xl mx-auto landing-gradient-text bg-gradient-to-r from-foreground via-emerald-400 to-foreground pb-2">
            DAARION Edge Client
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4 mb-10">
            Суверенний інтерфейс та edge-клієнт для створення, управління та координації персональних AI-агентів локально на вашому залізі.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto sm:max-w-none">
            <a href={GITHUB_RELEASES} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Download className="h-5 w-5" />
                Завантажити з GitHub
              </Button>
            </a>
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-13 px-10 font-semibold text-base gap-1.5 border-border/60 hover:bg-muted/30"
              >
                <Globe className="h-4 w-4" />
                GitHub
                <ExternalLink className="h-3.5 w-3.5 ml-0.5 opacity-50" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Platforms ── */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-muted/5 to-muted/15 border-t border-border/10">
        <div className="container max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Підтримувані платформи</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Крос-платформний клієнт, побудований на Tauri v2
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 landing-stagger">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="landing-reveal landing-card-hover group bg-card/30 backdrop-blur-sm border border-border/40 rounded-2xl p-5 flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-primary/8 group-hover:bg-primary/15 transition-colors flex-shrink-0 mt-0.5">
                  <platform.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-foreground">{platform.name}</h4>
                    <Badge
                      variant="secondary"
                      className={`text-[10px] px-1.5 py-0 h-5 font-medium ${
                        platform.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                          : platform.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {platform.status === 'active' && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />}
                      {platform.status === 'pending' && <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />}
                      {platform.statusLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{platform.arch}</p>
                  <p className="text-xs text-muted-foreground/70">Формат: {platform.format}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center landing-reveal">
            <a href={GITHUB_RELEASES} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Всі релізи на GitHub
                <ExternalLink className="h-3 w-3 opacity-50" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Architecture Layers ── */}
      <section className="py-16 md:py-24 border-t border-border/10">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3 landing-reveal">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Архітектура Edge Client</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Три рівні суверенної агентської інфраструктури
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
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Безпека та оновлення</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 landing-stagger">
            {[
              {
                icon: Shield,
                title: 'Суверенна безпека',
                desc: 'Приватний ключ ніколи не покидає пристрій. Зберігається в macOS Keychain або Windows Credential Manager через нативний keyring API.',
              },
              {
                icon: Lock,
                title: 'Пісочниця Worker Mode',
                desc: 'Всі edge-задачі виконуються у закритому контейнері (Docker/Colima) з --network none та очищеними змінними середовища.',
              },
              {
                icon: Download,
                title: 'Ручні оновлення',
                desc: 'Автоматичні оновлення поки вимкнені. Завантажуйте нові версії вручну з GitHub Releases.',
              },
              {
                icon: Zap,
                title: 'Status: Beta / Canary',
                desc: 'Потребує proof of performance, стабільності та безпеки на кожній платформі перед production-релізом.',
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
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Для розробників</h2>
            <p className="text-sm text-muted-foreground">Rust stable + Node.js v20+</p>
          </div>

          <div className="landing-reveal space-y-4">
            <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-border/20 flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Terminal</span>
              </div>
              <pre className="p-5 text-sm font-mono text-foreground/80 overflow-x-auto leading-relaxed">
                <code>{`# 1. Клонувати репозиторій
git clone ${GITHUB_REPO}.git
cd daarion-edge-client

# 2. Встановити залежності
npm install

# 3. Запустити dev-режим (Vite + Tauri)
npm run dev
# В іншому терміналі:
npm run tauri dev

# 4. Збірка release-пакетів
npm run build
npm run tauri build`}</code>
              </pre>
            </div>
          </div>

          <div className="text-center landing-reveal">
            <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2">
                <Globe className="h-4 w-4" />
                Відкрити на GitHub
                <ExternalLink className="h-3 w-3 opacity-50" />
              </Button>
            </a>
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
              <h3 className="font-bold text-base">Діагностичні логи</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Якщо застосунок крашиться або показує білий екран — зберіть і надішліть діагностичний лог:
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
            Готові запустити свого агента?
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Завантажте DAARION Edge Client, створіть свою суверенну криптоідентичність та почніть координацію через MicroDAO.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={GITHUB_RELEASES} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="h-13 px-10 font-semibold text-base gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Download className="h-5 w-5" />
                Завантажити
              </Button>
            </a>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/')}
              className="h-13 px-10 font-semibold text-base gap-1.5 border-border/60 hover:bg-muted/30"
            >
              <Layers className="h-4 w-4" />
              Повернутись до MicroDAO
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
            <button onClick={() => navigate('/install')} className="hover:text-foreground transition-colors">
              DAARION Edge Client
            </button>
            <span className="text-border">·</span>
            <a href="https://github.com/DAARION-DAO/loval-echoes" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub (MicroDAO Open Source)
            </a>
            <span className="text-border">·</span>
            <a href="https://github.com/DAARION-DAO/daarion-edge-client" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub (Edge Client Open Source)
            </a>
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 flex-wrap">
            <span>© {new Date().getFullYear()}</span>
            <a href="https://daarion.city/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 text-foreground/80 font-medium transition-all">
              <img src="/daarion-logo.jpg" alt="DAARION.city" className="h-4 w-4 rounded-sm object-cover" />
              <span>DAARION.city</span>
            </a>
            <span>— Всі права захищено.</span>
          </div>
          <div className="text-[10px] text-muted-foreground/60">Побудовано для гнучкої координації та живих спільнот.</div>
        </div>
      </footer>
    </div>
  );
}

export default Install;
