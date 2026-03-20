import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  Settings,
  LogOut,
  TrendingUp,
  Trophy,
  CreditCard,
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

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const mainNav = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Transações", url: "/dashboard/transacoes", icon: ArrowLeftRight },
    { title: "Metas", url: "/dashboard/metas", icon: Trophy },
    { title: "Orçamentos", url: "/dashboard/orcamentos", icon: Target },
    { title: "Investimentos", url: "/dashboard/investimentos", icon: TrendingUp },
    { title: "Relatórios", url: "/dashboard/relatorios", icon: PieChart },
    { title: "Dívidas", url: "/dashboard/dividas", icon: CreditCard },
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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