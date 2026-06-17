import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Palette, 
  Globe, 
  Shield, 
  Upload,
  Fingerprint,
  CreditCard,
  Network
} from 'lucide-react';
import { useTranslation, Language } from '@/lib/i18n';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { ThemeSwitch } from '@/components/ThemeSwitch';
import { supabase } from '@/integrations/supabase/client';
import { Bell, MessageSquare, CheckCircle2, XCircle } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IdentityChecklist } from '@/components/identity/IdentityChecklist';
import { WalletConnect } from '@/components/identity/WalletConnect';
import { TelegramLink } from '@/components/identity/TelegramLink';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import {
  uploadCommunityAvatar,
  updateActiveCommunity,
  AvatarUploadError,
} from '@/services/microdaoSettings';
import { useNavigate, useSearchParams } from 'react-router-dom';

const microdaoSettingsCopy: Record<
  Language,
  {
    title: string;
    description: string;
    readOnly: string;
    nameLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    uploadAvatar: string;
    save: string;
    saving: string;
    savedTitle: string;
    savedDesc: string;
    uploadSuccess: string;
    uploadError: string;
    emptyState: string;
    owner: string;
    admin: string;
    member: string;
    tokenNote: string;
  }
> = {
  uk: {
    title: 'MicroDAO',
    description: 'Редагуйте назву, опис і аватар активної MicroDAO. Slug не змінюється.',
    readOnly: 'У вас режим перегляду. Редагувати MicroDAO можуть власник або адміністратор.',
    nameLabel: 'Назва MicroDAO',
    descriptionLabel: 'Опис',
    descriptionPlaceholder: 'Коротко опишіть фокус і призначення MicroDAO',
    uploadAvatar: 'Завантажити аватар',
    save: 'Зберегти MicroDAO',
    saving: 'Збереження...',
    savedTitle: 'MicroDAO оновлено',
    savedDesc: 'Назва, опис або аватар активної MicroDAO збережені.',
    uploadSuccess: 'Аватар MicroDAO оновлено.',
    uploadError: 'Не вдалося оновити MicroDAO.',
    emptyState: 'Активну MicroDAO не вибрано.',
    owner: 'Власник',
    admin: 'Адмін',
    member: 'Учасник',
    tokenNote: 'Перейменування дозволене у V1, доки випуск власних токенів ще не активовано.',
  },
  en: {
    title: 'MicroDAO',
    description: 'Edit the active MicroDAO name, description, and avatar. The slug stays unchanged.',
    readOnly: 'You are in read-only mode. Only the owner or an admin can edit this MicroDAO.',
    nameLabel: 'MicroDAO name',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Briefly describe the MicroDAO focus and purpose',
    uploadAvatar: 'Upload avatar',
    save: 'Save MicroDAO',
    saving: 'Saving...',
    savedTitle: 'MicroDAO updated',
    savedDesc: 'The active MicroDAO name, description, or avatar was saved.',
    uploadSuccess: 'MicroDAO avatar updated.',
    uploadError: 'Could not update MicroDAO.',
    emptyState: 'No active MicroDAO is selected.',
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    tokenNote: 'Renaming is allowed in V1 while custom token issuance is not active yet.',
  },
  ru: {
    title: 'MicroDAO',
    description: 'Редактируйте название, описание и аватар активной MicroDAO. Slug не меняется.',
    readOnly: 'У вас режим просмотра. Редактировать MicroDAO может владелец или администратор.',
    nameLabel: 'Название MicroDAO',
    descriptionLabel: 'Описание',
    descriptionPlaceholder: 'Кратко опишите фокус и назначение MicroDAO',
    uploadAvatar: 'Загрузить аватар',
    save: 'Сохранить MicroDAO',
    saving: 'Сохранение...',
    savedTitle: 'MicroDAO обновлена',
    savedDesc: 'Название, описание или аватар активной MicroDAO сохранены.',
    uploadSuccess: 'Аватар MicroDAO обновлен.',
    uploadError: 'Не удалось обновить MicroDAO.',
    emptyState: 'Активная MicroDAO не выбрана.',
    owner: 'Владелец',
    admin: 'Админ',
    member: 'Участник',
    tokenNote: 'Переименование разрешено в V1, пока выпуск собственных токенов еще не активирован.',
  },
  es: {
    title: 'MicroDAO',
    description: 'Edita el nombre, la descripción y el avatar de la MicroDAO activa. El slug no cambia.',
    readOnly: 'Estás en modo de solo lectura. Solo el propietario o un admin pueden editar esta MicroDAO.',
    nameLabel: 'Nombre de MicroDAO',
    descriptionLabel: 'Descripción',
    descriptionPlaceholder: 'Describe brevemente el foco y propósito de la MicroDAO',
    uploadAvatar: 'Subir avatar',
    save: 'Guardar MicroDAO',
    saving: 'Guardando...',
    savedTitle: 'MicroDAO actualizada',
    savedDesc: 'Se guardó el nombre, la descripción o el avatar de la MicroDAO activa.',
    uploadSuccess: 'Avatar de MicroDAO actualizado.',
    uploadError: 'No se pudo actualizar la MicroDAO.',
    emptyState: 'No hay una MicroDAO activa seleccionada.',
    owner: 'Owner',
    admin: 'Admin',
    member: 'Miembro',
    tokenNote: 'El cambio de nombre está permitido en V1 mientras la emisión de tokens propios no esté activa.',
  },
};

