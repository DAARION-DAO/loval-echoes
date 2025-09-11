import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/i18n";
import { useState } from "react";

interface LayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function Layout({ sidebar, children }: LayoutProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/70 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
            <span className="font-bold text-lg">Дух Общины</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block border-r min-h-[calc(100vh-3.5rem)]">
            {sidebar}
          </aside>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-3.5rem)] overflow-hidden">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-80 bg-background border-r overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold">Меню</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ✕
                </Button>
              </div>
              {sidebar}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}