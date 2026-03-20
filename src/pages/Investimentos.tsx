"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Plus, RefreshCw, Wallet, 
  Trophy, Calendar, PieChart, List, BarChart3, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Coins, Landmark, Building2, Bitcoin, ShieldCheck, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

/* --- TYPES --- */
interface Asset {
  id: number;
  name: string;
  type: 'Renda Fixa' | 'Ações' | 'FII' | 'Cripto' | 'Tesouro' | 'Fundo';
  value: number;
  yield: number;
  yieldPct: number;
  composition: number;
  startDate: string;
  contribution: number;
  expiry?: string;
  sparkline: { date: string; val: number }[];
}

/* --- DATA --- */
const portfolioHistory = [
  { date: 'Out 24', val: 32000, yield: 1.2 },
  { date: 'Nov 24', val: 34500, yield: 1.8 },
  { date: 'Dez 24', val: 38200, yield: 2.1 },
  { date: 'Jan 25', val: 41000, yield: 1.5 },
  { date: 'Fev 25', val: 44800, yield: 2.4 },
  { date: 'Mar 25', val: 47830, yield: 2.3 },
];

const initialAssets: Asset[] = [
  { 
    id: 1, name: "CDB Banco Inter 102%", type: 'Renda Fixa', value: 12400, yield: 843, yieldPct: 7.3, composition: 26, 
    startDate: '2024-01-10', contribution: 11557, expiry: '2026-01-10',
    sparkline: Array.from({ length: 10 }, (_, i) => ({ date: `${i}`, val: 12000 + Math.random() * 400 }))
  },
  { 
    id: 2, name: "Petrobras (PETR4)", type: 'Ações', value: 8500, yield: 1250, yieldPct: 17.2, composition: 18, 
    startDate: '2024-03-15', contribution: 7250,
    sparkline: Array.from({ length: 10 }, (_, i) => ({ date: `${i}`, val: 7000 + Math.random() * 1500 }))
  },
  { 
    id: 3, name: "HGLG11", type: 'FII', value: 6200, yield: 480, yieldPct: 8.4, composition: 13, 
    startDate: '2024-05-20', contribution: 5720,
    sparkline: Array.from({ length: 10 }, (_, i) => ({ date: `${i}`, val: 5800 + Math.random() * 400 }))
  },
  { 
    id: 4, name: "Bitcoin (BTC)", type: 'Cripto', value: 9800, yield: 3200, yieldPct: 48.5, composition: 20, 
    startDate: '2024-02-01', contribution: 6600,
    sparkline: Array.from({ length: 10 }, (_, i) => ({ date: `${i}`, val: 6000 + Math.random() * 4000 }))
  },
  { 
    id: 5, name: "Tesouro Selic 2029", type: 'Tesouro', value: 10930, yield: 930, yieldPct: 9.3, composition: 23, 
    startDate: '2024-01-01', contribution: 10000, expiry: '2029-03-01',
    sparkline: Array.from({ length: 10 }, (_, i) => ({ date: `${i}`, val: 10000 + Math.random() * 930 }))
  },
];

const benchmarkData = [
  { name: 'Out', carteira: 0, cdi: 0, poup: 0, ibov: 0 },
  { name: 'Nov', carteira: 1.8, cdi: 0.9, poup: 0.5, ibov: 1.2 },
  { name: 'Dez', carteira: 3.9, cdi: 1.8, poup: 1.0, ibov: 2.5 },
  { name: 'Jan', carteira: 5.4, cdi: 2.7, poup: 1.5, ibov: 1.8 },
  { name: 'Fev', carteira: 7.8, cdi: 3.6, poup: 2.0, ibov: 3.2 },
  { name: 'Mar', carteira: 10.1, cdi: 4.5, poup: 2.5, ibov: 4.1 },
];

const contributionData = [
  { month: 'Out', aporte: 1200, meta: 1000 },
  { month: 'Nov', aporte: 1500, meta: 1000 },
  { month: 'Dez', aporte: 2000, meta: 1000 },
  { month: 'Jan', aporte: 800, meta: 1000 },
  { month: 'Fev', aporte: 1300, meta: 1000 },
  { month: 'Mar', aporte: 1600, meta: 1000 },
];

const typeColors: Record<string, string> = {
  'Renda Fixa': 'hsl(var(--chart-1))',
  'Ações': 'hsl(var(--chart-2))',
  'FII': 'hsl(var(--chart-3))',
  'Cripto': 'hsl(var(--chart-4))',
  'Tesouro': 'hsl(var(--chart-5))',
  'Fundo': 'hsl(var(--chart-1))',
};

