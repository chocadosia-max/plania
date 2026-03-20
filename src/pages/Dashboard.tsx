import { useEffect, useState, useMemo } from "react";
import {
  Wallet, TrendingUp, CreditCard, PiggyBank,
  ChevronLeft, ChevronRight, Calendar, Target, 
  ArrowUpRight, AlertTriangle, Trophy, Landmark
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getIconeTransacao } from "./Transacoes";
import { format, addMonths, subMonths, addYears, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useDadosFinanceiros, Periodo } from "@/hooks/useDadosFinanceiros";
import { usePlanIA } from "@/contexts/PlanIAContext";

function StatCard({ icon: Icon, label, targetValue, prefix = "R$ ", change, positive, delay, link }: any) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = targetValue;
    const duration = 800;
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
        {change !== undefined && <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", positive ? "bg-green-500/10 text-green-500" : "bg-red-400/10 text-red-400")}>{change}</span>}
      </div>
      <p className="text-2xl font-black font-mono-financial text-foreground">{prefix}{val.toLocaleString("pt-BR")}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

const Dashboard = () => {
  const { selectedDate, setSelectedDate, viewType, setViewType, goals, budgets, investments, dividas, getBudgetSpent } = usePlanIA();

  const periodo: Periodo = {
    tipo: viewType,
    mes: selectedDate.getMonth(),
    ano: selectedDate.getFullYear()
  };

  const dados = useDadosFinanceiros(periodo);

  // Cálculos automáticos baseados no contexto
  const totalInvestido = useMemo(() => investments.reduce((acc, inv) => acc + (Number(inv.valor) || 0), 0), [investments]);
  const totalDividas = useMemo(() => dividas.reduce((acc, d) => {
    const pags = d.pagamentos || {};
    const totalPago = Object.values(pags).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
    return acc + Math.max(0, (Number(d.valorTotal) || 0) - totalPago);
  }, 0), [dividas]);

  const orcamentosCriticos = useMemo(() => {
    return budgets.map(b => {
      const spent = getBudgetSpent(b.categoria);
      const pct = (spent / b.limite) * 100;
      return { ...b, spent, pct };
    }).filter(b => b.pct >= 80).sort((a, b) => b.pct - a.pct);
  }, [budgets, getBudgetSpent]);

  const metasDestaque = useMemo(() => {
    return [...goals].sort((a, b) => {
      const pctA = (a.valorAtual / a.valorAlvo);
      const pctB = (b.valorAtual / b.valorAlvo);
      return pctB - pctA;
    }).slice(0, 2);
  }, [goals]);

  const handlePrev = () => setSelectedDate(viewType === 'month' ? subMonths(selectedDate, 1) : subYears(selectedDate, 1));
  const handleNext = () => setSelectedDate(viewType === 'month' ? addMonths(selectedDate, 1) : addYears(selectedDate, 1));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 animate-reveal">
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-muted/50 rounded-xl border border-border/40">
            <button 
              onClick={() => setViewType('month')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", viewType === 'month' ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
            >
              Mês
            </button>
            <button 
              onClick={() => setViewType('year')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", viewType === 'year' ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
            >
              Anual
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></Button>
            <div className="flex flex-col items-center min-w-[120px]">
              <span className="text-sm font-black text-foreground capitalize">
                {viewType === 'month' ? format(selectedDate, "MMMM yyyy", { locale: ptBR }) : format(selectedDate, "yyyy")}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNext}><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-[10px] font-black uppercase" onClick={() => setSelectedDate(new Date())}>
            <Calendar className="w-3.5 h-3.5" /> Hoje
          </Button>
        </div>
      </div>

      {/* Primeira Linha: Fluxo de Caixa */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Saldo" targetValue={dados.saldo} change={dados.saldo >= 0 ? "↑" : "↓"} positive={dados.saldo >= 0} delay={0} link="/dashboard/transacoes" />
        <StatCard icon={TrendingUp} label="Receitas" targetValue={dados.receitas} positive delay={80} link="/dashboard/transacoes" />
        <StatCard icon={CreditCard} label="Gastos" targetValue={dados.gastos} positive={false} delay={160} link="/dashboard/transacoes" />
        <StatCard icon={PiggyBank} label="Economia" targetValue={dados.economia} prefix="" suffix="%" positive delay={240} link="/dashboard/metas" />
      </div>

      {/* Segunda Linha: Patrimônio e Dívidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard icon={Landmark} label="Patrimônio Investido" targetValue={totalInvestido} delay={300} link="/dashboard/investimentos" />
        <StatCard icon={AlertTriangle} label="Total em Dívidas" targetValue={totalDividas} positive={false} delay={350} link="/dashboard/dividas" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Transações Recentes */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 animate-reveal" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Transações Recentes</h3>
            <Link to="/dashboard/transacoes" className="text-[10px] font-black uppercase text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-1">
            {dados.transacoes.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">Nenhuma transação encontrada para este período.</div>
            ) : (
              dados.transacoes.slice(0, 6).map((t, i) => (
                <div key={t.id || i} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 border",
                    (t.tipo === "receita" || t.tipo === "entrada") ? "bg-green-500/10 border-green-500/20" : "bg-red-400/10 border-red-400/20"
                  )}>
                    {getIconeTransacao(t.descricao, t.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{t.descricao}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{t.categoria} · {t.data}</p>
                  </div>
                  <span className={cn("font-mono-financial text-sm font-bold", (t.tipo === 'receita' || t.tipo === 'entrada') ? "text-green-500" : "text-red-400")}>
                    {(t.tipo === 'receita' || t.tipo === 'entrada') ? "+" : "-"}R$ {Math.abs(t.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Metas e Orçamentos */}
        <div className="space-y-6">
          {/* Metas em Destaque */}
          <div className="glass-card rounded-xl p-5 animate-reveal" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Metas Próximas</h3>
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-4">
              {metasDestaque.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">Nenhuma meta cadastrada.</p>
              ) : (
                metasDestaque.map((meta, i) => {
                  const pct = Math.min(Math.round((meta.valorAtual / meta.valorAlvo) * 100), 100);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span>{meta.emoji} {meta.nome}</span>
                        <span className="text-primary">{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })
              )}
              <Link to="/dashboard/metas">
                <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase h-8">Gerenciar Metas</Button>
              </Link>
            </div>
          </div>

          {/* Orçamentos Críticos */}
          <div className="glass-card rounded-xl p-5 animate-reveal" style={{ animationDelay: '600ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Alertas de Orçamento</h3>
              <AlertTriangle className="w-4 h-4 text-orange-400" />
            </div>
            <div className="space-y-3">
              {orcamentosCriticos.length === 0 ? (
                <p className="text-[10px] text-green-500 text-center py-4 font-bold">Tudo sob controle! ✅</p>
              ) : (
                orcamentosCriticos.slice(0, 3).map((orc, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{orc.emoji}</span>
                      <span className="text-[11px] font-bold">{orc.categoria}</span>
                    </div>
                    <span className={cn("text-[11px] font-black", orc.pct >= 100 ? "text-red-400" : "text-orange-400")}>
                      {orc.pct.toFixed(0)}%
                    </span>
                  </div>
                ))
              )}
              <Link to="/dashboard/orcamentos">
                <Button variant="ghost" className="w-full mt-2 text-[10px] font-black uppercase h-8">Ver Orçamentos</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;