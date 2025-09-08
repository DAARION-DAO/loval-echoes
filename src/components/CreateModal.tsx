import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n';
import { MessageSquarePlus, GitBranch, FolderPlus } from 'lucide-react';

interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFormData) => void;
  loading?: boolean;
  error?: string;
}

export interface CreateFormData {
  type: 'chat' | 'branch' | 'project';
  name: string;
  description?: string;
  tags?: string[];
  forkedFromMessageId?: string;
}

export const CreateModal = ({ 
  open, 
  onClose, 
  onSubmit, 
  loading = false, 
  error 
}: CreateModalProps) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateFormData>({
    type: 'chat',
    name: '',
    description: '',
    tags: [],
  });
  
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    
    onSubmit({
      ...formData,
      tags,
    });
  };

  const handleClose = () => {
    setFormData({
      type: 'chat',
      name: '',
      description: '',
      tags: [],
    });
    setTagsInput('');
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'branch':
        return <GitBranch className="h-4 w-4" />;
      case 'project':
        return <FolderPlus className="h-4 w-4" />;
      default:
        return <MessageSquarePlus className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'branch':
        return t.branchFromMessage;
      case 'project':
        return t.project;
      default:
        return t.generalChat;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getIcon(formData.type)}
              Создать {getTypeLabel(formData.type).toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              {formData.type === 'chat' && 'Создайте новый общий чат для обсуждений'}
              {formData.type === 'branch' && 'Создайте ветку из существующего сообщения'}
              {formData.type === 'project' && 'Создайте новый проект для совместной работы'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Тип чата</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'chat' | 'branch' | 'project') =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">
                    <div className="flex items-center gap-2">
                      <MessageSquarePlus className="h-4 w-4" />
                      {t.generalChat}
                    </div>
                  </SelectItem>
                  <SelectItem value="branch">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      {t.branchFromMessage}
                    </div>
                  </SelectItem>
                  <SelectItem value="project">
                    <div className="flex items-center gap-2">
                      <FolderPlus className="h-4 w-4" />
                      {t.project}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder={
                  formData.type === 'chat' ? 'Название чата' :
                  formData.type === 'project' ? 'Название проекта' : 'Название ветки'
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                }
                placeholder="Краткое описание (необязательно)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">{t.tags}</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Теги через запятую: общение, работа, проект"
              />
              <p className="text-xs text-muted-foreground">
                Разделите теги запятыми
              </p>
            </div>

            {formData.type === 'branch' && (
              <div className="space-y-2">
                <Label htmlFor="messageId">ID сообщения</Label>
                <Input
                  id="messageId"
                  value={formData.forkedFromMessageId || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ 
                      ...prev, 
                      forkedFromMessageId: e.target.value 
                    }))
                  }
                  placeholder="ID сообщения для создания ветки"
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              {t.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.name.trim()}
            >
              {loading ? t.loading : t.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};