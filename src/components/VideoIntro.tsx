import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VolumeX, Volume2 } from 'lucide-react';
import { useVideoIntro } from '@/hooks/useVideoIntro';

interface VideoIntroProps {
  onComplete?: () => void;
  className?: string;
}

export const VideoIntro = ({ onComplete, className = '' }: VideoIntroProps) => {
  const { showIntro, isMuted, completeIntro, toggleMute } = useVideoIntro();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && showIntro) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(console.error);
    }
  }, [isMuted, showIntro]);

  const handleMuteToggle = () => {
    const newMutedState = toggleMute();
    if (videoRef.current) {
      videoRef.current.muted = newMutedState;
    }
  };

  const handleVideoEnd = () => {
    completeIntro();
    onComplete?.();
  };

  const handleSkip = () => {
    completeIntro();
    onComplete?.();
  };

  if (!showIntro) {
    return null;
  }

  return (
    <div className="video-intro-container">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Video */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          playsInline
          preload="auto"
        >
          <source src="/assets/zhos-logo-video.mp4" type="video/mp4" />
          Ваш браузер не поддерживает воспроизведение видео.
        </video>

        {/* Overlay Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleMuteToggle}
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">
                {isMuted ? 'Включить звук' : 'Выключить звук'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              Пропустить
            </Button>
          </div>

          {/* Bottom Progress Indicator */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            <div className="text-white/80 text-sm text-center">
              Добро пожаловать в ЖОС Мессенджер
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};