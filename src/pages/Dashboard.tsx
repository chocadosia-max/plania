import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, PiggyBank,
  ShoppingCart, Home, Car, Utensils, Gamepad2, Zap, Briefcase,
  Heart, Music, CheckCircle2, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { QuickLaunchBar } from "@/components/QuickLaunchBar";
import { cn } from "@/lib/utils";

/* ─── data ─── */
const monthlyData = [
  { month: "Out", receita: 4200, despesa: 3100 },
  { month: "Nov", receita: 4800, despesa: 2900 },
  { month: "Dez", receita: 4500, despesa: 3400 },
  { month: "Jan", receita: 5200, despesa: 3200 },
  { month: "Fev", receita: 4900, despesa: 2800 },
  { month: "Mar", receita: 5600, despesa: 3500 },
];

const categoryData = [
  { name: "Moradia", value: 2800, color: "hsl(var(--chart-1))" },
  { name: "Alimentação", value: 1200, color: "hsl(var(--chart-2))" },
  { name: "Transporte", value: 650, color: "hsl(var(--chart-3))" },
  { name: "Lazer", value: 480, color: "hsl(var(--chart-4))" },
  { name: "Outros", value: 370, color: "hsl(var(--chart-5))" },
];

const categoryIcons: Record<string, any> = {
  Salário: Briefcase,
  Aluguel: Home,
  Supermercado: ShoppingCart,
  Freelance: Briefcase,
  "Conta de luz": Zap,
  Restaurante: Utensils,
  Uber: Car,
  Spotify: Music,
  Academia: Heart,
  "Game Pass": Gamepad2,
};

const transactions = [
  { id: 1, desc: "Salário", value: 5600, cat: "Receita", date: "01 Mar" },
  { id: 2, desc: "Aluguel", value: -1800, cat: "Moradia", date: "05 Mar" },
  { id: 3, desc: "Supermercado", value: -342.5, cat: "Alimentação", date: "08 Mar" },
  { id: 4, desc: "Freelance", value: 1200, cat: "Receita", date: "12 Mar" },
  { id: 5, desc: "Conta de luz", value: -187.3, cat: "Moradia", date: "15 Mar" },
  { id: 6, desc: "Restaurante", value: -89.9, cat: "Alimentação", date: "17 Mar" },
  { id: 7, desc: "Uber", value: -32.5, cat: "Transporte", date: "18 Mar" },
  { id: 8, desc: "Spotify", value: -21.9, cat: "Lazer", date: "19 Mar" },
];

const sparklines = {
  saldo: [12.4, 13.2, 11.8, 14.5, 15.2, 14.8, 16.3],
  receita: [4.2, 4.8, 4.5, 5.2, 4.9, 5.6, 5.8],
  gastos: [3.1, 2.9, 3.4, 3.2, 2.8, 3.5, 3.3],
  economia: [1.1, 1.9, 1.1, 2.0, 2.1, 2.1, 2.5],
};

