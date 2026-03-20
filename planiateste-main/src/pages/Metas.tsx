import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus, Sparkles, Lock, Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";

/* ─── types ─── */
interface Goal {
  id: number;
  name: string;
  emoji: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
}

interface Achievement {
  id: number;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
}

/* ─── data ─── */
const initialGoals: Goal[] = [
  { id: 1, name: "Viagem para Portugal", emoji: "✈️", target: 8000, current: 7660, deadline: "2026-07-01", color: "hsl(var(--primary))" },
  { id: 2, name: "Reserva de emergência", emoji: "🛡️", target: 20000, current: 16320, deadline: "2026-12-31", color: "hsl(var(--chart-2))" },
  { id: 3, name: "Notebook novo", emoji: "💻", target: 5000, current: 5000, deadline: "2026-03-15", color: "hsl(var(--chart-3))" },
  { id: 4, name: "Curso de inglês", emoji: "📚", target: 3000, current: 900, deadline: "2026-09-01", color: "hsl(var(--chart-4))" },
];

const achievements: Achievement[] = [
  { id: 1, emoji: "🏆", title: "Primeiro lançamento", description: "Registrou sua 1ª transação", unlocked: true },
  { id: 2, emoji: "🐜", title: "Formiga Rainha", description: "Economizou 3 meses seguidos", unlocked: true },
  { id: 3, emoji: "🎯", title: "Meta batida", description: "Completou sua primeira meta", unlocked: true },
  { id: 4, emoji: "📊", title: "Analista nato", description: "Usou o chat da IA 10 vezes", unlocked: true },
  { id: 5, emoji: "💰", title: "Milionário em formação", description: "Economize R$ 10.000 no total", unlocked: false },
  { id: 6, emoji: "👑", title: "Mestre do orçamento", description: "6 meses sem estourar o orçamento", unlocked: false },
  { id: 7, emoji: "🔥", title: "Sequência de fogo", description: "30 dias seguidos lançando transações", unlocked: false },
  { id: 8, emoji: "🧠", title: "Estrategista", description: "Crie 5 metas diferentes", unlocked: false },
];

const emojiOptions = ["🏠", "✈️", "💻", "📚", "🎮", "🚗", "💍", "🏋️", "🎸", "🛡️", "🎁", "💰"];

/* ─── progress color ─── */
function getProgressColor(pct: number) {
  if (pct >= 100) return "bg-green-500";
  if (pct >= 71) return "bg-blue-500";
  if (pct >= 31) return "bg-yellow-400";
  return "bg-red-400";
}

function getProgressGlow(pct: number) {
  if (pct >= 100) return "shadow-green-500/30";
  if (pct >= 71) return "shadow-blue-500/20";
  if (pct >= 31) return "shadow-yellow-400/20";
  return "shadow-red-400/20";
}

/* ─── confetti particles ─── */
function ConfettiEffect() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 0.8 + Math.random() * 0.6,
    color: ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"][i % 6],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${p.x}%`,
            top: "50%",
            background: p.color,
            animation: `confetti-burst ${p.duration}s cubic-bezier(0.16,1,0.3,1) ${p.delay}s both`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── goal card ─── */
