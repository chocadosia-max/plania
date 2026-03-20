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
  Download,
  FileUp,
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

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Transações", url: "/dashboard/transacoes", icon: ArrowLeftRight },
  { title: "Metas", url: "/dashboard/metas", icon: Trophy },
  { title: "Orçamentos", url: "/dashboard/orcamentos", icon: Target },
  { title: "Investimentos", url: "/dashboard/investimentos", icon: TrendingUp },
  { title: "Relatórios", url: "/dashboard/relatorios", icon: PieChart },
];

const bottomNav = [
  { title: "Temas", url: "/themes", icon: Palette },
  { title: "Configurações", url: "/dashboard/config", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30">
      <SidebarContent>
        {/* Logo */}
        <div className={`px-4 py-5 ${collapsed ? "px-2 text-center" : ""}`}>
          <Link to="/dashboard" className="text-lg font-bold text-foreground tracking-tight">
            {collapsed ? (
              <span className="text-primary text-xl">P</span>
            ) : (
              <>Plan<span className="text-primary">IA</span></>
            )}
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Import Button */}
        <div className="px-3 py-2">
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link to="/dashboard/importar">
                <button className={`
                  w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                  bg-gradient-to-r from-purple-600 to-cyan-500 
                  text-white font-bold text-xs uppercase tracking-wider
                  shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
                  relative overflow-hidden group
                `}>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  
                  <FileUp className="w-4 h-4 shrink-0 animate-bounce" style={{ animationDuration: '2s' }} />
                  {!collapsed && <span>Importar Planilha</span>}
                </button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[200px] text-xs">
              Traga seus dados do Excel, Google Sheets ou Notion em minutos
            </TooltipContent>
          </Tooltip>
        </div>

        {/* AI assistant link */}
        <SidebarGroup>
          <SidebarGroupLabel>IA</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button className="flex items-center gap-2 w-full hover:bg-muted/50 transition-colors text-sm">
                    <Sparkles className="h-4 w-4 text-primary animate-[pulse-soft_2.5s_ease-in-out_infinite]" />
                    {!collapsed && <span>Assistente IA</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)}>
                <NavLink
                  to={item.url}
                  className="hover:bg-muted/50 transition-colors"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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