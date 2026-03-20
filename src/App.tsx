import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PlanIAProvider } from "@/contexts/PlanIAContext";
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
import Importar from "./pages/Importar";
import DynamicPage from "./pages/DynamicPage";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PlanIAProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                
                <Route path="/dashboard" element={<DashWrap><Dashboard /></DashWrap>} />
                <Route path="/dashboard/transacoes" element={<DashWrap><Transacoes /></DashWrap>} />
                <Route path="/dashboard/metas" element={<DashWrap><Metas /></DashWrap>} />
                <Route path="/dashboard/orcamentos" element={<DashWrap><Orcamentos /></DashWrap>} />
                <Route path="/dashboard/investimentos" element={<DashWrap><Investimentos /></DashWrap>} />
                <Route path="/dashboard/config" element={<DashWrap><Configuracoes /></DashWrap>} />
                <Route path="/dashboard/relatorios" element={<DashWrap><Relatorios /></DashWrap>} />
                <Route path="/dashboard/relatorios/insight/:id" element={<DashWrap><InsightDetail /></DashWrap>} />
                <Route path="/dashboard/importar" element={<DashWrap><Importar /></DashWrap>} />
                
                {/* Rota Dinâmica para abas geradas pela planilha */}
                <Route path="/dashboard/:id" element={<DashWrap><DynamicPage /></DashWrap>} />
                
                <Route path="/themes" element={<Themes />} />
                
                {/* Rota 404 Personalizada */}
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