export const Settings = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language, setLanguage } = useTranslation();
  const { user } = useAuth();
  const { profile, updateProfile, updateTelegram, uploadAvatar, loading } = useUserProfile();
  const {
    activeCommunity,
    activeCommunityId,
    userCommunityRole,
    isCommunityAdmin,
    refresh: refreshCommunity,
  } = useActiveCommunity();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const communityFileInputRef = useRef<HTMLInputElement>(null);
  const microdaoSectionRef = useRef<HTMLDivElement>(null);
  const microdaoCopy = microdaoSettingsCopy[language] ?? microdaoSettingsCopy.en;
  const [showPrinciplesBanner, setShowPrinciplesBanner] = useState(
    localStorage.getItem('zhos-principles-banner-dismissed') !== 'true'
  );
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [communityName, setCommunityName] = useState(activeCommunity?.name || '');
  const [communityDescription, setCommunityDescription] = useState(activeCommunity?.description || '');
  const [communitySaving, setCommunitySaving] = useState(false);
  const [communityAvatarUploading, setCommunityAvatarUploading] = useState(false);
  
  // Push notifications hook
  const {
    pushEnabled,
    permissionStatus,
    settings: pushSettings,
    requestPermission,
    saveSettings: savePushSettings,
  } = usePushNotifications();
  
  const [chats, setChats] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  // Sync displayName with profile when it loads
  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
  }, [profile]);

  useEffect(() => {
    setCommunityName(activeCommunity?.name || '');
    setCommunityDescription(activeCommunity?.description || '');
  }, [activeCommunity?.id, activeCommunity?.name, activeCommunity?.description]);

  useEffect(() => {
    if (searchParams.get('section') !== 'microdao') return;
    window.requestAnimationFrame(() => {
      microdaoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [searchParams]);

  // Load chats for push notification selection
  useEffect(() => {
    const loadChats = async () => {
      if (!user) return;
      
      try {
        setLoadingChats(true);
        const { data, error } = await supabase
          .from('conversations')
          .select('id, name')
          .order('updated_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setChats(data || []);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoadingChats(false);
      }
    };

    loadChats();
  }, [user]);


  const handlePrinciplesBannerToggle = (enabled: boolean) => {
    setShowPrinciplesBanner(enabled);
    if (enabled) {
      localStorage.removeItem('zhos-principles-banner-dismissed');
    } else {
      localStorage.setItem('zhos-principles-banner-dismissed', 'true');
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({ display_name: displayName });
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleNewsPushToggle = async (enabled: boolean) => {
    await savePushSettings({ news_enabled: enabled });
  };

  const handleChatToggle = (chatId: string, enabled: boolean) => {
    const currentChats = pushSettings.chat_notifications || [];
    const newChats = enabled
      ? [...currentChats, chatId]
      : currentChats.filter(id => id !== chatId);
    
    savePushSettings({ chat_notifications: newChats });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setAvatarUploading(true);
      await uploadAvatar(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setAvatarUploading(false);
      event.currentTarget.value = '';
    }
  };

  const resolveAvatarError = (error: unknown) => {
    if (error instanceof AvatarUploadError && error.code === 'too_large') {
      return t.settingsExtra.errorTooLarge;
    }

    if (error instanceof AvatarUploadError && error.code === 'unsupported_type') {
      return t.userProfile.unsupportedFileType;
    }

    return error instanceof Error ? error.message : microdaoCopy.uploadError;
  };

  const handleCommunityAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeCommunityId || !isCommunityAdmin) return;

    try {
      setCommunityAvatarUploading(true);
      const updated = await uploadCommunityAvatar(file, activeCommunityId);
      setCommunityName(updated.name);
      setCommunityDescription(updated.description || '');
      await refreshCommunity();
      toast({
        title: microdaoCopy.savedTitle,
        description: microdaoCopy.uploadSuccess,
      });
    } catch (error) {
      console.error('Error uploading community avatar:', error);
      toast({
        title: t.settingsExtra.errorTitle,
        description: resolveAvatarError(error),
        variant: 'destructive',
      });
    } finally {
      setCommunityAvatarUploading(false);
      event.currentTarget.value = '';
    }
  };

  const handleSaveCommunity = async () => {
    if (!activeCommunityId || !isCommunityAdmin) return;

    try {
      setCommunitySaving(true);
      await updateActiveCommunity({
        communityId: activeCommunityId,
        name: communityName,
        description: communityDescription,
      });
      await refreshCommunity();
      toast({
        title: microdaoCopy.savedTitle,
        description: microdaoCopy.savedDesc,
      });
    } catch (error) {
      console.error('Error saving community:', error);
      toast({
        title: t.settingsExtra.errorTitle,
        description: error instanceof Error ? error.message : microdaoCopy.uploadError,
        variant: 'destructive',
      });
    } finally {
      setCommunitySaving(false);
    }
  };

  const roleLabel = userCommunityRole === 'owner'
    ? microdaoCopy.owner
    : userCommunityRole === 'admin'
      ? microdaoCopy.admin
      : microdaoCopy.member;

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
            {t.settingsExtra.profileDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
              <AvatarFallback>
                {profile?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || avatarUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {avatarUploading ? t.settingsExtra.saving : t.settingsExtra.uploadPhoto}
              </Button>
            </div>
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
              <Label htmlFor="displayName">{t.settingsExtra.labelDisplayName}</Label>
              <Input 
                id="displayName" 
                placeholder={t.settingsExtra.placeholderDisplayName}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active MicroDAO Settings */}
      <Card ref={microdaoSectionRef} className="scroll-mt-20">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                {microdaoCopy.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {activeCommunity ? microdaoCopy.description : microdaoCopy.emptyState}
              </CardDescription>
            </div>
            {activeCommunity && (
              <Badge variant={isCommunityAdmin ? 'default' : 'outline'} className="w-fit shrink-0">
                {roleLabel}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!activeCommunity ? (
            <p className="text-sm text-muted-foreground">{microdaoCopy.emptyState}</p>
          ) : (
            <>
              {!isCommunityAdmin && (
                <div className="rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                  {microdaoCopy.readOnly}
                </div>
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={activeCommunity.avatar_url || ''} alt={activeCommunity.name} />
                  <AvatarFallback>
                    {activeCommunity.name?.charAt(0).toUpperCase() || 'M'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    ref={communityFileInputRef}
                    onChange={handleCommunityAvatarUpload}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => communityFileInputRef.current?.click()}
                    disabled={!isCommunityAdmin || communityAvatarUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {communityAvatarUploading ? t.settingsExtra.saving : microdaoCopy.uploadAvatar}
                  </Button>
                  <p className="text-xs text-muted-foreground">{microdaoCopy.tokenNote}</p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="communityName">{microdaoCopy.nameLabel}</Label>
                  <Input
                    id="communityName"
                    value={communityName}
                    onChange={(event) => setCommunityName(event.target.value)}
                    disabled={!isCommunityAdmin}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communityDescription">{microdaoCopy.descriptionLabel}</Label>
                  <Textarea
                    id="communityDescription"
                    value={communityDescription}
                    onChange={(event) => setCommunityDescription(event.target.value)}
                    placeholder={microdaoCopy.descriptionPlaceholder}
                    disabled={!isCommunityAdmin}
                    className="min-h-24"
                  />
                </div>
              </div>

              {isCommunityAdmin && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveCommunity} disabled={communitySaving || !communityName.trim()}>
                    {communitySaving ? microdaoCopy.saving : microdaoCopy.save}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Identity & Wallet Settings — Sprint F3 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            {t.identity.sectionTitle}
          </CardTitle>
          <CardDescription>
            {t.identity.sectionDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Identity Checklist */}
          <IdentityChecklist
            email={user?.email ?? null}
            telegramUsername={profile?.telegram_username ?? null}
            walletAddress={profile?.wallet_address ?? null}
            level={
              profile?.role === 'guardian' ? 'guardian'
                : profile?.access_tier === 'leader' ? 'leader'
                : 'member'
            }
          />

          {/* Access Tier Badge */}
          {profile?.access_tier && ['founder', 'partner', 'sovereign', 'worker_node'].includes(profile.access_tier) && (
            <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  {t.advancedAccess.accessTierLabel}
                </span>
                <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-[9px] uppercase font-bold">
                  {profile.access_tier === 'founder' ? t.advancedAccess.founderName
                    : profile.access_tier === 'partner' ? t.advancedAccess.partnerName
                    : profile.access_tier === 'sovereign' ? t.advancedAccess.sovereignName
                    : t.advancedAccess.workerNodeName}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500">
                {t.advancedAccess.accessTierDesc}
              </p>
            </div>
          )}
          
          <Separator />

          {/* Wallet Connection */}
          <WalletConnect />

          {/* Telegram Link */}
          <TelegramLink
            currentUsername={profile?.telegram_username}
            onSaved={(username) => {
              updateTelegram(username);
            }}
          />
        </CardContent>
      </Card>

      {/* Crypto Billing & Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t.pricingExtra.billingTitle}
          </CardTitle>
          <CardDescription>
            {t.pricingExtra.billingDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => navigate('/billing')} 
            className="bg-indigo-600 hover:bg-indigo-550 text-indigo-100 border border-indigo-500/30 text-xs font-semibold gap-1.5"
          >
            <CreditCard className="h-4 w-4" />
            {t.pricingExtra.manageSubscription}
          </Button>
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
            {t.settingsExtra.themeSectionTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t.theme}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settingsExtra.themeSectionDesc}
              </p>
            </div>
            <ThemeSwitch />
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
            {t.settingsExtra.langSelectLabel}
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
                <SelectItem value="uk">UA</SelectItem>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="ru">RU</SelectItem>
                <SelectItem value="es">ES</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ZHOS Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settingsExtra.zhosSectionTitle}</CardTitle>
          <CardDescription>
            {t.settingsExtra.zhosSectionDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{t.showPrinciplesBanner}</Label>
              <p className="text-sm text-muted-foreground">
                {t.settingsExtra.zhosShowPrinciples}
              </p>
            </div>
            <Switch
              checked={showPrinciplesBanner}
              onCheckedChange={handlePrinciplesBannerToggle}
            />
          </div>

          <Separator />

          {/* Push Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {t.settingsExtra.pushTitle}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t.settingsExtra.pushDesc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {permissionStatus === 'granted' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : permissionStatus === 'denied' ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : null}
                {!pushEnabled && permissionStatus !== 'denied' && (
                  <Button size="sm" onClick={requestPermission}>
                    {t.settingsExtra.enableBtn}
                  </Button>
                )}
              </div>
            </div>

            {permissionStatus === 'denied' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-sm text-red-600 dark:text-red-400">
                {t.settingsExtra.pushDeniedAlert}
              </div>
            )}

            {pushEnabled && (
              <>
                <Separator />
                
                {/* News Feed Notifications */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      {t.settingsExtra.notifyNewsTitle}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settingsExtra.notifyNewsDesc}
                    </p>
                  </div>
                  <Switch
                    checked={pushSettings.news_enabled}
                    onCheckedChange={handleNewsPushToggle}
                  />
                </div>

                <Separator />

                {/* Chat Notifications */}
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      {t.settingsExtra.notifyChatsTitle}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t.settingsExtra.notifyChatsDesc}
                    </p>
                  </div>
                  
                  {loadingChats ? (
                    <div className="text-sm text-muted-foreground">{t.settingsExtra.loadingChats}</div>
                  ) : chats.length === 0 ? (
                    <div className="text-sm text-muted-foreground">{t.settingsExtra.noChats}</div>
                  ) : (
                    <ScrollArea className="h-48 border rounded-md p-3">
                      <div className="space-y-2">
                        {chats.map((chat) => (
                          <div key={chat.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`chat-${chat.id}`}
                              checked={pushSettings.chat_notifications?.includes(chat.id) || false}
                              onCheckedChange={(checked) => handleChatToggle(chat.id, checked as boolean)}
                            />
                            <Label
                              htmlFor={`chat-${chat.id}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {chat.name || t.settingsExtra.chatFallbackName.replace('{id}', chat.id.slice(0, 8))}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>{t.settingsExtra.limitsTitle}</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• {t.settingsExtra.limitsOnline}</div>
              <div>• {t.settingsExtra.limitsFileSize}</div>
              <div>• {t.settingsExtra.limitsMessageLength}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button 
          className="w-full sm:w-auto"
          onClick={handleSaveProfile}
          disabled={loading}
        >
          {loading ? t.settingsExtra.saving : t.save}
        </Button>
      </div>
    </div>
  );
};