function GoalCard({ goal }: { goal: Goal }) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const isComplete = pct >= 100;

  useEffect(() => {
    const t = setTimeout(() => setAnimatedWidth(pct), 200);
    return () => clearTimeout(t);
  }, [pct]);

  const remaining = Math.max(goal.target - goal.current, 0);
  const deadlineDate = new Date(goal.deadline);
  const daysLeft = Math.max(Math.ceil((deadlineDate.getTime() - Date.now()) / 86400000), 0);

  return (
    <div className={cn(
      "glass-card rounded-xl p-5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group",
      isComplete && "ring-1 ring-green-500/30"
    )}>
      {isComplete && <ConfettiEffect />}

      <div className="flex items-start justify-between mb-3 relative z-20">
        <div className="flex items-center gap-3">
          <span className={cn("text-2xl", isComplete && "animate-[float_2s_ease-in-out_infinite]")}>{goal.emoji}</span>
          <div>
            <h3 className="font-semibold text-foreground text-sm">{goal.name}</h3>
            <p className="text-[11px] text-muted-foreground">
              {isComplete ? "🎉 Meta concluída!" : `${daysLeft} dias restantes`}
            </p>
          </div>
        </div>
        <span className={cn(
          "text-xs font-bold font-mono-financial px-2 py-0.5 rounded-full",
          isComplete ? "bg-green-500/15 text-green-500" : "bg-muted text-muted-foreground"
        )}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative z-20">
        <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out shadow-lg",
              getProgressColor(pct),
              getProgressGlow(pct)
            )}
            style={{ width: `${animatedWidth}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-mono-financial text-foreground">
            R$ {goal.current.toLocaleString("pt-BR")}
          </span>
          <span className="text-xs font-mono-financial text-muted-foreground">
            R$ {goal.target.toLocaleString("pt-BR")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── achievement badge ─── */
function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <div className={cn(
      "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300",
      achievement.unlocked
        ? "glass-card hover:-translate-y-1 hover:shadow-lg cursor-default badge-shimmer"
        : "bg-muted/30 border-border/30 opacity-50"
    )}>
      <div className="relative">
        <span className={cn(
          "text-3xl block",
          achievement.unlocked ? "" : "grayscale"
        )}>
          {achievement.unlocked ? achievement.emoji : "🔒"}
        </span>
      </div>
      <div className="text-center">
        <p className={cn(
          "text-xs font-semibold",
          achievement.unlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {achievement.title}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
          {achievement.description}
        </p>
      </div>
    </div>
  );
}

/* ─── new goal form ─── */
function NewGoalDialog({ onAdd }: { onAdd: (g: Goal) => void }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [emoji, setEmoji] = useState("🎯");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (!name || !value || !date) return;
    onAdd({
      id: Date.now(),
      name,
      emoji,
      target: parseFloat(value),
      current: 0,
      deadline: format(date, "yyyy-MM-dd"),
      color: "hsl(var(--primary))",
    });
    setName("");
    setValue("");
    setEmoji("🎯");
    setDate(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" size="sm">
          <Plus className="w-4 h-4" />
          Nova meta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar nova meta</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Nome da meta</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Viagem dos sonhos" className="input-glow" />
          </div>
          <div className="space-y-1.5">
            <Label>Valor alvo (R$)</Label>
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="5000" className="input-glow font-mono-financial" />
          </div>
          <div className="space-y-1.5">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-xl border transition-all duration-200 active:scale-[0.9]",
                    emoji === e ? "border-primary bg-primary/10 ring-1 ring-primary/20 scale-110" : "border-border/50 hover:border-primary/30"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Prazo</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarUI
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  disabled={(d) => d < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={handleSubmit} className="w-full" size="lg" disabled={!name || !value || !date}>
            Criar meta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── main page ─── */
export default function Metas() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const addGoal = useCallback((g: Goal) => {
    setGoals((prev) => [...prev, g]);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalAchievements = achievements.length;

  // Motivational message
  const incompleteGoal = goals.find((g) => g.current < g.target);
  const motivationalText = incompleteGoal
    ? (() => {
        const remaining = incompleteGoal.target - incompleteGoal.current;
        const weeksLeft = Math.max(Math.ceil((new Date(incompleteGoal.deadline).getTime() - Date.now()) / (7 * 86400000)), 1);
        const perWeek = Math.ceil(remaining / weeksLeft);
        return `Você está a R$ ${remaining.toLocaleString("pt-BR")} de completar sua meta "${incompleteGoal.name}"! Se economizar R$ ${perWeek.toLocaleString("pt-BR")}/semana, chega em ${weeksLeft} semanas. 💪`;
      })()
    : "Parabéns! 🎉 Todas as suas metas foram atingidas. Que tal criar uma nova?";

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
      {/* Motivational card */}
      <div
        className="glass-card rounded-2xl p-5 flex items-start gap-4"
        style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-primary animate-[pulse-soft_2.5s_ease-in-out_infinite]" />
        </div>
        <div>
          <p className="text-xs font-medium text-primary mb-1 uppercase tracking-wider">Insight da IA</p>
          <p className="text-sm text-foreground leading-relaxed">{motivationalText}</p>
        </div>
      </div>

      {/* Goals section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Suas metas</h2>
            <p className="text-sm text-muted-foreground">{goals.filter((g) => g.current >= g.target).length} de {goals.length} concluídas</p>
          </div>
          <NewGoalDialog onAdd={addGoal} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((g, i) => (
            <div key={g.id} style={{ animation: `reveal 0.6s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${i * 100}ms` }}>
              <GoalCard goal={g} />
            </div>
          ))}
        </div>
      </div>

      {/* Achievements section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-foreground">Conquistas</h2>
          <p className="text-sm text-muted-foreground">{unlockedCount} de {totalAchievements} desbloqueadas</p>
        </div>

        {/* Progress */}
        <div className="glass-card rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progresso geral</span>
            <span className="text-xs font-bold font-mono-financial text-foreground">{Math.round((unlockedCount / totalAchievements) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {achievements.map((a, i) => (
            <div key={a.id} style={{ animation: `reveal 0.5s cubic-bezier(0.16,1,0.3,1) both`, animationDelay: `${200 + i * 80}ms` }}>
              <AchievementBadge achievement={a} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
