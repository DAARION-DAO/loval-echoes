import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CommunityStats {
  totalUsers: number;
  onlineUsers: number;
  onlineAgents: number;
  totalChats: number;
  todayMessages: number;
  isLoading: boolean;
}

export const useCommunityStats = () => {
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    onlineUsers: 0,
    onlineAgents: 0,
    totalChats: 0,
    todayMessages: 0,
    isLoading: true
  });

  const loadStats = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      // Параллельно получаем все статистики
      const [profilesResult, chatsResult, messagesResult, onlineResult] = await Promise.all([
        // Общее количество пользователей
        supabase.from('community_members').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        // Общее количество чатов (не архивированных)
        supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('is_archived', false),
        // Сообщения за сегодня
        supabase.from('messages').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
        // Активные пользователи (по сообщениям за последние 5 минут)
        supabase.from('messages').select('sender_name').gte('created_at', fiveMinutesAgo).not('sender_name', 'is', null)
      ]);

      // Подсчитываем уникальных онлайн пользователей и агентов
      const allOnlineNames = (onlineResult.data || []).filter(m => m.sender_name).map(m => m.sender_name);
      
      const zhosName = String.fromCharCode(0x0416, 0x041e, 0x0421);
      const spiritName = String.fromCharCode(0x0414, 0x0443, 0x0445, 0x20, 0x043e, 0x0431, 0x0449, 0x0438, 0x043d, 0x044b);

      const uniqueOnlineUsers = new Set(
        allOnlineNames.filter(name => !name.includes(zhosName) && !name.includes(spiritName))
      );
      
      const uniqueOnlineAgents = new Set(
        allOnlineNames.filter(name => name.includes(zhosName) || name.includes(spiritName))
      );
      
      // Ensure "Дух общины" is always counted as online
      uniqueOnlineAgents.add(spiritName);

      setStats({
        totalUsers: profilesResult.count || 0,
        onlineUsers: Math.max(1, uniqueOnlineUsers.size), // At least current user
        onlineAgents: uniqueOnlineAgents.size,
        totalChats: chatsResult.count || 0,
        todayMessages: messagesResult.count || 0,
        isLoading: false
      });
    } catch (error) {
      console.error('Error loading community stats:', error);
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    loadStats();
    
    // Обновляем статистику каждые 30 секунд
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loadStats };
};