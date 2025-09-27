import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (projectId: string) => void;
}

export function CreateProjectModal({ open, onOpenChange, onProjectCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название проекта",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('projects-api', {
        body: {
          name: name.trim(),
          description: description.trim(),
          participants: []
        }
      });

      if (response.error) {
        throw response.error;
      }

      const { project } = response.data;
      
      toast({
        title: "Успех",
        description: "Проект создан успешно",
      });

      // Reset form
      setName('');
      setDescription('');
      onOpenChange(false);
      
      // Notify parent
      if (onProjectCreated) {
        onProjectCreated(project.id);
      }

    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать проект",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Создать проект</DialogTitle>
          <DialogDescription>
            Создайте новый проект для совместной работы с командой
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Название проекта</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название проекта"
              maxLength={100}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Описание (необязательно)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Краткое описание проекта"
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Отмена
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Создание...' : 'Создать проект'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}