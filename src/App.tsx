import { ChatSidebar } from "@/components/ChatSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { lazy, Suspense } from "react";
import { ChatsPage } from "./pages/Chats";
import { Auth } from "./pages/Auth";
import { NewIndex } from "./pages/NewIndex";

// Lazy load heavy components
const ChatsManagement = lazy(() => import("./pages/ChatsManagement").then(m => ({ default: m.ChatsManagement })));
const ChatPage = lazy(() => import("./pages/Chat").then(m => ({ default: m.ChatPage })));
const NotFound = lazy(() => import("./pages/NotFound"));
const ImportPage = lazy(() => import("./pages/Import").then(m => ({ default: m.ImportPage })));
const Settings = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const Participants = lazy(() => import("./pages/Participants").then(m => ({ default: m.Participants })));
const NewsPage = lazy(() => import("./pages/News"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const MyTasks = lazy(() => import("./pages/MyTasks"));
const Agents = lazy(() => import("./pages/Agents"));
const Integrations = lazy(() => import("./pages/Integrations"));
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
    // Guest access enabled for team preview usage
  }

  return (
    <Layout sidebar={<ChatSidebar />}>
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner size="lg" text="Загрузка..." />}>
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
            <Route path="/integrations" element={<Integrations />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
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
