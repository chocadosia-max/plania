import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Download, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Lightbulb, Utensils, ShoppingCart, Car, Home, Gamepad2, BookOpen, Heart } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Area, AreaChart,
  Treemap as RechartsTreemap,
} from "recharts";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── mock data ─── */
const monthlyBalance = [
  { month: "Out", saldo: 12400, receita: 4200, despesa: 3100 },
  { month: "Nov", saldo: 13200, receita: 4800, despesa: 2900 },
  { month: "Dez", saldo: 11800, receita: 4500, despesa: 3400 },
  { month: "Jan", saldo: 14500, receita: 5200, despesa: 3200 },
  { month: "Fev", saldo: 15200, receita: 4900, despesa: 2800 },
  { month: "Mar", saldo: 16320, receita: 5600, despesa: 3500 },
];

const stackedData = [
  { month: "Out", Moradia: 1400, Alimentação: 800, Transporte: 350, Lazer: 300, Outros: 250 },
  { month: "Nov", Moradia: 1400, Alimentação: 750, Transporte: 280, Lazer: 250, Outros: 220 },
  { month: "Dez", Moradia: 1500, Alimentação: 900, Transporte: 400, Lazer: 350, Outros: 250 },
  { month: "Jan", Moradia: 1400, Alimentação: 850, Transporte: 380, Lazer: 280, Outros: 290 },
  { month: "Fev", Moradia: 1350, Alimentação: 700, Transporte: 300, Lazer: 200, Outros: 250 },
  { month: "Mar", Moradia: 1800, Alimentação: 850, Transporte: 380, Lazer: 270, Outros: 200 },
];

const treemapData = [
  { name: "Moradia", size: 2800, fill: "hsl(var(--chart-1))" },
  { name: "Alimentação", size: 1200, fill: "hsl(var(--chart-2))" },
  { name: "Transporte", size: 650, fill: "hsl(var(--chart-3))" },
  { name: "Lazer", size: 480, fill: "hsl(var(--chart-4))" },
  { name: "Saúde", size: 320, fill: "hsl(var(--chart-5))" },
  { name: "Educação", size: 280, fill: "hsl(var(--chart-1))" },
  { name: "Outros", size: 370, fill: "hsl(var(--chart-3))" },
];

const compareData = [
  { cat: "Moradia", atual: 1800, anterior: 1400 },
  { cat: "Alimentação", atual: 850, anterior: 700 },
  { cat: "Transporte", atual: 380, anterior: 300 },
  { cat: "Lazer", atual: 270, anterior: 200 },
  { cat: "Outros", atual: 200, anterior: 250 },
];

const insights = [
  { icon: "📈", title: "Alimentação subiu 23%", desc: "Gastos com alimentação cresceram significativamente neste trimestre comparado ao anterior.", color: "hsl(var(--chart-2))" },
  { icon: "🏆", title: "Melhor mês: Fevereiro", desc: "Você economizou R$ 2.100 — o maior saldo positivo dos últimos 6 meses!", color: "hsl(var(--chart-1))" },
  { icon: "⚠️", title: "Moradia acima da média", desc: "O gasto com moradia cresceu 28% em março. Verifique se houve despesa extra.", color: "hsl(var(--destructive))" },
  { icon: "💡", title: "Oportunidade de economia", desc: "Se reduzir lazer em 15%, você economiza R$ 486/ano — quase uma viagem!", color: "hsl(var(--chart-4))" },
  { icon: "📊", title: "Tendência positiva", desc: "Sua renda vem crescendo 5% ao mês nos últimos 3 meses. Continue assim!", color: "hsl(var(--chart-1))" },
  { icon: "🎯", title: "Meta de viagem acelerando", desc: "No ritmo atual, você bate a meta de viagem 2 semanas antes do previsto.", color: "hsl(var(--chart-3))" },
];

