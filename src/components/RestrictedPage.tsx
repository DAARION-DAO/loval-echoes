import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const RestrictedPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="glass-panel border-red-500/20 bg-slate-900/40 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="h-8 w-8 text-red-500 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-100">
              Доступ обмежено
            </CardTitle>
            <CardDescription className="text-slate-400 mt-2 leading-relaxed text-sm">
              Ваш акаунт заблоковано або відхилено адміністратором. Будь ласка, зверніться до підтримки, якщо ви вважаєте, що це помилка.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Емейл:</span>
                <span className="text-slate-200 font-semibold break-all">{user?.email}</span>
              </div>
              <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Статус:</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                  Обмежено / Blocked
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 border-slate-800 hover:bg-slate-900 h-10 font-semibold text-slate-300"
              >
                <LogOut className="h-4 w-4" />
                Вийти з акаунта
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
