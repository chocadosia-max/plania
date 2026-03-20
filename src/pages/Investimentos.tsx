"use client";

import React, { useState } from 'react';
import { TrendingUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePlanIA } from "@/contexts/PlanIAContext";

export default function Investimentos() {
  const { investments, addInvestment, deleteInvestment } = usePlanIA();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipo: "Renda Fixa",
    valor: "",
    dataInicio: new Date().toISOString().split("T")[0],
    instituicao: ""
  });

  const handleSave = () => {
    if (!form.nome || !form.valor) return;
    addInvestment({
      ...form,
      valor: parseFloat(form.valor)
    });
    setIsDrawerOpen(false);
    setForm({ nome: "", tipo: "Renda Fixa", valor: "", dataInicio: new Date().toISOString().split("T")[0], instituicao: "" });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Investimentos</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seu patrimônio</p>
        </div>
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> Novo investimento</Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[480px]">
            <SheetHeader className="mb-8"><SheetTitle className="text-2xl font-black">Novo Investimento</SheetTitle></SheetHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Nome do Ativo</Label>
                <Input placeholder="Ex: CDB Banco Inter, Ações PETR4" value={form.nome} onChange={(e) => setForm({...form, nome: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({...form, tipo: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                      <SelectItem value="Ações">Ações</SelectItem>
                      <SelectItem value="FIIs">FIIs</SelectItem>
                      <SelectItem value="Cripto">Cripto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor Aplicado (R$)</Label>
                  <Input type="number" placeholder="1000" value={form.valor} onChange={(e) => setForm({...form, valor: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Instituição</Label>
                <Input placeholder="Ex: XP, NuInvest, Inter" value={form.instituicao} onChange={(e) => setForm({...form, instituicao: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Data da Aplicação</Label>
                <Input type="date" value={form.dataInicio} onChange={(e) => setForm({...form, dataInicio: e.target.value})} />
              </div>
              <Button 
                size="lg" 
                className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl mt-4" 
                onClick={handleSave}
                disabled={!form.nome || !form.valor}
              >
                Registrar Investimento
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((inv, i) => (
          <div key={inv.id} className="glass-card rounded-2xl p-5 space-y-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative animate-reveal" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><TrendingUp className="w-5 h-5" /></div>
                <div>
                  <h4 className="text-sm font-bold text-foreground truncate max-w-[150px]">{inv.nome}</h4>
                  <Badge variant="outline" className="text-[8px] uppercase">{inv.tipo}</Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteInvestment(inv.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black font-mono-financial">R$ {inv.valor.toLocaleString('pt-BR')}</p>
              <p className="text-[10px] text-muted-foreground">Instituição: {inv.instituicao || 'Não informada'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}