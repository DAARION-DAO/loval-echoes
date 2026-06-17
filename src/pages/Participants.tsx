import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
import { useTranslation } from '@/lib/i18n';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  buildInviteUrl,
  CommunityMemberView,
  InviteCodeView,
  InviteRole,
  loadCommunityMembers,
  loadInviteCodes,
  regenerateInviteCode,
  removeCommunityMember,
  updateCommunityMemberRole,
} from '@/services/communityMembers';
import {
  AlertTriangle,
  Copy,
  Crown,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  Share2,
  Shield,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';

const memberLocals = {
  uk: {
    title: 'Учасники MicroDAO',
    subtitle: 'Керуйте ролями, адміністраторами та запрошеннями активної MicroDAO.',
    noCommunityTitle: 'MicroDAO не вибрано',
    noCommunityDesc: 'Оберіть або створіть MicroDAO, щоб керувати її учасниками.',
    inviteTitle: 'Запрошення',
    inviteDesc: 'Надсилайте код або посилання. Email-доставка поки не підключена.',
    memberInvite: 'Код учасника',
    adminInvite: 'Код адміністратора',
    noActiveCode: 'Активного коду немає',
    generate: 'Згенерувати',
    regenerate: 'Оновити код',
    copyCode: 'Код',
    copyLink: 'Посилання',
    share: 'Поділитися',
    copied: 'Скопійовано',
    sharedTitle: 'Запрошення в MicroDAO',
    memberList: 'Список учасників',
    search: 'Пошук учасників...',
    emptyTitle: 'Учасників не знайдено',
    emptyDesc: 'Спробуйте змінити пошук або створіть запрошення.',
    joined: 'Приєднався',
    you: 'Ви',
    owner: 'Власник',
    admin: 'Адмін',
    member: 'Учасник',
    otherRole: 'Інша роль',
    approved: 'Схвалено',
    pending: 'Очікує',
    rejected: 'Відхилено',
    makeAdmin: 'Зробити адміном',
    makeMember: 'Зробити учасником',
    remove: 'Видалити',
    removeTitle: 'Видалити учасника?',
    removeDesc: 'Учасник втратить доступ до цієї MicroDAO. Дія не змінює його платформний акаунт.',
    readOnly: 'У вас режим перегляду. Ролі змінюють owner або admin.',
    adminLimit: 'Admin може видаляти тільки звичайних учасників. Призначати admin може тільки owner.',
    inviteRestricted: 'Запрошення доступні owner/admin цієї MicroDAO.',
    adminInviteRestricted: 'Admin-код бачить і оновлює тільки owner.',
    refresh: 'Оновити',
    loadError: 'Не вдалося завантажити учасників',
    roleUpdated: 'Роль оновлено',
    memberRemoved: 'Учасника видалено',
    inviteUpdated: 'Код запрошення оновлено',
    cancel: 'Скасувати',
    memberFallback: 'Учасник',
  },
  en: {
    title: 'MicroDAO Members',
    subtitle: 'Manage roles, admins, and invites for the active MicroDAO.',
    noCommunityTitle: 'No MicroDAO selected',
    noCommunityDesc: 'Select or create a MicroDAO to manage its members.',
    inviteTitle: 'Invites',
    inviteDesc: 'Share a code or link. Email delivery is not connected yet.',
    memberInvite: 'Member code',
    adminInvite: 'Admin code',
    noActiveCode: 'No active code',
    generate: 'Generate',
    regenerate: 'Regenerate',
    copyCode: 'Code',
    copyLink: 'Link',
    share: 'Share',
    copied: 'Copied',
    sharedTitle: 'MicroDAO invitation',
    memberList: 'Member list',
    search: 'Search members...',
    emptyTitle: 'No members found',
    emptyDesc: 'Try another search or create an invite.',
    joined: 'Joined',
    you: 'You',
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
    otherRole: 'Other role',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    makeAdmin: 'Make admin',
    makeMember: 'Make member',
    remove: 'Remove',
    removeTitle: 'Remove member?',
    removeDesc: 'This member will lose access to this MicroDAO. Their platform account is not changed.',
    readOnly: 'You are in read-only mode. Roles are managed by an owner or admin.',
    adminLimit: 'Admins can only remove regular members. Only the owner can assign admins.',
    inviteRestricted: 'Invites are available to this MicroDAO owner/admin.',
    adminInviteRestricted: 'Only the owner can view and regenerate the admin code.',
    refresh: 'Refresh',
    loadError: 'Failed to load members',
    roleUpdated: 'Role updated',
    memberRemoved: 'Member removed',
    inviteUpdated: 'Invite code updated',
    cancel: 'Cancel',
    memberFallback: 'Member',
  },
  ru: {
    title: 'Участники MicroDAO',
    subtitle: 'Управляйте ролями, администраторами и приглашениями активной MicroDAO.',
    noCommunityTitle: 'MicroDAO не выбрана',
    noCommunityDesc: 'Выберите или создайте MicroDAO, чтобы управлять участниками.',
    inviteTitle: 'Приглашения',
    inviteDesc: 'Отправляйте код или ссылку. Email-доставка пока не подключена.',
    memberInvite: 'Код участника',
    adminInvite: 'Код администратора',
    noActiveCode: 'Активного кода нет',
    generate: 'Создать',
    regenerate: 'Обновить код',
    copyCode: 'Код',
    copyLink: 'Ссылка',
    share: 'Поделиться',
    copied: 'Скопировано',
    sharedTitle: 'Приглашение в MicroDAO',
    memberList: 'Список участников',
    search: 'Поиск участников...',
    emptyTitle: 'Участники не найдены',
    emptyDesc: 'Измените поиск или создайте приглашение.',
    joined: 'Присоединился',
    you: 'Вы',
    owner: 'Владелец',
    admin: 'Админ',
    member: 'Участник',
    otherRole: 'Другая роль',
    approved: 'Одобрен',
    pending: 'Ожидает',
    rejected: 'Отклонен',
    makeAdmin: 'Сделать админом',
    makeMember: 'Сделать участником',
    remove: 'Удалить',
    removeTitle: 'Удалить участника?',
    removeDesc: 'Участник потеряет доступ к этой MicroDAO. Его платформенный аккаунт не изменится.',
    readOnly: 'У вас режим просмотра. Роли меняет owner или admin.',
    adminLimit: 'Admin может удалять только обычных участников. Назначать admin может только owner.',
    inviteRestricted: 'Приглашения доступны owner/admin этой MicroDAO.',
    adminInviteRestricted: 'Admin-код видит и обновляет только owner.',
    refresh: 'Обновить',
    loadError: 'Не удалось загрузить участников',
    roleUpdated: 'Роль обновлена',
    memberRemoved: 'Участник удален',
    inviteUpdated: 'Код приглашения обновлен',
    cancel: 'Отмена',
    memberFallback: 'Участник',
  },
  es: {
    title: 'Miembros de MicroDAO',
    subtitle: 'Gestiona roles, administradores e invitaciones de la MicroDAO activa.',
    noCommunityTitle: 'No hay MicroDAO seleccionada',
    noCommunityDesc: 'Selecciona o crea una MicroDAO para gestionar sus miembros.',
    inviteTitle: 'Invitaciones',
    inviteDesc: 'Comparte un código o enlace. El envío por email aún no está conectado.',
    memberInvite: 'Código de miembro',
    adminInvite: 'Código de administrador',
    noActiveCode: 'Sin código activo',
    generate: 'Generar',
    regenerate: 'Regenerar',
    copyCode: 'Código',
    copyLink: 'Enlace',
    share: 'Compartir',
    copied: 'Copiado',
    sharedTitle: 'Invitación a MicroDAO',
    memberList: 'Lista de miembros',
    search: 'Buscar miembros...',
    emptyTitle: 'No se encontraron miembros',
    emptyDesc: 'Prueba otra búsqueda o crea una invitación.',
    joined: 'Se unió',
    you: 'Tú',
    owner: 'Propietario',
    admin: 'Admin',
    member: 'Miembro',
    otherRole: 'Otro rol',
    approved: 'Aprobado',
    pending: 'Pendiente',
    rejected: 'Rechazado',
    makeAdmin: 'Hacer admin',
    makeMember: 'Hacer miembro',
    remove: 'Eliminar',
    removeTitle: '¿Eliminar miembro?',
    removeDesc: 'Este miembro perderá acceso a esta MicroDAO. Su cuenta de plataforma no cambia.',
    readOnly: 'Estás en modo lectura. Los roles los gestiona owner o admin.',
    adminLimit: 'Los admins solo pueden eliminar miembros normales. Solo el owner puede asignar admins.',
    inviteRestricted: 'Las invitaciones están disponibles para owner/admin de esta MicroDAO.',
    adminInviteRestricted: 'Solo el owner puede ver y regenerar el código admin.',
    refresh: 'Actualizar',
    loadError: 'No se pudieron cargar los miembros',
    roleUpdated: 'Rol actualizado',
    memberRemoved: 'Miembro eliminado',
    inviteUpdated: 'Código de invitación actualizado',
    cancel: 'Cancelar',
    memberFallback: 'Miembro',
  },
};

const supportedInviteRoles: InviteRole[] = ['member', 'admin'];

export const Participants = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const {
    activeCommunity,
    activeCommunityId,
    userCommunityRole,
    isCommunityAdmin,
    refresh,
  } = useActiveCommunity();
  const l = memberLocals[language as keyof typeof memberLocals] || memberLocals.en;

  const [members, setMembers] = useState<CommunityMemberView[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCodeView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionKey, setActionKey] = useState<string | null>(null);

  const isOwner = userCommunityRole === 'owner';
  const canManageInvites = userCommunityRole === 'owner' || userCommunityRole === 'admin';

  const loadData = async () => {
    if (!activeCommunityId) {
      setMembers([]);
      setInviteCodes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [loadedMembers, loadedCodes] = await Promise.all([
        loadCommunityMembers(activeCommunityId),
        loadInviteCodes(activeCommunityId),
      ]);
      setMembers(loadedMembers);
      setInviteCodes(loadedCodes);
    } catch (error: any) {
      console.error('Error loading community members:', error);
      toast({
        title: t.error,
        description: error?.message || l.loadError,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCommunityId]);

  const inviteByRole = useMemo(() => {
    const map = new Map<InviteRole, InviteCodeView>();
    for (const role of supportedInviteRoles) {
      const code = inviteCodes.find((invite) => invite.role_to_grant === role && invite.is_active);
      if (code) map.set(role, code);
    }
    return map;
  }, [inviteCodes]);

  const visibleMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => {
      const displayName = getDisplayName(member, l.memberFallback).toLowerCase();
      return (
        displayName.includes(query) ||
        member.user_id.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query) ||
        member.status.toLowerCase().includes(query)
      );
    });
  }, [l.memberFallback, members, search]);

  const activeCount = members.filter((member) => member.status === 'approved').length;
  const adminCount = members.filter((member) => member.status === 'approved' && member.role === 'admin').length;

  const copyText = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: l.copied });
    } catch (error: any) {
      toast({
        title: t.error,
        description: error?.message || l.loadError,
        variant: 'destructive',
      });
    }
  };

  const handleShareInvite = async (code: string) => {
    const url = buildInviteUrl(code);
    if ('share' in navigator) {
      try {
        await navigator.share({
          title: l.sharedTitle,
          text: code,
          url,
        });
        return;
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
      }
    }
    await copyText(url);
  };

  const handleRegenerateInvite = async (role: InviteRole) => {
    if (!activeCommunityId || !activeCommunity || !user) return;
    if (role === 'admin' && !isOwner) return;
    if (role === 'member' && !canManageInvites) return;

    const key = `invite-${role}`;
    setActionKey(key);
    try {
      const existing = inviteByRole.get(role);
      await regenerateInviteCode({
        communityId: activeCommunityId,
        communityName: activeCommunity.name,
        role,
        createdBy: user.id,
        maxUses: existing?.max_uses ?? 50,
      });
      await loadData();
      toast({
        title: t.success,
        description: l.inviteUpdated,
      });
    } catch (error: any) {
      toast({
        title: t.error,
        description: error?.message || l.loadError,
        variant: 'destructive',
      });
    } finally {
      setActionKey(null);
    }
  };

  const handleRoleChange = async (member: CommunityMemberView, role: 'admin' | 'member') => {
    if (!isOwner || member.role === 'owner') return;
    setActionKey(`role-${member.id}`);
    try {
      await updateCommunityMemberRole(member.id, role);
      await loadData();
      await refresh();
      toast({
        title: t.success,
        description: l.roleUpdated,
      });
    } catch (error: any) {
      toast({
        title: t.error,
        description: error?.message || l.loadError,
        variant: 'destructive',
      });
    } finally {
      setActionKey(null);
    }
  };

  const handleRemoveMember = async (member: CommunityMemberView) => {
    if (!canRemoveMember(member)) return;
    setActionKey(`remove-${member.id}`);
    try {
      await removeCommunityMember(member.id);
      await loadData();
      await refresh();
      toast({
        title: t.success,
        description: l.memberRemoved,
      });
    } catch (error: any) {
      toast({
        title: t.error,
        description: error?.message || l.loadError,
        variant: 'destructive',
      });
    } finally {
      setActionKey(null);
    }
  };

  const canRemoveMember = (member: CommunityMemberView) => {
    if (member.role === 'owner' || member.user_id === user?.id) return false;
    if (userCommunityRole === 'owner') return member.role === 'admin' || member.role === 'member';
    if (userCommunityRole === 'admin') return member.role === 'member';
    return false;
  };

  const roleLabel = (role: string) => {
    if (role === 'owner') return l.owner;
    if (role === 'admin') return l.admin;
    if (role === 'member') return l.member;
    return l.otherRole;
  };

  const statusLabel = (status: string) => {
    if (status === 'approved') return l.approved;
    if (status === 'pending') return l.pending;
    if (status === 'rejected') return l.rejected;
    return status;
  };

  const renderInviteCard = (role: InviteRole) => {
    const invite = inviteByRole.get(role);
    const canGenerate = role === 'member' ? canManageInvites : isOwner;
    const url = invite ? buildInviteUrl(invite.code) : '';
    const busy = actionKey === `invite-${role}`;

    return (
      <Card key={role} className="border-border/80 bg-card/70">
        <CardHeader className="space-y-1 p-4">
          <CardTitle className="text-sm flex items-center gap-2">
            {role === 'admin' ? <Shield className="h-4 w-4 text-amber-400" /> : <UserPlus className="h-4 w-4 text-primary" />}
            {role === 'admin' ? l.adminInvite : l.memberInvite}
          </CardTitle>
          {role === 'admin' && !isOwner && (
            <CardDescription className="text-xs">{l.adminInviteRestricted}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div className="rounded-lg border bg-background/60 px-3 py-2 font-mono text-sm text-foreground select-all break-all">
            {invite?.code || l.noActiveCode}
          </div>
          {invite && (
            <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span>{l.copyLink}: {url.replace(/^https?:\/\//, '')}</span>
              <span>{invite.used_count ?? 0}/{invite.max_uses ?? '∞'}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button
              variant="outline"
              size="sm"
              className="h-10"
              disabled={!invite}
              onClick={() => invite && copyText(invite.code)}
            >
              <Copy className="mr-2 h-4 w-4" />
              {l.copyCode}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10"
              disabled={!invite}
              onClick={() => invite && copyText(url)}
            >
              <Copy className="mr-2 h-4 w-4" />
              {l.copyLink}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-10"
              disabled={!invite}
              onClick={() => invite && handleShareInvite(invite.code)}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {l.share}
            </Button>
            {canGenerate && (
              <Button
                size="sm"
                className="h-10"
                disabled={busy}
                onClick={() => handleRegenerateInvite(role)}
              >
                {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {invite ? l.regenerate : l.generate}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!activeCommunityId || !activeCommunity) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h1 className="text-xl font-semibold">{l.noCommunityTitle}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{l.noCommunityDesc}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-7.5rem)] space-y-5 p-4 pb-24 sm:p-6 lg:min-h-[calc(100vh-3.5rem)] lg:pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{l.title}</h1>
            <Badge variant="outline" className="max-w-full truncate">
              {activeCommunity.name}
            </Badge>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{l.subtitle}</p>
        </div>
        <Button variant="outline" className="h-10 self-start lg:self-auto" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {l.refresh}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{activeCount}</div>
            <div className="text-xs text-muted-foreground">{l.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{adminCount}</div>
            <div className="text-xs text-muted-foreground">{l.admin}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold capitalize">{roleLabel(userCommunityRole || 'member')}</div>
            <div className="text-xs text-muted-foreground">{l.you}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-5">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-5 w-5 text-primary" />
            {l.inviteTitle}
          </CardTitle>
          <CardDescription>{canManageInvites ? l.inviteDesc : l.inviteRestricted}</CardDescription>
        </CardHeader>
        {canManageInvites && (
          <CardContent className="grid grid-cols-1 gap-3 p-4 pt-0 lg:grid-cols-2 sm:p-5 sm:pt-0">
            {renderInviteCard('member')}
            {isOwner ? (
              renderInviteCard('admin')
            ) : (
              <Card className="border-dashed bg-muted/20">
                <CardContent className="flex min-h-[180px] items-center gap-3 p-4 text-sm text-muted-foreground">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                  {l.adminInviteRestricted}
                </CardContent>
              </Card>
            )}
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-primary" />
                {l.memberList}
              </CardTitle>
              {!isCommunityAdmin && <CardDescription className="mt-1">{l.readOnly}</CardDescription>}
              {userCommunityRole === 'admin' && <CardDescription className="mt-1">{l.adminLimit}</CardDescription>}
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={l.search}
                className="h-10 pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-5 sm:pt-0">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : visibleMembers.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <Users className="mb-4 h-10 w-10 text-muted-foreground" />
              <h3 className="font-semibold">{l.emptyTitle}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{l.emptyDesc}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {visibleMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  currentUserId={user?.id}
                  actionKey={actionKey}
                  labels={l}
                  roleLabel={roleLabel}
                  statusLabel={statusLabel}
                  getDisplayName={(row) => getDisplayName(row, l.memberFallback)}
                  canPromote={isOwner && member.role === 'member'}
                  canDemote={isOwner && member.role === 'admin'}
                  canRemove={canRemoveMember(member)}
                  onPromote={() => handleRoleChange(member, 'admin')}
                  onDemote={() => handleRoleChange(member, 'member')}
                  onRemove={() => handleRemoveMember(member)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface MemberCardProps {
  member: CommunityMemberView;
  currentUserId?: string;
  actionKey: string | null;
  labels: typeof memberLocals.uk;
  roleLabel: (role: string) => string;
  statusLabel: (status: string) => string;
  getDisplayName: (member: CommunityMemberView) => string;
  canPromote: boolean;
  canDemote: boolean;
  canRemove: boolean;
  onPromote: () => void;
  onDemote: () => void;
  onRemove: () => void;
}

const MemberCard = ({
  member,
  currentUserId,
  actionKey,
  labels,
  roleLabel,
  statusLabel,
  getDisplayName,
  canPromote,
  canDemote,
  canRemove,
  onPromote,
  onDemote,
  onRemove,
}: MemberCardProps) => {
  const displayName = getDisplayName(member);
  const isSelf = member.user_id === currentUserId;
  const busy = actionKey?.endsWith(member.id);
  const hasActions = canPromote || canDemote || canRemove;

  return (
    <div className="rounded-xl border bg-card/60 p-4">
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 shrink-0">
          <AvatarImage src={member.profile?.avatar_url || undefined} />
          <AvatarFallback>{displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-semibold">{displayName}</h3>
                {isSelf && <Badge variant="outline">{labels.you}</Badge>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {labels.joined}: {formatDate(member.created_at)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <RoleBadge role={member.role} label={roleLabel(member.role)} />
              <Badge variant={member.status === 'approved' ? 'secondary' : 'outline'}>
                {statusLabel(member.status)}
              </Badge>
              {hasActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" disabled={busy}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canPromote && (
                      <DropdownMenuItem onClick={onPromote}>
                        <Shield className="mr-2 h-4 w-4" />
                        {labels.makeAdmin}
                      </DropdownMenuItem>
                    )}
                    {canDemote && (
                      <DropdownMenuItem onClick={onDemote}>
                        <Users className="mr-2 h-4 w-4" />
                        {labels.makeMember}
                      </DropdownMenuItem>
                    )}
                    {canRemove && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(event) => event.preventDefault()}
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            {labels.remove}
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{labels.removeTitle}</AlertDialogTitle>
                            <AlertDialogDescription>{labels.removeDesc}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
                            <AlertDialogAction onClick={onRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              {labels.remove}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="truncate font-mono text-[11px] text-muted-foreground">{member.user_id}</div>
        </div>
      </div>
    </div>
  );
};

const RoleBadge = ({ role, label }: { role: string; label: string }) => {
  if (role === 'owner') {
    return (
      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
        <Crown className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  }
  if (role === 'admin') {
    return (
      <Badge className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/10">
        <Shield className="mr-1 h-3 w-3" />
        {label}
      </Badge>
    );
  }
  return <Badge variant="outline">{label}</Badge>;
};

const getDisplayName = (member: CommunityMemberView, fallback: string) =>
  member.profile?.display_name || `${fallback} ${member.user_id.slice(0, 6)}`;

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
