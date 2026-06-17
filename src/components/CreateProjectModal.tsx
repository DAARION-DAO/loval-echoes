import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from '@/lib/i18n';
import { getFunctionErrorMessage } from '@/utils/functionErrors';

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (projectId: string) => void;
}

export function CreateProjectModal({ open, onOpenChange, onProjectCreated }: CreateProjectModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({
        title: t.error,
        description: t.projects.titleRequired,
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
        title: t.success,
        description: t.projects.successCreate,
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
      const description = await getFunctionErrorMessage(error, t.projects.createError);
      toast({
        title: t.error,
        description,
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
          <DialogTitle>{t.projects.createModalTitle}</DialogTitle>
          <DialogDescription>
            {t.projects.createModalDesc}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t.projects.labelName}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.projects.placeholderName}
              maxLength={100}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">{t.projects.labelDesc}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.projects.placeholderDesc}
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t.projects.cancelBtn}
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? t.projects.creatingBtn : t.projects.createBtn}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
