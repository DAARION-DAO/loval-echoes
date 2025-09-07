import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return null; // This shouldn't happen due to route protection, but just in case
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Добро пожаловать в ЖОС Мессенджер</h1>
            <p className="text-muted-foreground mt-2">
              Привет, {user.user_metadata?.display_name || user.email}!
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Выйти
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate('/chats')}
          >
            <h2 className="text-xl font-semibold mb-2">{t.chats.title}</h2>
            <p className="text-muted-foreground">
              Перейти к чатам общины и начать общение с агентом ЖОС
            </p>
          </div>
          
          <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Принципы ЖОС</h2>
            <p className="text-muted-foreground">
              Изучить принципы живой операционной системы и духа общины
            </p>
          </div>
          
          <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Настройки</h2>
            <p className="text-muted-foreground">
              Настроить профиль и параметры взаимодействия
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
