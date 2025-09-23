import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  valid: boolean;
  sanitizedName?: string;
  error?: string;
  rateLimited?: boolean;
}

export const useEnhancedFileValidation = () => {
  const { toast } = useToast();

  const validateFile = async (file: File): Promise<ValidationResult> => {
    try {
      // Client-side pre-validation for better UX
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast({
          title: 'Файл слишком большой',
          description: 'Максимальный размер файла: 50MB',
          variant: 'destructive'
        });
        return { valid: false, error: 'Файл слишком большой' };
      }

      // Check for dangerous file extensions
      const dangerousExtensions = [
        '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar',
        '.sh', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.msi', '.dll'
      ];
      
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (dangerousExtensions.includes(fileExtension)) {
        toast({
          title: 'Недопустимый тип файла',
          description: 'Этот тип файла не разрешен для загрузки',
          variant: 'destructive'
        });
        return { valid: false, error: 'Недопустимый тип файла' };
      }

      // Rate limit check for file uploads
      const userAgent = navigator.userAgent;
      
      // Calculate file hash for security logging
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { data, error } = await supabase.functions.invoke('file-validation', {
        body: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          contentHash: contentHash.substring(0, 16),
          userAgent
        }
      });

      if (error) {
        console.error('File validation error:', error);
        toast({
          title: 'Ошибка валидации файла',
          description: 'Не удалось проверить файл',
          variant: 'destructive'
        });
        return { valid: false, error: 'Ошибка валидации файла' };
      }

      if (data.rateLimited) {
        toast({
          title: 'Слишком много попыток',
          description: 'Попробуйте загрузить файл позже',
          variant: 'destructive'
        });
        return { valid: false, rateLimited: true, error: 'Слишком много попыток' };
      }

      if (!data.success) {
        toast({
          title: 'Файл отклонен',
          description: data.error || 'Файл не соответствует требованиям безопасности',
          variant: 'destructive'
        });
        return { valid: false, error: data.error };
      }

      return { 
        valid: true, 
        sanitizedName: data.sanitizedFileName 
      };

    } catch (error) {
      console.error('Enhanced file validation error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось проверить файл',
        variant: 'destructive'
      });
      return { valid: false, error: 'Не удалось проверить файл' };
    }
  };

  return { validateFile };
};