/* ─── animated counter ─── */
function useCounter(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

/* ─── summary card ─── */
function SummaryCard({ label, value, prefix = "R$ ", sub, positive, delay }: {
  label: string; value: number; prefix?: string; sub?: string; positive?: boolean; delay: number;
}) {
  const animated = useCounter(value);
  return (
    <div
      className="glass-card rounded-xl p-4 space-y-1"
      style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${delay}ms` }}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold font-mono-financial text-foreground">
        {prefix}{animated.toLocaleString("pt-BR")}
      </p>
      {sub && (
        <p className={cn("text-xs flex items-center gap-1", positive === true ? "text-green-500" : positive === false ? "text-red-400" : "text-muted-foreground")}>
          {positive === true && <ArrowUpRight className="w-3 h-3" />}
          {positive === false && <ArrowDownRight className="w-3 h-3" />}
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── custom treemap content ─── */
const TreemapContent = (props: any) => {
  const { x, y, width, height, name, size } = props;
  if (width < 40 || height < 30) return null;
  const total = treemapData.reduce((s, d) => s + d.size, 0);
  const pct = ((size / total) * 100).toFixed(1);
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={6} fill={props.fill || "hsl(var(--chart-1))"} fillOpacity={0.75} stroke="hsl(var(--background))" strokeWidth={2} className="transition-all duration-200 hover:fill-opacity-100 cursor-pointer" />
      {width > 60 && height > 45 && (
        <>
          <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" className="fill-foreground text-xs font-medium">{name}</text>
          <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" className="fill-muted-foreground text-[10px]">
            {pct}% · R$ {size.toLocaleString("pt-BR")}
          </text>
        </>
      )}
    </g>
  );
};

/* ─── main ─── */
const Relatorios = () => {
  const [period, setPeriod] = useState("3m");
  const [customDate, setCustomDate] = useState<Date>();
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set());

  const toggleLegend = (key: string) => {
    setHiddenKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const stackedCategories = ["Moradia", "Alimentação", "Transporte", "Lazer", "Outros"];
  const stackedColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const tooltipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    color: "hsl(var(--foreground))",
    fontSize: 12,
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-[1200px] mx-auto">
        {/* Header + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={{ animation: "reveal 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Visão completa das suas finanças</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Este mês</SelectItem>
                <SelectItem value="3m">Últimos 3 meses</SelectItem>
                <SelectItem value="1y">Este ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            {period === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("gap-2", !customDate && "text-muted-foreground")}>
                    <CalendarIcon className="w-4 h-4" />
                    {customDate ? format(customDate, "dd/MM/yyyy") : "Escolher data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar mode="single" selected={customDate} onSelect={setCustomDate} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            )}

            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Exportação Excel iniciada! 📊")}>
              <Download className="w-3.5 h-3.5" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("Relatório PDF gerado! 📄")}>
              <Download className="w-3.5 h-3.5" /> PDF
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <SummaryCard label="Receitas" value={29200} positive sub="+12% vs anterior" delay={0} />
          <SummaryCard label="Gastos" value={18900} positive={false} sub="+5% vs anterior" delay={60} />
          <SummaryCard label="Saldo" value={10300} positive sub="Positivo 🎉" delay={120} />
          <SummaryCard label="Maior gasto único" value={1800} sub="Aluguel · Mar" delay={180} />
          <SummaryCard label="Categoria top" value={8850} prefix="" sub="🏠 Moradia (47%)" delay={240} />
          <SummaryCard label="Melhor mês" value={2100} sub="Fevereiro · economia" positive delay={300} />
        </div>

        {/* Chart 1: Saldo ao longo do tempo */}
        <div className="glass-card rounded-xl p-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "100ms" }}>
          <h3 className="font-semibold text-foreground text-sm mb-4">Linha do tempo — Saldo mensal</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyBalance}>
              <defs>
                <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <Area type="monotone" dataKey="saldo" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#saldoGrad)" dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }} activeDot={{ r: 6 }} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart 2: Barras empilhadas */}
          <div className="glass-card rounded-xl p-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "200ms" }}>
            <h3 className="font-semibold text-foreground text-sm mb-2">Categorias por mês</h3>
            {/* Interactive legend */}
            <div className="flex flex-wrap gap-2 mb-3">
              {stackedCategories.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => toggleLegend(cat)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border transition-all duration-200 active:scale-95",
                    hiddenKeys.has(cat) ? "opacity-40 border-border" : "border-border/60"
                  )}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: stackedColors[i] }} />
                  {cat}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stackedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
                {stackedCategories.map((cat, i) => (
                  !hiddenKeys.has(cat) && (
                    <Bar key={cat} dataKey={cat} stackId="a" fill={stackedColors[i]} radius={i === stackedCategories.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} animationDuration={800} animationBegin={i * 100} />
                  )
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Treemap */}
          <div className="glass-card rounded-xl p-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "300ms" }}>
            <h3 className="font-semibold text-foreground text-sm mb-4">Treemap de gastos</h3>
            <ResponsiveContainer width="100%" height={270}>
              <RechartsTreemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="none"
                content={<TreemapContent />}
                animationDuration={800}
              />
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Comparativo */}
        <div className="glass-card rounded-xl p-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "350ms" }}>
          <h3 className="font-semibold text-foreground text-sm mb-4">Comparativo — Março vs Fevereiro</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={compareData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="cat" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, ""]} />
              <Bar dataKey="atual" name="Março" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} animationDuration={800} />
              <Bar dataKey="anterior" name="Fevereiro" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} animationDuration={800} animationBegin={200} />
              <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
            </BarChart>
          </ResponsiveContainer>
          {/* Change indicators */}
          <div className="flex flex-wrap gap-3 mt-3">
            {compareData.map((d) => {
              const pct = ((d.atual - d.anterior) / d.anterior * 100).toFixed(0);
              const up = d.atual > d.anterior;
              return (
                <div key={d.cat} className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">{d.cat}:</span>
                  <span className={cn("flex items-center gap-0.5 font-medium", up ? "text-red-400" : "text-green-500")}>
                    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {up ? "+" : ""}{pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <section className="space-y-4 pb-8" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "450ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">O que a IA encontrou</h2>
              <p className="text-xs text-muted-foreground">Insights automáticos baseados nos seus dados</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 group"
                style={{ animation: "reveal 0.5s cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${500 + i * 80}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">{ins.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{ins.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ins.desc}</p>
                    <button className="text-xs text-primary font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Ver detalhes →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;
