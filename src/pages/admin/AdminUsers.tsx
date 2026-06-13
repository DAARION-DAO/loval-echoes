import { useState, useEffect } from 'react';
import { getAdminUsers, AdminUserRow, isRlsOrSchemaError } from '@/lib/adminQueries';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  ShieldAlert, 
  Check, 
  Ban, 
  UserCheck, 
  Copy, 
  ExternalLink,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const AdminUsers = () => {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isRpc, setIsRpc] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'guardian' | 'approved' | 'pending' | 'rejected'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isUk = language === 'uk';

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getAdminUsers();
    if (res.data) {
      setUsers(res.data);
    }
    setError(res.error);
    setIsRpc(res.isRpc);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} ${isUk ? 'скопійовано' : 'copied'}`,
    });
  };

  const handleSetApprovalStatus = async (userId: string, status: 'approved' | 'rejected') => {
    setActionLoading(userId);
    try {
      // Call the existing secure RPC admin_set_approval_status(p_user_id, p_status)
      const { error } = await supabase.rpc('admin_set_approval_status', {
        p_user_id: userId,
        p_status: status
      });

      if (error) throw error;

      toast({
        title: isUk ? 'Статус оновлено' : 'Status Updated',
        description: isUk 
          ? `Користувачу успішно встановлено статус: ${status}` 
          : `User approval status changed to: ${status}`,
      });
      
      // Reload user lists
      await fetchUsers();
    } catch (err: any) {
      console.error('Error changing approval status:', err);
      toast({
        variant: "destructive",
        title: isUk ? 'Помилка оновлення' : 'Update Failed',
        description: err.message || (isUk ? 'Не вдалося виконати операцію' : 'Failed to perform operation'),
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.display_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchesSearch) return false;
    
    if (activeFilter === 'all') return true;
    if (activeFilter === 'guardian') return u.role === 'guardian';
    if (activeFilter === 'approved') return u.approval_status === 'approved';
    if (activeFilter === 'pending') return u.approval_status === 'pending';
    if (activeFilter === 'rejected') return u.approval_status === 'rejected' || u.approval_status === 'blocked';
    
    return true;
  });

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold">Approved</Badge>;
      case 'rejected':
      case 'blocked':
        return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-semibold">Blocked</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] font-semibold">Pending</Badge>;
    }
  };

  const getRoleBadge = (role: string | null) => {
    if (role === 'guardian') {
      return <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-bold">Guardian</Badge>;
    }
    return <Badge variant="outline" className="text-slate-400 border-slate-800 text-[10px] font-medium">Member</Badge>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoadingSpinner size="lg" text={isUk ? 'Завантаження списку користувачів...' : 'Loading user list...'} />
      </div>
    );
  }

  const rlsBlocked = error && isRlsOrSchemaError(error);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            {isUk ? 'Керування користувачами' : 'User Operations'}
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {isUk 
              ? 'Список користувачів платформи, контроль доступу та конфігурація рівнів дозволів.' 
              : 'Detailed user directory, registration states, and security access tiers.'}
          </p>
        </div>
      </div>

      {rlsBlocked ? (
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-5 space-y-3 text-xs">
          <div className="font-bold text-red-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            {isUk ? 'Доступ до списку користувачів обмежено RLS' : 'User Access Restricted by RLS'}
          </div>
          <p className="text-slate-400 leading-relaxed">
            {isUk 
              ? 'Ваш акаунт не має прав на пряме читання профілів інших користувачів у Supabase. Будь ласка, переконайтеся, що файл локальної міграції успішно запущено на вашому локальному інстансі Supabase, і ви зайшли під акаунтом з роллю guardian.'
              : 'You do not have direct client read permission for user profiles. Ensure the platform admin RPCs have been loaded into your local database instance and that your session has the guardian platform role.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-slate-900/10 border border-slate-900/60 p-4 rounded-xl backdrop-blur-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder={isUk ? 'Пошук за email або ім’ям...' : 'Search by email or name...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-950/40 border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus-visible:ring-indigo-500/50"
              />
            </div>
            
            <div className="flex flex-wrap gap-1.5">
              {(['all', 'guardian', 'approved', 'pending', 'rejected'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'outline'}
                  onClick={() => setActiveFilter(filter)}
                  className="h-8 text-[11px] font-semibold uppercase px-3 border-slate-800"
                >
                  {isUk 
                    ? filter === 'all' ? 'Всі' : filter === 'guardian' ? 'Guardians' : filter === 'approved' ? 'Активні' : filter === 'pending' ? 'Очікують' : 'Блоковані'
                    : filter.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl border border-slate-850 bg-slate-900/15 backdrop-blur-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-300">
                <thead>
                  <tr className="border-b border-slate-850 bg-slate-950/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">{isUk ? 'Користувач' : 'Identity'}</th>
                    <th className="p-4">{isUk ? 'Статус' : 'Status'}</th>
                    <th className="p-4">Роль</th>
                    <th className="p-4">{isUk ? 'Рівень доступу' : 'Access Tier'}</th>
                    <th className="p-4">{isUk ? 'Створено' : 'Created At'}</th>
                    <th className="p-4 text-right">{isUk ? 'Дії' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60 text-xs">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        {isUk ? 'Користувачів не знайдено' : 'No users match criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 space-y-1">
                          <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                            {user.display_name || 'No Name'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 max-w-xs truncate">
                            {user.email || 'no-email'}
                            {user.email && (
                              <button 
                                onClick={() => handleCopy(user.email!, 'Email')}
                                className="text-slate-600 hover:text-slate-400 transition-colors"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-4">{getStatusBadge(user.approval_status)}</td>
                        <td className="p-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{getRoleBadge(user.role)}</span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                                {isUk ? 'Потребує RPC у F2B для зміни ролі' : 'Requires RPC in F2B to modify platform role'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="p-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">
                                  <Badge variant="outline" className="border-slate-800 text-[10px] font-mono text-slate-400 bg-slate-950/20">
                                    {user.access_tier || 'early_access'}
                                  </Badge>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                                {isUk ? 'Потребує RPC у F2B для зміни ліміту' : 'Requires RPC in F2B to modify access tier'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="p-4 text-[10px] font-mono text-slate-500">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {user.approval_status !== 'approved' && (
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 border-emerald-500/20 hover:border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
                                onClick={() => handleSetApprovalStatus(user.user_id, 'approved')}
                                disabled={actionLoading === user.id}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {user.approval_status !== 'rejected' && user.approval_status !== 'blocked' && (
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400"
                                onClick={() => handleSetApprovalStatus(user.user_id, 'rejected')}
                                disabled={actionLoading === user.id}
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 border-slate-800 text-slate-500 hover:text-slate-400 cursor-not-allowed opacity-50"
                                  >
                                    <Info className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 border border-slate-800 text-[10px] text-slate-400">
                                  {isUk 
                                    ? 'Зміна ролі чи білінгу відключена (Потребує RPC у F2B)' 
                                    : 'Role/Tier editing is disabled (Needs RPC in F2B)'}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminUsers;
