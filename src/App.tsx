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
              <Route path="*" element={<NotFound />} />
            </Routes>
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