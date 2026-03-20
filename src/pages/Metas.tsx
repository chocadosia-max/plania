"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Plus } from "lucide-react";
import { usePlanIA } from "@/contexts/PlanIAContext";

export default function Metas() {
  const { goals, addGoal, deleteGoal } = usePlanIA();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    emoji: "🎯",
    valorAlvo: "",
    valorAtual: "",
    prazo: "",
    cor: "#7c3aed"
  });

  const safeGoals = Array.isArray(goals) ? goals : [];

  const handleSave = () => {
    if (!form.nome || !form.valorAlvo) return;
    addGoal({
      ...form,
      valorAlvo: parseFloat(form.valorAlvo),
      valorAtual: parseFloat(form.valorAtual || "0")
    });
    setIsModalOpen(false);
    setForm({ nome: "", emoji: "🎯", valorAlvo: "", valorAtual: "", prazo: "", cor: "#7c3aed" });
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Suas metas</h2>
          <p className="text-sm text-muted-foreground">Organize seus sonhos e objetivos</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" size="sm"><Plus className="w-4 h-4" /> Nova meta</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Criar nova meta</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Emoji</Label>
                  <Input value={form.emoji} onChange={(e) => setForm({...form, emoji: e.target.value})} className="text-center text-xl" />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Nome da meta</Label>
                  <Input placeholder="Ex: Viagem para o Japão" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Alvo (R$)</Label>
                  <Input type="number" placeholder="10000" value={form.valorAlvo} onChange={(e) => setForm({...form, valorAlvo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Já possuo (R$)</Label>
                  <Input type="number" placeholder="0" value={form.valorAtual} onChange={(e) => setForm({...form, valorAtual: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Prazo estimado</Label>
                <Input type="date" value={form.prazo} onChange={(e) => setForm({...form, prazo: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.nome || !form.valorAlvo}>Salvar Meta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {safeGoals.map((g, i) => {
          const target = Number(g?.valorAlvo) || 1;
          const current = Number(g?.valorAtual) || 0;
          const pct = Math.min(Math.round((current / target) * 100), 100);
          return (
            <div key={g?.id || i} className="glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-start justify-between mb-3 relative z-20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{g?.emoji || "🎯"}</span>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{g?.nome || "Sem nome"}</h3>
                    <p className="text-[11px] text-muted-foreground">{pct}% concluído · Alvo: R$ {target.toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteGoal(g?.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                  <span>Atual: R$ {current.toLocaleString('pt-BR')}</span>
                  <span>Prazo: {g?.prazo || "Sem prazo"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}