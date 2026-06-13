import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, LogOut, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';

export const PendingApprovalPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <Card className="shadow-elegant border-border/80 bg-card/70 backdrop-blur-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{t.pendingApproval.cardTitle}</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 leading-relaxed text-sm">
              {t.pendingApproval.cardDesc}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-2">
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="space-y-0.5">
                  <div className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">{t.pendingApproval.accountLabel}</div>
                  <div className="text-foreground font-medium break-all">{user?.email}</div>
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{t.pendingApproval.statusLabel}</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  {t.pendingApproval.statusPending}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 border-muted hover:bg-muted/30 h-10 font-semibold"
              >
                <LogOut className="h-4 w-4" />
                {t.pendingApproval.btnLogout}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')} 
                className="w-full flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground h-10 font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                {t.pendingApproval.btnBackHome}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};