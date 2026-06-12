import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  RefreshCw, 
  Save, 
  AlertTriangle, 
  History, 
  Edit3, 
  Play,
  Lock
} from 'lucide-react';

interface PromptVersion {
  id: string;
  prompt_type: 'system' | 'responses' | 'fallback';
  version_name: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_VERSIONS: PromptVersion[] = [
  {
    id: 'sys-v1',
    prompt_type: 'system',
    version_name: 'v1',
    content: 'Ви є системним ШІ-помічником для MicroDAO спільноти. Допомагайте координувати завдання, розписувати проекти та відповідати на запитання з бази знань.',
    is_active: true,
    created_at: '2026-06-01T12:00:00.000Z',
    updated_at: '2026-06-01T12:00:00.000Z'
  },
  {
    id: 'sys-v2',
    prompt_type: 'system',
    version_name: 'v2',
    content: 'Ви — ШІ-координатор нашої спільноти. Ваша мета — допомагати учасникам вирішувати задачі, супроводжувати роботу над проектами та надавати доступ до знань у зручній формі.',
    is_active: false,
    created_at: '2026-06-10T14:30:00.000Z',
    updated_at: '2026-06-10T14:30:00.000Z'
  },
  {
    id: 'resp-v1',
    prompt_type: 'responses',
    version_name: 'v1',
    content: 'Відповідайте лаконічно, структуровано, використовуйте списки та маркування. Мова відповідей — українська.',
    is_active: true,
    created_at: '2026-06-02T10:00:00.000Z',
    updated_at: '2026-06-02T10:00:00.000Z'
  },
  {
    id: 'fall-v1',
    prompt_type: 'fallback',
    version_name: 'v1',
    content: 'Якщо у базі знань немає відповіді на запитання, ввічливо повідомте про це та порадьте звернутися до адміністраторів або створити нову задачу.',
    is_active: true,
    created_at: '2026-06-03T09:00:00.000Z',
    updated_at: '2026-06-03T09:00:00.000Z'
  }
];

export function PromptEditor() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'system' | 'responses' | 'fallback'>('system');
  
