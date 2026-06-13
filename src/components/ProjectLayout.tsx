import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Kanban, FileText, Calendar, Settings } from 'lucide-react';
import { ProjectKanban } from './ProjectKanban';
import { ChatInterface } from './ChatInterface';
import { useTranslation } from '@/lib/i18n';

interface ProjectLayoutProps {
  projectId: string;
  projectName?: string;
}

export function ProjectLayout({ projectId, projectName }: ProjectLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="chat" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-5 mx-4 mt-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {t.projectLayout.tabChat}
          </TabsTrigger>
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            {t.projectLayout.tabKanban}
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t.projectLayout.tabDocs}
          </TabsTrigger>
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {t.projectLayout.tabMeetings}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t.projectLayout.tabSettings}
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
            <h3 className="text-lg font-semibold mb-2">{t.projectLayout.docsWipTitle}</h3>
            <p className="text-muted-foreground">
              {t.projectLayout.docsWipDesc}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="meetings" className="flex-1 m-0 p-4">
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t.projectLayout.meetingsWipTitle}</h3>
            <p className="text-muted-foreground">
              {t.projectLayout.meetingsWipDesc}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="flex-1 m-0 p-4">
          <div className="text-center py-12">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t.projectLayout.settingsWipTitle}</h3>
            <p className="text-muted-foreground">
              {t.projectLayout.settingsWipDesc}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}