"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, History, MoreVertical, Edit2, Eye, Archive, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';
import { usePlanIA, Budget } from "@/contexts/PlanIAContext";

function getStatusClass(gasto: number, limite: number) {
  const percent = (gasto / limite) * 100;
  if (percent >= 100) return "status-estourado";
  if (percent >= 90)  return "status-critico";
  if (percent >= 60)  return "status-atencao";
  return "status-ok";
}

function getStatusLabel(gasto: number, limite: number) {
  const percent = (gasto / limite) * 100;
  if (percent >= 100) return { icon: "⛔", text: "Estourado!", class: "badge-estourado" };
  if (percent >= 90)  return { icon: "🔴", text: "Limite crítico", class: "badge-critico" };
  if (percent >= 60)  return { icon: "🟠", text: "Atenção", class: "badge-atencao" };
  return { icon: "🟢", text: "No controle", class: "badge-ok" };
}

function GaugeChart({ percent }: { percent: number }) {
  const deg = Math.min((percent / 100) * 180 - 90, 90);
  return (
    <div className="relative w-56 h-28 overflow-hidden flex items-end justify-center">
      <div className="absolute w-56 h-56 rounded-full border-[14px] border-muted/20 top-0" />
      <div className="absolute w-56 h-56 rounded-full border-[14px] border-transparent border-t-green-500/40 border-l-green-500/40 top-0 rotate-[-45deg]" />
      <div className="absolute w-56 h-56 rounded-full border-[14px] border-transparent border-t-yellow-500/40 top-0 rotate-[45deg]" />
      <div className="absolute w-56 h-56 rounded-full border-[14px] border-transparent border-t-red-500/40 border-r-red-500/40 top-0 rotate-[135deg]" />
      <div className="absolute bottom-0 w-1 h-24 bg-foreground origin-bottom transition-transform duration-1000 ease-out z-10" style={{ transform: `rotate(${deg}deg)` }}>
        <div className="absolute -top-1 -left-1 w-3 h-3 rounded-full bg-foreground" />
      </div>
      <div className="absolute bottom-0 text-center z-20">
        <span className="text-4xl font-black font-mono-financial">{percent}%</span>
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Utilizado</p>
      </div>
    </div>
  );
}

export default function Orcamentos() {
  const { budgets, transactions } = usePlanIA();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const weeklyData = useMemo(() => {
    // Simulação de dados semanais baseados nas transações reais
    return [
      { name: 'Sem 1', orcado: totalLimit / 4, gasto: totalSpent * 0.2 },
      { name: 'Sem 2', orcado: totalLimit / 4, gasto: totalSpent * 0.3 },
      { name: 'Sem 3', orcado: totalLimit / 4, gasto: totalSpent * 0.25 },
      { name: 'Sem 4', orcado: totalLimit / 4, gasto: totalSpent * 0.25 },
    ];
  }, [totalLimit, totalSpent]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Baseado no seu histórico real importado</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-xl border-primary/20 text-primary">
            <History className="w-4 h-4" /> Histórico
          </Button>
          <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" /> Novo orçamento
          </Button>
        </div>
      </div>

      <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-primary/40 via-border to-secondary/40 animate-reveal">
        <div className="bg-card/90 backdrop-blur-2xl rounded-[23px] p-8 mesh-gradient overflow-hidden relative">
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <GaugeChart percent={totalPct} />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 w-full">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resumo do mês</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Orçamento total</span><span className="font-bold font-mono-financial">R$ {totalLimit.toLocaleString('pt-BR')}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-muted-foreground">Total gasto</span><span className={cn("font-bold font-mono-financial", totalPct > 90 ? "text-red-400" : "text-foreground")}>R$ {totalSpent.toLocaleString('pt-BR')}</span></div>
                </div>
              </div>
              <div className="sm:col-span-2 h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                    <Bar dataKey="orcado" fill="hsl(var(--muted-foreground))" fillOpacity={0.2} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="gasto" radius={[2, 2, 0, 0]}>
                      {weeklyData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.gasto > entry.orcado ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b, i) => (
          <BudgetCard key={b.id} budget={b} delay={i * 80} />
        ))}
      </div>
    </div>
  );
}

function BudgetCard({ budget: b, delay }: { budget: Budget; delay: number }) {
  const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
  const statusClass = getStatusClass(b.spent, b.limit);
  const statusLabel = getStatusLabel(b.spent, b.limit);

  return (
    <div className={cn("orcamento-card rounded-2xl p-5 space-y-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden animate-reveal", statusClass)} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl">🏷️</div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground">{b.cat}</h4>
              <div className={cn("badge-status text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1", statusLabel.class)}>
                <span>{statusLabel.icon}</span>
                <span>{statusLabel.text}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] font-black uppercase border-none px-0">R$ {b.limit.toLocaleString('pt-BR')}</Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2"><Edit2 className="w-4 h-4" /> Editar limite</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><Eye className="w-4 h-4" /> Ver transações</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive"><Trash2 className="w-4 h-4" /> Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className={cn("h-2.5 w-full bg-muted/30 rounded-full overflow-hidden", statusClass.replace('status-', 'barra-'))}>
          <div className="barra-fill h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
          <span>Gasto: R$ {b.spent.toLocaleString('pt-BR')}</span>
          <span>{pct}%</span>
        </div>
      </div>
    </div>
  );
}