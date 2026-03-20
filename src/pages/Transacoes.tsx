"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Filter, Plus, Upload, ShoppingCart, Car, Utensils, 
  Heart, Gamepad2, BookOpen, Home, Briefcase, Plane, Gift,
  ArrowUpRight, ArrowDownRight, Wallet, Hash, MoreHorizontal,
  Edit2, Copy, Trash2, X, Calendar as CalendarIcon, ChevronDown,
  Check, Loader2, Camera, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

/* --- TYPES --- */
interface Transaction {
  id: number;
  desc: string;
  value: number;
  cat: string;
  date: string;
  type: 'receita' | 'gasto';
  tags?: string[];
}

/* --- DATA --- */
const initialTransactions: Transaction[] = [
  { id: 1, desc: "Salário", value: 5600, cat: "Trabalho", date: "2026-03-20", type: 'receita' },
  { id: 2, desc: "Aluguel", value: 1800, cat: "Moradia", date: "2026-03-20", type: 'gasto', tags: ['Recorrente'] },
  { id: 3, desc: "Supermercado", value: 342.5, cat: "Mercado", date: "2026-03-19", type: 'gasto' },
  { id: 4, desc: "Freelance Logo", value: 1200, cat: "Trabalho", date: "2026-03-18", type: 'receita' },
  { id: 5, desc: "Uber", value: 32.5, cat: "Transporte", date: "2026-03-18", type: 'gasto' },
  { id: 6, desc: "Netflix", value: 55.9, cat: "Lazer", date: "2026-03-15", type: 'gasto', tags: ['Recorrente'] },
];

const categories = [
  { id: "Mercado", emoji: "🛒", color: "bg-blue-500" },
  { id: "Transporte", emoji: "🚗", color: "bg-orange-500" },
  { id: "Alimentação", emoji: "🍕", color: "bg-red-500" },
  { id: "Saúde", emoji: "💊", color: "bg-emerald-500" },
  { id: "Lazer", emoji: "🎮", color: "bg-purple-500" },
  { id: "Educação", emoji: "📚", color: "bg-cyan-500" },
  { id: "Moradia", emoji: "🏠", color: "bg-amber-500" },
  { id: "Trabalho", emoji: "💼", color: "bg-indigo-500" },
  { id: "Viagem", emoji: "✈️", color: "bg-sky-500" },
  { id: "Outros", emoji: "🎁", color: "bg-slate-500" },
];

/* --- COMPONENTS --- */

