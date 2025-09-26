import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Kanban } from 'lucide-react';
import { ProjectKanban } from './ProjectKanban';

interface ChatTabsProps {
  chatId: string;
  chatContent: React.ReactNode;
}

export function ChatTabs({ chatId, chatContent }: ChatTabsProps) {
  return (
    <Tabs defaultValue="chat" className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Чат
        </TabsTrigger>
        <TabsTrigger value="kanban" className="flex items-center gap-2">
          <Kanban className="h-4 w-4" />
          Канбан
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="chat" className="flex-1 m-0">
        {chatContent}
      </TabsContent>
      
      <TabsContent value="kanban" className="flex-1 m-0">
        <ProjectKanban projectId={chatId} />
      </TabsContent>
    </Tabs>
  );
}