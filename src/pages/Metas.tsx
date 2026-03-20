"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Plus, Sparkles, Lock, Calendar, MoreVertical, Edit2, CheckCircle2, Archive, Trash2, ChevronDown, ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { toast } from "sonner";

/* --- TYPES --- */
interface Goal {
  id: number;
  name: string;
  emoji: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
  archived?: boolean;
}

/* --- DATA --- */
const initialGoals: Goal[] = [
  { id: 1, name: "Viagem para Portugal", emoji: "✈️", target: 8000, current: 7660, deadline: "2026-07-01", color: "hsl(var(--primary))" },
  { id: 2, name: "Reserva de emergência", emoji: "🛡️", target: 20000, current: 16320, deadline: "2026-12-31", color: "hsl(var(--chart-2))" },
  { id: 3, name: "Notebook novo", emoji: "💻", target: 5000, current: 5000, deadline: "2026-03-15", color: "hsl(var(--chart-3))" },
];

export default function Metas() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [showArchived, setShowArchived] = useState(false);

  const activeGoals = goals.filter(g => !g.archived);
  const archivedGoals = goals.filter(g => g.archived);

  const handleArchive = (id: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, archived: true } : g));
    toast.info("📦 Meta arquivada", { action: { label: "Ver arquivadas →", onClick: () => setShowArchived(true) } });
  };

  const handleReactivate = (id: number) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, archived: false } : g));
    toast.success("✅ Meta reativada!");
  };

  const handleDelete = (id: number) => {
    const goal = goals.find(g => g.id === id);
    setGoals(prev => prev.filter(g => g.id !== id));
    toast.error(`🗑️ Meta '${goal?.name}' excluída`, {
      action: { label: "Desfazer →", onClick: () => setGoals(prev => [...prev, goal!]) }
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto pb-20">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Suas metas</h2>
          <p className="text-sm text-muted-foreground">{activeGoals.filter(g => g.current >= g.target).length} de {activeGoals.length} concluídas</p>
        </div>
        <NewGoalDialog onAdd={(g) => setGoals([...goals, g])} />
      </div>

      {/* ACTIVE GOALS */}
      <div className="grid sm:grid-cols-2 gap-4">
        {activeGoals.map((g, i) => (
          <GoalCard key={g.id} goal={g} delay={i * 100} onArchive={() => handleArchive(g.id)} onDelete={() => handleDelete(g.id)} />
        ))}
      </div>

      {/* ARCHIVED SECTION */}
      {archivedGoals.length > 0 && (
        <div className="pt-10 border-t border-border/30">
          <button onClick={() => setShowArchived(!showArchived)} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors mx-auto">
            <Archive className="w-4 h-4" /> Ver metas arquivadas ({archivedGoals.length}) {showArchived ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {showArchived && (
            <div className="grid sm:grid-cols-2 gap-4 mt-6 animate-reveal">
              {archivedGoals.map((g) => (
                <div key={g.id} className="opacity-60 grayscale hover:grayscale-0 transition-all">
                  <GoalCard goal={g} delay={0} onReactivate={() => handleReactivate(g.id)} onDelete={() => handleDelete(g.id)} isArchived />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal: g, delay, onArchive, onDelete, onReactivate, isArchived }: any) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const pct = Math.min(Math.round((g.current / g.target) * 100), 100);

  return (
    <div className="glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group animate-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-3 relative z-20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{g.emoji}</span>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{g.name}</h3>
            <p className="text-[11px] text-muted-foreground">{pct}% concluído</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="w-4 h-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isArchived ? (
              <DropdownMenuItem className="gap-2" onClick={onReactivate}><Plus className="w-4 h-4" /> Reativar meta</DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem className="gap-2"><Edit2 className="w-4 h-4" /> Editar meta</DropdownMenuItem>
                <DropdownMenuItem className="gap-2"><CheckCircle2 className="w-4 h-4" /> Marcar concluída</DropdownMenuItem>
                <DropdownMenuItem className="gap-2" onClick={onArchive}><Archive className="w-4 h-4" /> Arquivar meta</DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setIsDeleteModalOpen(true)}>
              <Trash2 className="w-4 h-4" /> Excluir meta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>

      {/* DELETE MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-xl font-bold">Excluir meta '{g.name}'?</DialogTitle>
            <DialogDescription>Você progrediu {pct}% nessa meta. Tem certeza que quer excluí-la?</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase text-muted-foreground"><span>Progresso atual</span><span>{pct}%</span></div>
            <Progress value={pct} className="h-2 bg-muted" />
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { onDelete(); setIsDeleteModalOpen(false); }}>Sim, excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewGoalDialog({ onAdd }: { onAdd: (g: Goal) => void }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="gap-2" size="sm"><Plus className="w-4 h-4" /> Nova meta</Button></DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Criar nova meta</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5"><Label>Nome da meta</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Viagem dos sonhos" /></div>
          <div className="space-y-1.5"><Label>Valor alvo (R$)</Label><Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="5000" /></div>
          <div className="space-y-1.5">
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" className="w-full justify-start text-left font-normal"><Calendar className="mr-2 h-4 w-4" />{date ? format(date, "dd/MM/yyyy") : "Selecionar data"}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-0"><CalendarUI mode="single" selected={date} onSelect={setDate} initialFocus disabled={(d) => d < new Date()} /></PopoverContent>
            </Popover>
          </div>
          <Button onClick={() => { onAdd({ id: Date.now(), name, emoji: "🎯", target: parseFloat(value), current: 0, deadline: format(date!, "yyyy-MM-dd"), color: "hsl(var(--primary))" }); setOpen(false); }} className="w-full" size="lg" disabled={!name || !value || !date}>Criar meta</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}