"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Plus, MoreVertical, Edit2, CheckCircle2, Archive, Trash2, ChevronDown, ChevronUp
} from "lucide-react";
import { usePlanIA, Goal } from "@/contexts/PlanIAContext";
import { toast } from "sonner";

export default function Metas() {
  const { goals } = usePlanIA();
  const [showArchived, setShowArchived] = useState(false);

  const activeGoals = goals.filter(g => !g.archived);
  const archivedGoals = goals.filter(g => g.archived);

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Suas metas</h2>
          <p className="text-sm text-muted-foreground">Sugeridas automaticamente pela IA</p>
        </div>
        <Button className="gap-2" size="sm"><Plus className="w-4 h-4" /> Nova meta</Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {activeGoals.map((g, i) => (
          <GoalCard key={g.id} goal={g} delay={i * 100} />
        ))}
      </div>

      {archivedGoals.length > 0 && (
        <div className="pt-10 border-t border-border/30">
          <button onClick={() => setShowArchived(!showArchived)} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mx-auto">
            <Archive className="w-4 h-4" /> Ver metas arquivadas ({archivedGoals.length}) {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal: g, delay }: { goal: Goal; delay: number }) {
  const pct = Math.min(Math.round((g.current / g.target) * 100), 100);

  return (
    <div className="glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group animate-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3 relative z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{g.emoji}</span>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{g.name}</h3>
            <p className="text-[11px] text-muted-foreground">{pct}% concluído · Alvo: R$ {g.target.toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="gap-2"><Edit2 className="w-4 h-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><CheckCircle2 className="w-4 h-4" /> Concluir</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive"><Trash2 className="w-4 h-4" /> Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2">
        <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
          <span>Atual: R$ {g.current.toLocaleString('pt-BR')}</span>
          <span>Prazo: {g.deadline}</span>
        </div>
      </div>
    </div>
  );
}