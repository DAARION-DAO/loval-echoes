import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Palette, 
  Globe, 
  Shield, 
  Upload,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const Settings = () => {
  const { t, language, setLanguage } = useTranslation();
  const { user } = useAuth();
  const [showPrinciplesBanner, setShowPrinciplesBanner] = useState(
    localStorage.getItem('zhos-principles-banner-dismissed') !== 'true'
  );
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme immediately
    const root = window.document.documentElement;
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handlePrinciplesBannerToggle = (enabled: boolean) => {
    setShowPrinciplesBanner(enabled);
    if (enabled) {
      localStorage.removeItem('zhos-principles-banner-dismissed');
    } else {
      localStorage.setItem('zhos-principles-banner-dismissed', 'true');
    }
  };

  const getThemeIcon = (themeType: string) => {
    switch (themeType) {
      case 'light':
        return <Sun className="h-4 w-4" />;
      case 'dark':
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">{t.settings.title}</h1>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {t.profile}
          </CardTitle>
          <CardDescription>
            Управление профилем и персональными данными
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt="Profile" />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Загрузить фото
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                value={user?.email || ''} 
                disabled 
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">Отображаемое имя</Label>
              <Input 
                id="displayName" 
                placeholder="Ваше имя в чатах"
                defaultValue=""
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t.theme}
          </CardTitle>
          <CardDescription>
            Настройка внешнего вида приложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.theme}</Label>
            <Select value={theme} onValueChange={handleThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    {t.themeLight}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    {t.themeDark}
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    {t.themeSystem}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t.language}
          </CardTitle>
          <CardDescription>
            Выбор языка интерфейса
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{t.language}</Label>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ru">Русский (RU)</SelectItem>
                <SelectItem value="ua">Українська (UA)</SelectItem>
                <SelectItem value="en">English (EN)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ZHOS Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки ЖОС</CardTitle>
          <CardDescription>
            Специфичные настройки для сообщества ЖОС
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t.showPrinciplesBanner}</Label>
              <p className="text-sm text-muted-foreground">
                Показывать баннер с принципами ЖОС в интерфейсе
              </p>
            </div>
            <Switch
              checked={showPrinciplesBanner}
              onCheckedChange={handlePrinciplesBannerToggle}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Лимиты участия</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Максимум участников онлайн: 50</div>
              <div>• Размер файлов: до 10MB</div>
              <div>• Длина сообщений: до 4000 символов</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button className="w-full sm:w-auto">
          {t.save}
        </Button>
      </div>
    </div>
  );
};