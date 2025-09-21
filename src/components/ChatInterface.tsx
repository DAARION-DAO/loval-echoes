import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Square,
  RotateCcw,
  ImageIcon,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';
import { difyClient } from '@/utils/difyClient';
import { useDifyStream } from '@/hooks/useDifyStream';
import { useToast } from '@/hooks/use-toast';

interface ChatInterfaceProps {
  chatId: string;
  onMessageSent?: (message: string) => void;
}

export const ChatInterface = ({ chatId, onMessageSent }: ChatInterfaceProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isStreaming, startStream, stopStream } = useDifyStream(chatId);
  
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() && attachedFiles.length === 0) return;
    if (isStreaming) return;

    try {
      let fileIds: string[] = [];
      
      // Загружаем файлы если есть
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            const uploadResult = await difyClient.uploadFile(file);
            fileIds.push(uploadResult.id);
          } catch (error) {
            console.error('Error uploading file:', error);
            toast({
              title: t.error,
              description: `Ошибка загрузки файла ${file.name}`,
              variant: 'destructive',
            });
          }
        }
      }

      // Уведомляем о сообщении перед отправкой
      onMessageSent?.(message);
      
      // Отправляем сообщение
      await startStream(message, fileIds);
      
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
  };

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        try {
          const { text } = await difyClient.speechToText(audioBlob);
          setMessage(prev => prev + text);
        } catch (error) {
          console.error('Error transcribing audio:', error);
          toast({
            title: t.error,
            description: error instanceof Error ? error.message : t.errors.unknownError,
            variant: 'destructive',
          });
        }
        
        // Останавливаем stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: t.error,
        description: 'Не удалось получить доступ к микрофону',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

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
    <div className="border-t bg-background p-4">
      {/* Прогресс загрузки */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-4">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-1">Загрузка файлов...</p>
        </div>
      )}

      {/* Прикрепленные файлы */}
      {attachedFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {attachedFiles.map((file, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="flex items-center gap-2 px-3 py-1"
            >
              {getFileIcon(file)}
              <span className="text-xs">{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="ml-1 text-muted-foreground hover:text-foreground"
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
            <p className="text-primary font-medium">{t.files.dragDrop}</p>
          </div>
        )}

        <div className="flex gap-2 p-3">
          {/* Textarea */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? t.voice.transcribing : 'Введите сообщение...'}
              className="min-h-[44px] max-h-32 resize-none border-0 shadow-none focus-visible:ring-0"
              disabled={isRecording}
            />
          </div>

          {/* Кнопки действий */}
          <div className="flex items-end gap-1">
            {/* Кнопка файлов */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className="h-10 w-10 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Кнопка записи голоса */}
            <Button
              variant="ghost"
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isStreaming}
              className={`h-10 w-10 p-0 ${isRecording ? 'text-destructive animate-pulse-soft' : ''}`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            {/* Кнопка остановки/отправки */}
            {isStreaming ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => stopStream('current-task-id')} // TODO: получать task_id
                className="h-10 w-10 p-0"
              >
                <Square className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() && attachedFiles.length === 0}
                size="sm"
                className="h-10 w-10 p-0"
              >
                <Send className="h-4 w-4" />
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

      {/* Индикатор печати */}
      {isStreaming && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground animate-pulse-soft">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          ЖОС Агент печатает...
        </div>
      )}
    </div>
  );
};