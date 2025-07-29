import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ui/error-boundary";
import { LoadingState } from "@/components/ui/loading-spinner";
import { BackupService } from "@/components/BackupService";
import { LocalStorageMigration } from "@/components/LocalStorageMigration";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Tracks = lazy(() => import("./pages/Tracks"));
const SecurityDashboard = lazy(() => import("@/components/SecurityDashboard").then(module => ({ default: module.SecurityDashboard })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingState>Carregando página...</LoadingState>}>
    {children}
  </Suspense>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LocalStorageMigration />
          <BackupService />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<PageSuspense><Index /></PageSuspense>} />
              <Route path="/sobre" element={<PageSuspense><About /></PageSuspense>} />
              <Route path="/contato" element={<PageSuspense><Contact /></PageSuspense>} />
              <Route path="/privacidade" element={<PageSuspense><Privacy /></PageSuspense>} />
              <Route path="/termos" element={<PageSuspense><TermsOfService /></PageSuspense>} />
              <Route path="/faq" element={<PageSuspense><FAQ /></PageSuspense>} />
              <Route path="/avaliacao" element={<PageSuspense><Assessment /></PageSuspense>} />
              <Route path="/auth" element={<PageSuspense><Auth /></PageSuspense>} />
              <Route path="/reset-password" element={<PageSuspense><ResetPassword /></PageSuspense>} />
              <Route path="/trilhas" element={<PageSuspense><Tracks /></PageSuspense>} />
              <Route path="/dashboard" element={<PageSuspense><Dashboard /></PageSuspense>} />
              <Route path="/seguranca" element={<PageSuspense><SecurityDashboard /></PageSuspense>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<PageSuspense><NotFound /></PageSuspense>} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
