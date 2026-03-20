import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "PlanIA — Assistente Financeiro",
  "/login": "Entrar · PlanIA",
  "/dashboard": "Dashboard · PlanIA",
  "/dashboard/transacoes": "Transações · PlanIA",
  "/dashboard/metas": "Metas · PlanIA",
  "/dashboard/relatorios": "Relatórios · PlanIA",
  "/dashboard/config": "Configurações · PlanIA",
  "/themes": "Temas · PlanIA",
};

export function usePageTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = titles[pathname] || "PlanIA";
  }, [pathname]);
}
