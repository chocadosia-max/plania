"use client";

import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit2, Copy, Trash2, Search, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePlanIA, Transaction } from "@/contexts/PlanIAContext";

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

export default function Transacoes() {
  const { transactions, addTransaction, deleteTransaction, updateTransaction } = usePlanIA();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.desc.toLowerCase().includes(search.toLowerCase()) || 
      t.cat.toLowerCase().includes(search.toLowerCase())
    );
  }, [transactions, search]);

  const totals = useMemo(() => {
    const receitas = transactions.filter(t => t.type === 'receita').reduce((acc, t) => acc + t.value, 0);
    const gastos = transactions.filter(t => t.type === 'gasto').reduce((acc, t) => acc + Math.abs(t.value), 0);
    return { receitas, gastos, saldo: receitas - gastos };
  }, [transactions]);

  const handleSave = (t: any) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, t);
      toast.success("✅ Transação atualizada");
    } else {
      addTransaction(t);
      toast.success("✅ Transação registrada! ✨");
    }
    setIsDrawerOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-black font-sora">Transações</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar transação..." 
              className="pl-9 rounded-xl bg-muted/50 border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Sheet open={isDrawerOpen} onOpenChange={(o) => { setIsDrawerOpen(o); if (!o) setEditingTransaction(null); }}>
            <SheetTrigger asChild>
              <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> Nova transação</Button>
            </SheetTrigger>
            <TransactionDrawer initialData={editingTransaction} onSave={handleSave} />
          </Sheet>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border-green-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Receitas</p>
          <p className="text-2xl font-black text-green-500 font-mono-financial">R$ {totals.receitas.toLocaleString('pt-BR')}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-red-400/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Gastos</p>
          <p className="text-2xl font-black text-red-400 font-mono-financial">R$ {totals.gastos.toLocaleString('pt-BR')}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-primary/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Saldo</p>
          <p className="text-2xl font-black text-foreground font-mono-financial">R$ {totals.saldo.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
          </div>
        ) : (
          filteredTransactions.map((t, i) => (
            <TransactionItem 
              key={t.id} 
              transaction={t} 
              onEdit={() => { setEditingTransaction(t); setIsDrawerOpen(true); }} 
              onDelete={() => deleteTransaction(t.id)} 
              delay={i * 30} 
            />
          ))
        )}
      </div>
    </div>
  );
}

function TransactionItem({ transaction: t, onEdit, onDelete, delay }: any) {
  const cat = categories.find(c => c.id === t.cat) || categories[categories.length - 1];

  return (
    <div className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-all duration-300 animate-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm", cat.color)}>{cat.emoji}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-foreground truncate">{t.desc}</h4>
        <p className="text-[11px] text-muted-foreground">{t.cat} · {t.date}</p>
      </div>
      <div className={cn("text-sm font-black font-mono-financial", t.type === 'receita' ? "text-green-500" : "text-red-400")}>
        {t.type === 'receita' ? '+' : '-'} R$ {Math.abs(t.value).toLocaleString('pt-BR')}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}><Edit2 className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={onDelete}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

function TransactionDrawer({ initialData, onSave }: any) {
  const [type, setType] = useState<'receita' | 'gasto'>(initialData?.type || 'gasto');
  const [value, setValue] = useState(initialData?.value?.toString() || "");
  const [desc, setDesc] = useState(initialData?.desc || "");
  const [cat, setCat] = useState(initialData?.cat || "Outros");

  return (
    <SheetContent className={cn("w-full sm:max-w-[480px] border-none", type === 'receita' ? "bg-green-500/5" : "bg-red-400/5")}>
      <SheetHeader className="mb-8"><SheetTitle className="text-2xl font-black">{initialData ? "Editar transação" : "Nova Transação"}</SheetTitle></SheetHeader>
      <div className="space-y-8">
        <div className="flex p-1 bg-muted rounded-2xl">
          <button onClick={() => setType('receita')} className={cn("flex-1 py-3 rounded-xl text-sm font-black transition-all", type === 'receita' ? "bg-green-500 text-white shadow-lg" : "text-muted-foreground")}>RECEITA</button>
          <button onClick={() => setType('gasto')} className={cn("flex-1 py-3 rounded-xl text-sm font-black transition-all", type === 'gasto' ? "bg-red-400 text-white shadow-lg" : "text-muted-foreground")}>GASTO</button>
        </div>
        <div className="text-center space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Valor</Label>
          <div className="flex items-center justify-center gap-2">
            <span className={cn("text-3xl font-black", type === 'receita' ? "text-green-500" : "text-red-400")}>R$</span>
            <input type="number" placeholder="0,00" className={cn("bg-transparent border-none outline-none text-6xl font-black w-full max-w-[280px] text-center font-mono-financial", type === 'receita' ? "text-green-500" : "text-red-400")} value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label className="text-xs font-bold">Descrição</Label><Input placeholder="Ex: Almoço, Salário..." className="h-12 rounded-xl bg-muted/50 border-none" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Categoria</Label>
            <div className="grid grid-cols-5 gap-2">
              {categories.map(c => (
                <button key={c.id} onClick={() => setCat(c.id)} className={cn("aspect-square rounded-xl flex items-center justify-center text-xl transition-all", cat === c.id ? `${c.color} text-white scale-110 shadow-lg` : "bg-muted/50 hover:bg-muted")}>{c.emoji}</button>
              ))}
            </div>
          </div>
        </div>
        <Button size="lg" className={cn("w-full h-16 rounded-2xl text-lg font-black shadow-2xl", type === 'receita' ? "bg-green-500 hover:bg-green-600" : "bg-red-400 hover:bg-red-500")} onClick={() => onSave({ desc, value: parseFloat(value), cat, date: initialData?.date || new Date().toISOString().split('T')[0], type })} disabled={!value || !desc}>{initialData ? "Salvar alterações ✓" : `Registrar ${type === 'receita' ? 'Receita' : 'Gasto'}`}</Button>
      </div>
    </SheetContent>
  );
}