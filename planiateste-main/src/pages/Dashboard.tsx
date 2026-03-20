import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, PiggyBank,
  ShoppingCart, Home, Car, Utensils, Gamepad2, Zap, Briefcase,
  Heart, Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─── data ─── */
const monthlyData = [
  { month: "Out", receita: 4200, despesa: 3100 },
  { month: "Nov", receita: 4800, despesa: 2900 },
  { month: "Dez", receita: 4500, despesa: 3400 },
  { month: "Jan", receita: 5200, despesa: 3200 },
  { month: "Fev", receita: 4900, despesa: 2800 },
  { month: "Mar", receita: 5600, despesa: 3500 },
];

const quarterlyData = [
  { month: "Q3 '25", receita: 14200, despesa: 9800 },
  { month: "Q4 '25", receita: 13500, despesa: 9300 },
  { month: "Q1 '26", receita: 15700, despesa: 9500 },
];

const annualData = [
  { month: "2024", receita: 52000, despesa: 38000 },
  { month: "2025", receita: 58000, despesa: 36000 },
  { month: "2026", receita: 16800, despesa: 10300 },
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

/* sparkline data for each stat card */
const sparklines = {
  saldo: [12.4, 13.2, 11.8, 14.5, 15.2, 14.8, 16.3],
  receita: [4.2, 4.8, 4.5, 5.2, 4.9, 5.6, 5.8],
  gastos: [3.1, 2.9, 3.4, 3.2, 2.8, 3.5, 3.3],
  economia: [1.1, 1.9, 1.1, 2.0, 2.1, 2.1, 2.5],
};

/* ─── animated counter hook ─── */
function useCounter(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setVal(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

/* ─── mini sparkline ─── */
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

/* ─── stat card ─── */
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

/* ─── main ─── */
const Dashboard = () => {
  const [chartFilter, setChartFilter] = useState<"mensal" | "trimestral" | "anual">("mensal");
  const [visibleRows, setVisibleRows] = useState(0);

  const chartData = chartFilter === "mensal" ? monthlyData : chartFilter === "trimestral" ? quarterlyData : annualData;

  // Cascade animation for transaction rows
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    transactions.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleRows((v) => Math.max(v, i + 1)), 100 + i * 80));
    });
    return () => timers.forEach(clearTimeout);
  }, []);


  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={Wallet} label="Saldo Atual" targetValue={16320} change="+8,2%" positive accentColor="hsl(var(--chart-1))" sparkData={sparklines.saldo} tooltip="Saldo consolidado de todas as contas" delay={0} />
              <StatCard icon={TrendingUp} label="Receitas do mês" targetValue={5600} change="+14,3%" positive accentColor="hsl(var(--chart-2))" sparkData={sparklines.receita} tooltip="Total de entradas em março" delay={80} />
              <StatCard icon={CreditCard} label="Gastos do mês" targetValue={3497} change="-3,1%" positive={false} accentColor="hsl(var(--chart-3))" sparkData={sparklines.gastos} tooltip="Total de saídas em março" delay={160} />
              <StatCard icon={PiggyBank} label="Economia" targetValue={2103} prefix="R$ " change="37,5% do salário" positive accentColor="hsl(var(--chart-4))" sparkData={sparklines.economia} tooltip="Diferença entre receitas e gastos" delay={240} />
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Bar chart */}
              <div className="lg:col-span-2 glass-card rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground text-sm">Receitas vs Gastos</h3>
                  <div className="flex gap-1">
                    {(["mensal", "trimestral", "anual"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setChartFilter(f)}
                        className={`text-xs px-3 py-1 rounded-full transition-all duration-200 ${
                          chartFilter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))", fontSize: 12 }}
                      formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]}
                    />
                    <Bar dataKey="receita" name="Receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={800} />
                    <Bar dataKey="despesa" name="Despesa" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart */}
              <div className="glass-card rounded-xl p-5">
                <h3 className="font-semibold text-foreground text-sm mb-4">Gastos por categoria</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={800}
                      activeShape={(props: any) => {
                        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
                        return (
                          <g>
                            <path
                              d={`M ${cx},${cy} L ${cx + (outerRadius + 6) * Math.cos(-startAngle * Math.PI / 180)},${cy + (outerRadius + 6) * Math.sin(-startAngle * Math.PI / 180)} A ${outerRadius + 6},${outerRadius + 6} 0 ${endAngle - startAngle > 180 ? 1 : 0},0 ${cx + (outerRadius + 6) * Math.cos(-endAngle * Math.PI / 180)},${cy + (outerRadius + 6) * Math.sin(-endAngle * Math.PI / 180)} Z`}
                              fill={fill}
                              opacity={0.9}
                            />
                          </g>
                        );
                      }}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} className="transition-all duration-200" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))", fontSize: 12 }}
                      formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-1">
                  {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-xs">
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
            <div className="glass-card rounded-xl p-5">
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
