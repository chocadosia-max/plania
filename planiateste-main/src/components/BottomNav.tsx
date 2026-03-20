import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ArrowLeftRight, Trophy, PieChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: LayoutDashboard, label: "Início", path: "/dashboard" },
  { icon: ArrowLeftRight, label: "Transações", path: "/dashboard/transacoes" },
  { icon: Trophy, label: "Metas", path: "/dashboard/metas" },
  { icon: PieChart, label: "Relatórios", path: "/dashboard/relatorios" },
  { icon: Settings, label: "Config", path: "/dashboard/config" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-card border-t border-border/30 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ icon: Icon, label, path }) => {
          const active = pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200 active:scale-95",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "w-10 h-7 rounded-full flex items-center justify-center transition-all duration-300",
                active && "bg-primary/15"
              )}>
                <Icon className={cn("w-5 h-5 transition-all duration-200", active && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]")} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
