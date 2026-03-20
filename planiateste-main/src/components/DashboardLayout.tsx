import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AIChatPanel } from "@/components/AIChatPanel";
import { QuickLaunchBar } from "@/components/QuickLaunchBar";
import { BottomNav } from "@/components/BottomNav";
import { PageTransition } from "@/components/PageTransition";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const currentMonth = months[new Date().getMonth()];
  usePageTitle();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background transition-colors duration-500">
        {/* Sidebar hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 glass-card border-b border-border/30 h-14 flex items-center px-4 gap-4">
            <div className="hidden md:block">
              <SidebarTrigger />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-base font-bold text-foreground">Olá, Mariana 👋</h1>
                <p className="text-[11px] text-muted-foreground -mt-0.5">{currentMonth} 2026</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/themes">
                  <Button variant="ghost" size="icon" className="h-9 w-9" title="Trocar tema">
                    <Palette className="w-4 h-4" />
                  </Button>
                </Link>
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                  MF
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto pb-24 md:pb-20">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>

        {/* Desktop: QuickLaunchBar, Mobile: BottomNav */}
        <div className="hidden md:block">
          <QuickLaunchBar />
        </div>
        <BottomNav />

        <AIChatPanel />
      </div>
    </SidebarProvider>
  );
}
