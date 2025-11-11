import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, Search, LayoutGrid, LayoutList, Folder, 
  FolderOpen, File, Tag, Settings, Download, 
  Trash2, Copy, Move, Star, StarOff 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KBFile {
  id: string;
  name: string;
  file_type: string;
  mime_type?: string;
  size_bytes: number;
  storage_path: string;
  description?: string;
  is_knowledge_base: boolean;
  created_at: string;
  file_tags?: { tag: string }[];
  profiles?: { display_name: string; avatar_url?: string };
  folders?: { name: string };
}

interface KBFolder {
  id: string;
  name: string;
  parent_id?: string;
  project_id?: string;
  scope: 'community' | 'project';
}

export default function KnowledgeBase() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [scope, setScope] = useState<'community' | 'project'>(
    (searchParams.get('scope') as 'community' | 'project') || 'community'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<KBFile[]>([]);
  const [folders, setFolders] = useState<KBFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.set('scope', scope);
      if (searchQuery) params.set('q', searchQuery);
      if (projectId && scope === 'project') params.set('projectId', projectId);
      
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/knowledge-base-api/search?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic2RzZGV4YXl6Zm9leGpkbGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzQxNjUsImV4cCI6MjA3MjY1MDE2NX0.mlCtak2aAIMRuJU3GCF0WWS4065aalvfZOm1nPHtEqI'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to load files');
      }
      
      const data = await response.json();
      setFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось загрузить файлы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const params = new URLSearchParams();
      params.set('scope', scope);
      if (projectId && scope === 'project') params.set('projectId', projectId);
      
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch(
        `https://pbsdsdexayzfoexjdlgb.supabase.co/functions/v1/knowledge-base-api/folders?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBic2RzZGV4YXl6Zm9leGpkbGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwNzQxNjUsImV4cCI6MjA3MjY1MDE2NX0.mlCtak2aAIMRuJU3GCF0WWS4065aalvfZOm1nPHtEqI'
          }
        }
      );

      if (!response.ok) throw new Error(await response.text());
      
      const data = await response.json();
      setFolders(data || []);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  useEffect(() => {
    loadFiles();
    loadFolders();
  }, [scope, searchQuery, projectId]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'document':
        return '📄';
      case 'image':
        return '🖼️';
      case 'code':
        return '💻';
      case 'data':
        return '📊';
      default:
        return '📁';
    }
  };

  const toggleKnowledgeBase = async (fileId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ is_knowledge_base: !currentValue })
        .eq('id', fileId);
      
      if (error) throw error;
      
      toast({
        title: !currentValue ? "Добавлено в базу знаний" : "Удалено из базы знаний",
        description: "Файл успешно обновлен",
      });
      
      loadFiles();
    } catch (error) {
      console.error('Error toggling knowledge base:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить файл",
        variant: "destructive",
      });
    }
  };

  const renderFolderTree = (parentId: string | null = null, level = 0) => {
    const childFolders = folders.filter(f => f.parent_id === parentId);
    
    return childFolders.map(folder => (
      <div key={folder.id} style={{ marginLeft: level * 16 }}>
        <Button
          variant={selectedFolder === folder.id ? "secondary" : "ghost"}
          className="w-full justify-start mb-1"
          onClick={() => setSelectedFolder(folder.id)}
        >
          {selectedFolder === folder.id ? (
            <FolderOpen className="h-4 w-4 mr-2" />
          ) : (
            <Folder className="h-4 w-4 mr-2" />
          )}
          {folder.name}
        </Button>
        {renderFolderTree(folder.id, level + 1)}
      </div>
    ));
  };

  return (
    <Layout
      sidebar={
        <div className="p-4">
          <Tabs value={scope} onValueChange={(v) => setScope(v as 'community' | 'project')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="community">Сообщество</TabsTrigger>
              <TabsTrigger value="project">Проекты</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="mb-4">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setSelectedFolder(null)}
            >
              <Folder className="h-4 w-4 mr-2" />
              Все файлы
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)]">
            {renderFolderTree()}
          </ScrollArea>
        </div>
      }
    >
      <div className="h-full flex flex-col">
        {/* Верхняя панель */}
        <div className="border-b border-border bg-background/50 p-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск файлов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Загрузить
            </Button>
        </div>

        {/* Область файлов */}
        <ScrollArea className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <File className="h-12 w-12 mb-4 opacity-50" />
                <p>Файлов не найдено</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {files.map((file) => (
                  <Card key={file.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-4xl">{getFileIcon(file.file_type)}</div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => toggleKnowledgeBase(file.id, file.is_knowledge_base)}>
                              {file.is_knowledge_base ? (
                                <><StarOff className="h-4 w-4 mr-2" /> Убрать из базы знаний</>
                              ) : (
                                <><Star className="h-4 w-4 mr-2" /> Добавить в базу знаний</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" /> Скачать
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" /> Копировать ссылку
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Move className="h-4 w-4 mr-2" /> Переместить
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate mb-1">{file.name}</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          {formatFileSize(file.size_bytes)}
                        </p>
                        
                        {file.is_knowledge_base && (
                          <Badge variant="secondary" className="mb-2">
                            <Star className="h-3 w-3 mr-1" />
                            База знаний
                          </Badge>
                        )}
                        
                        {file.file_tags && file.file_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {file.file_tags.slice(0, 3).map((tagObj, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tagObj.tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {files.map((file) => (
                  <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getFileIcon(file.file_type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{formatFileSize(file.size_bytes)}</span>
                          {file.folders && (
                            <>
                              <span>•</span>
                              <span>{file.folders.name}</span>
                            </>
                          )}
                          {file.profiles && (
                            <>
                              <span>•</span>
                              <span>{file.profiles.display_name}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {file.is_knowledge_base && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            База знаний
                          </Badge>
                        )}
                        {file.file_tags && file.file_tags.map((tagObj, idx) => (
                          <Badge key={idx} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {tagObj.tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => toggleKnowledgeBase(file.id, file.is_knowledge_base)}>
                            {file.is_knowledge_base ? (
                              <><StarOff className="h-4 w-4 mr-2" /> Убрать из базы знаний</>
                            ) : (
                              <><Star className="h-4 w-4 mr-2" /> Добавить в базу знаний</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" /> Скачать
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" /> Копировать ссылку
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Move className="h-4 w-4 mr-2" /> Переместить
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </ScrollArea>
      </div>

      <FileUploadDialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        onUploadComplete={() => {
          loadFiles();
          loadFolders();
        }}
        projectId={projectId}
        folderId={selectedFolder || undefined}
        scope={scope}
      />
    </Layout>
  );
}
