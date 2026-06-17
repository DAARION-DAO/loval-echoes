import type { ReactNode } from "react";
import { ArrowLeft, Download, Home, LogIn, Menu, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { Language, useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type PublicNavKey = "home" | "agents" | "pricing" | "install";

interface PublicHeaderProps {
  active?: PublicNavKey;
  logoSrc?: string;
  logoAlt?: string;
  title?: string;
  mobileTitle?: string;
  backToHome?: boolean;
  primaryLabel?: string;
  primaryIcon?: ReactNode;
  onPrimaryClick?: () => void;
  primaryClassName?: string;
  showInstallPrompt?: boolean;
}

export function PublicHeader({
  active = "home",
  logoSrc = "/logo.jpg",
  logoAlt = "MicroDAO",
  title = "MicroDAO",
  mobileTitle,
  backToHome = false,
  primaryLabel,
  primaryIcon,
  onPrimaryClick,
  primaryClassName,
  showInstallPrompt = false,
}: PublicHeaderProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { isInstallable, install } = usePwaInstall();

  const fallbackPrimaryLabel = user ? t.nav.goToDashboard : t.create;
  const ctaLabel = primaryLabel ?? fallbackPrimaryLabel;
  const ctaIcon = primaryIcon ?? <Sparkles className="h-3.5 w-3.5" />;
  const primaryAction = onPrimaryClick ?? (() => navigate(user ? "/dashboard" : "/auth?signup=true"));

  const navItems: Array<{
    key: PublicNavKey;
    label: string;
    href: string;
    icon?: ReactNode;
  }> = [
    { key: "home", label: "MicroDAO", href: "/", icon: <Home className="h-4 w-4" /> },
    { key: "agents", label: t.agentDirectory.navbarAgents, href: "/agents" },
    { key: "pricing", label: t.agentDirectory.navbarPricing, href: "/pricing" },
    {
      key: "install",
      label: t.landing.client,
      href: "/install",
      icon: <Download className="h-4 w-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          {backToHome && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              aria-label={t.importExtra.backBtn}
              className="h-10 w-10 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="MicroDAO"
          >
            <img
              src={logoSrc}
              alt={logoAlt}
              className="h-8 w-8 shrink-0 rounded-lg object-cover shadow-md sm:h-9 sm:w-9"
            />
            <span className="truncate text-sm font-bold tracking-tight sm:text-base">
              <span className="hidden xs:inline">{title}</span>
              <span className="xs:hidden">{mobileTitle ?? title}</span>
            </span>
          </button>

          <Badge variant="secondary" className="hidden h-5 px-1.5 py-0 text-[10px] font-medium sm:inline-flex">
            beta
          </Badge>
        </div>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Public navigation">
          {navItems.slice(1).map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.href)}
              className={cn(
                "h-10 gap-1.5 px-3 text-sm font-medium",
                active === item.key && "text-primary",
              )}
            >
              {item.icon}
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
            <SelectTrigger
              aria-label="Language"
              className="h-10 w-[62px] bg-background/60 px-2 text-xs sm:w-[74px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="uk">UA</SelectItem>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="ru">RU</SelectItem>
              <SelectItem value="es">ES</SelectItem>
            </SelectContent>
          </Select>

          {showInstallPrompt && isInstallable && (
            <Button
              variant="outline"
              size="sm"
              onClick={install}
              className="hidden h-10 gap-1.5 border-primary/30 px-3 text-xs font-semibold text-primary hover:bg-primary/5 sm:inline-flex"
            >
              <Download className="h-4 w-4" />
              {t.landing.installPwa}
            </Button>
          )}

          <Button
            size="sm"
            onClick={primaryAction}
            className={cn(
              "h-10 min-w-10 gap-1.5 px-2 text-xs font-semibold shadow-md transition-shadow hover:shadow-lg sm:px-3",
              primaryClassName,
            )}
          >
            {ctaIcon}
            <span className="hidden sm:inline">{ctaLabel}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
            className="hidden h-10 gap-1.5 px-3 text-sm font-medium lg:inline-flex"
          >
            {!user && <LogIn className="h-4 w-4" />}
            {user ? t.nav.goToDashboard : t.landing.login}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10 md:hidden" aria-label="Menu">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navItems.map((item) => (
                <DropdownMenuItem
                  key={item.key}
                  onSelect={() => navigate(item.href)}
                  className={cn("min-h-10 gap-2", active === item.key && "font-semibold text-primary")}
                >
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
              {showInstallPrompt && isInstallable && (
                <DropdownMenuItem onSelect={install} className="min-h-10 gap-2 text-primary">
                  <Download className="h-4 w-4" />
                  {t.landing.installPwa}
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => navigate(user ? "/dashboard" : "/auth")}
                className="min-h-10 gap-2"
              >
                {!user && <LogIn className="h-4 w-4" />}
                {user ? t.nav.goToDashboard : t.landing.login}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
