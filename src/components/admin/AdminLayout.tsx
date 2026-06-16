import { ReactNode } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Key, 
  CreditCard, 
  Cpu, 
  ArrowLeft,
  Shield,
  Menu,
  X,
  UserPlus,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isUk = language === 'uk';

  const menuItems = [
    {
      to: '/admin',
      label: isUk ? 'Огляд' : 'Overview',
      icon: LayoutDashboard,
      exact: true
    },
    {
      to: '/admin/users',
      label: isUk ? 'Користувачі' : 'Users',
      icon: Users
    },
    {
      to: '/admin/microdaos',
      label: isUk ? 'MicroDAO' : 'MicroDAOs',
      icon: Building2
    },
    {
      to: '/admin/access-requests',
      label: isUk ? 'Заявки доступу' : 'Access Requests',
      icon: Key
    },
    {
      to: '/admin/billing',
      label: isUk ? 'Білінг' : 'Billing',
      icon: CreditCard
    },
    {
      to: '/admin/agent-ops',
      label: isUk ? 'Агентні операції' : 'Agent Ops',
      icon: Cpu
    },
    {
      to: '/admin/team',
      label: isUk ? 'Команда' : 'Team',
      icon: UserPlus
    },
    {
      to: '/admin/agent',
      label: isUk ? 'Адмін Агент' : 'Admin Agent',
      icon: Bot
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur border-b border-slate-800/80 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-400" />
          <span className="font-bold text-sm bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Guardian Console</span>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-slate-400 hover:text-slate-100 h-8 w-8"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-64 bg-slate-900/30 border-r border-slate-800/50 flex flex-col justify-between p-4 md:sticky md:top-0 md:h-screen z-40 transition-transform md:translate-x-0",
        mobileMenuOpen ? "fixed inset-y-0 left-0 translate-x-0 pt-16 bg-slate-950/95" : "hidden md:flex"
      )}>
        <div className="space-y-6">
          {/* Logo Section */}
          <div className="hidden md:flex items-center gap-2.5 px-2">
            <Shield className="h-6 w-6 text-indigo-400 animate-pulse" />
            <div>
              <div className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Guardian Console</div>
              <div className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">{isUk ? 'Платформа керування' : 'Platform Control'}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to) && (item.to !== '/admin' || location.pathname === '/admin');

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border",
                    isActive 
                      ? "bg-indigo-600/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]" 
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                  )}
                >
                  <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-indigo-400" : "text-slate-500")} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Back to App Section */}
        <div className="pt-4 border-t border-slate-850 space-y-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full flex items-center justify-center gap-1.5 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 h-9 font-semibold text-xs transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isUk ? 'Повернутися в додаток' : 'Back to App'}
          </Button>

          {/* Admin Identity Card */}
          <div className="rounded-xl bg-slate-950/40 border border-slate-850 p-3 space-y-1.5">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-wider font-semibold text-slate-500">
              <span>{isUk ? 'Адміністратор' : 'Platform Admin'}</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">{profile?.role || 'guardian'}</span>
            </div>
            <div className="text-[11px] font-medium text-slate-300 truncate">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Warning Banner */}
        <header className="px-6 py-3 bg-slate-900/10 border-b border-slate-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-400/90 bg-indigo-950/20 border border-indigo-900/25 px-3 py-1.5 rounded-lg w-full">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 flex-shrink-0 animate-pulse" />
            <span className="truncate">
              {isUk 
                ? 'Метадані платформи — приватна пам’ять спільнот та повідомлення не відображаються.'
                : 'Platform metadata only — private community memory and messages are not shown.'}
            </span>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-auto text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-900/50 border border-slate-800 px-2 py-1 rounded">
            env: {import.meta.env.MODE || 'production'}
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
