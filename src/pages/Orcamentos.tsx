"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, ChevronLeft, ChevronRight, AlertCircle, 
  TrendingUp, Lightbulb, CheckCircle2, MoreVertical,
  ArrowRight, RefreshCw, Trash2, Edit2, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/* --- TYPES --- */
interface Budget {
  id: number;
  cat: string;
  emoji: string;
  limit: number;
  spent: number;
  color: string;
}

/* --- DATA --- */
const initialBudgets: Budget[] = [
  { id: 1, cat: "Moradia", emoji: "🏠", limit: 2000, spent: 1800, color: "hsl(var(--chart-1))" },
  { id: 2, cat: "Alimentação", emoji: "🍕", limit: 1200, spent: 850, color: "hsl(var(--chart-2))" },
  { id: 3, cat: "Transporte", emoji: "🚗", limit: 600, spent: 580, color: "hsl(var(--chart-3))" },
  { id: 4, cat: "Lazer", emoji: "🎮", limit: 400, spent: 450, color: "hsl(var(--chart-4))" },
  { id: 5, cat: "Saúde", emoji: "💊", limit: 300, spent: 120, color: "hsl(var(--chart-5))" },
];

const weeklyData = [
  { name: 'Sem 1', orcado: 1200, gasto: 950 },
  { name: 'Sem 2', orcado: 1200, gasto: 1100 },
  { name: 'Sem 3', orcado: 1200, gasto: 1350 },
  { name: 'Sem 4', orcado: 1200, gasto: 800 },
];

/* --- COMPONENTS --- */

function GaugeChart({ percent }: { percent: number }) {
  const deg = Math.min((percent / 100) * 180 - 90, 90);
  
  return (
    <div className="relative w-56 h-28 overflow-hidden flex items-end justify-center">
      {/* Background Arc */}
      <div className="absolute w-56 h-56 rounded-full border-[14px] border-muted/20 top-0" />
      {/* Colored Zones */}
      <div className="absolute w-56 h-56 rounded-full border-[14px] border-transparent border-t-green-500/40 border-l-green-500/40 top-0 rotate-[-45deg]" />
      <div className="absolute w-56 h-56 rounded-full border-[14px] border-transparent border-t-yellow-500/40 top-0 rotate-[45deg]" />
      <div className="absolute w-56 h-56 rounded-full border-[14px] border-transparent border-t-red-500/40 border-r-red-500/40 top-0 rotate-[135deg]" />
      
      {/* Needle */}
      <div 
        className="absolute bottom-0 w-1 h-24 bg-foreground origin-bottom transition-transform duration-1000 ease-out z-10"
        style={{ transform: `rotate(${deg}deg)`, animation: "gauge-needle 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" } as any}
      >
        <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-foreground" />
      </div>
      
      {/* Center Info */}
      <div className="absolute bottom-0 text-center z-20">
        <span className="text-4xl font-black font-mono-financial">{percent}%</span>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Utilizado</p>
      </div>
    </div>
  );
}

function BudgetCard({ budget: b, delay }: { budget: Budget; delay: number }) {
  const pct = Math.round((b.spent / b.limit) * 100);
  const isOver = pct > 100;
  const status = pct < 60 ? 'No controle' : pct < 85 ? 'Atenção' : pct <= 100 ? 'Crítico' : 'Estourado';
  const statusColor = pct < 60 ? 'text-green-500' : pct < 85 ? 'text-yellow-500' : 'text-red-400';
  const barColor = pct < 60 ? 'bg-green-500' : pct < 85 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <div 
      className="glass-card rounded-2xl p-5 space-y-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
      style={{ 
        animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", 
        animationDelay: `${delay}ms`,
        boxShadow: `0 10px 30px -10px ${barColor.replace('bg-', 'hsl(var(--')}/0.2)`
      } as any}
    >
      {/* Left Border Accent */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity", barColor)} />

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{b.emoji}</span>
          <div>
            <h4 className="text-sm font-bold text-foreground">{b.cat}</h4>
            <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-tighter border-none px-0", statusColor, pct > 85 && "animate-pulse")}>
              {status}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Gasto</p>
            <p className="text-sm font-black">R$ {b.spent.toLocaleString('pt-BR')}</p>
          </div>
          <div className="text-right space-y-0.5">
            <p className="text-[10px] text-muted-foreground font-bold uppercase">Limite</p>
            <p className="text-xs text-muted-foreground font-bold">R$ {b.limit.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="relative pt-4">
          <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out relative",
                barColor,
                isOver && "animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
              )}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span 
            className={cn(
              "absolute -top-1 text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm transition-all duration-1000",
              barColor, "text-white"
            )}
            style={{ left: `calc(${Math.min(pct, 90)}% - 10px)` }}
          >
            {pct}%
          </span>
        </div>

        <p className={cn(
          "text-[11px] font-bold text-center pt-1",
          isOver ? "text-red-400 animate-shake" : "text-green-500"
        )}>
          {isOver 
            ? `R$ ${(b.spent - b.limit).toLocaleString('pt-BR')} acima do limite` 
            : `R$ ${(b.limit - b.spent).toLocaleString('pt-BR')} restantes`}
        </p>
      </div>

      <div className="pt-2 border-t border-border/30 flex items-center justify-between text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
        <span>Média: R$ {(b.spent / 20).toFixed(2)}/dia</span>
        <span className={cn(isOver ? "text-red-400" : "text-green-500")}>
          Prev: R$ {(b.spent * 1.2).toFixed(0)}
        </span>
      </div>
    </div>
  );
}

