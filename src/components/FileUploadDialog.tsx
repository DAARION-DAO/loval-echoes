import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, File, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
  projectId?: string;
  folderId?: string;
  scope?: 'community' | 'project';
}

export const FileUploadDialog = ({
  open,
  onClose,
  onUploadComplete,
  projectId,
  folderId,
  scope = 'community'
}: FileUploadDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [tags, setTags] = useState<Record<string, string>>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    
    // Initialize descriptions and tags for new files
    acceptedFiles.forEach(file => {
      if (!descriptions[file.name]) {
        setDescriptions(prev => ({ ...prev, [file.name]: '' }));
      }
      if (!tags[file.name]) {
        setTags(prev => ({ ...prev, [file.name]: '' }));
      }
    });
  }, [files, descriptions, tags]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: true,
  });

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    setDescriptions(prev => {
      const newDesc = { ...prev };
      delete newDesc[fileName];
      return newDesc;
    });
    setTags(prev => {
      const newTags = { ...prev };
      delete newTags[fileName];
      return newTags;
    });
  };

  const handleUpload = async () => {
    if (!user || files.length === 0) return;

    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      try {
        // Validate file
        const MAX_SIZE = 25 * 1024 * 1024; // 25MB
        if (file.size > MAX_SIZE) {
          throw new Error(`Файл ${file.name} слишком большой (макс. 25MB)`);
        }

        // Upload to storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(fileName);

        // Determine file type
        let fileType = 'document';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.includes('json') || file.type.includes('csv')) fileType = 'data';
        else if (file.type.includes('text') || file.name.endsWith('.md')) fileType = 'code';

        // Create file record in database
        const { data: fileRecord, error: dbError } = await supabase
          .from('files')
          .insert({
            name: file.name,
            file_type: fileType,
            mime_type: file.type,
            size_bytes: file.size,
            storage_path: fileName,
            description: descriptions[file.name] || null,
            is_knowledge_base: true, // Auto-add to knowledge base
            user_id: user.id,
            project_id: projectId || null,
            folder_id: folderId || null,
            scope: scope,
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Add tags if provided
        if (tags[file.name]) {
          const tagList = tags[file.name].split(',').map(t => t.trim()).filter(Boolean);
          if (tagList.length > 0) {
            const tagInserts = tagList.map(tag => ({
              file_id: fileRecord.id,
              tag: tag
            }));

            await supabase.from('file_tags').insert(tagInserts);
          }
        }

        return { success: true, fileName: file.name };
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        return {
          success: false,
          fileName: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    setUploading(false);

    if (successCount > 0) {
      toast({
        title: "Файлы загружены",
        description: `Успешно загружено ${successCount} файл(ов)${failCount > 0 ? `, ошибок: ${failCount}` : ''}`,
      });
      setFiles([]);
      setDescriptions({});
      setTags({});
      onUploadComplete?.();
      onClose();
    } else {
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить файлы",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Загрузить файлы в базу знаний</DialogTitle>
          <DialogDescription>
            Выберите файлы для загрузки. Они будут автоматически добавлены в базу знаний.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {isDragActive
                ? 'Отпустите файлы здесь'
                : 'Перетащите файлы сюда или нажмите для выбора'}
            </p>
            <p className="text-xs text-muted-foreground">
              Поддерживаются: PDF, TXT, MD, DOCX, DOC, CSV, JSON, изображения (макс. 25MB)
            </p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.name} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.name)}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <Label htmlFor={`desc-${file.name}`} className="text-xs">Описание (необязательно)</Label>
                      <Textarea
                        id={`desc-${file.name}`}
                        placeholder="Краткое описание файла..."
                        value={descriptions[file.name] || ''}
                        onChange={(e) => setDescriptions(prev => ({ ...prev, [file.name]: e.target.value }))}
                        className="text-sm"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`tags-${file.name}`} className="text-xs">Теги (через запятую)</Label>
                      <Input
                        id={`tags-${file.name}`}
                        placeholder="тег1, тег2, тег3"
                        value={tags[file.name] || ''}
                        onChange={(e) => setTags(prev => ({ ...prev, [file.name]: e.target.value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={uploading}>
              Отмена
            </Button>
            <Button onClick={handleUpload} disabled={uploading || files.length === 0}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Загрузка...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Загрузить {files.length > 0 && `(${files.length})`}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

