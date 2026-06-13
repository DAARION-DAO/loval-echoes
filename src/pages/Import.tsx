import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Upload, FileText, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/lib/i18n';

export const ImportPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      // Check file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: t.importExtra.errorTooLargeTitle,
          description: t.importExtra.errorTooLargeDesc,
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
    }
  }, [toast, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    maxFiles: 1
  });

  const handleImport = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setProgress(30);

      const { data, error } = await supabase.functions.invoke('import-history', {
        body: formData
      });

      setProgress(80);

      if (error) {
        throw error;
      }

      setProgress(100);

      toast({
        title: t.importExtra.importSuccessTitle,
        description: t.importExtra.importSuccessDesc
      });

      // Redirect to the imported conversation
      if (data?.conversationId) {
        navigate(`/chats/${data.conversationId}`);
      } else {
        navigate('/chats');
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: t.importExtra.importFailedTitle,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
  };

  return (
    <div className="container max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/chats')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.importExtra.backBtn}
        </Button>
        <h1 className="text-2xl font-bold">{t.importExtra.title}</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t.importExtra.uploadBtn}
            </CardTitle>
            <CardDescription>
              {t.importExtra.formatsHelper}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-lg">{t.importExtra.dropActive}</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">
                      {t.importExtra.dropInactive}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t.importExtra.limitDesc}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                    disabled={uploading}
                  >
                    {t.delete}
                  </Button>
                </div>

                {progress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.importExtra.importing}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                <Button
                  onClick={handleImport}
                  disabled={uploading}
                  className="w-full"
                >
                  {uploading ? t.importExtra.importing : t.importExtra.importBtn}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t.importExtra.howToExportTg}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-1">
              <p className="font-medium">{t.importExtra.tgStep1}</p>
              <p className="text-muted-foreground ml-4">
                {t.importExtra.tgStep1Desc}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{t.importExtra.tgStep2}</p>
              <p className="text-muted-foreground ml-4">
                {t.importExtra.tgStep2Desc}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{t.importExtra.tgStep3}</p>
              <p className="text-muted-foreground ml-4">
                {t.importExtra.tgStep3Desc}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};