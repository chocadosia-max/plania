import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Settings,
  Palette,
  LogOut,
  TrendingUp,
  Sparkles,
  Trophy,
  FileUp,
  CreditCard,
  Package,
  Users,
  ClipboardList,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const iconMap: Record<string, any> = {
  dividas: CreditCard,
  estoque: Package,
  clientes: Users,
  dre: ClipboardList,
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { dynamicTabs } = usePlanIA();
  const [visibleNewBadges, setVisibleNewBadges] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newTabs = dynamicTabs.filter(t => t.isNew);
    if (newTabs.length > 0) {
      const initialBadges: Record<string, boolean> = {};
      newTabs.forEach(t => initialBadges[t.id] = true);
      setVisibleNewBadges(initialBadges);

      const timer = setTimeout(() => {
        setVisibleNewBadges({});
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [dynamicTabs]);

  const mainNav = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Transações", url: "/dashboard/transacoes", icon: ArrowLeftRight },
    { title: "Metas", url: "/dashboard/metas", icon: Trophy },
    { title: "Orçamentos", url: "/dashboard/orcamentos", icon: Target },
    { title: "Investimentos", url: "/dashboard/investimentos", icon: TrendingUp },
    { title: "Relatórios", url: "/dashboard/relatorios", icon: PieChart },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarContent>
        <div className={`px-4 py-5 ${collapsed ? "px-2 text-center" : ""}`}>
          <Link to="/dashboard" className="text-lg font-bold text-foreground tracking-tight">
            {collapsed ? <span className="text-primary text-xl">P</span> : <>Plan<span className="text-primary">IA</span></>}
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <NavLink to={item.url} end className="hover:bg-muted/50 transition-colors" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Abas Dinâmicas */}
              {dynamicTabs.map((tab) => {
                const Icon = iconMap[tab.id] || CreditCard;
                return (
                  <SidebarMenuItem key={tab.id} className="animate-slide-down">
                    <SidebarMenuButton asChild isActive={location.pathname === tab.path}>
                      <NavLink to={tab.path} className="hover:bg-muted/50 transition-colors relative" activeClassName="bg-primary/10 text-primary font-medium">
                        <Icon className="mr-2 h-4 w-4" />
                        {!collapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span>{tab.label}</span>
                            {visibleNewBadges[tab.id] && (
                              <span className="bg-green-500 text-[8px] text-white font-black px-1.5 py-0.5 rounded-full animate-pulse">NOVO</span>
                            )}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="px-3 py-2">
          <Link to="/dashboard/importar">
            <button className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all relative overflow-hidden group">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <FileUp className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Importar Planilha</span>}
            </button>
          </Link>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/dashboard/config" className="hover:bg-muted/50 transition-colors">
                <Settings className="mr-2 h-4 w-4" />
                {!collapsed && <span>Configurações</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/" className="hover:bg-muted/50 transition-colors text-muted-foreground">
                <LogOut className="mr-2 h-4 w-4" />
                {!collapsed && <span>Sair</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}