function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 28;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="mt-1">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  icon: Icon,
  label,
  targetValue,
  prefix = "R$ ",
  change,
  positive,
  accentColor,
  sparkData,
  tooltip,
  delay,
}: {
  icon: any;
  label: string;
  targetValue: number;
  prefix?: string;
  change: string;
  positive: boolean;
  accentColor: string;
  sparkData: number[];
  tooltip: string;
  delay: number;
}) {
  const animatedValue = useCounter(targetValue);

  return (
    <UITooltip>
      <TooltipTrigger asChild>
        <div
          className="glass-card rounded-xl p-5 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default"
          style={{ animation: `reveal 0.6s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${delay}ms` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Icon className="w-4 h-4 text-primary animate-[pulse-soft_2.5s_ease-in-out_infinite]" />
            </div>
            <span className={`text-xs font-medium flex items-center gap-0.5 ${positive ? "text-green-500" : "text-red-400"}`}>
              {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}
            </span>
          </div>
          <p className="text-2xl font-bold font-mono-financial text-foreground">
            {prefix}{animatedValue.toLocaleString("pt-BR")}
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <Sparkline data={sparkData} color={accentColor} />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom"><p className="text-xs">{tooltip}</p></TooltipContent>
    </UITooltip>
  );
}

const Dashboard = () => {
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [visibleRows, setVisibleRows] = useState(0);

  useEffect(() => {
    const isNewImport = localStorage.getItem("plania-show-import-success") === "true";
    if (isNewImport) {
      setShowSuccessCard(true);
      const savedSummary = localStorage.getItem("plania-adapted-summary");
      if (savedSummary) setSummary(JSON.parse(savedSummary));
      
      localStorage.removeItem("plania-show-import-success");
      setTimeout(() => setShowSuccessCard(false), 8000);
    }

    const timers: NodeJS.Timeout[] = [];
    transactions.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleRows((v) => Math.max(v, i + 1)), 100 + i * 80));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Success Card */}
      {showSuccessCard && summary && (
        <div className="animate-reveal bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2">
            <button onClick={() => setShowSuccessCard(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center shrink-0 animate-check-bounce">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-foreground">Configuração concluída! 🎉</h2>
              <p className="text-sm text-muted-foreground">
                Importamos {summary.count} transações e adaptamos o PlanIA para o seu perfil 
                <span className="font-bold text-primary ml-1 uppercase">{localStorage.getItem("plania-user-type")}</span>.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="text-xs"><span className="text-muted-foreground">Renda média:</span> <span className="font-bold text-green-500">R$ {summary.income.toLocaleString('pt-BR')}</span></div>
                <div className="text-xs"><span className="text-muted-foreground">Gasto médio:</span> <span className="font-bold text-red-400">R$ {summary.expenses.toLocaleString('pt-BR')}</span></div>
                <div className="text-xs"><span className="text-muted-foreground">Economia:</span> <span className="font-bold text-primary">R$ {summary.savings.toLocaleString('pt-BR')}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Saldo Atual" targetValue={16320} change="+8,2%" positive accentColor="hsl(var(--chart-1))" sparkData={sparklines.saldo} tooltip="Saldo consolidado de todas as contas" delay={0} />
        <StatCard icon={TrendingUp} label="Receitas do mês" targetValue={5600} change="+14,3%" positive accentColor="hsl(var(--chart-2))" sparkData={sparklines.receita} tooltip="Total de entradas em março" delay={80} />
        <StatCard icon={CreditCard} label="Gastos do mês" targetValue={3497} change="-3,1%" positive={false} accentColor="hsl(var(--chart-3))" sparkData={sparklines.gastos} tooltip="Total de saídas em março" delay={160} />
        <StatCard icon={PiggyBank} label="Economia" targetValue={2103} prefix="R$ " change="37,5% do salário" positive accentColor="hsl(var(--chart-4))" sparkData={sparklines.economia} tooltip="Diferença entre receitas e gastos" delay={240} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-xl p-5 animate-reveal" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground text-sm">Receitas vs Gastos</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))", fontSize: 12 }}
                formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]}
              />
              <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={1500} />
              <Bar dataKey="despesa" name="Despesa" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} animationDuration={1500} animationBegin={300} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card rounded-xl p-5 animate-reveal" style={{ animationDelay: '600ms' }}>
          <h3 className="font-semibold text-foreground text-sm mb-4">Gastos por categoria</h3>
          <div className="h-[180px] w-full">
            {/* Pie chart content here */}
          </div>
          <div className="space-y-2 mt-1">
            {categoryData.map((c, i) => (
              <div 
                key={c.name} 
                className="flex items-center justify-between text-xs animate-reveal"
                style={{ animationDelay: `${800 + i * 100}ms` }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                </div>
                <span className="font-mono-financial text-foreground">R$ {c.value.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="glass-card rounded-xl p-5 animate-reveal" style={{ animationDelay: '1000ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-sm">Transações recentes</h3>
          <Button variant="ghost" size="sm" className="text-xs text-primary">
            Ver todas
          </Button>
        </div>
        <div className="space-y-1">
          {transactions.map((t, i) => {
            const IconComp = categoryIcons[t.desc] || ShoppingCart;
            return (
              <div
                key={t.id}
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                style={{
                  opacity: i < visibleRows ? 1 : 0,
                  transform: i < visibleRows ? "translateX(0)" : "translateX(-20px)",
                  transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                }}
              >
                <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.desc}</p>
                  <p className="text-[11px] text-muted-foreground">{t.cat} · {t.date}</p>
                </div>
                <span className={`font-mono-financial text-sm font-medium shrink-0 ${t.value > 0 ? "text-green-500" : "text-red-400"}`}>
                  {t.value > 0 ? "+" : ""}R$ {Math.abs(t.value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dashboard specific floating elements */}
      <div className="hidden md:block">
        <QuickLaunchBar />
      </div>
    </div>
  );
};

export default Dashboard;