"use client";

import React, { useState, useMemo } from 'react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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

const initialTransactions: Transaction[] = [
  { id: 1, desc: "Salário", value: 5600, cat: "Trabalho", date: "2026-03-20", type: 'receita' },
  { id: 2, desc: "Aluguel", value: 1800, cat: "Moradia", date: "2026-03-20", type: 'gasto', tags: ['Recorrente'] },
  { id: 3, desc: "Supermercado", value: 342.5, cat: "Mercado", date: "2026-03-19", type: 'gasto' },
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

export default function Transacoes() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleEdit = (t: Transaction) => {
    setEditingTransaction(t);
    setIsDrawerOpen(true);
  };

  const handleDuplicate = (t: Transaction) => {
    setEditingTransaction({ ...t, id: Date.now(), date: new Date().toISOString().split('T')[0] });
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: number) => {
    const deleted = transactions.find(t => t.id === id);
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.error(`🗑️ Removida: ${deleted?.desc}`, {
      action: { label: "Desfazer →", onClick: () => setTransactions(prev => [...prev, deleted!]) }
    });
  };

  const handleSave = (t: Transaction) => {
    if (editingTransaction && transactions.find(item => item.id === editingTransaction.id)) {
      setTransactions(prev => prev.map(item => item.id === editingTransaction.id ? t : item));
      toast.success("✅ Transação atualizada com sucesso");
    } else {
      setTransactions([t, ...transactions]);
      toast.success("✅ Transação registrada! ✨");
    }
    setIsDrawerOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black font-sora">Transações</h1>
        <Sheet open={isDrawerOpen} onOpenChange={(o) => { setIsDrawerOpen(o); if (!o) setEditingTransaction(null); }}>
          <SheetTrigger asChild>
            <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> Nova transação</Button>
          </SheetTrigger>
          <TransactionDrawer initialData={editingTransaction} onSave={handleSave} />
        </Sheet>
      </div>

      <div className="space-y-2">
        {transactions.map((t, i) => (
          <TransactionItem key={t.id} transaction={t} onEdit={() => handleEdit(t)} onDuplicate={() => handleDuplicate(t)} onDelete={() => handleDelete(t.id)} delay={i * 40} />
        ))}
      </div>
    </div>
  );
}

function TransactionItem({ transaction: t, onEdit, onDuplicate, onDelete, delay }: any) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const cat = categories.find(c => c.id === t.cat) || categories[categories.length - 1];

  if (isConfirmingDelete) {
    return (
      <div className="flex items-center justify-between p-4 rounded-2xl bg-destructive/10 border border-destructive/20 animate-reveal">
        <p className="text-sm font-bold text-destructive">Excluir esta transação?</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setIsConfirmingDelete(false)}>Cancelar</Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>Confirmar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-all duration-300 animate-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm", cat.color)}>{cat.emoji}</div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-foreground truncate">{t.desc}</h4>
        <p className="text-[11px] text-muted-foreground">{t.cat}</p>
      </div>
      <div className={cn("text-sm font-black font-mono-financial", t.type === 'receita' ? "text-green-500" : "text-red-400")}>
        {t.type === 'receita' ? '+' : '-'} R$ {t.value.toLocaleString('pt-BR')}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onEdit}><Edit2 className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onDuplicate}><Copy className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive" onClick={() => setIsConfirmingDelete(true)}><Trash2 className="w-3.5 h-3.5" /></Button>
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
        <Button size="lg" className={cn("w-full h-16 rounded-2xl text-lg font-black shadow-2xl", type === 'receita' ? "bg-green-500 hover:bg-green-600" : "bg-red-400 hover:bg-red-500")} onClick={() => onSave({ id: initialData?.id || Date.now(), desc, value: parseFloat(value), cat, date: initialData?.date || new Date().toISOString().split('T')[0], type })} disabled={!value || !desc}>{initialData ? "Salvar alterações ✓" : `Registrar ${type === 'receita' ? 'Receita' : 'Gasto'}`}</Button>
      </div>
    </SheetContent>
  );
}