import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, Search, LayoutGrid, LayoutList, Folder, 
  FolderOpen, File, Tag, Settings, Download, 
  Trash2, Copy, Move, Star, StarOff,
  Database, Cpu, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileUploadDialog } from "@/components/FileUploadDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/lib/i18n";
import { getFunctionErrorMessage } from "@/utils/functionErrors";

interface KBFile {
  id: string;
  name: string;
  file_type: string;
  mime_type?: string;
  size_bytes: number;
  storage_path: string;
  description?: string;
  is_knowledge_base: boolean;
  indexing_status?: string | null;
  created_at: string;
  file_tags?: { tag: string }[];
  profiles?: { display_name: string; avatar_url?: string };
  folders?: { name: string };
  folders_id?: string;
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
  const { t } = useTranslation();
  
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
  const [indexingFileId, setIndexingFileId] = useState<string | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedFileForConfig, setSelectedFileForConfig] = useState<string | null>(null);
  const [chunkSize, setChunkSize] = useState(1000);
  const [chunkOverlap, setChunkOverlap] = useState(200);

  const indexFile = async (fileId: string, size = 1000, overlap = 200) => {
    try {
      setIndexingFileId(fileId);
      
      const { data, error } = await supabase.functions.invoke('embed-document', {
        body: { fileId, chunkSize: size, chunkOverlap: overlap }
      });

      if (error) {
        throw new Error(error.message || 'Failed to index file');
      }

      toast({
        title: t.kb.indexSuccessTitle,
        description: t.kb.indexSuccess,
      });

      loadFiles();
    } catch (error) {
      console.error('Error indexing file:', error);
      toast({
        title: t.kb.indexErrorTitle,
        description: error instanceof Error ? error.message : t.kb.indexFailedDesc,
        variant: "destructive",
      });
    } finally {
      setIndexingFileId(null);
    }
  };

  const handleOpenConfigDialog = (fileId: string) => {
    setSelectedFileForConfig(fileId);
    setConfigDialogOpen(true);
  };

  const handleStartIndexing = () => {
    if (selectedFileForConfig) {
      indexFile(selectedFileForConfig, chunkSize, chunkOverlap);
      setConfigDialogOpen(false);
    }
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.set('scope', scope);
      if (searchQuery) params.set('q', searchQuery);
      if (projectId && scope === 'project') params.set('projectId', projectId);
      
      const { data, error } = await supabase.functions.invoke(`knowledge-base-api/search?${params.toString()}`, {
        method: 'GET'
      });

      if (error) {
        throw new Error(error.message || 'Failed to load files');
      }
      
      setFiles(data?.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
      const description = await getFunctionErrorMessage(error, t.kb.errorLoadFiles);
      toast({
        title: t.error,
        description,
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
      
      const { data, error } = await supabase.functions.invoke(`knowledge-base-api/folders?${params.toString()}`, {
        method: 'GET'
      });

      if (error) throw new Error(error.message);
      
      setFolders(data?.folders || []);
    } catch (error) {
      console.error('Error loading folders:', error);
      const description = await getFunctionErrorMessage(error, t.kb.errorLoadFiles);
      toast({
        title: t.error,
        description,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFiles();
    loadFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        title: !currentValue ? t.kb.addedToKb : t.kb.removedFromKb,
        description: t.kb.fileUpdated,
      });
      
      loadFiles();
    } catch (error) {
      console.error('Error toggling knowledge base:', error);
      toast({
        title: t.error,
        description: t.kb.errorUpdate,
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

  const sidebarContent = (
    <div className="p-4">
      <Tabs value={scope} onValueChange={(v) => setScope(v as 'community' | 'project')}>
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="community">{t.kb.tabCommunity}</TabsTrigger>
          <TabsTrigger value="project">{t.kb.tabProjects}</TabsTrigger>
          <TabsTrigger value="personal">{t.kb.tabPersonal}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => setSelectedFolder(null)}
        >
          <Folder className="h-4 w-4 mr-2" />
          {t.kb.allFiles}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)]">
        {renderFolderTree()}
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-7.5rem)] bg-background lg:min-h-[calc(100vh-3.5rem)]">
      <aside className="hidden w-72 shrink-0 border-r bg-sidebar/50 lg:block">
        {sidebarContent}
      </aside>

      <div className="min-w-0 flex-1 flex flex-col">
        <div className="border-b border-border bg-background/50 p-3 lg:hidden">
          <Tabs value={scope} onValueChange={(v) => setScope(v as 'community' | 'project')}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="community">{t.kb.tabCommunity}</TabsTrigger>
              <TabsTrigger value="project">{t.kb.tabProjects}</TabsTrigger>
              <TabsTrigger value="personal">{t.kb.tabPersonal}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Верхняя панель */}
        <div className="border-b border-border bg-background/50 p-3 sm:p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="w-full flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t.kb.searchPlaceholder}
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
            
            <Button onClick={() => setUploadDialogOpen(true)} className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              {t.kb.uploadBtn}
            </Button>
        </div>

        {/* Область файлов */}
        <ScrollArea className="flex-1 p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <File className="h-12 w-12 mb-4 opacity-50" />
                <p>{t.kb.noFilesFound}</p>
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
                                <><StarOff className="h-4 w-4 mr-2" /> {t.kb.removeFromKb}</>
                              ) : (
                                <><Star className="h-4 w-4 mr-2" /> {t.kb.addToKb}</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleOpenConfigDialog(file.id)}
                              disabled={indexingFileId === file.id || file.indexing_status === 'indexing'}
                            >
                              <Database className="h-4 w-4 mr-2" />
                              {file.indexing_status === 'indexed' ? t.kb.reindex : t.kb.indexBtn}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" /> {t.kb.download}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" /> {t.kb.copyLink}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Move className="h-4 w-4 mr-2" /> {t.kb.move}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> {t.delete}
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
                            {t.kb.title}
                          </Badge>
                        )}
                        
                        {file.indexing_status === 'indexed' ? (
                          <Badge variant="secondary" className="mb-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                            <Cpu className="h-3 w-3 mr-1" />
                            {t.kb.indexed}
                          </Badge>
                        ) : file.indexing_status === 'indexing' || indexingFileId === file.id ? (
                          <Badge variant="secondary" className="mb-2 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20 animate-pulse">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            {t.kb.indexing}
                          </Badge>
                        ) : file.indexing_status === 'failed' ? (
                          <Badge variant="secondary" className="mb-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                            {t.error}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="mb-2 cursor-pointer hover:bg-muted" onClick={() => handleOpenConfigDialog(file.id)}>
                            <Database className="h-3 w-3 mr-1" />
                            {t.kb.indexBtn}
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
                            {t.kb.title}
                          </Badge>
                        )}
                        {file.indexing_status === 'indexed' ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                            <Cpu className="h-3 w-3 mr-1" />
                            {t.kb.indexed}
                          </Badge>
                        ) : file.indexing_status === 'indexing' || indexingFileId === file.id ? (
                          <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20 animate-pulse">
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            {t.kb.indexing}
                          </Badge>
                        ) : file.indexing_status === 'failed' ? (
                          <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20">
                            {t.error}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="cursor-pointer hover:bg-muted" onClick={() => handleOpenConfigDialog(file.id)}>
                            <Database className="h-3 w-3 mr-1" />
                            {t.kb.indexBtn}
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
                              <><StarOff className="h-4 w-4 mr-2" /> {t.kb.removeFromKb}</>
                            ) : (
                              <><Star className="h-4 w-4 mr-2" /> {t.kb.addToKb}</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleOpenConfigDialog(file.id)}
                            disabled={indexingFileId === file.id || file.indexing_status === 'indexing'}
                          >
                            <Database className="h-4 w-4 mr-2" />
                            {file.indexing_status === 'indexed' ? t.kb.reindex : t.kb.indexBtn}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" /> {t.kb.download}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" /> {t.kb.copyLink}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Move className="h-4 w-4 mr-2" /> {t.kb.move}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> {t.delete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            )}
        </ScrollArea>

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

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t.kb.configTitle}</DialogTitle>
            <DialogDescription>
              {t.kb.configDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chunkSize" className="text-right">
                {t.kb.chunkSize}
              </Label>
              <Input
                id="chunkSize"
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chunkOverlap" className="text-right">
                {t.kb.chunkOverlap}
              </Label>
              <Input
                id="chunkOverlap"
                type="number"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              {t.cancel}
            </Button>
            <Button onClick={handleStartIndexing}>
              {t.kb.indexAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
