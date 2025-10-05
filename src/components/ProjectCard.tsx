import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CompactName } from "./CompactName";
import { Folder, Calendar, Users, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProjectTaskStats } from "@/hooks/useProjectTaskStats";

interface ProjectCardProps {
  project: {
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
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const participants = project.conversation_participants || [];
  const admin = participants.find(p => p.role === 'admin');
  const { stats } = useProjectTaskStats(project.id);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'сегодня';
    if (diffDays === 2) return 'вчера';
    if (diffDays <= 7) return `${diffDays} дня назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/projects/${project.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {project.avatar_url ? (
              <Avatar className="w-10 h-10">
                <AvatarImage src={project.avatar_url} alt={project.name} />
                <AvatarFallback>
                  <Folder className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <Folder className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-tight">
              <CompactName name={project.name} max={30} className="project-card-title" />
            </CardTitle>
            {project.description && (
              <CardDescription className="text-sm mt-1 line-clamp-2">
                <CompactName name={project.description} max={80} />
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Task Stats */}
        {stats.total > 0 && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {stats.progress + stats.review} активных
            </Badge>
            {stats.overdue > 0 && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                {stats.overdue} просрочено
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {stats.done}/{stats.total} завершено
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(project.updated_at)}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{participants.length}</span>
            </div>
          </div>
          
          {admin && (
            <Badge variant="secondary" className="text-xs px-2 py-0">
              <CompactName name={admin.profiles.display_name} max={12} />
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2">
            {participants.slice(0, 3).map((participant, index) => (
              <Avatar key={participant.user_id} className="w-6 h-6 ring-2 ring-background">
                <AvatarImage 
                  src={participant.profiles.avatar_url} 
                  alt={participant.profiles.display_name} 
                />
                <AvatarFallback className="text-xs">
                  {participant.profiles.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {participants.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{participants.length - 3}</span>
              </div>
            )}
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${project.id}`);
            }}
          >
            Открыть
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}