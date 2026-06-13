import { useState, useEffect } from 'react';
import { getAdminMicroDAOs, AdminMicroDAORow, isRlsOrSchemaError } from '@/lib/adminQueries';
import { 
  ShieldAlert, 
  Building2, 
  Copy, 
  Search, 
  ExternalLink,
  Bot,
  User,
  Clock,
  Settings,
  AlertTriangle,
  X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

export const AdminMicroDAOs = () => {
  const { language } = useTranslation();
  const { toast } = useToast();
  const [daos, setDaos] = useState<AdminMicroDAORow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isRpc, setIsRpc] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDao, setSelectedDao] = useState<AdminMicroDAORow | null>(null);

  const isUk = language === 'uk';

  const fetchDaos = async () => {
    setLoading(true);
    const res = await getAdminMicroDAOs();
    if (res.data) {
      setDaos(res.data);
    }
    setError(res.error);
    setIsRpc(res.isRpc);
    setLoading(false);
  };

  useEffect(() => {
    fetchDaos();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} ${isUk ? 'скопійовано' : 'copied'}`,
    });
  };

  const filteredDaos = daos.filter((d) => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.slug || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoadingSpinner size="lg" text={isUk ? 'Завантаження реєстру MicroDAO...' : 'Loading MicroDAO registry...'} />
      </div>
    );
  }

  const rlsBlocked = error && isRlsOrSchemaError(error);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
          {isUk ? 'Реєстр MicroDAO' : 'MicroDAO Registry'}
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          {isUk 
            ? 'Перелік створених організацій (спільнот), моніторинг підключення агентів та операційні метадані.' 
            : 'Sovereign community workspace directory, agent connectivity, and operational logs.'}
        </p>
      </div>

      {rlsBlocked ? (
        <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-5 space-y-3 text-xs">
          <div className="font-bold text-red-400 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            {isUk ? 'Доступ до списку MicroDAO обмежено RLS' : 'MicroDAO Access Restricted by RLS'}
          </div>
          <p className="text-slate-400 leading-relaxed">
            {isUk 
              ? 'Supabase RLS закриває доступ до таблиці communities для користувачів, які не є учасниками цих спільнот. Будь ласка, переконайтеся, що ви запустили локальний файл міграції для реєстрації безпечних RPC-функцій.'
              : 'Supabase Row Level Security blocks reading communities you are not a member of. Apply the local migration file to register admin SECURITY DEFINER queries to display the platform registry.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* List Area */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3 bg-slate-900/10 border border-slate-900/60 p-4 rounded-xl backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder={isUk ? 'Пошук за назвою або ідентифікатором...' : 'Search by name or slug...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-950/40 border-slate-800 text-slate-200 text-xs placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-850 bg-slate-900/15 backdrop-blur-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-slate-300">
                  <thead>
                    <tr className="border-b border-slate-850 bg-slate-950/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">MicroDAO</th>
                      <th className="p-4">{isUk ? 'Власник' : 'Owner'}</th>
                      <th className="p-4">{isUk ? 'Створено' : 'Created At'}</th>
                      <th className="p-4">{isUk ? 'Учасники' : 'Members'}</th>
                      <th className="p-4">{isUk ? 'Агент' : 'Agent'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 text-xs">
                    {filteredDaos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          {isUk ? 'Організацій не знайдено' : 'No MicroDAOs found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredDaos.map((dao) => (
                        <tr 
                          key={dao.id} 
                          onClick={() => setSelectedDao(dao)}
                          className={`hover:bg-slate-900/10 transition-colors cursor-pointer ${selectedDao?.id === dao.id ? 'bg-indigo-650/5' : ''}`}
                        >
                          <td className="p-4 space-y-1">
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              {dao.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              /{dao.slug || 'no-slug'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-xs text-slate-300">{dao.owner_name || (isUk ? 'Завантаження...' : 'Fetching...')}</div>
                            <div className="text-[9px] text-slate-500 font-mono">{dao.owner_email || '—'}</div>
                          </td>
                          <td className="p-4 text-[10px] font-mono text-slate-500">
                            {new Date(dao.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-slate-400 font-medium">
                            {dao.member_count}
                          </td>
                          <td className="p-4">
                            {dao.has_spirit_agent ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-semibold gap-1">
                                <Bot className="h-3 w-3" />
                                {dao.agent_status === 'active' ? 'Active' : 'Offline'}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-slate-500 border-slate-800 text-[10px] font-medium">
                                None
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Details Drawer Panel */}
          <div className="lg:col-span-1">
            {selectedDao ? (
              <Card className="border-slate-800 bg-slate-900/20 backdrop-blur-sm sticky top-6">
                <CardHeader className="flex flex-row items-start justify-between pb-3 border-b border-slate-850">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-bold text-slate-200">{selectedDao.name}</CardTitle>
                    <CardDescription className="text-[10px] font-mono text-indigo-400">/{selectedDao.slug || 'no-slug'}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-slate-500 hover:text-slate-300"
                    onClick={() => setSelectedDao(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* Warning Note */}
                  <div className="rounded-lg bg-indigo-950/20 border border-indigo-900/20 p-3 text-[10px] text-indigo-300/90 leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <span>
                      {isUk 
                        ? 'Показано лише системні метадані платформи. Вміст приватної пам’яті, повідомлення та конфіденційні файли спільноти захищені та недоступні для адміністраторів платформи.' 
                        : 'Platform admins see operational metadata. Private community memory, messages, and confidential files are restricted and protected from admin view.'}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex flex-col gap-1 rounded-lg bg-slate-950/25 border border-slate-850 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">ID Спільноти</span>
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-300 bg-slate-950/40 px-2 py-1 rounded">
                        <span className="truncate mr-2">{selectedDao.id}</span>
                        <button 
                          onClick={() => handleCopy(selectedDao.id, 'Community ID')}
                          className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-850/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                        {isUk ? 'Власник' : 'Owner'}
                      </span>
                      <span className="text-slate-200 text-right">
                        <div className="font-semibold">{selectedDao.owner_name || 'No Name'}</div>
                        <div className="text-[9px] text-slate-500 font-mono truncate max-w-[150px]">{selectedDao.owner_email || '—'}</div>
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-850/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                        {isUk ? 'Дата створення' : 'Created At'}
                      </span>
                      <span className="text-slate-200 font-mono text-[11px]">
                        {new Date(selectedDao.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-850/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-500" />
                        {isUk ? 'Тип спільноти' : 'Type'}
                      </span>
                      <span className="text-slate-300 uppercase font-semibold text-[10px]">
                        {selectedDao.type}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-850/60">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-slate-500" />
                        {isUk ? 'Дух Спільноти' : 'Spirit Agent'}
                      </span>
                      <span>
                        {selectedDao.has_spirit_agent ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
                            {selectedDao.agent_status === 'active' ? 'Active' : 'Offline'}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 font-semibold">{isUk ? 'Відсутній' : 'Not installed'}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="space-y-2 pt-2 border-t border-slate-850">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{isUk ? 'Дії адміністратора' : 'Admin Actions'}</div>
                    
                    <Button 
                      disabled
                      className="w-full justify-center bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 cursor-not-allowed opacity-60 text-xs h-9"
                    >
                      {isUk ? 'Призупинити MicroDAO' : 'Suspend MicroDAO'}
                    </Button>
                    
                    <Button 
                      disabled
                      className="w-full justify-center bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 cursor-not-allowed opacity-60 text-xs h-9"
                    >
                      {isUk ? 'Перевстановити Агента' : 'Repair Spirit Agent'}
                    </Button>
                    
                    <div className="text-[9px] text-center text-slate-500">
                      {isUk ? 'Дії відключені. Потрібні RPC у F2B' : 'Actions disabled. Needs RPC in F2B'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-850 border-dashed bg-slate-900/5 backdrop-blur-sm p-6 text-center text-slate-500 text-xs">
                {isUk 
                  ? 'Оберіть MicroDAO зі списку для перегляду детальних метаданих.' 
                  : 'Select a MicroDAO from the table to view its detailed operational metadata.'}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminMicroDAOs;
