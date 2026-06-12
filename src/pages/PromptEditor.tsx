import { useState, useEffect, useCallback } from 'react';
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
import { useActiveCommunity } from '@/hooks/useActiveCommunity';
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

export function PromptEditor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeCommunity, activeCommunityId, isCommunityAdmin, loading: communityLoading } = useActiveCommunity();

  const [activeTab, setActiveTab] = useState<'system' | 'responses' | 'fallback'>('system');
  const [versionName, setVersionName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = isCommunityAdmin;

  const loadVersions = useCallback(async () => {
    if (!activeCommunityId) {
      setVersions([]);
      return;
    }
    setLoadingVersions(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase
        .from('agent_prompt_versions')
        .select('id, prompt_type, version_name, content, is_active, created_at, updated_at')
        .eq('community_id', activeCommunityId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setVersions((data ?? []) as PromptVersion[]);
    } catch (err: any) {
      console.error('Load versions error:', err);
      setLoadError(err?.message || 'Не вдалося завантажити версії');
    } finally {
      setLoadingVersions(false);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    loadVersions();
  }, [loadVersions]);

  // Set initial editor content based on activeTab and active version
  useEffect(() => {
    const activeVersion = versions.find(v => v.prompt_type === activeTab && v.is_active);
    if (activeVersion) {
      setPromptContent(activeVersion.content);
      const typeVersions = versions.filter(v => v.prompt_type === activeTab);
      const nextVersionNum = typeVersions.length + 1;
      setVersionName(`v${nextVersionNum}`);
      setSelectedVersionId(activeVersion.id);
    } else {
      const typeVersions = versions.filter(v => v.prompt_type === activeTab);
      setPromptContent('');
      setVersionName(`v${typeVersions.length + 1}`);
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
    loadVersions().then(() => toast({ description: 'Дані оновлено' }));
  };

  const handleSaveVersion = async () => {
    if (!promptContent.trim()) return;
    if (!versionName.trim()) {
      toast({
        title: "Помилка",
        description: "Будь ласка, введіть назву версії",
        variant: "destructive",
      });
      return;
    }
    if (!activeCommunityId || !user) return;
    setSaving(true);
    try {
      // First version for this prompt_type becomes active automatically
      const isFirst = versions.filter(v => v.prompt_type === activeTab).length === 0;
      const { data, error } = await supabase
        .from('agent_prompt_versions')
        .insert({
          community_id: activeCommunityId,
          prompt_type: activeTab,
          version_name: versionName.trim(),
          content: promptContent,
          is_active: isFirst,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      await loadVersions();
      setSelectedVersionId(data.id);
      toast({ description: 'Версію промпту збережено' });
    } catch (err: any) {
      console.error('Save error:', err);
      toast({
        title: 'Помилка збереження',
        description: err?.message || 'Спробуйте ще раз',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleActivateVersion = async (id: string) => {
    try {
      const { error } = await supabase.rpc('activate_prompt_version', { p_version_id: id });
      if (error) throw error;
      await loadVersions();
      const activated = versions.find(v => v.id === id);
      if (activated) {
        setPromptContent(activated.content);
        setSelectedVersionId(activated.id);
      }
      toast({ description: 'Версію активовано' });
    } catch (err: any) {
      console.error('Activate error:', err);
      toast({
        title: 'Помилка активації',
        description: err?.message || 'Спробуйте ще раз',
        variant: 'destructive',
      });
    }
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

  if (communityLoading) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <div className="text-sm text-muted-foreground">Завантаження спільноти...</div>
      </div>
    );
  }

  if (!activeCommunityId) {
    return (
      <div className="container max-w-5xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Немає активної спільноти</CardTitle>
            <CardDescription>Створіть або оберіть спільноту, щоб редагувати промпти.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

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
            Налаштування інструкцій та поведінки агента{activeCommunity ? ` · ${activeCommunity.name}` : ''}
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
              disabled={!promptContent.trim() || saving}
              className="flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Збереження...' : 'Зберегти версію'}
            </Button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs">
          {loadError}
        </div>
      )}

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
