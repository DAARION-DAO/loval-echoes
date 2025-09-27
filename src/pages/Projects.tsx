import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Search, Filter } from "lucide-react";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { ProjectCard } from "@/components/ProjectCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Project {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  conversation_participants: Array<{
    user_id: string;
    role: string;
    profiles: {
      display_name: string;
      avatar_url?: string;
    };
  }>;
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadProjects = async () => {
    try {
      const response = await supabase.functions.invoke('projects-api');
      
      if (response.error) {
        throw response.error;
      }

      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить проекты",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleProjectCreated = (projectId: string) => {
    // Reload projects and navigate to new project
    loadProjects();
    navigate(`/projects/${projectId}`);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Проекты</h1>
            <p className="text-muted-foreground">
              Управляйте проектами и совместной работой команды
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск проектов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button onClick={() => setShowCreateModal(true)} className="shrink-0">
              <FolderPlus className="h-4 w-4 mr-2" />
              Создать проект
            </Button>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create Project Card */}
              <Card 
                className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => setShowCreateModal(true)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FolderPlus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Создать проект</CardTitle>
                  <CardDescription>
                    Начните новый проект с командой
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Создать проект
                  </Button>
                </CardContent>
              </Card>

              {/* Project Cards */}
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <FolderPlus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Нет проектов</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? 'Проекты не найдены' : 'Создайте первый проект для начала работы'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                Создать проект
              </Button>
            </div>
          )}

          {/* Create Project Modal */}
          <CreateProjectModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
            onProjectCreated={handleProjectCreated}
          />
        </div>
      </div>
    </div>
  );
}