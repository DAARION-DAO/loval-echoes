import { useState, useEffect } from 'react';

export const useVideoIntro = () => {
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem('zhos-video-intro-seen') !== 'true';
  });

  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('zhos-video-muted') === 'true';
  });

  const completeIntro = () => {
    localStorage.setItem('zhos-video-intro-seen', 'true');
    setShowIntro(false);
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('zhos-video-muted', newMutedState.toString());
    return newMutedState;
  };

  const resetIntro = () => {
    localStorage.removeItem('zhos-video-intro-seen');
    setShowIntro(true);
  };

  return {
    showIntro,
    isMuted,
    completeIntro,
    toggleMute,
    resetIntro,
  };
};