import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Square,
  RotateCcw,
  ImageIcon,
  FileText,
  Activity,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/lib/i18n';
import { difyClient } from '@/utils/difyClient';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ChatInterfaceProps {
  chatId: string;
}

export const ChatInterface = ({ chatId }: ChatInterfaceProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // Оголошуємо всі state змінні перед їх використанням
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(true); // Увімкнено за замовчуванням
  const [autoStopEnabled, setAutoStopEnabled] = useState(true);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isAutoStopped, setIsAutoStopped] = useState(false);
  const [silenceProgress, setSilenceProgress] = useState(0);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isAutoStoppedRef = useRef<boolean>(false);
  const handleSendMessageRef = useRef<((textToSend?: string, voiceMeta?: {
    messageType?: string;
    fileUrl?: string;
    transcription?: string;
    voiceDuration?: number;
  }) => Promise<void>) | null>(null);
  const startRecordingRef = useRef<(() => Promise<void>) | null>(null);
  
  // Обработка TTS аудио из Dify stream
  const handleTTSMessage = useCallback(async (tts: { audio: string; message_id: string }) => {
    console.log('Playing TTS audio from Dify stream, voice mode:', voiceModeEnabled);
    try {
      // Конвертируем base64 в blob
      const binaryString = atob(tts.audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      
      // Воспроизводим аудио
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      setIsPlayingTTS(true);
      
      // Зберігаємо поточні значення для використання в callback
      const shouldAutoRecord = voiceModeEnabled && autoStopEnabled;
      
      audio.onended = () => {
        setIsPlayingTTS(false);
        URL.revokeObjectURL(audioUrl);
        
        // В голосовом режиме автоматически начинаем запись после воспроизведения
        if (shouldAutoRecord) {
          console.log('TTS from Dify stream ended, starting recording automatically...');
          setTimeout(() => {
            // Використовуємо ref для доступу до startRecording
            if (startRecordingRef.current) {
              startRecordingRef.current();
            }
          }, 500);
        }
      };
      
      audio.onerror = () => {
        setIsPlayingTTS(false);
        URL.revokeObjectURL(audioUrl);
        toast({
          title: t.chatInterface.errPlayTitle,
          description: t.chatInterface.errPlayDesc,
          variant: 'destructive',
        });
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing TTS audio:', error);
      setIsPlayingTTS(false);
      toast({
        title: t.chatInterface.errTtsTitle,
        description: t.chatInterface.errTtsDesc,
        variant: 'destructive',
      });
    }
  }, [voiceModeEnabled, autoStopEnabled, toast]);
  
  // Перевіряємо scope чату для визначення чи доступний головний агент
  const [chatScope, setChatScope] = useState<'community' | 'project' | 'personal' | null>(null);
  const [isMainAgentAvailable, setIsMainAgentAvailable] = useState(true);
  
  useEffect(() => {
    // Scope column not yet available in conversations table - default to community
    setChatScope('community');
    setIsMainAgentAvailable(true);
  }, [chatId]);
  
  const currentMessage = null;
  const isStreaming = false;
  const stopStream = () => {};
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<any>(null);
  const typingChannelRef = useRef<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const channel = supabase.channel(`messages-${chatId}`);
    channel.subscribe();
    typingChannelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current && typingChannelRef.current) {
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: currentUser.id,
            user_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || t.chatInterface.userFallbackName,
            is_typing: false
          }
        });
      }
      isTypingRef.current = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [chatId, currentUser]);

  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Handle typing indicator
  useEffect(() => {
    if (!chatId || !currentUser || !typingChannelRef.current) return;

    if (message.length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: currentUser.id,
            user_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || t.chatInterface.userFallbackName,
            is_typing: true
          }
        });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        if (typingChannelRef.current) {
          typingChannelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: {
              user_id: currentUser.id,
              user_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || t.chatInterface.userFallbackName,
              is_typing: false
            }
          });
        }
      }, 2000);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingChannelRef.current.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: currentUser.id,
            user_name: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0] || t.chatInterface.userFallbackName,
            is_typing: false
          }
        });
      }
    }
  }, [message, chatId, currentUser]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const silenceStartRef = useRef<number>(0);
  const recordingStartRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Автоматическое озвучивание завершенного ответа агента в голосовом режиме
  // Примітка: TTS з Dify stream обробляється через handleTTSMessage
  // Цей useEffect для fallback якщо TTS не прийшов через stream
  useEffect(() => {
    // Перевіряємо чи є TTS вже оброблений через stream
    if (!currentMessage?.isComplete || isPlayingTTS) return;
    
    // Якщо voiceModeEnabled вимкнено, не озвучуємо
    if (!voiceModeEnabled) return;
    
    // Перевіряємо чи вже є TTS audio в метаданих (оброблено через handleTTSMessage)
    // Якщо немає, використовуємо fallback через tts-api
    const speakResponse = async () => {
      try {
        console.log('Synthesizing agent response via TTS API (fallback)...');
        
        const { data, error } = await supabase.functions.invoke('tts-api', {
          body: { 
            text: currentMessage.content,
            voice: 'alloy'
          }
        });
        
        if (error) {
          console.error('TTS API error:', error);
          return;
        }
        
        // Конвертируем base64 в blob и воспроизводим
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioElementRef.current = audio;
        setIsPlayingTTS(true);
        
        // Зберігаємо значення для використання в callback
        const shouldAutoRecord = voiceModeEnabled && autoStopEnabled;
        
        audio.onended = () => {
          setIsPlayingTTS(false);
          URL.revokeObjectURL(audioUrl);
          
          // В голосовом режиме автоматически начинаем запись после воспроизведения
          if (shouldAutoRecord) {
            console.log('TTS playback ended (fallback), starting recording automatically...');
            setTimeout(() => {
              startRecording();
            }, 500);
          }
        };
        
        audio.onerror = () => {
          setIsPlayingTTS(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } catch (error) {
        console.error('Error in TTS playback:', error);
        setIsPlayingTTS(false);
      }
    };
    
    speakResponse();
  }, [currentMessage?.isComplete, currentMessage?.content, voiceModeEnabled, autoStopEnabled, isPlayingTTS]);

  // Конвертация аудио blob в WAV формат
  const convertToWav = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Конвертируем в PCM WAV
    const wavBuffer = audioBufferToWav(audioBuffer);
    await audioContext.close();
    
    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // Конвертация AudioBuffer в WAV формат
  const audioBufferToWav = (audioBuffer: AudioBuffer): ArrayBuffer => {
    const numChannels = 1; // моно
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const data = audioBuffer.getChannelData(0);
    const dataLength = data.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    // PCM данные
    const volume = 0.8;
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, data[i] * volume));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return buffer;
  };

  // Озвучивание ответа агента через TTS (автоматически из Dify stream)

  // Останавливаем воспроизведение TTS
  const stopPlayingTTS = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setIsPlayingTTS(false);
  };


  const handleSendMessage = useCallback(async (
    textToSend?: string,
    voiceMeta?: {
      messageType?: string;
      fileUrl?: string;
      transcription?: string | null;
      voiceDuration?: number;
      fileName?: string;
      fileSize?: number;
      fileType?: string;
    }
  ) => {
    const messageText = textToSend || message;
    if (!messageText.trim() && attachedFiles.length === 0 && !voiceMeta) return;
    if (isStreaming) return;

    try {
      // 1. Send text message if any
      if (messageText.trim() && !voiceMeta) {
        await difyClient.sendMessage(chatId, messageText);
      }

      // 2. Send voice message if any
      if (voiceMeta) {
        await difyClient.sendMessage(chatId, '', undefined, voiceMeta);
      }
      
      // 3. Send each file as a separate message
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            const uploadResult = await difyClient.uploadFile(file, chatId);
            await difyClient.sendMessage(chatId, '', undefined, {
              messageType: 'file',
              fileUrl: uploadResult.url,
              fileName: uploadResult.name,
              fileSize: uploadResult.size,
              fileType: file.type,
            });
          } catch (error) {
            console.error('Error uploading file:', error);
            toast({
              title: t.error,
              description: t.chatInterface.errUploadTitle.replace('{name}', file.name),
              variant: 'destructive',
            });
          }
        }
      }
      
      // Очищаем форму
      setMessage('');
      setAttachedFiles([]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t.error,
        description: error instanceof Error ? error.message : t.errors.unknownError,
        variant: 'destructive',
      });
    }
  }, [message, attachedFiles, isStreaming, chatId, toast, t, difyClient]);

  // Зберігаємо handleSendMessage в ref для використання в async callbacks
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).filter(file => {
      // Проверка размера файла (25MB)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: t.error,
          description: t.files.tooLarge,
          variant: 'destructive',
        });
        return false;
      }
      
      // Проверка типа файла
      const allowedTypes = [
        'text/plain',
        'text/markdown',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: t.error,
          description: t.files.invalidType,
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    });
    
    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const stopRecording = (isAutoStop = false) => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    console.log('Stopping recording...', { isAutoStop });
    setIsRecording(false);
    
    // Встановлюємо флаг тільки якщо це був автостоп
    if (isAutoStop) {
      setIsAutoStopped(true);
      isAutoStoppedRef.current = true; // Зберігаємо в ref для використання в onstop callback
    } else {
      setIsAutoStopped(false);
      isAutoStoppedRef.current = false;
    }
    
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setSilenceProgress(0);
    
    // Clean up audio processing
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
  };

  const startRecording = useCallback(async () => {
    let stream: MediaStream | null = null;
    
    try {
      // Pre-flight Check 1: Secure Context
      if (!window.isSecureContext) {
        toast({
          title: t.chatInterface.errHttpsTitle,
          description: t.chatInterface.errHttpsDesc,
          variant: 'destructive',
        });
        return;
      }

      // Pre-flight Check 2: Browser Compatibility
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: t.chatInterface.errMicrophoneNotSupportedTitle,
          description: t.chatInterface.errMicrophoneNotSupportedDesc,
          variant: 'destructive',
        });
        return;
      }

      // Pre-flight Check 3: Device Availability
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioInput = devices.some(device => device.kind === 'audioinput');
      
      if (!hasAudioInput) {
        toast({
          title: t.chatInterface.errMicrophoneNotFoundTitle,
          description: t.chatInterface.errMicrophoneNotFoundDesc,
          variant: 'destructive',
        });
        return;
      }

      // Request microphone access
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup Voice Activity Detection (VAD)
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      processorRef.current = processor;
      
      analyser.fftSize = 2048;
      microphone.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);
      
      // VAD Configuration
      const SILENCE_THRESHOLD = 0.02;
      const SILENCE_DURATION = 2500; // 2.5 seconds as requested
      const MIN_RECORDING_TIME = 1000; // minimum 1 second
      
      recordingStartRef.current = Date.now();
      silenceStartRef.current = 0;
      
      // Audio level monitoring and silence detection
      processor.onaudioprocess = (e) => {
        const buffer = e.inputBuffer.getChannelData(0);
        const rms = Math.sqrt(buffer.reduce((sum, val) => sum + val * val, 0) / buffer.length);
        
        // Update visual audio level
        setAudioLevel(Math.min(rms * 100, 100));
        
        if (autoStopEnabled) {
          const currentTime = Date.now();
          const recordingDuration = currentTime - recordingStartRef.current;
          
          if (rms < SILENCE_THRESHOLD) {
            if (silenceStartRef.current === 0) {
              silenceStartRef.current = currentTime;
            } else {
              const silenceDuration = currentTime - silenceStartRef.current;
              const progress = Math.min((silenceDuration / SILENCE_DURATION) * 100, 100);
              setSilenceProgress(progress);
              
              // Auto-stop if silence detected for long enough and minimum recording time passed
              if (silenceDuration > SILENCE_DURATION && recordingDuration > MIN_RECORDING_TIME) {
                console.log('Auto-stopping recording due to silence');
                stopRecording(true); // Передаємо true щоб позначити що це автостоп
              }
            }
          } else {
            // Reset silence timer when sound detected
            silenceStartRef.current = 0;
            setSilenceProgress(0);
          }
        }
      };
      
    // Determine the best supported MIME type - prioritize WAV
    let mimeType = 'audio/wav';
    if (MediaRecorder.isTypeSupported('audio/wav')) {
      mimeType = 'audio/wav';
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=pcm')) {
      mimeType = 'audio/webm;codecs=pcm';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      mimeType = 'audio/webm';
    }
    
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = mediaRecorder;
    console.log('Recording with MIME type:', mimeType);
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        let audioBlob = new Blob(chunks, { type: mimeType });
        
        const wasAutoStopped = isAutoStoppedRef.current;
        const recordingDuration = Math.max(1, Math.round((Date.now() - recordingStartRef.current) / 1000));
        
        // Показываем индикатор обработки
        toast({
          title: t.chatInterface.toastProcessingVoiceTitle,
          description: t.chatInterface.toastConvertingDesc,
        });
        
        try {
          // Конвертируем в WAV если это не WAV
          if (!mimeType.includes('wav')) {
            console.log('Converting audio to WAV format...');
            audioBlob = await convertToWav(audioBlob);
            console.log('Audio converted to WAV');
          }
          
          toast({
            title: t.chatInterface.toastProcessingVoiceTitle,
            description: t.chatInterface.toastSavingDesc,
          });
          
          // Upload to Supabase Storage
          const fileName = `${chatId}/${Date.now()}.wav`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('voice-messages')
            .upload(fileName, audioBlob, {
              contentType: 'audio/wav',
              cacheControl: '3600',
              upsert: false
            });
          
          if (uploadError) {
            throw new Error(`Failed to upload voice message: ${uploadError.message}`);
          }
          
          const { data: { publicUrl } } = supabase.storage
            .from('voice-messages')
            .getPublicUrl(fileName);
            
          const voiceMeta = {
            messageType: 'voice',
            fileUrl: publicUrl,
            transcription: null,
            voiceDuration: recordingDuration,
          };
          
          console.log('Voice message uploaded, public URL:', publicUrl);
          
          toast({
            title: t.chatInterface.toastAudioRecordedTitle,
            description: t.chatInterface.toastSendingDesc,
          });
          
          // Скидаємо ref
          isAutoStoppedRef.current = false;
          
          setTimeout(() => {
            if (handleSendMessageRef.current) {
              handleSendMessageRef.current('', voiceMeta);
            }
            setIsAutoStopped(false);
          }, 300);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          const errorMessage = error instanceof Error ? error.message : t.errors.unknownError;
          console.error('Full error details:', {
            error,
            message: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
            audioBlobSize: audioBlob.size,
            mimeType,
          });
          
          // Перевіряємо чи це помилка від API
          let apiError = null;
          if (error instanceof Error && error.message.includes('HTTP')) {
            try {
              const match = error.message.match(/HTTP (\d+): (.+)/);
              if (match) {
                const status = parseInt(match[1]);
                const errorText = match[2];
                apiError = { status, text: errorText };
                console.error('API Error:', apiError);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
          
          // Check if it's a format error
          if (errorMessage.includes('415') || errorMessage.includes('Unsupported') || (apiError && apiError.status === 415)) {
            toast({
              title: t.chatInterface.toastAudioFormatErrorTitle,
              description: t.chatInterface.toastAudioFormatErrorDesc,
              variant: 'destructive',
            });
          } else if (errorMessage.includes('Speech to text is not enabled') || (apiError && apiError.status === 403)) {
            toast({
              title: t.chatInterface.toastVoiceDisabledTitle,
              description: t.chatInterface.toastVoiceDisabledDesc,
              variant: 'destructive',
            });
          } else if (apiError && apiError.status === 401) {
            toast({
              title: t.chatInterface.toastAuthErrorTitle,
              description: t.chatInterface.toastAuthErrorDesc,
              variant: 'destructive',
            });
          } else if (apiError && apiError.status >= 500) {
            toast({
              title: t.chatInterface.toastServerErrorTitle,
              description: t.chatInterface.toastServerErrorDesc,
              variant: 'destructive',
            });
          } else {
            toast({
              title: t.chatInterface.toastVoiceRecognitionErrorTitle,
              description: apiError?.text || t.chatInterface.toastVoiceRecognitionErrorDesc,
              variant: 'destructive',
            });
          }
        }
        
        // Cleanup stream in success path
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      
      // Cleanup stream in error path
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Specific error handling
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            toast({
              title: t.chatInterface.toastMicPermissionDeniedTitle,
              description: t.chatInterface.toastMicPermissionDeniedDesc,
              variant: 'destructive',
            });
            break;
          case 'NotFoundError':
            toast({
              title: t.chatInterface.errMicrophoneNotFoundTitle,
              description: t.chatInterface.errMicrophoneNotFoundDesc,
              variant: 'destructive',
            });
            break;
          case 'NotReadableError':
            toast({
              title: t.chatInterface.toastMicBusyTitle,
              description: t.chatInterface.toastMicBusyDesc,
              variant: 'destructive',
            });
            break;
          case 'SecurityError':
            toast({
              title: t.chatInterface.toastSecurityErrorTitle,
              description: t.chatInterface.toastSecurityErrorDesc,
              variant: 'destructive',
            });
            break;
          case 'NotSupportedError':
            toast({
              title: t.chatInterface.toastNotSupportedTitle,
              description: t.chatInterface.toastNotSupportedDesc,
              variant: 'destructive',
            });
            break;
          default:
            toast({
              title: t.chatInterface.toastRecordErrorTitle,
              description: t.chatInterface.toastRecordErrorDesc.replace('{error}', error.message),
              variant: 'destructive',
            });
        }
      } else {
        toast({
          title: t.chatInterface.toastAccessErrorTitle,
          description: t.chatInterface.toastAccessErrorDesc,
          variant: 'destructive',
        });
      }
    }
  }, [toast, autoStopEnabled, voiceModeEnabled, handleSendMessage]);

  // Зберігаємо startRecording в ref для використання в async callbacks
  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="border-t bg-background p-3 sm:p-4 mobile-safe-area">
      {/* Повідомлення про недоступність головного агента в приватних чатах */}
      {!isMainAgentAvailable && chatScope === 'personal' && (
        <div className="mb-3 sm:mb-4 p-3 bg-muted/50 border border-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            {t.chatInterface.toastDifyPrivateChatAlert}
          </p>
        </div>
      )}
      
      {/* Индикатор уровня звука при записи */}
      {isRecording && (
        <div className="mb-3 sm:mb-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-75"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {autoStopEnabled ? t.chatInterface.btnAutoStopOn : t.chatInterface.btnSpeaking}
          </span>
        </div>
      )}

      {/* Прогресс загрузки */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-3 sm:mb-4">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-1">{t.chatInterface.labelUploadingFiles}</p>
        </div>
      )}

      {/* Прикрепленные файлы */}
      {attachedFiles.length > 0 && (
        <div className="mb-3 sm:mb-4 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-2 text-sm touch-target"
            >
              {getFileIcon(file)}
              <span className="text-xs sm:text-sm max-w-16 sm:max-w-32 truncate" title={file.name}>{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="ml-1 text-muted-foreground hover:text-foreground touch-target min-w-4 min-h-4 flex items-center justify-center"
                aria-label={t.chatInterface.ariaDeleteFile}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Область drag & drop */}
      <div
        className={`relative rounded-lg border-2 border-dashed transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg flex items-center justify-center z-10">
            <p className="text-primary font-medium text-sm sm:text-base">{t.files.dragDrop}</p>
          </div>
        )}

        <div className="flex gap-2 p-2 sm:p-3">
          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? t.chatInterface.placeholderRecording : t.chatInterface.placeholderTypeMessage}
              className="min-h-[40px] sm:min-h-[44px] max-h-24 sm:max-h-32 resize-none border-0 shadow-none focus-visible:ring-0 mobile-input text-base px-3 py-2"
              disabled={isRecording}
            />
          </div>

          {/* Кнопки действий */}
          <div className="flex items-end gap-1 flex-shrink-0">
            {/* Кнопка файлов */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className="touch-target h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0"
              aria-label={t.chatInterface.ariaAttachFile}
            >
              <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Кнопка настроек голоса */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isStreaming || isRecording}
                  className="touch-target h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0"
                  aria-label={t.chatInterface.ariaVoiceSettings}
                >
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">{t.chatInterface.voiceSettingsTitle}</h4>
                  
                  {/* {t.chatInterface.voiceModeLabel} */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voice-mode" className="text-sm">
                      {t.chatInterface.voiceModeLabel}
                    </Label>
                    <Switch
                      id="voice-mode"
                      checked={voiceModeEnabled}
                      onCheckedChange={setVoiceModeEnabled}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.chatInterface.voiceModeDesc}
                  </p>
                  
                  {/* Автостоп */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-stop" className="text-sm">
                      {t.chatInterface.autoStopLabel}
                    </Label>
                    <Switch
                      id="auto-stop"
                      checked={autoStopEnabled}
                      onCheckedChange={setAutoStopEnabled}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.chatInterface.autoStopDesc}
                  </p>
                </div>
              </PopoverContent>
            </Popover>

            {/* Кнопка записи голоса / остановки TTS */}
            {isPlayingTTS ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={stopPlayingTTS}
                className="touch-target h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0 text-primary animate-pulse-soft"
                aria-label={t.chatInterface.ariaStopPlayback}
              >
                <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (isRecording) {
                    stopRecording();
                  } else {
                    startRecording();
                  }
                }}
                disabled={isStreaming}
                className={`touch-target h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0 ${isRecording ? 'text-destructive animate-pulse-soft' : ''}`}
                aria-label={isRecording ? t.chatInterface.ariaStopRecording : t.chatInterface.ariaStartRecording}
              >
                {isRecording ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
            )}

            {/* Кнопка остановки/отправки */}
            {isStreaming ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => stopStream()}
                className="touch-target h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0"
                aria-label={t.chatInterface.ariaStopGeneration}
              >
                <Square className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            ) : (
              <Button
                onClick={() => handleSendMessage()}
                disabled={(!message.trim() && attachedFiles.length === 0) || !isMainAgentAvailable}
                size="sm"
                className="touch-target h-10 w-10 sm:h-11 sm:w-11 p-0 flex-shrink-0"
                aria-label={t.chatInterface.ariaSendMessage}
                title={!isMainAgentAvailable ? t.chatInterface.titleMainAgentUnavailable : t.chatInterface.ariaSendMessage}
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Индикатор печати или озвучивания */}
      {isStreaming && (
        <div className="mt-2 sm:mt-3 flex items-center gap-3 text-sm text-muted-foreground animate-pulse-soft px-1">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-sm sm:text-base">{t.chatInterface.indicatorAgentTyping}</span>
        </div>
      )}
      
      {isPlayingTTS && (
        <div className="mt-2 sm:mt-3 flex items-center gap-3 text-sm text-primary animate-pulse-soft px-1">
          <Volume2 className="h-4 w-4" />
          <span className="text-sm sm:text-base">{t.chatInterface.indicatorSpeakingResponse}</span>
        </div>
      )}
    </div>
  );
};