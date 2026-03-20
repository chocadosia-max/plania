"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Search, X, Edit2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { usePlanIA } from "@/contexts/PlanIAContext";

export function getIconeTransacao(descricao: string, tipo: string) {
  const d = (descricao || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (d.includes("salario") || d.includes("salário")) return "💼";
  if (d.includes("freelance") || d.includes("freela")) return "💻";
  if (d.includes("aluguel") && tipo === "receita") return "🏠";
  if (d.includes("dividendo")) return "📈";
  if (d.includes("bonus") || d.includes("bônus")) return "🎁";
  if (d.includes("pix receb") || (d.includes("transferen") && tipo === "receita")) return "💸";
  if (d.includes("aluguel")) return "🏠";
  if (d.includes("condomin")) return "🏢";
  if (d.includes("energia") || d.includes("luz") || d.includes("eletric")) return "💡";
  if (d.includes("agua") || d.includes("água")) return "💧";
  if (d.includes("gas") || d.includes("gás")) return "🔥";
  if (d.includes("internet") || d.includes("wifi")) return "📡";
  if (d.includes("mercado") || d.includes("supermercad")) return "🛒";
  if (d.includes("restaurante") || d.includes("lanchon")) return "🍽️";
  if (d.includes("ifood") || d.includes("delivery")) return "🛵";
  if (d.includes("uber") || d.includes("99")) return "🚗";
  if (d.includes("combustiv") || d.includes("gasolina") || d.includes("posto")) return "⛽";
  if (d.includes("onibus") || d.includes("metro")) return "🚌";
  if (d.includes("farmacia") || d.includes("farmácia") || d.includes("drogaria")) return "💊";
  if (d.includes("medico") || d.includes("médico") || d.includes("consulta")) return "🏥";
  if (d.includes("netflix")) return "🎬";
  if (d.includes("spotify")) return "🎵";
  if (d.includes("invest") || d.includes("cdb") || d.includes("tesouro")) return "📈";
  if (d.includes("cartao") || d.includes("cartão") || d.includes("fatura")) return "💳";
  if (tipo === "receita") return "💰";
  return "📋";
}

export default function Transacoes() {
  const { transactions, addTransaction, deleteTransaction } = usePlanIA();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const [form, setForm] = useState({
    tipo: 'gasto' as 'receita' | 'gasto',
    valor: "",
    descricao: "",
    categoria: "Outros",
    data: new Date().toISOString().split("T")[0],
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      (t.descricao || "").toLowerCase().includes(search.toLowerCase()) || 
      (t.categoria || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [transactions, search]);

  const totals = useMemo(() => {
    const receitas = transactions.filter(t => t.tipo === "receita" || t.valor > 0).reduce((sum, t) => sum + Math.abs(t.valor), 0);
    const gastos = transactions.filter(t => t.tipo === "gasto" || t.valor < 0).reduce((sum, t) => sum + Math.abs(t.valor), 0);
    return { receitas, gastos, saldo: receitas - gastos };
  }, [transactions]);

  const handleSave = () => {
    if (!form.valor || !form.descricao) return;
    addTransaction({ ...form, valor: parseFloat(form.valor) * (form.tipo === 'gasto' ? -1 : 1) });
    setIsDrawerOpen(false);
    setForm({ tipo: 'gasto', valor: "", descricao: "", categoria: "Outros", data: new Date().toISOString().split("T")[0] });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-black font-sora">Transações</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar transação..." className="pl-9 rounded-xl bg-muted/50 border-none" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild><Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> Nova transação</Button></SheetTrigger>
            <SheetContent className={cn("w-full sm:max-w-[480px] border-none", form.tipo === 'receita' ? "bg-green-500/5" : "bg-red-400/5")}>
              <SheetHeader className="mb-8"><SheetTitle className="text-2xl font-black">Nova Transação</SheetTitle></SheetHeader>
              <div className="space-y-8">
                <div className="flex p-1 bg-muted rounded-2xl">
                  <button onClick={() => setForm({...form, tipo: 'receita'})} className={cn("flex-1 py-3 rounded-xl text-sm font-black transition-all", form.tipo === 'receita' ? "bg-green-500 text-white shadow-lg" : "text-muted-foreground")}>RECEITA</button>
                  <button onClick={() => setForm({...form, tipo: 'gasto'})} className={cn("flex-1 py-3 rounded-xl text-sm font-black transition-all", form.tipo === 'gasto' ? "bg-red-400 text-white shadow-lg" : "text-muted-foreground")}>GASTO</button>
                </div>
                <div className="text-center space-y-2">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Valor</Label>
                  <div className="flex items-center justify-center gap-2">
                    <span className={cn("text-3xl font-black", form.tipo === 'receita' ? "text-green-500" : "text-red-400")}>R$</span>
                    <input type="number" placeholder="0,00" className={cn("bg-transparent border-none outline-none text-6xl font-black w-full max-w-[280px] text-center font-mono-financial", form.tipo === 'receita' ? "text-green-500" : "text-red-400")} value={form.valor} onChange={(e) => setForm({...form, valor: e.target.value})} autoFocus />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5"><Label className="text-xs font-bold">Descrição</Label><Input placeholder="Ex: Almoço, Salário..." className="h-12 rounded-xl bg-muted/50 border-none" value={form.descricao} onChange={(e) => setForm({...form, descricao: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs font-bold">Data</Label><Input type="date" className="h-12 rounded-xl bg-muted/50 border-none" value={form.data} onChange={(e) => setForm({...form, data: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs font-bold">Categoria</Label><Input placeholder="Ex: Alimentação, Transporte..." className="h-12 rounded-xl bg-muted/50 border-none" value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})} /></div>
                </div>
                <Button size="lg" className={cn("w-full h-16 rounded-2xl text-lg font-black shadow-2xl transition-all", form.tipo === 'receita' ? "bg-green-500 hover:bg-green-600" : "bg-red-400 hover:bg-red-500")} onClick={handleSave} disabled={!form.valor || !form.descricao}>Registrar {form.tipo === 'receita' ? 'Receita' : 'Gasto'}</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border-green-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Receitas</p>
          <p className="text-2xl font-black text-green-500 font-mono-financial">R$ {totals.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-red-400/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Gastos</p>
          <p className="text-2xl font-black text-red-400 font-mono-financial">R$ {totals.gastos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-primary/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Saldo</p>
          <p className="text-2xl font-black text-foreground font-mono-financial">R$ {totals.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTransactions.map((t, i) => (
          <div 
            key={t.id || i} 
            className="transacao-item"
            style={{ "--cor-tipo": (t.tipo === 'receita' || t.valor > 0) ? "#34D399" : "#F87171" } as any}
            onClick={() => setSelected(t)}
          >
            <div className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 border",
              (t.tipo === 'receita' || t.valor > 0) ? "bg-green-500/15 border-green-500/30" : "bg-red-400/15 border-red-400/30"
            )}>
              {getIconeTransacao(t.descricao, t.tipo)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-foreground truncate">{t.descricao}</h4>
              <p className="text-[11px] text-muted-foreground">{t.categoria} · {t.data}</p>
            </div>
            <div className={cn("text-sm font-black font-mono-financial", (t.tipo === 'receita' || t.valor > 0) ? "text-green-500" : "text-red-400")}>
              {(t.tipo === 'receita' || t.valor > 0) ? '+' : '-'} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE DETALHE */}
      {selected && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-[#0F1629] border border-[#2D4070] rounded-[20px] p-8 w-full max-w-md relative animate-scale-in shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1E2D4D] flex items-center justify-center text-[#7B8DB0] hover:text-white transition-colors">×</button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0",
                (selected.tipo === 'receita' || selected.valor > 0) ? "bg-green-500/15" : "bg-red-400/15"
              )}>
                {getIconeTransacao(selected.descricao, selected.tipo)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#F0F4FF] leading-tight">{selected.descricao}</h2>
                <p className="text-xs text-[#7B8DB0] mt-1">{selected.categoria} · {selected.data}</p>
              </div>
            </div>

            <div className={cn(
              "rounded-xl p-4 mb-6 text-center border",
              (selected.tipo === 'receita' || selected.valor > 0) ? "bg-green-500/5 border-green-500/20" : "bg-red-400/5 border-red-400/20"
            )}>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7B8DB0] mb-1">Valor</p>
              <p className={cn("text-3xl font-black font-mono-financial", (selected.tipo === 'receita' || selected.valor > 0) ? "text-green-500" : "text-red-400")}>
                {(selected.tipo === 'receita' || selected.valor > 0) ? '+' : '-'} R$ {Math.abs(selected.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#7B8DB0] mb-2">Dados completos da planilha</p>
              <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {Object.entries(selected.dadosOriginais || selected)
                  .filter(([k, v]) => v !== null && v !== undefined && v !== "" && !["id", "origem", "dadosOriginais"].includes(k))
                  .map(([chave, valor]) => (
                    <div key={chave} className="flex justify-between items-center p-3 bg-[#162040] rounded-lg border border-[#1E2D4D]">
                      <span className="text-xs text-[#7B8DB0] capitalize">{chave.replace(/_/g, " ")}</span>
                      <span className="text-xs font-bold text-[#F0F4FF]">{valor.toString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button className="flex-1 h-12 rounded-xl bg-[#6366F1] hover:bg-[#6366F1]/90 font-bold gap-2">
                <Edit2 className="w-4 h-4" /> Editar
              </Button>
              <Button 
                variant="outline" 
                className="w-12 h-12 rounded-xl border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20"
                onClick={() => { deleteTransaction(selected.id); setSelected(null); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}