export default function Orcamentos() {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'cards' | 'comparativo'>('cards');
  const [daysLeft, setDaysLeft] = useState(18);

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalPct = Math.round((totalSpent / totalLimit) * 100);

  const healthStatus = totalPct < 70 ? 'saudavel' : totalPct < 90 ? 'atencao' : 'critico';

  const alerts = [
    { type: 'critical', msg: "Alimentação estourou o limite em R$ 40", icon: AlertCircle, color: "bg-red-400/10 text-red-400" },
    { type: 'warning', msg: "Lazer está em 87% do limite", icon: AlertCircle, color: "bg-yellow-500/10 text-yellow-500" },
    { type: 'tip', msg: "Seu gasto com Transporte caiu 15% este mês. Bom trabalho!", icon: Lightbulb, color: "bg-primary/10 text-primary" },
    { type: 'positive', msg: "Saúde está R$ 120 abaixo do orçado. Você pode realocar esse valor.", icon: CheckCircle2, color: "bg-green-500/10 text-green-500" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Orçamentos</h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Março 2026 · <span className={cn("font-bold", daysLeft < 7 ? "text-red-400" : daysLeft < 15 ? "text-yellow-500" : "text-green-500")}>
                {daysLeft} dias restantes no mês
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-muted rounded-xl">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
            <span className="px-4 py-1 text-xs font-black flex items-center">Março 2026</span>
            <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
          </div>
          
          <div className={cn(
            "px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all",
            healthStatus === 'saudavel' ? "bg-green-500/10 text-green-500" : healthStatus === 'atencao' ? "bg-yellow-500/10 text-yellow-500" : "bg-red-400/10 text-red-400 animate-pulse"
          )}>
            <div className={cn("w-2 h-2 rounded-full", healthStatus === 'saudavel' ? "bg-green-500" : healthStatus === 'atencao' ? "bg-yellow-500" : "bg-red-400")} />
            {healthStatus === 'saudavel' ? "Orçamento saudável" : healthStatus === 'atencao' ? "Atenção necessária" : "Limite crítico"}
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Novo orçamento
              </Button>
            </DialogTrigger>
            <BudgetModal onSave={(b) => {
              setBudgets([...budgets, b]);
              setIsModalOpen(false);
              toast.success("Orçamento definido! 🎯");
            }} />
          </Dialog>
        </div>
      </div>

      {/* PANORAMIC PANEL */}
      <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-primary/40 via-border to-secondary/40 animate-reveal" style={{ animationDelay: '100ms' } as any}>
        <div className="bg-card/90 backdrop-blur-2xl rounded-[23px] p-8 mesh-gradient overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/5 opacity-50" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            {/* Gauge */}
            <GaugeChart percent={totalPct} />

            {/* Summary */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resumo do mês</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Orçamento total</span>
                    <span className="font-bold font-mono-financial">R$ {totalLimit.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total gasto</span>
                    <span className={cn("font-bold font-mono-financial", totalPct > 90 ? "text-red-400" : "text-foreground")}>
                      R$ {totalSpent.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Saldo disponível</span>
                    <span className={cn("font-bold font-mono-financial", totalLimit - totalSpent < 0 ? "text-red-400" : "text-green-500")}>
                      R$ {(totalLimit - totalSpent).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weekly Chart */}
              <div className="sm:col-span-2 h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                      cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                    />
                    <Bar dataKey="orcado" fill="hsl(var(--muted-foreground))" fillOpacity={0.2} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="gasto" radius={[2, 2, 0, 0]}>
                      {weeklyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.gasto > entry.orcado ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ALERTS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {alerts.map((alert, i) => (
          <div 
            key={i} 
            className={cn("flex flex-col justify-between p-4 rounded-2xl animate-slide-down group relative overflow-hidden", alert.color)}
            style={{ animationDelay: `${400 + i * 100}ms` } as any}
          >
            <div className="flex items-start gap-3">
              <alert.icon className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-bold leading-relaxed">{alert.msg}</p>
            </div>
            <Button variant="ghost" size="sm" className="mt-3 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 w-fit">
              Ver detalhes <ArrowRight className="ml-2 w-3 h-3" />
            </Button>
            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* VIEW TOGGLE */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-muted rounded-xl">
          <button 
            onClick={() => setView('cards')}
            className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", view === 'cards' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            📊 Cards
          </button>
          <button 
            onClick={() => setView('comparativo')}
            className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", view === 'comparativo' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}
          >
            📈 Comparativo
          </button>
        </div>
        <Button variant="outline" className="rounded-xl gap-2 font-bold border-primary/20 text-primary hover:bg-primary/5 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Realocar saldo
        </Button>
      </div>

      {/* GRID / COMPARATIVO */}
      {view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((b, i) => (
            <BudgetCard key={b.id} budget={b} delay={600 + i * 80} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-8 animate-reveal">
          <div className="space-y-6">
            {budgets.sort((a, b) => (b.spent/b.limit) - (a.spent/a.limit)).map((b, i) => {
              const pct = Math.round((b.spent / b.limit) * 100);
              return (
                <div key={b.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span>{b.emoji}</span>
                      <span>{b.cat}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">R$ {b.spent.toLocaleString('pt-BR')} / R$ {b.limit.toLocaleString('pt-BR')}</span>
                      <span className={cn(pct > 100 ? "text-red-400" : "text-primary")}>{pct}%</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", pct > 100 ? "bg-red-400" : pct > 85 ? "bg-yellow-500" : "bg-primary")}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetModal({ onSave }: { onSave: (b: Budget) => void }) {
  const [limit, setLimit] = useState("");
  const [cat, setCat] = useState("Outros");

  const categories = [
    { id: "Mercado", emoji: "🛒" },
    { id: "Transporte", emoji: "🚗" },
    { id: "Alimentação", emoji: "🍕" },
    { id: "Saúde", emoji: "💊" },
    { id: "Lazer", emoji: "🎮" },
    { id: "Moradia", emoji: "🏠" },
  ];

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-2xl font-black font-sora">Definir Orçamento</DialogTitle>
      </DialogHeader>
      <div className="space-y-8 py-4">
        <div className="text-center space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Limite Mensal</Label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-primary">R$</span>
            <input 
              type="number" 
              placeholder="0,00"
              className="bg-transparent border-none outline-none text-5xl font-black w-full max-w-[200px] text-center font-mono-financial text-primary"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              autoFocus
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-bold">
            ≈ R$ {(parseFloat(limit || "0") / 30).toFixed(2)} por dia
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-xs font-bold">Categoria</Label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  "p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2",
                  cat === c.id ? "border-primary bg-primary/10 scale-105" : "border-transparent bg-muted/50 hover:bg-muted"
                )}
              >
                <span className="text-2xl">{c.emoji}</span>
                <span className="text-[10px] font-bold">{c.id}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button 
          className="w-full h-14 rounded-2xl text-lg font-black shadow-xl"
          onClick={() => onSave({
            id: Date.now(),
            cat,
            emoji: categories.find(c => c.id === cat)?.emoji || "🎁",
            limit: parseFloat(limit),
            spent: 0,
            color: "hsl(var(--primary))"
          })}
          disabled={!limit}
        >
          Criar Orçamento
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}