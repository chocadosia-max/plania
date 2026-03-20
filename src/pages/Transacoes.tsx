"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Search, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { usePlanIA } from "@/contexts/PlanIAContext";

export function getIconeTransacao(descricao: string, tipo: string) {
  const d = (descricao || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Receitas
  if (d.includes("salario") || d.includes("salário")) return "💼";
  if (d.includes("freelance") || d.includes("freela")) return "💻";
  if (d.includes("aluguel") && tipo === "receita") return "🏠";
  if (d.includes("dividendo")) return "📈";
  if (d.includes("bonus") || d.includes("bônus")) return "🎁";
  if (d.includes("pix receb") || (d.includes("transferen") && tipo === "receita")) return "💸";
  if (d.includes("tony")) return "👤";
  
  // Moradia
  if (d.includes("aluguel")) return "🏠";
  if (d.includes("condomin")) return "🏢";
  if (d.includes("energia") || d.includes("luz") || d.includes("eletric")) return "💡";
  if (d.includes("agua") || d.includes("água")) return "💧";
  if (d.includes("gas") || d.includes("gás")) return "🔥";
  if (d.includes("internet") || d.includes("wifi")) return "📡";
  
  // Alimentação
  if (d.includes("mercado") || d.includes("supermercad")) return "🛒";
  if (d.includes("restaurante") || d.includes("lanchon")) return "🍽️";
  if (d.includes("ifood") || d.includes("delivery")) return "🛵";
  if (d.includes("padaria")) return "🥖";
  if (d.includes("acougue") || d.includes("açougue")) return "🥩";
  
  // Transporte
  if (d.includes("uber") || d.includes("99")) return "🚗";
  if (d.includes("combustiv") || d.includes("gasolina") || d.includes("posto")) return "⛽";
  if (d.includes("onibus") || d.includes("metro")) return "🚌";
  if (d.includes("passagem") || d.includes("aereo") || d.includes("latam") || d.includes("gol")) return "✈️";
  
  // Saúde
  if (d.includes("farmacia") || d.includes("farmácia") || d.includes("drogaria")) return "💊";
  if (d.includes("medico") || d.includes("médico") || d.includes("consulta")) return "🏥";
  if (d.includes("academia") || d.includes("gym")) return "💪";
  if (d.includes("plano saude") || d.includes("convenio")) return "🩺";
  
  // Lazer
  if (d.includes("netflix")) return "🎬";
  if (d.includes("spotify")) return "🎵";
  if (d.includes("amazon")) return "📦";
  if (d.includes("disney")) return "🏰";
  if (d.includes("cinema")) return "🎥";
  if (d.includes("jogo") || d.includes("steam")) return "🎮";
  
  // Educação
  if (d.includes("escola") || d.includes("colegio")) return "🏫";
  if (d.includes("faculdade") || d.includes("univers")) return "🎓";
  if (d.includes("curso") || d.includes("udemy") || d.includes("alura")) return "📚";
  
  // Finanças
  if (d.includes("invest") || d.includes("cdb") || d.includes("tesouro")) return "📈";
  if (d.includes("cartao") || d.includes("cartão") || d.includes("fatura")) return "💳";
  if (d.includes("emprestimo") || d.includes("parcela")) return "🏦";
  if (d.includes("seguro")) return "🛡️";
  
  if (tipo === "receita") return "💰";
  return "📋";
}

export default function Transacoes() {
  const { transactions, addTransaction, deleteTransaction } = usePlanIA();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    tipo: 'gasto' as 'receita' | 'gasto',
    valor: "",
    descricao: "",
    categoria: "Outros",
    data: new Date().toISOString().split("T")[0],
    recorrente: false
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      (t.descricao || "").toLowerCase().includes(search.toLowerCase()) || 
      (t.categoria || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [transactions, search]);

  const totals = useMemo(() => {
    const receitas = transactions.filter(t => t.tipo === "receita" || t.valor > 0).reduce((sum, t) => sum + Math.abs(t.valor), 0);
    const gastos = transactions.filter(t => t.tipo === "gasto" || t.tipo === "despesa" || t.valor < 0).reduce((sum, t) => sum + Math.abs(t.valor), 0);
    return { receitas, gastos, saldo: receitas - gastos };
  }, [transactions]);

  const handleSave = () => {
    if (!form.valor || !form.descricao) return;
    addTransaction({ ...form, valor: parseFloat(form.valor) * (form.tipo === 'gasto' ? -1 : 1) });
    setIsDrawerOpen(false);
    setForm({ tipo: 'gasto', valor: "", descricao: "", categoria: "Outros", data: new Date().toISOString().split("T")[0], recorrente: false });
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

      <div className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto"><CreditCard className="w-8 h-8 text-muted-foreground" /></div>
            <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
          </div>
        ) : (
          filteredTransactions.map((t, i) => (
            <div key={t.id || i} className="group relative flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-all duration-300 animate-reveal" style={{ animationDelay: `${i * 30}ms` }}>
              <div style={{
                width: 44, height: 44,
                borderRadius: "50%",
                background: (t.tipo === "receita" || t.valor > 0) ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
                border: `1px solid ${(t.tipo === "receita" || t.valor > 0) ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`
              }}>
                {getIconeTransacao(t.descricao, t.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{t.descricao}</h4>
                <p className="text-[11px] text-muted-foreground">{t.categoria} · {t.data}</p>
              </div>
              <div className={cn("text-sm font-black font-mono-financial", (t.tipo === 'receita' || t.valor > 0) ? "text-green-500" : "text-red-400")}>
                {(t.tipo === 'receita' || t.valor > 0) ? '+' : '-'} R$ {Math.abs(t.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteTransaction(t.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}