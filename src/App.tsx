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
import { Settings } from "./pages/Settings";
import { Participants } from "./pages/Participants";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from "./components/Layout";

const queryClient = new QueryClient();

const ProtectedLayout = () => {
  const { user, loading } = useAuth();

  console.log('🔒 ProtectedLayout - Auth state:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    loading,
    currentPath: window.location.pathname 
  });

  if (loading) {
    console.log('🔒 ProtectedLayout - Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Загрузка..." />
      </div>
    );
  }

  if (!user) {
    console.log('🔒 ProtectedLayout - No user, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('🔒 ProtectedLayout - User authenticated, showing protected content');
  return (
    <Layout sidebar={<ChatSidebar />}>
      <ProtectedRoute>
        <Routes>
          <Route path="/" element={<NewIndex />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/chats/manage" element={<ChatsManagement />} />
          <Route path="/chats/:chatId" element={<ChatPage />} />
          <Route path="/participants" element={<Participants />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ProtectedRoute>
    </Layout>
  );
};

const PublicRoutes = () => {
  const { user, loading } = useAuth();

  console.log('📍 PublicRoutes - Auth state:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    loading,
    currentPath: window.location.pathname 
  });

  if (loading) {
    console.log('📍 PublicRoutes - Loading...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="Загрузка..." />
      </div>
    );
  }

  if (user) {
    console.log('📍 PublicRoutes - User detected, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('📍 PublicRoutes - No user, showing Auth');
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