function AnimatedNumber({ value, prefix = "R$ " }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{display.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
}

function SummaryCard({ label, value, icon: Icon, color, delay }: any) {
  return (
    <div 
      className="glass-card rounded-2xl p-5 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 group cursor-default"
      style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={cn("w-2 h-2 rounded-full animate-pulse", color.replace('bg-', 'bg-opacity-50 bg-'))} />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">{label}</p>
        <h3 className="text-xl font-black font-mono-financial text-foreground">
          <AnimatedNumber value={value} />
        </h3>
      </div>
    </div>
  );
}

export default function Transacoes() {
  const [search, setSearch] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'todos' | 'receita' | 'gasto'>('todos');
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Stats
  const stats = useMemo(() => {
    const receitas = transactions.filter(t => t.type === 'receita').reduce((acc, t) => acc + t.value, 0);
    const gastos = transactions.filter(t => t.type === 'gasto').reduce((acc, t) => acc + t.value, 0);
    return { receitas, gastos, saldo: receitas - gastos, count: transactions.length };
  }, [transactions]);

  // Filtered list
  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.desc.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'todos' || t.type === filterType;
      const matchesCat = !filterCat || t.cat === filterCat;
      return matchesSearch && matchesType && matchesCat;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, search, filterType, filterCat]);

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredList.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return groups;
  }, [filteredList]);

  const handleDelete = (id: number) => {
    const deleted = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.error(`Removido: ${deleted?.desc}`, {
      action: { label: "Desfazer", onClick: () => setTransactions(prev => [...prev, deleted!]) }
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-32">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Transações</h1>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredList.length} transações de março de 2026
            </p>
            <Badge className="bg-primary/10 text-primary border-none font-black animate-pulse">
              R$ {stats.saldo.toLocaleString('pt-BR')}
            </Badge>
          </div>
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center gap-3 animate-reveal" style={{ animationDelay: '100ms' }}>
        <div 
          className={cn(
            "relative flex items-center transition-all duration-300 ease-out",
            isSearchExpanded ? "w-full sm:w-[320px]" : "w-[160px]"
          )}
        >
          <Search className={cn(
            "absolute left-3 w-4 h-4 text-muted-foreground transition-transform duration-500",
            isSearchExpanded && "rotate-[360deg]"
          )} />
          <Input 
            placeholder="Buscar..." 
            className="pl-10 rounded-xl bg-muted/50 border-none focus-visible:ring-primary/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsSearchExpanded(true)}
            onBlur={() => !search && setIsSearchExpanded(false)}
          />
        </div>

        <Button 
          variant="outline" 
          className={cn("gap-2 rounded-xl border-none bg-muted/50", showFilters && "bg-primary/10 text-primary")}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" /> Filtros
        </Button>

        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group">
              <Plus className="w-4 h-4 transition-transform group-hover:rotate-45" /> Nova transação
            </Button>
          </SheetTrigger>
          <TransactionDrawer onSave={(t) => {
            setTransactions([t, ...transactions]);
            setIsDrawerOpen(false);
            toast.success("Transação registrada! ✨");
          }} />
        </Sheet>

        <Button variant="ghost" className="gap-2 rounded-xl text-muted-foreground hover:text-foreground">
          <Upload className="w-4 h-4" /> Importar
        </Button>
      </div>

      {/* FILTERS PANEL */}
      {showFilters && (
        <div className="glass-card rounded-2xl p-5 space-y-5 animate-slide-down border-primary/20">
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tipo</p>
            <div className="flex gap-2">
              {['todos', 'receita', 'gasto'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t as any)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95",
                    filterType === t 
                      ? "bg-primary text-white scale-105 shadow-lg shadow-primary/20" 
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t === 'todos' ? 'Todos' : t === 'receita' ? '💚 Receitas' : '❤️ Gastos'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Categoria</p>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button
                onClick={() => setFilterCat(null)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  !filterCat ? "bg-foreground text-background" : "bg-muted/50 text-muted-foreground"
                )}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCat(cat.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2",
                    filterCat === cat.id ? `${cat.color} text-white` : "bg-muted/50 text-muted-foreground"
                  )}
                >
                  <span>{cat.emoji}</span> {cat.id}
                </button>
              ))}
            </div>
          </div>

          {(filterType !== 'todos' || filterCat) && (
            <button 
              onClick={() => { setFilterType('todos'); setFilterCat(null); }}
              className="text-xs font-bold text-primary hover:underline animate-reveal"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Receitas" value={stats.receitas} icon={ArrowUpRight} color="bg-green-500" delay={200} />
        <SummaryCard label="Gastos" value={stats.gastos} icon={ArrowDownRight} color="bg-red-400" delay={300} />
        <SummaryCard label="Saldo" value={stats.saldo} icon={Wallet} color="bg-primary" delay={400} />
        <SummaryCard label="Transações" value={stats.count} icon={Hash} color="bg-blue-500" prefix="" delay={500} />
      </div>

      {/* LIST */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([date, items], groupIdx) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-4 animate-slide-right" style={{ animationDelay: `${groupIdx * 100}ms` }}>
              <h2 className="text-sm font-black text-foreground whitespace-nowrap">
                {format(new Date(date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h2>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-border via-border/50 to-transparent" />
              <Badge variant="outline" className="font-mono-financial text-[10px] border-border/50">
                R$ {items.reduce((acc, t) => acc + (t.type === 'receita' ? t.value : -t.value), 0).toLocaleString('pt-BR')}
              </Badge>
            </div>

            <div className="space-y-2">
              {items.map((t, i) => (
                <TransactionItem key={t.id} transaction={t} onDelete={() => handleDelete(t.id)} delay={groupIdx * 100 + i * 40} />
              ))}
            </div>
          </div>
        ))}

        {filteredList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-reveal">
            <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center animate-[float_3s_ease-in-out_infinite]">
              <Wallet className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Nenhuma transação por aqui ainda</h3>
              <p className="text-sm text-muted-foreground">Que tal registrar sua primeira?</p>
            </div>
            <Button onClick={() => setIsDrawerOpen(true)} className="rounded-xl">
              + Adicionar transação
            </Button>
          </div>
        )}
      </div>

      {/* FLOATING BOTTOM BAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass-card rounded-2xl p-2 flex gap-2 shadow-2xl border-primary/20 animate-slide-down">
        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white rounded-xl gap-2 px-4 hover:-translate-y-1 transition-all shadow-lg shadow-green-500/20">
          <Plus className="w-4 h-4" /> Receita
        </Button>
        <Button size="sm" className="bg-red-400 hover:bg-red-500 text-white rounded-xl gap-2 px-4 hover:-translate-y-1 transition-all shadow-lg shadow-red-400/20">
          <Plus className="w-4 h-4" /> Gasto
        </Button>
        <Button size="sm" variant="ghost" className="rounded-xl gap-2 px-4 hover:-translate-y-1 transition-all">
          <Camera className="w-4 h-4" /> Escanear
        </Button>
      </div>
    </div>
  );
}

function TransactionItem({ transaction: t, onDelete, delay }: { transaction: Transaction; onDelete: () => void; delay: number }) {
  const cat = categories.find(c => c.id === t.cat) || categories[categories.length - 1];

  return (
    <div 
      className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-all duration-300 border-l-4 border-transparent hover:border-current"
      style={{ 
        animation: "reveal 0.5s cubic-bezier(0.16,1,0.3,1) both", 
        animationDelay: `${delay}ms`,
        color: cat.color.replace('bg-', 'var(--') // Simplified for demo
      }}
    >
      {/* ICON */}
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform duration-300", cat.color)}>
        {cat.emoji}
      </div>

      {/* DESC */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-foreground truncate">{t.desc}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <div className={cn("w-1.5 h-1.5 rounded-full", cat.color)} />
          <span className="text-[11px] text-muted-foreground">{t.cat}</span>
        </div>
      </div>

      {/* TAGS */}
      <div className="hidden sm:flex gap-1.5">
        {t.tags?.map(tag => (
          <Badge key={tag} variant="secondary" className="text-[9px] font-bold bg-muted/50 border-none px-2 py-0">
            {tag} {tag === 'Recorrente' && '🔄'}
          </Badge>
        ))}
      </div>

      {/* DATE */}
      <div className="hidden md:block text-[11px] text-muted-foreground font-medium">
        {format(new Date(t.date), "HH:mm")}
      </div>

      {/* VALUE */}
      <div className={cn(
        "text-sm font-black font-mono-financial transition-transform group-hover:scale-105",
        t.type === 'receita' ? "text-green-500" : "text-red-400"
      )}>
        {t.type === 'receita' ? '+' : '-'} R$ {t.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>

      {/* ACTIONS */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary">
          <Copy className="w-3.5 h-3.5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-lg hover:bg-red-400/10 hover:text-red-400"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function TransactionDrawer({ onSave }: { onSave: (t: Transaction) => void }) {
  const [type, setType] = useState<'receita' | 'gasto'>('gasto');
  const [value, setValue] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState("Outros");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!value || !desc) return;
    setIsSaving(true);
    setTimeout(() => {
      onSave({
        id: Date.now(),
        desc,
        value: parseFloat(value),
        cat,
        date: new Date().toISOString().split('T')[0],
        type
      });
      setIsSaving(false);
    }, 800);
  };

  return (
    <SheetContent className={cn(
      "w-full sm:max-w-[480px] border-none transition-colors duration-500",
      type === 'receita' ? "bg-green-500/5" : "bg-red-400/5"
    )}>
      <SheetHeader className="mb-8">
        <SheetTitle className="text-2xl font-black font-sora">Nova Transação</SheetTitle>
      </SheetHeader>

      <div className="space-y-8">
        {/* TYPE TOGGLE */}
        <div className="flex p-1 bg-muted rounded-2xl">
          <button 
            onClick={() => setType('receita')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
              type === 'receita' ? "bg-green-500 text-white shadow-lg" : "text-muted-foreground"
            )}
          >
            <ArrowUpRight className="w-4 h-4" /> RECEITA
          </button>
          <button 
            onClick={() => setType('gasto')}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
              type === 'gasto' ? "bg-red-400 text-white shadow-lg" : "text-muted-foreground"
            )}
          >
            <ArrowDownRight className="w-4 h-4" /> GASTO
          </button>
        </div>

        {/* VALUE */}
        <div className="text-center space-y-2">
          <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Valor</Label>
          <div className="flex items-center justify-center gap-2">
            <span className={cn("text-3xl font-black", type === 'receita' ? "text-green-500" : "text-red-400")}>R$</span>
            <input 
              type="number" 
              placeholder="0,00"
              className={cn(
                "bg-transparent border-none outline-none text-6xl font-black w-full max-w-[280px] text-center font-mono-financial animate-pulse",
                type === 'receita' ? "text-green-500" : "text-red-400"
              )}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-muted-foreground">Categoria</Label>
          <div className="grid grid-cols-5 gap-3">
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={cn(
                  "aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative",
                  cat === c.id 
                    ? `${c.color} text-white scale-110 shadow-xl ring-4 ring-white/10` 
                    : "bg-muted/50 hover:bg-muted text-2xl"
                )}
              >
                <span className={cn("text-2xl", cat === c.id && "animate-bounce")}>{c.emoji}</span>
                {cat === c.id && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md animate-check-bounce">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* FIELDS */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Descrição</Label>
            <Input 
              placeholder="Ex: Almoço, Salário..." 
              className="h-12 rounded-xl bg-muted/50 border-none input-glow"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs font-bold">Data</Label>
              <Button variant="outline" className="w-full h-12 rounded-xl justify-start gap-2 bg-muted/50 border-none">
                <CalendarIcon className="w-4 h-4" /> {format(new Date(), "dd/MM/yyyy")}
              </Button>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <Label className="text-xs font-bold">Recorrente</Label>
              <Switch />
            </div>
          </div>
        </div>

        {/* SAVE */}
        <Button 
          size="lg" 
          className={cn(
            "w-full h-16 rounded-2xl text-lg font-black shadow-2xl transition-all active:scale-95",
            type === 'receita' ? "bg-green-500 hover:bg-green-600" : "bg-red-400 hover:bg-red-500"
          )}
          onClick={handleSave}
          disabled={isSaving || !value || !desc}
        >
          {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : `Registrar ${type === 'receita' ? 'Receita' : 'Gasto'}`}
        </Button>
      </div>
    </SheetContent>
  );
}