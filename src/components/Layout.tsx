import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Menu, 
  Home, 
  Bell, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  FolderCheck,
  MoreVertical,
  MessageCircle,
  CheckSquare,
  FolderKanban,
  Bot,
  MoreHorizontal,
  Files
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useTranslation } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePendingApprovals } from "@/hooks/usePendingApprovals";
import { NewsNotificationsPopover } from "@/components/NewsNotificationsPopover";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface LayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

import { useUserApprovalStatus } from "@/hooks/useUserApprovalStatus";
import { Zap, Shield, Sparkles, Network } from "lucide-react";

export function Layout({ sidebar, children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const { pendingCount } = usePendingApprovals();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { accessTier } = useUserApprovalStatus();

  // Auto close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const mobileNavItems = [
    { label: t.nav.home, icon: Home, path: "/dashboard" },
    { label: t.nav.chats, icon: MessageCircle, path: "/chats" },
    { label: t.nav.tasks, icon: CheckSquare, path: "/my/tasks" },
    { label: t.nav.projects, icon: FolderKanban, path: "/projects" },
  ];

  const isNavItemActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 h-11 w-11"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <div className="flex items-center gap-2">
              <img src="/logo.jpg" alt="Logo" className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg object-cover shadow-sm" />
              <span className="font-bold text-lg sm:text-xl">{t.layout.appName}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {accessTier === 'founder' && (
                <Badge variant="outline" className="hidden sm:inline-flex bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs px-2.5 py-1 gap-1 items-center font-medium">
                  <Zap className="h-3 w-3" />
                  <span>Founder Program</span>
                </Badge>
              )}
              {accessTier === 'community' && (
                <Badge variant="outline" className="hidden sm:inline-flex bg-indigo-500/10 text-indigo-500 border-indigo-500/20 text-xs px-2.5 py-1 gap-1 items-center font-medium">
                  <Users className="h-3 w-3" />
                  <span>Community Tier</span>
                </Badge>
              )}
              {accessTier === 'early_access' && (
                <Badge variant="outline" className="hidden sm:inline-flex bg-blue-500/10 text-blue-500 border-blue-500/20 text-xs px-2.5 py-1 gap-1 items-center font-medium">
                  <Sparkles className="h-3 w-3" />
                  <span>Early Access</span>
                </Badge>
              )}
              {accessTier === 'network' && (
                <Badge variant="outline" className="hidden sm:inline-flex bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs px-2.5 py-1 gap-1 items-center font-medium">
                  <Network className="h-3 w-3" />
                  <span>Network Tier</span>
                </Badge>
              )}
              {accessTier === 'admin' && (
                <Badge variant="outline" className="hidden sm:inline-flex bg-rose-500/10 text-rose-500 border-rose-500/20 text-xs px-2.5 py-1 gap-1 items-center font-medium">
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="p-2"
              >
                <Home className="h-4 w-4" />
              </Button>
              
              <NewsNotificationsPopover />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/participants')}
                className="p-2 relative"
              >
                <Users className="h-4 w-4" />
                {pendingCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {pendingCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile Actions (Always Visible Notifications) */}
            <div className="flex md:hidden items-center gap-1">
              <NewsNotificationsPopover />
              
              {/* More Actions Dropdown on Mobile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2 h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/')}>
                    <Home className="mr-2 h-4 w-4" />
                    {t.nav.home}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/participants')}>
                    <Users className="mr-2 h-4 w-4" />
                    {t.nav.participants}
                    {pendingCount > 0 && (
                      <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
                        {pendingCount}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* User Avatar Dropdown (Always Visible) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 h-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0).toUpperCase() || 
                       user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{profile?.display_name || t.layout.user}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                  {accessTier === 'founder' && (
                    <div className="text-[10px] text-amber-500 font-semibold mt-1 flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>Founder Program</span>
                    </div>
                  )}
                  {accessTier === 'community' && (
                    <div className="text-[10px] text-indigo-400 font-semibold mt-1 flex items-center gap-1">
                      <Users className="h-3 w-3 text-indigo-400" />
                      <span>Community Tier</span>
                    </div>
                  )}
                  {accessTier === 'early_access' && (
                    <div className="text-[10px] text-blue-500 font-semibold mt-1 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Early Access</span>
                    </div>
                  )}
                  {accessTier === 'network' && (
                    <div className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                      <Network className="h-3 w-3" />
                      <span>Network Tier</span>
                    </div>
                  )}
                  {accessTier === 'admin' && (
                    <div className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>Admin</span>
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/participants')}>
                  <Users className="mr-2 h-4 w-4" />
                  {t.nav.participants}
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 px-1 text-xs">
                      {pendingCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/projects')}>
                  <FolderCheck className="mr-2 h-4 w-4" />
                  {t.nav.projects}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  {t.nav.settings}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  {t.layout.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block border-r min-h-[calc(100vh-3.5rem)] bg-sidebar">
            <div className="p-4">
              {sidebar}
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-3.5rem)] overflow-hidden">
            <div className="h-full flex flex-col">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Modern Slide-out Drawer */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-[300px] max-w-[85vw] bg-sidebar border-r flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <span className="font-bold text-lg">{t.nav.navigation}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {sidebar}
          </div>
        </SheetContent>
      </Sheet>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t border-border backdrop-blur-md flex items-end justify-around px-1" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {mobileNavItems.map((item) => {
          const active = isNavItemActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 min-h-[52px] text-muted-foreground hover:text-foreground transition-colors relative",
                active && "text-primary hover:text-primary"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
              )}
              <item.icon className="h-5 w-5 mb-0.5" />
              <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
            </button>
          );
        })}
        {/* More button opens the full sidebar drawer */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-2 min-h-[52px] text-muted-foreground hover:text-foreground transition-colors"
          )}
        >
          <MoreHorizontal className="h-5 w-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-tight">{t.nav.more}</span>
        </button>
      </nav>
    </div>
  );
}