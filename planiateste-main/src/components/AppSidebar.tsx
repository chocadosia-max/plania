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
