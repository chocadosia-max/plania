"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Sparkles, TrendingUp, TrendingDown, CheckCircle2, 
  Lightbulb, Target, ArrowRight, Calendar, Wallet, Utensils, 
  Gamepad2, Bus, Tv, Music, Check, AlertCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie
} from 'recharts';
import { insights } from "@/components/reports/AIInsightsSection";
import { toast } from "sonner";

export default function InsightDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const insight = insights.find(i => i.id === id);

  if (!insight) return null;

  const currentIndex = insights.findIndex(i => i.id === id);
  const prevInsight = insights[currentIndex - 1];
  const nextInsight = insights[currentIndex + 1];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/30 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/relatorios')} className="gap-2 -ml-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Badge className={cn("uppercase text-[10px] font-black", insight.bg, insight.color, "border-none")}>
              {insight.impact}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8 space-y-10 animate-reveal">
        {/* Title Section */}
        <div className="flex items-start gap-6">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg", insight.bg, insight.color)}>
            <insight.icon className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground">{insight.title}</h1>
            <p className="text-sm text-muted-foreground">Análise gerada em 25 de Março de 2026 pela IA do PlanIA</p>
          </div>
        </div>

        {/* Dynamic Content based on ID */}
        {id === 'delivery' && <DeliveryInsight />}
        {id === 'limites' && <LimitsInsight />}
        {id === 'lazer' && <LazerInsight />}
        {id === 'viagem' && <ViagemInsight />}
        {id === 'transporte' && <TransporteInsight />}
        {id === 'assinaturas' && <AssinaturasInsight />}

        {/* AI Deep Dive Footer */}
        <div className="rounded-3xl p-[1px] bg-gradient-to-br from-primary/40 via-border to-secondary/40 mt-16">
          <div className="bg-card rounded-[23px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Quer aprofundar essa análise?</h3>
                <p className="text-sm text-muted-foreground">Pergunte ao Assistente IA sobre este insight específico.</p>
              </div>
            </div>
            <Button className="gap-2 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
              Abrir chat com contexto <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-10 border-t border-border/30">
          {prevInsight ? (
            <Link to={`/dashboard/relatorios/insight/${prevInsight.id}`} className="flex flex-col items-start gap-1 group">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Insight Anterior</span>
              <span className="text-sm font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> {prevInsight.title}
              </span>
            </Link>
          ) : <div />}

          {nextInsight ? (
            <Link to={`/dashboard/relatorios/insight/${nextInsight.id}`} className="flex flex-col items-end gap-1 group text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Próximo Insight</span>
              <span className="text-sm font-bold group-hover:text-primary transition-colors flex items-center gap-2">
                {nextInsight.title} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ) : <div />}
        </div>
      </main>

      {/* Sticky Action Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <Button className={cn("w-full h-14 rounded-2xl text-lg font-black shadow-2xl", insight.color.replace('text-', 'bg-'))}>
          {getActionText(id)} <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

function getActionText(id: string | undefined) {
  switch(id) {
    case 'delivery': return "Criar orçamento de Delivery";
    case 'limites': return "Realocar R$ 420 para metas";
    case 'lazer': return "Ajustar limite de Lazer";
    case 'viagem': return "Marcar como prioridade";
    case 'transporte': return "Ver dicas de economia";
    case 'assinaturas': return "Iniciar auditoria";
    default: return "Tomar ação agora";
  }
}

/* --- INSIGHT COMPONENTS --- */

function DeliveryInsight() {
  const data = [
    { name: 'Jan', value: 280 },
    { name: 'Fev', value: 310 },
    { name: 'Mar', value: 290 },
    { name: 'Abr', value: 740 },
  ];

  return (
    <div className="space-y-10">
      <div className="bg-red-400/5 border border-red-400/20 rounded-2xl p-6">
        <p className="text-lg leading-relaxed text-foreground">
          Seus gastos com delivery somaram <span className="font-bold text-red-400">R$ 450 a mais</span> que a média dos últimos 3 meses. 
          Isso representa <span className="font-bold">23% da sua renda mensal</span> sendo gasta apenas em delivery.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-sm font-bold mb-6">Evolução de Gastos com Delivery</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `R$ ${v}`} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 3 ? '#f87171' : 'hsl(var(--muted-foreground))'} fillOpacity={index === 3 ? 1 : 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Média histórica", value: "R$ 290/mês" },
          { label: "Este mês", value: "R$ 740/mês", color: "text-red-400" },
          { label: "Diferença", value: "+R$ 450 (+155%)", color: "text-red-400" },
        ].map((c, i) => (
          <div key={i} className="glass-card rounded-xl p-4 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{c.label}</p>
            <p className={cn("text-xl font-black", c.color)}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> Como a IA sugere resolver</h3>
        <div className="grid gap-4">
          <div className="glass-card rounded-2xl p-6 flex items-start gap-4 border-l-4 border-l-purple-500">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0"><Target className="w-5 h-5 text-purple-500" /></div>
            <div className="space-y-1">
              <h4 className="font-bold">Definir limite semanal de delivery</h4>
              <p className="text-xs text-muted-foreground">Estabeleça R$ 70/semana como limite. O PlanIA avisa quando estiver próximo com alerta neon.</p>
              <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary">Criar orçamento agora →</Button>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-6 flex items-start gap-4 border-l-4 border-l-orange-500">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0"><Utensils className="w-5 h-5 text-orange-500" /></div>
            <div className="space-y-1">
              <h4 className="font-bold">Cozinhar 3x por semana</h4>
              <p className="text-xs text-muted-foreground">Substituir 3 pedidos semanais por refeições em casa economizaria R$ 180/mês. R$ 2.160 em um ano.</p>
              <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary">Criar meta de economia →</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitsInsight() {
  const categories = [
    { name: "Moradia", orcado: 1800, gasto: 1750, icon: "🏠" },
    { name: "Alimentação", orcado: 1200, gasto: 1120, icon: "🍕" },
    { name: "Transporte", orcado: 650, gasto: 480, icon: "🚗" },
    { name: "Lazer", orcado: 480, gasto: 420, icon: "🎮" },
    { name: "Saúde", orcado: 320, gasto: 120, icon: "💊" },
  ];

  return (
    <div className="space-y-10">
      <div className="bg-green-500/10 border border-green-500/20 rounded-3xl p-8 text-center space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*2}s` }} />
          ))}
        </div>
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black">Excelente trabalho! 🏆</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Todas as 8 categorias ficaram dentro do orçamento em março. Isso aconteceu pela primeira vez nos últimos 4 meses.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Detalhamento por Categoria</h3>
        <div className="grid gap-3">
          {categories.map((c, i) => {
            const pct = (c.gasto / c.orcado) * 100;
            return (
              <div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">{c.icon}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold">{c.name}</span>
                    <span className="text-[10px] font-bold text-green-500">Sobra: R$ {c.orcado - c.gasto}</span>
                  </div>
                  <Progress value={pct} className="h-1.5 bg-muted" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8 border-primary/20 bg-primary/5 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-bold">Realoque a sobra para suas metas</h4>
          <p className="text-sm text-muted-foreground">Você tem R$ 420 sobrando este mês. Sugerimos distribuir entre Reserva de Emergência e Viagem.</p>
          <Button className="mt-4 rounded-xl">Realocar agora →</Button>
        </div>
      </div>
    </div>
  );
}

function LazerInsight() {
  const [reduction, setReduction] = useState([200]);
  const maxLazer = 440;
  const currentSavings = 26;
  
  const newSavings = useMemo(() => {
    return currentSavings + (reduction[0] / 5000) * 100;
  }, [reduction]);

  const monthsSaved = Math.floor(reduction[0] / 50);

  return (
    <div className="space-y-10">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
        <p className="text-lg leading-relaxed">
          Se você reduzir <span className="font-bold text-primary">R$ {reduction[0]} em lazer</span> este mês, sua taxa de economia sobe de <span className="font-bold">26% para {newSavings.toFixed(1)}%</span> e você antecipa sua meta em <span className="font-bold text-primary">{monthsSaved} meses</span>.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Gamepad2 className="w-5 h-5 text-primary" /></div>
          <h3 className="text-lg font-bold">Simule o impacto do corte</h3>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between text-sm font-bold">
            <span>Quanto você quer reduzir?</span>
            <span className="text-primary text-xl">R$ {reduction[0]}</span>
          </div>
          <Slider 
            value={reduction} 
            onValueChange={setReduction} 
            max={maxLazer} 
            step={10}
            className="py-4"
          />
          <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
            <span>R$ 0</span>
            <span>R$ {maxLazer} (Total gasto)</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Taxa de Economia</p>
            <p className="text-xl font-black text-primary">{newSavings.toFixed(1)}%</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Meta Antecipada</p>
            <p className="text-xl font-black text-primary">{monthsSaved} meses</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 text-center">
            <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Em 12 meses</p>
            <p className="text-xl font-black text-primary">R$ {(reduction[0] * 12).toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViagemInsight() {
  return (
    <div className="space-y-10">
      <div className="glass-card rounded-3xl p-8 space-y-6 border-amber-500/20">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black">Meta: R$ 8.000 para viagem ✈️</h3>
          <Badge className="bg-green-500/10 text-green-500 border-none">No ritmo certo ✅</Badge>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm font-bold">
            <span>Progresso: 73%</span>
            <span>R$ 5.840 de R$ 8.000</span>
          </div>
          <div className="h-4 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: '73%' }} />
          </div>
          <p className="text-xs text-muted-foreground">Faltam <span className="font-bold text-foreground">R$ 2.160</span> para completar. No ritmo atual: completa em <span className="font-bold text-foreground">Abril/2026</span>.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Histórico de Aportes</h4>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{m:'Dez',v:800},{m:'Jan',v:1200},{m:'Fev',v:1000},{m:'Mar',v:1080}]}>
                <Bar dataKey="v" fill="hsl(var(--primary))" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="font-bold flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Como garantir</h4>
          <ul className="space-y-3">
            {[
              "Manter aporte de R$ 1.080/mês",
              "Não retirar da meta para emergências",
              "Deixar em conta separada rendendo 100% CDI"
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TransporteInsight() {
  return (
    <div className="space-y-10">
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0"><Bus className="w-6 h-6 text-green-500" /></div>
        <p className="text-lg leading-relaxed">
          Seu gasto com Uber caiu <span className="font-bold text-green-500">15% este mês</span>. O uso do transporte público rendeu <span className="font-bold">R$ 120 de economia</span>. Parabéns! 🚌
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <h3 className="text-sm font-bold">Comparativo Visual</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground"><span>Mês Anterior</span><span>R$ 340</span></div>
              <div className="h-8 rounded-lg bg-muted/50 flex items-center px-3 text-xs font-bold">Uber: R$ 340</div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground"><span>Este Mês</span><span>R$ 220</span></div>
              <div className="flex h-8 rounded-lg overflow-hidden text-[10px] font-bold text-white">
                <div className="bg-primary flex items-center px-3" style={{ width: '55%' }}>Uber: R$ 120</div>
                <div className="bg-blue-500 flex items-center px-3" style={{ width: '45%' }}>Ônibus: R$ 100</div>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold">Projeção Anual</h3>
          <p className="text-xs text-muted-foreground">Se mantiver esse hábito, em 12 meses você economizará <span className="font-bold text-foreground">R$ 1.440</span> só em transporte.</p>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{x:1,y:120},{x:6,y:720},{x:12,y:1440}]}>
                <Line type="monotone" dataKey="y" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssinaturasInsight() {
  const [cancelled, setCancelled] = useState<string[]>([]);
  const totalSaved = cancelled.length > 0 ? (cancelled.includes('s1') ? 29.9 : 0) + (cancelled.includes('s2') ? 24.9 : 0) : 0;

  const toggle = (id: string) => {
    setCancelled(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    if (!cancelled.includes(id)) toast.success("Marcado como cancelado! 💸");
  };

  return (
    <div className="space-y-10">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6">
        <p className="text-lg leading-relaxed">
          Encontramos <span className="font-bold text-primary">2 assinaturas</span> que você não utiliza há mais de 60 dias. Cancelar economiza <span className="font-bold">R$ 54/mês</span>.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { id: 's1', name: "Serviço de Streaming 1", price: 29.9, days: 67, icon: <Tv className="w-5 h-5" /> },
          { id: 's2', name: "App de Música Premium", price: 24.9, days: 91, icon: <Music className="w-5 h-5" /> },
        ].map((s) => {
          const isCancelled = cancelled.includes(s.id);
          return (
            <div key={s.id} className={cn(
              "glass-card rounded-2xl p-6 space-y-4 transition-all duration-500",
              isCancelled && "opacity-50 border-green-500/30 bg-green-500/5"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">{s.icon}</div>
                <div>
                  <h4 className={cn("font-bold", isCancelled && "line-through")}>{s.name}</h4>
                  <p className="text-xs text-muted-foreground">R$ {s.price.toLocaleString('pt-BR')}/mês</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-muted-foreground">Último uso detectado</p>
                <p className="text-sm font-bold text-red-400">{s.days} dias atrás</p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1 text-[10px] font-black uppercase">Lembrar depois</Button>
                <Button 
                  variant={isCancelled ? "secondary" : "default"} 
                  size="sm" 
                  className="flex-1 text-[10px] font-black uppercase"
                  onClick={() => toggle(s.id)}
                >
                  {isCancelled ? "Já cancelei ✓" : "Já cancelei"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card rounded-3xl p-8 text-center space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total economizado com cancelamentos</p>
        <p className="text-4xl font-black text-primary font-mono-financial">R$ {totalSaved.toLocaleString('pt-BR')}</p>
        <p className="text-xs text-muted-foreground">R$ {(totalSaved * 12).toLocaleString('pt-BR')} por ano</p>
      </div>
    </div>
  );
}