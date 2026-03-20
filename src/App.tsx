import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PlanIAProvider } from "@/contexts/PlanIAContext";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transacoes from "./pages/Transacoes";
import Metas from "./pages/Metas";
import Orcamentos from "./pages/Orcamentos";
import Investimentos from "./pages/Investimentos";
import Themes from "./pages/Themes";
import Configuracoes from "./pages/Configuracoes";
import Relatorios from "./pages/Relatorios";
import InsightDetail from "./pages/InsightDetail";
import Onboarding from "./pages/Onboarding";
import Dividas from "./pages/Dividas";
import Clientes from "./pages/Clientes";
import DynamicPage from "./pages/DynamicPage";
import { DashboardLayout } from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/dashboard");
      }
      if (event === "SIGNED_OUT") {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PlanIAProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthHandler />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
                <Route path="/onboarding" element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashWrap><Dashboard /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/transacoes" element={
                  <ProtectedRoute>
                    <DashWrap><Transacoes /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/metas" element={
                  <ProtectedRoute>
                    <DashWrap><Metas /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/orcamentos" element={
                  <ProtectedRoute>
                    <DashWrap><Orcamentos /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/investimentos" element={
                  <ProtectedRoute>
                    <DashWrap><Investimentos /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/config" element={
                  <ProtectedRoute>
                    <DashWrap><Configuracoes /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/relatorios" element={
                  <ProtectedRoute>
                    <DashWrap><Relatorios /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/relatorios/insight/:id" element={
                  <ProtectedRoute>
                    <DashWrap><InsightDetail /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/dividas" element={
                  <ProtectedRoute>
                    <DashWrap><Dividas /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/clientes" element={
                  <ProtectedRoute>
                    <DashWrap><Clientes /></DashWrap>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/:id" element={
                  <ProtectedRoute>
                    <DashWrap><DynamicPage /></DashWrap>
                  </ProtectedRoute>
                } />
                <Route path="/themes" element={
                  <ProtectedRoute>
                    <Themes />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-[#F0F4FF] bg-[#080B14] p-6 text-center">
                    <span className="text-7xl">🔍</span>
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black">Página não encontrada</h2>
                      <p className="text-[#7B8DB0]">Essa rota não existe no PlanIA.</p>
                    </div>
                    <a href="/dashboard" className="bg-[#6366F1] text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                      ← Voltar ao início
                    </a>
                  </div>
                } />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </PlanIAProvider>
  </QueryClientProvider>
);

function DashWrap({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default App;