"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, ChevronLeft, ChevronRight, AlertCircle, 
  TrendingUp, Lightbulb, CheckCircle2, MoreVertical,
  ArrowRight, RefreshCw, Trash2, Edit2, Eye, Archive,
  History, AlertTriangle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [view, setView] = useState<'cards' | 'comparativo'>('cards');
  const [daysLeft] = useState(18);

  const totalLimit = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalPct = Math.round((totalSpent / totalLimit) * 100);
  const healthStatus = totalPct < 70 ? 'saudavel' : totalPct < 90 ? 'atencao' : 'critico';

  const handleDelete = (id: number) => {
    const budget = budgets.find(b => b.id === id);
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast.error(`🗑️ Orçamento de ${budget?.cat} excluído`, {
      action: { label: "Desfazer →", onClick: () => setBudgets(prev => [...prev, budget!]) }
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Março 2026 · <span className={cn("font-bold", daysLeft < 7 ? "text-red-400" : "text-green-500")}>{daysLeft} dias restantes</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-xl border-primary/20 text-primary" onClick={() => setIsHistoryOpen(true)}>
            <History className="w-4 h-4" /> Gerenciar histórico
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" /> Novo orçamento
              </Button>
            </DialogTrigger>
            <BudgetModal onSave={(b) => { setBudgets([...budgets, b]); setIsModalOpen(false); toast.success("Orçamento definido! 🎯"); }} />
          </Dialog>
        </div>
      </div>

      {/* PANORAMIC PANEL */}
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

      {/* VIEW TOGGLE */}
      <div className="flex items-center justify-between">
        <div className="flex p-1 bg-muted rounded-xl">
          <button onClick={() => setView('cards')} className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", view === 'cards' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>📊 Cards</button>
          <button onClick={() => setView('comparativo')} className={cn("px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", view === 'comparativo' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>📈 Comparativo</button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b, i) => (
          <BudgetCard key={b.id} budget={b} delay={i * 80} onDelete={() => handleDelete(b.id)} />
        ))}
      </div>

      <HistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
    </div>
  );
}

function BudgetCard({ budget: b, delay, onDelete }: { budget: Budget; delay: number; onDelete: () => void }) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const pct = Math.round((b.spent / b.limit) * 100);
  const barColor = pct < 60 ? 'bg-green-500' : pct < 85 ? 'bg-yellow-500' : 'bg-red-400';
  const isHighValue = b.limit > 1000;

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden animate-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{b.emoji}</span>
          <div>
            <h4 className="text-sm font-bold text-foreground">{b.cat}</h4>
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
            <DropdownMenuItem className="gap-2"><Archive className="w-4 h-4" /> Arquivar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4" /> Excluir orçamento
            </MenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className="h-2.5 w-full bg-muted/30 rounded-full overflow-hidden">
          <div className={cn("h-full rounded-full transition-all duration-1000", barColor)} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
          <span>Gasto: R$ {b.spent.toLocaleString('pt-BR')}</span>
          <span>{pct}%</span>
        </div>
      </div>

      {/* DELETE MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md border-destructive/20">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold">Excluir orçamento de {b.cat}?</DialogTitle>
            <DialogDescription className="text-sm">
              Esta ação não pode ser desfeita. O histórico de gastos será mantido, mas o limite desta categoria será removido.
            </DialogDescription>
          </DialogHeader>
          
          {isHighValue && (
            <div className="space-y-3 py-4">
              <Label className="text-xs font-bold text-muted-foreground uppercase">Confirmação de segurança</Label>
              <p className="text-xs text-muted-foreground">Este orçamento tem um valor alto. Digite <span className="font-bold text-foreground">EXCLUIR</span> para confirmar.</p>
              <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Digite aqui..." className="border-destructive/30 focus-visible:ring-destructive/30" />
            </div>
          )}

          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" disabled={isHighValue && confirmText !== "EXCLUIR"} onClick={() => { onDelete(); setIsDeleteModalOpen(false); }}>
              Sim, excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HistoryModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const months = [
    { name: "Fevereiro 2025", cats: 8 },
    { name: "Janeiro 2025", cats: 8 },
    { name: "Dezembro 2024", cats: 7 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Gerenciar Histórico</DialogTitle>
          <DialogDescription>Exclua orçamentos de meses anteriores para limpar sua base.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {months.map((m, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/40">
              <div>
                <p className="font-bold text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.cats} categorias definidas</p>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 gap-2">
                <Trash2 className="w-4 h-4" /> Excluir mês
              </Button>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" className="w-full" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BudgetModal({ onSave }: { onSave: (b: Budget) => void }) {
  const [limit, setLimit] = useState("");
  const [cat, setCat] = useState("Outros");
  const categories = [{ id: "Mercado", emoji: "🛒" }, { id: "Transporte", emoji: "🚗" }, { id: "Alimentação", emoji: "🍕" }, { id: "Saúde", emoji: "💊" }, { id: "Lazer", emoji: "🎮" }, { id: "Moradia", emoji: "🏠" }];

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle className="text-2xl font-black">Definir Orçamento</DialogTitle></DialogHeader>
      <div className="space-y-8 py-4">
        <div className="text-center space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Limite Mensal</Label>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-black text-primary">R$</span>
            <input type="number" placeholder="0,00" className="bg-transparent border-none outline-none text-5xl font-black w-full max-w-[200px] text-center font-mono-financial text-primary" value={limit} onChange={(e) => setLimit(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} className={cn("p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2", cat === c.id ? "border-primary bg-primary/10 scale-105" : "border-transparent bg-muted/50 hover:bg-muted")}>
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-[10px] font-bold">{c.id}</span>
            </button>
          ))}
        </div>
      </div>
      <DialogFooter><Button className="w-full h-14 rounded-2xl text-lg font-black shadow-xl" onClick={() => onSave({ id: Date.now(), cat, emoji: categories.find(c => c.id === cat)?.emoji || "🎁", limit: parseFloat(limit), spent: 0, color: "hsl(var(--primary))" })} disabled={!limit}>Criar Orçamento</Button></DialogFooter>
    </DialogContent>
  );
}