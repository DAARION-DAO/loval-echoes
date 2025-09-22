import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  approval_status: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url'>>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      
      toast({
        title: 'Профиль обновлён',
        description: 'Изменения успешно сохранены'
      });

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить профиль',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Client-side validation first
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (file.size > MAX_SIZE) {
        throw new Error('Файл слишком большой. Максимальный размер: 5MB');
      }
      
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Неподдерживаемый тип файла. Используйте JPG, PNG, GIF или WebP');
      }

      // Server-side validation via edge function
      const { data: validationData, error: validationError } = await supabase.functions.invoke('file-validation', {
        body: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          contentHash: 'avatar-upload'
        }
      });

      if (validationError || !validationData?.success) {
        throw new Error(validationData?.error || 'Файл не прошел проверку безопасности');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload file to storage with additional security headers
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          cacheControl: '3600',
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Log security event
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: 'avatar_upload',
        p_event_data: {
          file_name: validationData.sanitizedFileName,
          file_size: file.size,
          file_type: file.type,
          timestamp: new Date().toISOString()
        }
      });

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить фото',
        variant: 'destructive'
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to profile changes
    const subscription = supabase
      .channel('user_profile')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE' && payload.new) {
            setProfile(payload.new as UserProfile);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile
  };
};