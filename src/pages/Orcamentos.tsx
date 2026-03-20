"use client";

import React, { useState } from 'react';
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlanIA } from "@/contexts/PlanIAContext";

const categories = [
  { id: "Mercado", emoji: "🛒" },
  { id: "Transporte", emoji: "🚗" },
  { id: "Alimentação", emoji: "🍕" },
  { id: "Saúde", emoji: "💊" },
  { id: "Lazer", emoji: "🎮" },
  { id: "Educação", emoji: "📚" },
  { id: "Moradia", emoji: "🏠" },
  { id: "Trabalho", emoji: "💼" },
  { id: "Outros", emoji: "🎁" },
];

export default function Orcamentos() {
  const { budgets, addBudget, deleteBudget, getBudgetSpent } = usePlanIA();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    categoria: "",
    emoji: "💰",
    limite: "",
    cor: "#7c3aed",
    recorrente: true
  });

  const safeBudgets = Array.isArray(budgets) ? budgets : [];

  const handleSave = () => {
    if (!form.categoria || !form.limite) return;
    addBudget({
      ...form,
      limite: parseFloat(form.limite)
    });
    setIsModalOpen(false);
    setForm({ categoria: "", emoji: "💰", limite: "", cor: "#7c3aed", recorrente: true });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Controle seus gastos por categoria</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> Novo orçamento</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar novo orçamento</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select onValueChange={(v) => {
                  const cat = categories.find(c => c.id === v);
                  setForm({...form, categoria: v, emoji: cat?.emoji || "💰"});
                }}>
                  <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.emoji} {c.id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Limite Mensal (R$)</Label>
                <Input type="number" placeholder="500" value={form.limite} onChange={(e) => setForm({...form, limite: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.categoria || !form.limite}>Salvar Orçamento</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeBudgets.map((b, i) => {
          const spent = getBudgetSpent(b?.categoria || "");
          const limit = Number(b?.limite) || 1;
          const pct = Math.round((spent / limit) * 100);
          
          let statusClass = "status-ok";
          if (pct >= 100) statusClass = "status-estourado";
          else if (pct >= 90) statusClass = "status-critico";
          else if (pct >= 60) statusClass = "status-atencao";

          return (
            <div key={b?.id || i} className={cn("orcamento-card rounded-2xl p-5 space-y-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden animate-reveal", statusClass)} style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-xl">{b?.emoji || "💰"}</div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{b?.categoria || "Sem categoria"}</h4>
                    <Badge variant="outline" className="text-[9px] font-black uppercase border-none px-0">Limite: R$ {limit.toLocaleString('pt-BR')}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteBudget(b?.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className={cn("h-2.5 w-full bg-muted/30 rounded-full overflow-hidden", statusClass.replace('status-', 'barra-'))}>
                  <div className="barra-fill h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(pct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Gasto: R$ {spent.toLocaleString('pt-BR')}</span>
                  <span>{pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}