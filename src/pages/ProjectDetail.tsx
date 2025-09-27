import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProjectLayout } from '@/components/ProjectLayout';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CompactName } from '@/components/CompactName';

interface Project {
  id: string;
  name: string;
  description?: string;
  type: string;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      navigate('/projects');
      return;
    }

    loadProject();
  }, [id, navigate]);

  const loadProject = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, name, description, type')
        .eq('id', id)
        .eq('type', 'project')
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Project not found');
      }

      setProject(data);
    } catch (error) {
      console.error('Error loading project:', error);
      toast({
        title: "Ошибка",
        description: "Проект не найден",
        variant: "destructive",
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/projects')}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Проекты
        </Button>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold">
            <CompactName name={project.name} max={50} />
          </h1>
          {project.description && (
            <p className="text-sm text-muted-foreground">
              <CompactName name={project.description} max={80} />
            </p>
          )}
        </div>
      </div>

      {/* Project Content */}
      <div className="flex-1 overflow-hidden">
        <ProjectLayout projectId={project.id} projectName={project.name} />
      </div>
    </div>
  );
}