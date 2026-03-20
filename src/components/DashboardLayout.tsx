import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Palette, RefreshCw, CheckCircle2 } from "lucide-react";
import { AIChatPanel } from "@/components/AIChatPanel";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentMonth = months[new Date().getMonth()];
  const { isSyncing, lastSync, transactions } = usePlanIA();
  usePageTitle();

  const [userName, setUserName] = useState(() => localStorage.getItem("plania-user-name") || "Mariana");
  const [userPhoto, setUserPhoto] = useState(() => localStorage.getItem("plania-user-photo"));

  useEffect(() => {
    const handleUpdate = () => {
      setUserName(localStorage.getItem("plania-user-name") || "Mariana");
      setUserPhoto(localStorage.getItem("plania-user-photo"));
    };

    window.addEventListener("profile-updated", handleUpdate);
    return () => window.removeEventListener("profile-updated", handleUpdate);
  }, []);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background transition-colors duration-500">
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 glass-card border-b border-border/30 h-14 flex items-center px-4 gap-4">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-base font-bold text-foreground">Olá, {userName} 👋</h1>
                  <p className="text-[11px] text-muted-foreground -mt-0.5">{currentMonth} 2026</p>
                </div>
                
                {/* Sync Indicator */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/40">
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3 h-3 text-primary animate-spin" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Sincronizando...</span>
                    </>
                  ) : lastSync ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Sincronizado · {transactions.length} itens · {format(lastSync, "HH:mm")}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link to="/themes">
                  <Button variant="ghost" size="icon" className="h-9 w-9" title="Trocar tema">
                    <Palette className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/dashboard/config">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary overflow-hidden border border-primary/20">
                    {userPhoto ? (
                      <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(userName)
                    )}
                  </div>
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto pb-24 md:pb-20">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>

        <BottomNav />
        <AIChatPanel />
      </div>
    </SidebarProvider>
  );
}