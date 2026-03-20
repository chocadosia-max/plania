import { useEffect, useState } from "react";
import {
  Wallet, TrendingUp, CreditCard, PiggyBank,
  ChevronLeft, ChevronRight, Calendar, RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuickLaunchBar } from "@/components/QuickLaunchBar";
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const { isSyncing, sync } = usePlanIA();

  const periodo: Periodo = {
    tipo: viewType,
    mes: selectedDate.getMonth(),
    ano: selectedDate.getFullYear()
  };

  const dados = useDadosFinanceiros(periodo);

  const handlePrev = () => setSelectedDate(viewType === 'month' ? subMonths(selectedDate, 1) : subYears(selectedDate, 1));
  const handleNext = () => setSelectedDate(viewType === 'month' ? addMonths(selectedDate, 1) : addYears(selectedDate, 1));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Seletor de Período e Ações */}
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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-[10px] font-black uppercase border-primary/30 text-primary hover:bg-primary/5"
            onClick={sync}
            disabled={isSyncing}
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
            {isSyncing ? "Sincronizando..." : "Sincronizar"}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-[10px] font-black uppercase" onClick={() => setSelectedDate(new Date())}>
            <Calendar className="w-3.5 h-3.5" /> Hoje
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Saldo" targetValue={dados.saldo} change={dados.saldo >= 0 ? "↑" : "↓"} positive={dados.saldo >= 0} delay={0} link="/dashboard/transacoes" />
        <StatCard icon={TrendingUp} label="Receitas" targetValue={dados.receitas} positive delay={80} link="/dashboard/transacoes" />
        <StatCard icon={CreditCard} label="Gastos" targetValue={dados.gastos} positive={false} delay={160} link="/dashboard/transacoes" />
        <StatCard icon={PiggyBank} label="Economia" targetValue={dados.economia} prefix="" suffix="%" positive delay={240} link="/dashboard/metas" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista Recente */}
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

        {/* Mini Insight IA */}
        <div className="glass-card rounded-xl p-6 bg-primary/5 border-primary/20 animate-reveal" style={{ animationDelay: '600ms' }}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold mb-2">Análise Inteligente</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            {dados.saldo >= 0 
              ? `Você economizou ${dados.economia}% da sua renda este mês. Continue assim para atingir suas metas mais rápido!`
              : "Seus gastos superaram as receitas. Analise as categorias onde você mais gastou para ajustar seu orçamento."}
          </p>
          <Link to="/dashboard/relatorios">
            <Button className="w-full rounded-xl font-bold text-xs uppercase tracking-widest">Ver Relatório Completo</Button>
          </Link>
        </div>
      </div>

      <QuickLaunchBar />
    </div>
  );
};

export default Dashboard;