  // Editor state
  const [versionName, setVersionName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  
  // Prompt versions list
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [isAdmin, setIsAdmin] = useState(true); // Default to true, updated below

  // Check admin role
  useEffect(() => {
    const checkRole = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (data) {
          setIsAdmin(data.role === 'admin');
        }
      } catch (err) {
        console.error('Error checking user roles:', err);
      }
    };
    checkRole();
  }, [user]);

  // Load versions from localStorage or set defaults
  const loadVersions = () => {
    const stored = localStorage.getItem('zhos-prompt-versions');
    if (stored) {
      try {
        setVersions(JSON.parse(stored));
      } catch (e) {
        setVersions(DEFAULT_VERSIONS);
      }
    } else {
      setVersions(DEFAULT_VERSIONS);
      localStorage.setItem('zhos-prompt-versions', JSON.stringify(DEFAULT_VERSIONS));
    }
  };

  useEffect(() => {
    loadVersions();
  }, []);

  // Set initial editor content based on activeTab and active version
  useEffect(() => {
    const activeVersion = versions.find(v => v.prompt_type === activeTab && v.is_active);
    if (activeVersion) {
      setPromptContent(activeVersion.content);
      // Generate a new version name suggestions
      const typeVersions = versions.filter(v => v.prompt_type === activeTab);
      const nextVersionNum = typeVersions.length + 1;
      setVersionName(`v${nextVersionNum}`);
      setSelectedVersionId(activeVersion.id);
    } else {
      setPromptContent('');
      setVersionName('v1');
      setSelectedVersionId(null);
    }
  }, [activeTab, versions]);

  const activePromptVersion = versions.find(v => v.prompt_type === activeTab && v.is_active);

  // Check for unsaved changes
  const loadedVersion = versions.find(v => v.id === selectedVersionId);
  const hasUnsavedChanges = loadedVersion 
    ? promptContent !== loadedVersion.content 
    : promptContent.trim() !== '';

  const handleRefresh = () => {
    loadVersions();
    toast({
      description: "Дані оновлено",
    });
  };

  const handleSaveVersion = () => {
    if (!promptContent.trim()) return;
    if (!versionName.trim()) {
      toast({
        title: "Помилка",
        description: "Будь ласка, введіть назву версії",
        variant: "destructive",
      });
      return;
    }

    const newVersion: PromptVersion = {
      id: `${activeTab}-${Date.now()}`,
      prompt_type: activeTab,
      version_name: versionName,
      content: promptContent,
      is_active: false, // Newly saved version starts as draft
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedVersions = [...versions, newVersion];
    setVersions(updatedVersions);
    localStorage.setItem('zhos-prompt-versions', JSON.stringify(updatedVersions));
    setSelectedVersionId(newVersion.id);

    toast({
      description: "Версію промпту збережено",
    });
  };

  const handleActivateVersion = (id: string) => {
    const updated = versions.map(v => {
      if (v.prompt_type === activeTab) {
        return { ...v, is_active: v.id === id };
      }
      return v;
    });

    setVersions(updated);
    localStorage.setItem('zhos-prompt-versions', JSON.stringify(updated));

    // If active was selected, update promptContent
    const activated = updated.find(v => v.id === id);
    if (activated) {
      setPromptContent(activated.content);
      setSelectedVersionId(activated.id);
    }

    toast({
      description: "Версію активовано",
    });
  };

  const handleEditVersion = (v: PromptVersion) => {
    setPromptContent(v.content);
    setVersionName(v.version_name);
    setSelectedVersionId(v.id);
    toast({
      description: `Завантажено версію ${v.version_name} для редагування`,
    });
  };

  const filteredVersions = versions.filter(v => v.prompt_type === activeTab)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="container max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Редактор промптів</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Налаштування інструкцій та поведінки агента
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="h-4 w-4" />
            Оновити
          </Button>
          
          {isAdmin && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSaveVersion}
              disabled={!promptContent.trim()}
              className="flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              Зберегти версію
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(val) => setActiveTab(val as any)} 
        className="w-full space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="system">Системний</TabsTrigger>
          <TabsTrigger value="responses">Відповіді</TabsTrigger>
          <TabsTrigger value="fallback">Фолбек</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Editor Card */}
          <div className="space-y-4">
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm shadow-md">
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {activeTab === 'system' && 'Системні інструкції (System Prompt)'}
                      {activeTab === 'responses' && 'Формат та стиль відповідей'}
                      {activeTab === 'fallback' && 'Фолбек інструкції (запасні відповіді)'}
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {activeTab === 'system' && 'Базові правила, знання та ідентичність ШІ-агента спільноти'}
                      {activeTab === 'responses' && 'Налаштування стилю спілкування, мови та довжини повідомлень'}
                      {activeTab === 'fallback' && 'Інструкції на випадок відсутності відповіді в базі знань або помилок'}
                    </CardDescription>
                  </div>
                  
                  {activePromptVersion && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      Активна версія: {activePromptVersion.version_name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-4">
                {/* Warning for regular members */}
                {!isAdmin && (
                  <div className="p-3 rounded-lg border border-warning/30 bg-warning/10 text-warning text-xs flex items-start gap-2 mb-2">
                    <Lock className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Перегляд обмежено.</span> Ви можете бачити активні інструкції, але редагування та створення нових версій дозволено лише адміністраторам команди.
                    </div>
                  </div>
                )}

                {/* Unsaved changes notification */}
                {hasUnsavedChanges && isAdmin && (
                  <div className="p-3 rounded-lg border border-accent/30 bg-accent/5 text-accent text-xs flex items-center gap-2 animate-pulse">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-accent" />
                    <span>Маєте незбережені зміни в цьому промпті. Натисніть <strong>"Зберегти версію"</strong> для збереження чернетки.</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="version-name">Назва версії</Label>
                  <Input 
                    id="version-name"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                    placeholder="Наприклад: v1, v1.1, draft-new"
                    className="max-w-[200px]"
                    disabled={!isAdmin}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt-textarea">
                    {activeTab === 'system' && 'Контент промпту (system)'}
                    {activeTab === 'responses' && 'Контент промпту (responses)'}
                    {activeTab === 'fallback' && 'Контент промпту (fallback)'}
                  </Label>
                  <Textarea
                    id="prompt-textarea"
                    value={promptContent}
                    onChange={(e) => setPromptContent(e.target.value)}
                    placeholder={
                      activeTab === 'system' 
                        ? 'Введіть системні інструкції для агента спільноти…' 
                        : activeTab === 'responses' 
                        ? 'Введіть вимоги до стилю та формату відповідей асистента…' 
                        : 'Введіть інструкції для поведінки у невідомих ситуаціях…'
                    }
                    className="min-h-[350px] font-mono text-sm leading-relaxed p-4 border-border/80 focus-visible:ring-primary bg-background/50"
                    disabled={!isAdmin}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Versions Panel */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <History className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Версії промпту</h3>
              </div>
              <Badge variant="outline" className="text-xs">
                Всього: {filteredVersions.length}
              </Badge>
            </div>

            <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
              {filteredVersions.length === 0 ? (
                <div className="text-center p-6 border rounded-lg border-dashed">
                  <p className="text-xs text-muted-foreground">Версій не знайдено</p>
                </div>
              ) : (
                filteredVersions.map((v) => (
                  <Card 
                    key={v.id} 
                    className={`border-border/60 transition-all ${
                      v.is_active 
                        ? 'bg-primary/5 border-primary/40 shadow-sm' 
                        : 'bg-card/40 hover:bg-card/70'
                    }`}
                  >
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{v.version_name}</span>
                        {v.is_active ? (
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5 py-0.5">
                            Активна
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                            Чернетка
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed bg-background/40 p-2 rounded">
                        {v.content}
                      </p>

                      <div className="text-[10px] text-muted-foreground">
                        {new Date(v.updated_at).toLocaleDateString('uk-UA', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        {!v.is_active && isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[11px] h-7 px-2.5 flex items-center gap-1 flex-1"
                            onClick={() => handleActivateVersion(v.id)}
                          >
                            <Play className="h-3 w-3" />
                            Активувати
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-[11px] h-7 px-2 flex items-center gap-1 flex-1"
                          onClick={() => handleEditVersion(v)}
                        >
                          <Edit3 className="h-3 w-3" />
                          {isAdmin ? 'Редагувати' : 'Переглянути'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