const typeIcons: Record<string, any> = {
  'Renda Fixa': Landmark,
  'Ações': TrendingUp,
  'FII': Building2,
  'Cripto': Bitcoin,
  'Tesouro': ShieldCheck,
  'Fundo': Briefcase,
};

/* --- COMPONENTS --- */

function AnimatedCounter({ value, prefix = "R$ ", duration = 1200 }: { value: number; prefix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (value - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{prefix}{display.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

function FloatingParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i}
          className="absolute w-1.5 h-1.5 bg-amber-400/40 rounded-full blur-[1px] animate-float-particle"
          style={{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${10 + Math.random() * 10}s`
          }}
        />
      ))}
    </div>
  );
}

function AssetCard({ asset: a, delay }: { asset: Asset; delay: number }) {
  const [tickerKey, setTickerKey] = useState(0);
  const Icon = typeIcons[a.type] || Briefcase;
  const isPositive = a.yieldPct > 0;

  useEffect(() => {
    const interval = setInterval(() => setTickerKey(k => k + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="glass-card rounded-2xl p-5 space-y-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
      style={{ 
        animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", 
        animationDelay: `${delay}ms`,
        borderTop: `4px solid ${typeColors[a.type] || 'hsl(var(--primary))'}`
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform")} style={{ backgroundColor: typeColors[a.type] || 'hsl(var(--primary))' }}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground truncate max-w-[120px]">{a.name}</h4>
            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-none px-0" style={{ color: typeColors[a.type] || 'hsl(var(--primary))' }}>
              {a.type}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <p className="text-xl font-black font-mono-financial text-foreground">
          R$ {(a.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className={cn("flex items-center gap-1 text-xs font-bold", isPositive ? "text-green-500" : "text-red-400")}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          <div key={tickerKey} className="animate-flip-ticker">
            R$ {(a.yield ?? 0).toLocaleString('pt-BR')} ({a.yieldPct ?? 0}%)
          </div>
        </div>
      </div>

      <div className="h-[60px] w-full">
        {a.sparkline && a.sparkline.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={a.sparkline}>
              <defs>
                <linearGradient id={`grad-${a.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke={isPositive ? "#10b981" : "#ef4444"} 
                strokeWidth={2} 
                fill={`url(#grad-${a.id})`} 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-muted/20 rounded flex items-center justify-center text-[10px] text-muted-foreground">Sem dados</div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span>{a.composition ?? 0}% da carteira</span>
        </div>
        <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${a.composition ?? 0}%`, backgroundColor: typeColors[a.type] || 'hsl(var(--primary))' }}
          />
        </div>
      </div>

      <div className="pt-2 border-t border-border/30 grid grid-cols-2 gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
        <div>Início: {a.startDate ? format(new Date(a.startDate), "dd/MM/yy") : '--'}</div>
        <div className="text-right">Aporte: R$ {(a.contribution ?? 0).toLocaleString('pt-BR')}</div>
      </div>
    </div>
  );
}

export default function Investimentos() {
  const [period, setPeriod] = useState('6M');
  const [view, setView] = useState<'lista' | 'distribuicao' | 'performance'>('lista');
  const [isSyncing, setIsSyncing] = useState(false);
  const [assets, setAssets] = useState<Asset[]>(initialAssets);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success("Dados sincronizados com o mercado! 🚀");
    }, 1500);
  };

  const totalInvested = useMemo(() => (assets ?? []).reduce((acc, a) => acc + (a.contribution ?? 0), 0), [assets]);
  const totalCurrentValue = 47830; // Mock value
  const totalYield = totalCurrentValue - totalInvested;
  const totalYieldPct = totalInvested > 0 ? (totalYield / totalInvested) * 100 : 0;

  const pieData = useMemo(() => {
    const groups: Record<string, number> = {};
    (assets ?? []).forEach(a => {
      if (a.type) {
        groups[a.type] = (groups[a.type] || 0) + (a.value ?? 0);
      }
    });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const sortedAssetsForPerformance = useMemo(() => {
    return [...(assets ?? [])].sort((a, b) => (b.yieldPct ?? 0) - (a.yieldPct ?? 0));
  }, [assets]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Investimentos</h1>
          <p className="text-sm text-muted-foreground">Seu patrimônio investido em tempo real</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-muted rounded-xl">
            {['1M', '3M', '6M', '1A', 'Tudo'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-black rounded-lg transition-all",
                  period === p ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Badge className="bg-green-500/10 text-green-500 border-none font-black animate-pulse px-3 py-1.5">
            + 8,4% no período
          </Badge>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Novo investimento
              </Button>
            </SheetTrigger>
            <NewInvestmentDrawer />
          </Sheet>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={handleSync}>
            <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* HERO PANEL */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-blue-500/40 via-border to-primary/40 animate-reveal" style={{ animationDelay: '100ms' }}>
        <div className="bg-[#0a1128] rounded-[23px] p-8 overflow-hidden relative min-h-[320px] flex flex-col lg:flex-row items-center gap-12">
          <FloatingParticles />
          
          <div className="relative z-10 flex-1 space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Patrimônio total investido</p>
              <h2 className="text-5xl sm:text-6xl font-black font-mono-financial text-white tracking-tighter">
                <AnimatedCounter value={totalCurrentValue} />
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 font-bold text-sm">
                <ArrowUpRight className="w-4 h-4 animate-bounce" />
                R$ 3.847 (8,4%)
              </div>
              <p className="text-xs text-white/40 font-medium">no período selecionado</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-amber-400/80">
              <Trophy className="w-4 h-4" />
              vs. Poupança no período: +5,2pp à frente 🏆
            </div>
          </div>

          <div className="relative z-10 w-full lg:w-[45%] h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={portfolioHistory}>
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="glass-card p-3 border-white/10 text-xs shadow-2xl">
                          <p className="font-bold text-white/60 mb-1">{payload[0].payload.date}</p>
                          <p className="text-lg font-black text-white">R$ {payload[0].value.toLocaleString('pt-BR')}</p>
                          <p className="text-green-400 font-bold">+{payload[0].payload.yield}% no mês</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke="url(#heroGrad)" 
                  strokeWidth={4} 
                  fill="url(#heroGrad)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Investido" value={totalInvested} icon={Wallet} color="text-blue-400" bg="bg-blue-400/10" delay={200} />
        <MetricCard label="Rendimento Total" value={totalYield} subValue={`+${totalYieldPct.toFixed(1)}%`} icon={TrendingUp} color="text-green-500" bg="bg-green-500/10" delay={300} />
        <MetricCard label="Melhor Ativo" value={3200} subValue="Bitcoin" icon={Trophy} color="text-amber-500" bg="bg-amber-500/10" delay={400} />
        <MetricCard label="Próximo Vencimento" value={0} subValue="CDB Inter" icon={Calendar} color="text-purple-500" bg="bg-purple-500/10" delay={500} isDate />
      </div>

      {/* PORTFOLIO SECTION */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black font-sora">Minha Carteira</h3>
          <div className="flex p-1 bg-muted rounded-xl">
            <button onClick={() => setView('lista')} className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2", view === 'lista' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              <List className="w-3 h-3" /> Lista
            </button>
            <button onClick={() => setView('distribuicao')} className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2", view === 'distribuicao' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              <PieChart className="w-3 h-3" /> Distribuição
            </button>
            <button onClick={() => setView('performance')} className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2", view === 'performance' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
              <BarChart3 className="w-3 h-3" /> Performance
            </button>
          </div>
        </div>

        {view === 'lista' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(assets ?? []).map((a, i) => (
              <AssetCard key={a.id} asset={a} delay={600 + i * 80} />
            ))}
          </div>
        )}

        {view === 'distribuicao' && (
          <div className="glass-card rounded-3xl p-8 flex flex-col lg:flex-row items-center gap-12 animate-reveal">
            <div className="relative w-64 h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={pieData}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={typeColors[entry.name] || 'hsl(var(--primary))'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full border-4 border-dashed border-muted flex items-center justify-center text-xs text-muted-foreground">Sem dados</div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total</p>
                <p className="text-xl font-black">R$ {totalCurrentValue.toLocaleString('pt-BR')}</p>
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-all group cursor-default">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeColors[item.name] || 'hsl(var(--primary))' }} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">R$ {(item.value ?? 0).toLocaleString('pt-BR')} ({totalCurrentValue > 0 ? ((item.value / totalCurrentValue) * 100).toFixed(1) : 0}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'performance' && (
          <div className="glass-card rounded-3xl p-8 animate-reveal">
            <div className="h-[400px] w-full">
              {sortedAssetsForPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedAssetsForPerformance} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} width={120} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
                    />
                    <Bar dataKey="yieldPct" radius={[0, 4, 4, 0]} animationDuration={1500}>
                      {sortedAssetsForPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={(entry.yieldPct ?? 0) > 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">Nenhum dado de performance</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BENCHMARK SECTION */}
      <div className="glass-card rounded-3xl p-8 space-y-6 animate-reveal" style={{ animationDelay: '800ms' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black font-sora">Como você se compara</h3>
            <p className="text-xs text-muted-foreground">Rentabilidade acumulada vs Benchmarks</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-500 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            Você está superando o CDI em 1,3 pontos percentuais
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={benchmarkData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12 }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, paddingBottom: 20 }} />
              <Line name="Sua Carteira" type="monotone" dataKey="carteira" stroke="#7c3aed" strokeWidth={4} dot={{ r: 4, fill: '#7c3aed' }} animationDuration={2000} />
              <Line name="CDI" type="monotone" dataKey="cdi" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              <Line name="Poupança" type="monotone" dataKey="poup" stroke="#94a3b8" strokeWidth={2} dot={false} />
              <Line name="IBOVESPA" type="monotone" dataKey="ibov" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CONTRIBUTIONS SECTION */}
      <div className="grid lg:grid-cols-2 gap-6 animate-reveal" style={{ animationDelay: '1000ms' }}>
        <div className="glass-card rounded-3xl p-8 space-y-6">
          <h3 className="text-xl font-black font-sora">Histórico de Aportes</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={contributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `R$ ${v}`} />
                <Tooltip />
                <Bar dataKey="aporte" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="meta" stroke="#ec4899" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black font-sora">Últimos Aportes</h3>
            <p className="text-xs font-bold text-primary">Total ano: R$ 12.400</p>
          </div>
          <div className="space-y-3">
            {(assets ?? []).slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: typeColors[a.type] || 'hsl(var(--primary))' }}>
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{a.name}</p>
                    <p className="text-[10px] text-muted-foreground">{a.startDate ? format(new Date(a.startDate), "dd MMM yyyy") : '--'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-foreground">R$ {((a.contribution ?? 0) / 10).toFixed(2)}</p>
                  <Badge variant="outline" className="text-[8px] px-1.5 py-0 border-none" style={{ backgroundColor: `${typeColors[a.type] || 'hsl(var(--primary))'}20`, color: typeColors[a.type] || 'hsl(var(--primary))' }}>
                    {a.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, subValue, icon: Icon, color, bg, delay, isDate }: any) {
  return (
    <div 
      className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group cursor-default"
      style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", bg, color)}>
          <Icon className="w-5 h-5" />
        </div>
        {subValue && (
          <Badge variant="outline" className={cn("text-[10px] font-black border-none px-2 py-0.5", bg, color)}>
            {subValue}
          </Badge>
        )}
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">{label}</p>
        <h3 className="text-xl font-black font-mono-financial text-foreground">
          {isDate ? "290 dias" : <AnimatedCounter value={value ?? 0} />}
        </h3>
      </div>
    </div>
  );
}

function NewInvestmentDrawer() {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const types = [
    { id: 'Renda Fixa', icon: Landmark, desc: 'CDB, LCI, LCA e outros' },
    { id: 'Ações', icon: TrendingUp, desc: 'Empresas listadas na bolsa' },
    { id: 'FII', icon: Building2, desc: 'Fundos Imobiliários' },
    { id: 'Cripto', icon: Bitcoin, desc: 'Bitcoin, Ethereum e mais' },
    { id: 'Tesouro', icon: ShieldCheck, desc: 'Títulos do governo federal' },
    { id: 'Fundo', icon: Briefcase, desc: 'Fundos de investimento' },
  ];

  return (
    <SheetContent className="w-full sm:max-w-[500px] border-none bg-background/95 backdrop-blur-xl">
      <SheetHeader className="mb-8">
        <SheetTitle className="text-2xl font-black font-sora">Novo Investimento</SheetTitle>
      </SheetHeader>

      <div className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-reveal">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Selecione o tipo</Label>
              <div className="grid grid-cols-2 gap-3">
                {types.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedType(t.id); setStep(2); }}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border/40 bg-muted/30 hover:border-primary/40 hover:bg-primary/5 transition-all text-center group active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <t.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{t.id}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-slide-down">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                {types.find(t => t.id === selectedType)?.icon && React.createElement(types.find(t => t.id === selectedType)!.icon, { className: "w-5 h-5" })}
              </div>
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest">Tipo selecionado</p>
                <p className="text-lg font-black text-foreground">{selectedType}</p>
              </div>
              <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => setStep(1)}>Trocar</Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Nome do Ativo</Label>
                <Input placeholder="Ex: CDB Banco X, PETR4..." className="h-12 rounded-xl bg-muted/50 border-none input-glow" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Valor Investido</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                    <Input type="number" placeholder="0,00" className="pl-10 h-12 rounded-xl bg-muted/50 border-none input-glow" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Data do Aporte</Label>
                  <Input type="date" className="h-12 rounded-xl bg-muted/50 border-none input-glow" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Vencimento (opcional)</Label>
                <Input type="date" className="h-12 rounded-xl bg-muted/50 border-none input-glow" />
              </div>
            </div>

            <Button 
              className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20"
              onClick={() => {
                toast.success("Investimento registrado com sucesso! 📈");
                setStep(1);
              }}
            >
              Registrar Investimento
            </Button>
          </div>
        )}
      </div>
    </SheetContent>
  );
}