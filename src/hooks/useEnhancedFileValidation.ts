import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

interface ValidationResult {
  valid: boolean;
  sanitizedName?: string;
  error?: string;
  rateLimited?: boolean;
}

export const useEnhancedFileValidation = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const validateFile = async (file: File): Promise<ValidationResult> => {
    try {
      // Client-side pre-validation for better UX
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        toast({
          title: t.fileValidation.tooLargeTitle,
          description: t.fileValidation.tooLargeDesc,
          variant: 'destructive'
        });
        return { valid: false, error: t.fileValidation.tooLargeTitle };
      }

      // Check for dangerous file extensions
      const dangerousExtensions = [
        '.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js', '.jar',
        '.sh', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.msi', '.dll'
      ];
      
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (dangerousExtensions.includes(fileExtension)) {
        toast({
          title: t.fileValidation.invalidTypeTitle,
          description: t.fileValidation.invalidTypeDesc,
          variant: 'destructive'
        });
        return { valid: false, error: t.fileValidation.invalidTypeTitle };
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
          title: t.fileValidation.validationErrorTitle,
          description: t.fileValidation.validationErrorDesc,
          variant: 'destructive'
        });
        return { valid: false, error: t.fileValidation.validationErrorTitle };
      }

      if (data.rateLimited) {
        toast({
          title: t.fileValidation.rateLimitTitle,
          description: t.fileValidation.rateLimitDesc,
          variant: 'destructive'
        });
        return { valid: false, rateLimited: true, error: t.fileValidation.rateLimitTitle };
      }

      if (!data.success) {
        toast({
          title: t.fileValidation.rejectedTitle,
          description: data.error || t.fileValidation.rejectedDesc,
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
        title: t.fileValidation.errorTitle,
        description: t.fileValidation.errorDesc,
        variant: 'destructive'
      });
      return { valid: false, error: t.fileValidation.errorDesc };
    }
  };

  return { validateFile };
};