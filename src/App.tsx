import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import EnhancedErrorBoundary from "@/components/ui/enhanced-error-boundary";
import { LoadingState } from "@/components/ui/loading-spinner";
import { BackupService } from "@/components/BackupService";
import { LocalStorageMigration } from "@/components/LocalStorageMigration";
import { CSRFProvider } from "@/contexts/CSRFContext";
import { logger } from "@/lib/logger";
import AccessGuard from "@/components/AccessGuard";

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
const Precos = lazy(() => import("./pages/Precos"));

// Profile-specific pages
const CriancasTypicas = lazy(() => import("./pages/CriancasTypicas"));
const SindromeDown = lazy(() => import("./pages/SindromeDown"));
const EspectroAutista = lazy(() => import("./pages/EspectroAutista"));
const TranstornosLinguagem = lazy(() => import("./pages/TranstornosLinguagem"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
  },
});

const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingState>Carregando página...</LoadingState>}>
    <EnhancedErrorBoundary context="Page Component">
      {children}
    </EnhancedErrorBoundary>
  </Suspense>
);

const App = () => {
  logger.info('App initialized', { component: 'App' });
  
  return (
    <EnhancedErrorBoundary context="Application Root">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <CSRFProvider>
              <EnhancedErrorBoundary context="Core Services">
                <LocalStorageMigration />
                <BackupService />
              </EnhancedErrorBoundary>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <EnhancedErrorBoundary context="Router">
                  <Routes>
                      <Route path="/" element={<PageSuspense><Index /></PageSuspense>} />
                      <Route path="/sobre" element={<PageSuspense><About /></PageSuspense>} />
                      <Route path="/contato" element={<PageSuspense><Contact /></PageSuspense>} />
                      <Route path="/privacidade" element={<PageSuspense><Privacy /></PageSuspense>} />
                      <Route path="/termos" element={<PageSuspense><TermsOfService /></PageSuspense>} />
                      <Route path="/faq" element={<PageSuspense><FAQ /></PageSuspense>} />
                      <Route path="/avaliacao" element={<PageSuspense><AccessGuard><Assessment /></AccessGuard></PageSuspense>} />
                      <Route path="/auth" element={<PageSuspense><Auth /></PageSuspense>} />
                      <Route path="/reset-password" element={<PageSuspense><ResetPassword /></PageSuspense>} />
                      <Route path="/precos" element={<PageSuspense>{/* Pricing page */}{/* Avoid duplicate hero/sections */}{/* Only Pricing */}{/* A dedicated page */}{/* Keep simple */}{/* eslint-disable */}{/* @ts-ignore */}{/* we import lazily below if needed */}{/* eslint-enable */}{/* Actually defined */}<Precos /></PageSuspense>} />
                      <Route path="/trilhas" element={<PageSuspense><AccessGuard><Tracks /></AccessGuard></PageSuspense>} />
                      <Route path="/dashboard" element={<PageSuspense><AccessGuard><Dashboard /></AccessGuard></PageSuspense>} />
                      <Route path="/seguranca" element={<PageSuspense><AccessGuard><SecurityDashboard /></AccessGuard></PageSuspense>} />
                      
                      {/* Profile-specific routes */}
                      <Route path="/criancas-tipicas" element={<PageSuspense><CriancasTypicas /></PageSuspense>} />
                      <Route path="/sindrome-down" element={<PageSuspense><SindromeDown /></PageSuspense>} />
                      <Route path="/espectro-autista" element={<PageSuspense><EspectroAutista /></PageSuspense>} />
                      <Route path="/transtornos-linguagem" element={<PageSuspense><TranstornosLinguagem /></PageSuspense>} />
                      
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<PageSuspense><NotFound /></PageSuspense>} />
                    </Routes>
                </EnhancedErrorBoundary>
              </BrowserRouter>
            </CSRFProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </EnhancedErrorBoundary>
  );
};

export default App;
