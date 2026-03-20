import { useEffect, useState, useMemo } from "react";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, PiggyBank,
  X, CheckCircle2, ChevronLeft, ChevronRight, Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuickLaunchBar } from "@/components/QuickLaunchBar";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { getIconeTransacao } from "./Transacoes";
import { format, addMonths, subMonths, addYears, subYears, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
        {change && <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", positive ? "bg-green-500/10 text-green-500" : "bg-red-400/10 text-red-400")}>{change}</span>}
      </div>
      <p className="text-2xl font-black font-mono-financial text-foreground">{prefix}{val.toLocaleString("pt-BR")}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
  return link ? <Link to={link}>{content}</Link> : content;
}

const Dashboard = () => {
  const { transactions, viewType, setViewType, selectedDate, setSelectedDate } = usePlanIA();
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // Filtragem de dados baseada no período selecionado
  const filteredData = useMemo(() => {
    let start, end;
    if (viewType === 'month') {
      start = startOfMonth(selectedDate);
      end = endOfMonth(selectedDate);
    } else {
      start = startOfYear(selectedDate);
      end = endOfYear(selectedDate);
    }

    const filtered = transactions.filter(t => {
      try {
        const tDate = parse(t.data, 'dd/MM/yyyy', new Date());
        return isWithinInterval(tDate, { start, end });
      } catch (e) { return false; }
    });

    const receitas = filtered.filter(t => t.tipo === "receita").reduce((sum, t) => sum + Math.abs(t.valor), 0);
    const gastos = filtered.filter(t => t.tipo === "gasto").reduce((sum, t) => sum + Math.abs(t.valor), 0);
    
    return { receitas, gastos, saldo: receitas - gastos, list: filtered.slice(0, 5) };
  }, [transactions, viewType, selectedDate]);

  const handlePrev = () => setSelectedDate(viewType === 'month' ? subMonths(selectedDate, 1) : subYears(selectedDate, 1));
  const handleNext = () => setSelectedDate(viewType === 'month' ? addMonths(selectedDate, 1) : addYears(selectedDate, 1));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Seletor de Período Premium */}
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

        <Button variant="outline" size="sm" className="gap-2 text-[10px] font-black uppercase" onClick={() => setSelectedDate(new Date())}>
          <Calendar className="w-3.5 h-3.5" /> Hoje
        </Button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Saldo" targetValue={filteredData.saldo} change={filteredData.saldo >= 0 ? "+8%" : "-2%"} positive={filteredData.saldo >= 0} delay={0} link="/dashboard/transacoes" />
        <StatCard icon={TrendingUp} label="Receitas" targetValue={filteredData.receitas} change="+14%" positive delay={80} link="/dashboard/transacoes" />
        <StatCard icon={CreditCard} label="Gastos" targetValue={filteredData.gastos} change="-3%" positive={false} delay={160} link="/dashboard/transacoes" />
        <StatCard icon={PiggyBank} label="Economia" targetValue={filteredData.saldo > 0 ? filteredData.saldo : 0} change="37%" positive delay={240} link="/dashboard/metas" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista Recente */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5 animate-reveal" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Transações de {viewType === 'month' ? 'Março' : '2026'}</h3>
            <Link to="/dashboard/transacoes" className="text-[10px] font-black uppercase text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-1">
            {filteredData.list.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">Nenhuma transação neste período.</div>
            ) : (
              filteredData.list.map((t, i) => (
                <div key={t.id || i} className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0 border",
                    t.tipo === "receita" ? "bg-green-500/10 border-green-500/20" : "bg-red-400/10 border-red-400/20"
                  )}>
                    {getIconeTransacao(t.descricao, t.tipo)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{t.descricao}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">{t.categoria} · {t.data}</p>
                  </div>
                  <span className={cn("font-mono-financial text-sm font-bold", t.tipo === 'receita' ? "text-green-500" : "text-red-400")}>
                    {t.tipo === 'receita' ? "+" : "-"}R$ {Math.abs(t.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mini Insight IA */}
        <div className="glass-card rounded-xl p-6 bg-primary/5 border-primary/20 animate-reveal" style={{ animationDelay: '600ms' }}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Análise de {viewType === 'month' ? 'Março' : '2026'}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            {filteredData.saldo >= 0 
              ? "Você está com saldo positivo! Sua taxa de economia está em 37%, o que é excelente para bater sua meta de viagem."
              : "Atenção: seus gastos superaram as receitas neste período. Considere revisar seus orçamentos de lazer."}
          </p>
          <Button className="w-full rounded-xl font-bold text-xs uppercase tracking-widest">Ver Relatório Completo</Button>
        </div>
      </div>

      <QuickLaunchBar />
    </div>
  );
};

export default Dashboard;