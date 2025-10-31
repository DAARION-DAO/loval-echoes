import { ChatSidebar } from "@/components/ChatSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { ChatsPage } from "./pages/Chats";
import { ChatsManagement } from "./pages/ChatsManagement";
import { ChatPage } from "./pages/Chat";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { NewIndex } from "./pages/NewIndex";
import { ImportPage } from "./pages/Import";
import { Settings } from "./pages/Settings";
import { Participants } from "./pages/Participants";
import NewsPage from "./pages/News";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import KnowledgeBase from "./pages/KnowledgeBase";
import MyTasks from "./pages/MyTasks";
import Agents from "./pages/Agents";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from "./components/Layout";
import { useSessionTimeout } from "./hooks/useSessionTimeout";

const queryClient = new QueryClient();

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  useSessionTimeout();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Загрузка..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Layout sidebar={<ChatSidebar />}>
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<NewIndex />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/chats/manage" element={<ChatsManagement />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/projects/:projectId/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/my/tasks" element={<MyTasks />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ProtectedRoute>
    </Layout>
  );
};

const PublicRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Загрузка..." />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Auth />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<PublicRoutes />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
