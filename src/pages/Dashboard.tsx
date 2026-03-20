import { useEffect, useState } from "react";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, PiggyBank,
  ShoppingCart, X, CheckCircle2
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuickLaunchBar } from "@/components/QuickLaunchBar";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { getIconeTransacao } from "./Transacoes";

function StatCard({ icon: Icon, label, targetValue, prefix = "R$ ", change, positive, accentColor, sparkData, tooltip, delay, link }: any) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = targetValue;
    const duration = 1000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setVal(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [targetValue]);

  const content = (
    <div className="glass-card rounded-xl p-5 hover:-translate-y-1 transition-all duration-300 group cursor-pointer" style={{ animation: `reveal 0.6s both`, animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
        <span className={`text-xs font-medium flex items-center gap-0.5 ${positive ? "text-green-500" : "text-red-400"}`}>{change}</span>
      </div>
      <p className="text-2xl font-bold font-mono-financial text-foreground">{prefix}{val.toLocaleString("pt-BR")}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

const Dashboard = () => {
  const { transactions } = usePlanIA();
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    const isNewImport = localStorage.getItem("plania-show-import-success") === "true";
    if (isNewImport) {
      setShowSuccessCard(true);
      const savedSummary = localStorage.getItem("plania-adapted-summary");
      if (savedSummary) setSummary(JSON.parse(savedSummary));
      localStorage.removeItem("plania-show-import-success");
      setTimeout(() => setShowSuccessCard(false), 8000);
    }
  }, []);

  const totals = {
    receitas: transactions.filter(t => t.tipo === "receita" || t.valor > 0).reduce((sum, t) => sum + Math.abs(t.valor), 0),
    gastos: transactions.filter(t => t.tipo === "gasto" || t.valor < 0).reduce((sum, t) => sum + Math.abs(t.valor), 0),
  };
  const saldo = totals.receitas - totals.gastos;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {showSuccessCard && summary && (
        <div className="animate-reveal bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-6 relative">
          <button onClick={() => setShowSuccessCard(false)} className="absolute top-4 right-4"><X className="w-4 h-4" /></button>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-green-500" /></div>
            <div>
              <h2 className="text-lg font-bold">Configuração concluída! 🎉</h2>
              <p className="text-sm text-muted-foreground">Importamos {summary.count} transações e adaptamos o PlanIA para você.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Saldo Atual" targetValue={saldo} change="+8,2%" positive accentColor="hsl(var(--chart-1))" delay={0} link="/dashboard/transacoes" />
        <StatCard icon={TrendingUp} label="Receitas" targetValue={totals.receitas} change="+14%" positive accentColor="hsl(var(--chart-2))" delay={80} link="/dashboard/transacoes" />
        <StatCard icon={CreditCard} label="Gastos" targetValue={totals.gastos} change="-3%" positive={false} accentColor="hsl(var(--chart-3))" delay={160} link="/dashboard/transacoes" />
        <StatCard icon={PiggyBank} label="Economia" targetValue={saldo > 0 ? saldo : 0} change="37%" positive accentColor="hsl(var(--chart-4))" delay={240} link="/dashboard/metas" />
      </div>

      <div className="glass-card rounded-xl p-5 animate-reveal" style={{ animationDelay: '1000ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Transações recentes</h3>
          <Link to="/dashboard/transacoes" className="text-xs text-[#6366F1] hover:underline">Ver todas</Link>
        </div>
        <div className="space-y-1">
          {transactions.slice(0, 5).map((t, i) => (
            <div key={t.id || i} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
              <div style={{
                width: 36, height: 36,
                borderRadius: "50%",
                background: (t.tipo === "receita" || t.valor > 0) ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
                border: `1px solid ${(t.tipo === "receita" || t.valor > 0) ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`
              }}>
                {getIconeTransacao(t.descricao, t.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{t.descricao}</p>
                <p className="text-[11px] text-muted-foreground">{t.categoria} · {t.data}</p>
              </div>
              <span className={`font-mono-financial text-sm font-medium ${(t.tipo === 'receita' || t.valor > 0) ? "text-green-500" : "text-red-400"}`}>
                {(t.tipo === 'receita' || t.valor > 0) ? "+" : "-"}R$ {Math.abs(t.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <QuickLaunchBar />
    </div>
  );
};

export default Dashboard;