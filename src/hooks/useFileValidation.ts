import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';

export const useFileValidation = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

  const validateFile = async (file: File): Promise<{ valid: boolean; sanitizedName?: string }> => {
    try {
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
          contentHash: contentHash.substring(0, 16) // First 16 chars for logging
        }
      });

      if (error) {
        toast({
          title: t.fileValidation.validationErrorTitle,
          description: error.message || t.fileValidation.rejectedDesc,
          variant: 'destructive'
        });
        return { valid: false };
      }

      if (!data.success) {
        toast({
          title: t.fileValidation.rejectedTitle,
          description: data.error || t.fileValidation.rejectedDesc,
          variant: 'destructive'
        });
        return { valid: false };
      }

      return { 
        valid: true, 
        sanitizedName: data.sanitizedFileName 
      };

    } catch (error) {
      console.error('File validation error:', error);
      toast({
        title: t.fileValidation.errorTitle,
        description: t.fileValidation.errorDesc,
        variant: 'destructive'
      });
      return { valid: false };
    }
  };

  return { validateFile };
};