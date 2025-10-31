import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser,
  ILocalAudioTrack 
} from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const APP_ID = 'YAROMIR';

interface AgoraVoiceCallProps {
  channelName: string;
  onLeave?: () => void;
}

export const AgoraVoiceCall: React.FC<AgoraVoiceCallProps> = ({
  channelName,
  onLeave,
}) => {
  const { toast } = useToast();
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<Map<string, IAgoraRTCRemoteUser>>(new Map());
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<ILocalAudioTrack | null>(null);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    initAgora();
    return () => {
      cleanup();
    };
  }, []);

  const initAgora = async () => {
    try {
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Пользователь не авторизован');
      }
      setUserId(user.id);

      // Создаем клиент Agora
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Обработчики событий
      client.on('user-published', async (remoteUser, mediaType) => {
        await client.subscribe(remoteUser, mediaType);
        
        if (mediaType === 'audio') {
          remoteUser.audioTrack?.play();
          setRemoteUsers(prev => new Map(prev).set(remoteUser.uid.toString(), remoteUser));
        }
      });

      client.on('user-unpublished', (remoteUser) => {
        setRemoteUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(remoteUser.uid.toString());
          return newMap;
        });
      });

      client.on('user-left', (remoteUser) => {
        setRemoteUsers(prev => {
          const newMap = new Map(prev);
          newMap.delete(remoteUser.uid.toString());
          return newMap;
        });
      });

    } catch (error) {
      console.error('Ошибка инициализации Agora:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось инициализировать голосовой звонок',
        variant: 'destructive',
      });
    }
  };

  const joinChannel = async () => {
    if (!clientRef.current || !userId) return;

    try {
      // Генерируем токен (в продакшене нужно получать с сервера)
      const token = null; // Для тестирования без токена

      // Присоединяемся к каналу
      await clientRef.current.join(APP_ID, channelName, token, userId);

      // Создаем локальный аудио трек
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = audioTrack;

      // Публикуем аудио трек
      await clientRef.current.publish([audioTrack]);

      setIsJoined(true);
      toast({
        title: 'Подключено',
        description: 'Вы присоединились к голосовому каналу',
      });
    } catch (error) {
      console.error('Ошибка подключения:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось присоединиться к каналу',
        variant: 'destructive',
      });
    }
  };

  const leaveChannel = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }

      if (clientRef.current) {
        await clientRef.current.leave();
      }

      setIsJoined(false);
      setRemoteUsers(new Map());
      
      toast({
        title: 'Отключено',
        description: 'Вы покинули голосовой канал',
      });

      onLeave?.();
    } catch (error) {
      console.error('Ошибка отключения:', error);
    }
  };

  const toggleMute = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setMuted(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    remoteUsers.forEach(user => {
      if (user.audioTrack) {
        if (isSpeakerOff) {
          user.audioTrack.play();
        } else {
          user.audioTrack.stop();
        }
      }
    });
    setIsSpeakerOff(!isSpeakerOff);
  };

  const cleanup = async () => {
    if (isJoined) {
      await leaveChannel();
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Голосовой канал</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isJoined ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span>{remoteUsers.size + (isJoined ? 1 : 0)} участников</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isJoined ? (
          <Button onClick={joinChannel} className="flex-1">
            <Phone className="h-4 w-4 mr-2" />
            Начать встречу
          </Button>
        ) : (
          <>
            <Button
              variant={isMuted ? 'destructive' : 'secondary'}
              onClick={toggleMute}
              className="flex-1"
            >
              {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
              {isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
            </Button>

            <Button
              variant={isSpeakerOff ? 'destructive' : 'secondary'}
              onClick={toggleSpeaker}
              size="icon"
            >
              {isSpeakerOff ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            <Button
              variant="destructive"
              onClick={leaveChannel}
              size="icon"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {isJoined && remoteUsers.size > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Участники:</p>
          <div className="space-y-1">
            {Array.from(remoteUsers.values()).map((user) => (
              <div
                key={user.uid}
                className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-md bg-muted/50"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Участник {user.uid.toString().slice(0, 8)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
