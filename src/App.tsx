import { ChatSidebar } from "@/components/ChatSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ActiveCommunityProvider, useActiveCommunity } from "@/hooks/useActiveCommunity";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { lazy, Suspense } from "react";
import { useTranslation } from "@/lib/i18n";
import { ChatsPage } from "./pages/Chats";
import { Auth } from "./pages/Auth";
import { NewIndex } from "./pages/NewIndex";
import { ResetPassword } from "./pages/ResetPassword";
import { Start } from "./pages/Start";

// Lazy load heavy components
const ChatsManagement = lazy(() => import("./pages/ChatsManagement").then(m => ({ default: m.ChatsManagement })));
const ChatPage = lazy(() => import("./pages/Chat").then(m => ({ default: m.ChatPage })));
const NotFound = lazy(() => import("./pages/NotFound"));
const ImportPage = lazy(() => import("./pages/Import").then(m => ({ default: m.ImportPage })));
const Settings = lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const Billing = lazy(() => import("./pages/Billing"));
const Participants = lazy(() => import("./pages/Participants").then(m => ({ default: m.Participants })));
const NewsPage = lazy(() => import("./pages/News"));
const Projects = lazy(() => import("./pages/Projects"));
const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const MyTasks = lazy(() => import("./pages/MyTasks"));
const Agents = lazy(() => import("./pages/Agents"));
const Integrations = lazy(() => import("./pages/Integrations"));
const PromptEditor = lazy(() => import("./pages/PromptEditor").then(m => ({ default: m.PromptEditor })));
const Install = lazy(() => import("./pages/Install"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AgentDirectory = lazy(() => import("./pages/AgentDirectory"));
const MicroDAOOnboarding = lazy(() => import("./pages/MicroDAOOnboarding"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview").then(m => ({ default: m.AdminOverview })));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers").then(m => ({ default: m.AdminUsers })));
const AdminMicroDAOs = lazy(() => import("./pages/admin/AdminMicroDAOs").then(m => ({ default: m.AdminMicroDAOs })));
const AdminAccessRequests = lazy(() => import("./pages/admin/AdminAccessRequests").then(m => ({ default: m.AdminAccessRequests })));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling").then(m => ({ default: m.AdminBilling })));
const AdminAgentOps = lazy(() => import("./pages/admin/AdminAgentOps").then(m => ({ default: m.AdminAgentOps })));

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from "./components/Layout";
import { useSessionTimeout } from "./hooks/useSessionTimeout";
import { useUserApprovalStatus } from "@/hooks/useUserApprovalStatus";
import { PendingApprovalPage } from "@/components/PendingApprovalPage";
import { RestrictedPage } from "@/components/RestrictedPage";
import { GuardianRoute } from "./components/admin/GuardianRoute";
import { AdminLayout } from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

const PublicStartRoute = () => {
  const { user, loading } = useAuth();
  const { approvalStatus } = useUserApprovalStatus();
  const { loading: commLoading, memberships } = useActiveCommunity();
  const { t } = useTranslation();

  if (loading || (user && (approvalStatus === 'loading' || commLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text={t.loading} />
      </div>
    );
  }

  if (!user) {
    return <Start />; // Public Landing
  }

  if (approvalStatus === 'rejected' || approvalStatus === 'blocked') {
    return <Navigate to="/restricted" replace />;
  }

  if (memberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  // Logged in and has community -> go to dashboard
  return <Navigate to="/dashboard" replace />;
};

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const { approvalStatus } = useUserApprovalStatus();
  useSessionTimeout();
  const { loading: commLoading, memberships } = useActiveCommunity();
  const { t } = useTranslation();

  if (loading || (user && (approvalStatus === 'loading' || commLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text={t.loading} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (approvalStatus === 'rejected' || approvalStatus === 'blocked') {
    return <Navigate to="/restricted" replace />;
  }

  if (memberships.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Layout sidebar={<ChatSidebar />}>
      <ProtectedRoute>
        <Suspense fallback={<LoadingSpinner size="lg" text={t.loading} />}>
          <Routes>
            <Route path="/dashboard" element={<NewIndex />} />
            <Route path="/chats" element={<ChatsPage />} />
            <Route path="/chats/manage" element={<ChatsManagement />} />
            <Route path="/chats/:chatId" element={<ChatPage />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/import" element={<ImportPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/projects/:projectId/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/my/tasks" element={<MyTasks />} />
            <Route path="/agents/manage" element={<Agents />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/prompts" element={<PromptEditor />} />
            <Route path="/prompt-editor" element={<PromptEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ProtectedRoute>
    </Layout>
  );
};

const PublicRoutes = () => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text={t.loading} />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Auth />;
};

const WaitlistRoute = () => {
  const { user, loading } = useAuth();
  const { approvalStatus } = useUserApprovalStatus();
  const { t } = useTranslation();

  if (loading || approvalStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" text={t.loading} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (approvalStatus === 'rejected' || approvalStatus === 'blocked') {
    return <Navigate to="/restricted" replace />;
  }

  return <PendingApprovalPage />;
};

const App = () => {
  const { t } = useTranslation();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ActiveCommunityProvider>
                <Routes>
                  <Route path="/" element={<PublicStartRoute />} />
                  <Route path="/home" element={<Start />} />
                  <Route path="/install" element={<Suspense fallback={<LoadingSpinner size="lg" text={t.loading} />}><Install /></Suspense>} />
                  <Route path="/auth" element={<PublicRoutes />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/waitlist" element={<WaitlistRoute />} />
                  <Route path="/restricted" element={<RestrictedPage />} />
                  <Route path="/pricing" element={<Suspense fallback={<LoadingSpinner size="lg" text={t.loading} />}><Pricing /></Suspense>} />
                  <Route path="/agents" element={<Suspense fallback={<LoadingSpinner size="lg" text={t.loading} />}><AgentDirectory /></Suspense>} />
                  <Route path="/onboarding" element={<Suspense fallback={<LoadingSpinner size="lg" text={t.loading} />}><MicroDAOOnboarding /></Suspense>} />
                  <Route 
                    path="/admin/*" 
                    element={
                      <GuardianRoute>
                        <AdminLayout>
                          <Suspense fallback={<LoadingSpinner size="lg" text={t.loading} />}>
                            <Routes>
                              <Route path="/" element={<AdminOverview />} />
                              <Route path="/users" element={<AdminUsers />} />
                              <Route path="/microdaos" element={<AdminMicroDAOs />} />
                              <Route path="/access-requests" element={<AdminAccessRequests />} />
                              <Route path="/billing" element={<AdminBilling />} />
                              <Route path="/agent-ops" element={<AdminAgentOps />} />
                              <Route path="*" element={<Navigate to="/admin" replace />} />
                            </Routes>
                          </Suspense>
                        </AdminLayout>
                      </GuardianRoute>
                    } 
                  />
                  <Route path="/*" element={<ProtectedLayout />} />
                </Routes>
              </ActiveCommunityProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
