import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Activity, Users, FileText, Eye } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  rateLimitEvents: number;
  authFailures: number;
  fileUploads: number;
}

export const SecurityDashboard = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalEvents: 0,
    criticalEvents: 0,
    rateLimitEvents: 0,
    authFailures: 0,
    fileUploads: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
    
    // Set up real-time subscription for security events
    const channel = supabase
      .channel('security_events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'security_audit_log'
      }, (payload) => {
        console.log('New security event:', payload);
        loadSecurityData(); // Refresh data on new events
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSecurityData = async () => {
    try {
      // Load recent security events (last 24 hours)
      const { data: eventsData, error: eventsError } = await supabase
        .from('security_audit_log')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (eventsError) {
        console.error('Error loading security events:', eventsError);
        return;
      }

      setEvents((eventsData || []).map(event => ({
        ...event,
        event_data: event.event_data as Record<string, any>,
        ip_address: event.ip_address as string | undefined,
        user_agent: event.user_agent as string | undefined
      })));

      // Calculate statistics
      const totalEvents = eventsData?.length || 0;
      const criticalEvents = eventsData?.filter(e => {
        const eventData = e.event_data as Record<string, any>;
        return eventData?.severity === 'critical' || 
               e.event_type.includes('rate_limit') ||
               e.event_type.includes('failed');
      }).length || 0;
      
      const rateLimitEvents = eventsData?.filter(e => 
        e.event_type.includes('rate_limit')
      ).length || 0;
      
      const authFailures = eventsData?.filter(e => 
        e.event_type.includes('auth') && e.event_type.includes('failed')
      ).length || 0;
      
      const fileUploads = eventsData?.filter(e => 
        e.event_type.includes('file_upload')
      ).length || 0;

      setStats({
        totalEvents,
        criticalEvents,
        rateLimitEvents,
        authFailures,
        fileUploads
      });

    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: 'Ошибка загрузки данных безопасности',
        description: 'Не удалось загрузить информацию о безопасности',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (eventType: string, eventData: Record<string, any>) => {
    if (eventData?.severity === 'critical' || eventType.includes('rate_limit')) {
      return 'destructive';
    }
    if (eventData?.severity === 'warning' || eventType.includes('failed')) {
      return 'secondary';
    }
    return 'default';
  };

  const getEventIcon = (eventType: string) => {
    if (eventType.includes('auth')) return <Users className="w-4 h-4" />;
    if (eventType.includes('file')) return <FileText className="w-4 h-4" />;
    if (eventType.includes('rate_limit')) return <AlertTriangle className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  const formatEventDescription = (event: SecurityEvent) => {
    const eventType = event.event_type;
    const data = event.event_data;
    
    if (eventType.includes('auth_login_success')) {
      return `Успешный вход пользователя ${data?.email || 'неизвестно'}`;
    }
    if (eventType.includes('auth_login_failed')) {
      return `Неудачная попытка входа ${data?.email || 'неизвестно'}`;
    }
    if (eventType.includes('auth_signup_success')) {
      return `Успешная регистрация ${data?.email || 'неизвестно'}`;
    }
    if (eventType.includes('rate_limit')) {
      return `Превышен лимит запросов для действия: ${data?.action || 'неизвестно'}`;
    }
    if (eventType.includes('file_upload')) {
      return `Загрузка файла: ${data?.original_filename || 'неизвестно'}`;
    }
    
    return eventType.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Загрузка данных безопасности...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Панель безопасности</h2>
      </div>

      {/* Security Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Всего событий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">За последние 24 часа</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Критические</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Требуют внимания</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Блокировки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.rateLimitEvents}</div>
            <p className="text-xs text-muted-foreground">Rate limiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Неудачные входы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.authFailures}</div>
            <p className="text-xs text-muted-foreground">Попытки взлома</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Загрузки файлов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.fileUploads}</div>
            <p className="text-xs text-muted-foreground">Проверенные файлы</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {stats.criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Обнаружено {stats.criticalEvents} критических событий безопасности за последние 24 часа. 
            Рекомендуется немедленная проверка.
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Последние события безопасности
          </CardTitle>
          <CardDescription>
            События за последние 24 часа (максимум 50)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Нет событий безопасности за последние 24 часа
            </p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(event.event_type, event.event_data)}>
                        {event.event_type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    <p className="text-sm">{formatEventDescription(event)}</p>
                    {event.ip_address && (
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {event.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={loadSecurityData} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Обновить данные
        </Button>
      </div>
    </div>
  );
};