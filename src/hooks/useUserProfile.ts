import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n';
import { uploadProfileAvatar, AvatarUploadError } from '@/services/microdaoSettings';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  approval_status: string;
  created_at: string;
  updated_at: string;
  role?: string;
  access_tier?: string;
  wallet_address?: string;
  wallet_verified_at?: string;
  telegram_username?: string;
  telegram_user_id?: string;
}


export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
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
        title: t.userProfile.updatedTitle,
        description: t.userProfile.updatedDesc
      });

      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t.userProfile.updateErrorTitle,
        description: t.userProfile.updateErrorDesc,
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateTelegram = async (telegramUsername: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          telegram_username: telegramUsername,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.warn('[useUserProfile] telegram_username column may not exist:', error.message);
      } else {
        setProfile(prev => prev ? { ...prev, telegram_username: telegramUsername } : prev);
      }
    } catch (err) {
      console.warn('[useUserProfile] updateTelegram failed:', err);
    }
  };

  const updateWallet = async (walletAddress: string | null) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          wallet_address: walletAddress,
          wallet_verified_at: walletAddress ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) {
        console.warn('[useUserProfile] wallet_address column may not exist:', error.message);
      } else {
        setProfile(prev => prev ? {
          ...prev,
          wallet_address: walletAddress ?? undefined,
          wallet_verified_at: walletAddress ? new Date().toISOString() : undefined,
        } : prev);
      }
    } catch (err) {
      console.warn('[useUserProfile] updateWallet failed:', err);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { avatarUrl, profile: nextProfile } = await uploadProfileAvatar(file);
      setProfile(nextProfile);

      toast({
        title: t.userProfile.updatedTitle,
        description: t.userProfile.updatedDesc
      });

      return avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      const description = error instanceof AvatarUploadError && error.code === 'too_large'
        ? t.userProfile.fileTooLarge
        : error instanceof AvatarUploadError && error.code === 'unsupported_type'
          ? t.userProfile.unsupportedFileType
          : error instanceof Error ? error.message : t.userProfile.uploadFailed;

      toast({
        title: t.userProfile.updateErrorTitle,
        description,
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
    const channelName = `user_profile_${user.id}_${Math.random().toString(36).substring(7)}`;
    const subscription = supabase
      .channel(channelName)
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
      supabase.removeChannel(subscription);
    };
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    updateTelegram,
    updateWallet,
    uploadAvatar,
    refetch: fetchProfile
  };
};
