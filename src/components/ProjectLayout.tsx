import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Kanban, FileText, Calendar, Settings } from 'lucide-react';
import { ProjectKanban } from './ProjectKanban';
import { ChatInterface } from './ChatInterface';

interface ProjectLayoutProps {
  projectId: string;
  projectName?: string;
}

export function ProjectLayout({ projectId, projectName }: ProjectLayoutProps) {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="chat" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-5 mx-4 mt-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Чат
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Задачи
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Документы
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Встречи
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Настройки
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="flex-1 m-0">
          <ChatInterface chatId={projectId} />
        </TabsContent>
        
        <TabsContent value="kanban" className="flex-1 m-0">
          <ProjectKanban projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="docs" className="flex-1 m-0 p-4">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Документы проекта</h3>
            <p className="text-muted-foreground">
              Функционал документов в разработке
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="meetings" className="flex-1 m-0 p-4">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Встречи проекта</h3>
            <p className="text-muted-foreground">
              Функционал встреч в разработке
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="flex-1 m-0 p-4">
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Настройки проекта</h3>
            <p className="text-muted-foreground">
              Функционал настроек в разработке
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}