import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            {/* Rotas do Dashboard - Todas usando DashWrap consistentemente */}
            <Route path="/dashboard" element={<DashWrap><Dashboard /></DashWrap>} />
            <Route path="/dashboard/transacoes" element={<DashWrap><Transacoes /></DashWrap>} />
            <Route path="/dashboard/metas" element={<DashWrap><Metas /></DashWrap>} />
            <Route path="/dashboard/orcamentos" element={<DashWrap><Orcamentos /></DashWrap>} />
            <Route 
              path="/dashboard/investimentos" 
              element={
                <DashWrap>
                  <ErrorBoundary>
                    <Investimentos />
                  </ErrorBoundary>
                </DashWrap>
              } 
            />
            <Route path="/dashboard/config" element={<DashWrap><Configuracoes /></DashWrap>} />
            <Route path="/dashboard/relatorios" element={<DashWrap><Relatorios /></DashWrap>} />
            
            <Route path="/themes" element={<Themes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

function DashWrap({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}

export default App;