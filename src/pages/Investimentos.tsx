"use client";

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Plus, MoreVertical, Edit2, Trash2, CheckCircle2, ArrowRightLeft, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { usePlanIA, Investment } from "@/contexts/PlanIAContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Investimentos() {
  const { investments, transactions } = usePlanIA();
  const [activeTab, setActiveTab] = useState("ativos");

  const totalInvested = useMemo(() => {
    return investments.reduce((acc, inv) => acc + inv.value, 0);
  }, [investments]);

  const avgSavings = useMemo(() => {
    const revenues = transactions.filter(t => t.type === 'receita').reduce((acc, t) => acc + t.value, 0);
    const expenses = transactions.filter(t => t.type === 'gasto').reduce((acc, t) => acc + Math.abs(t.value), 0);
    return (revenues - expenses) / 6;
  }, [transactions]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Investimentos</h1>
          <p className="text-sm text-muted-foreground">Patrimônio total: R$ {totalInvested.toLocaleString('pt-BR')}</p>
        </div>
        <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> Novo investimento</Button>
      </div>

      {investments.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-6 border-primary/20 bg-primary/5 animate-reveal">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <TrendingUp className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Comece a fazer seu dinheiro render 💡</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Detectamos que você economiza em média <span className="font-bold text-foreground">R$ {avgSavings.toLocaleString('pt-BR')}</span> por mês. 
              Que tal alocar uma parte disso em investimentos?
            </p>
          </div>
          <Button size="lg" className="rounded-2xl px-8">Registrar primeiro investimento</Button>
        </div>
      ) : (
        <Tabs defaultValue="ativos" onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="ativos" className="rounded-lg px-8">Ativos ({investments.length})</TabsTrigger>
            <TabsTrigger value="encerrados" className="rounded-lg px-8">Encerrados</TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {investments.map((inv, i) => (
              <AssetCard key={inv.id} asset={inv} delay={i * 80} />
            ))}
          </div>
        </Tabs>
      )}
    </div>
  );
}

function AssetCard({ asset: a, delay }: { asset: Investment; delay: number }) {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative animate-reveal" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <h4 className="text-sm font-bold text-foreground truncate max-w-[150px]">{a.name}</h4>
            <Badge variant="outline" className="text-[8px] uppercase">{a.type}</Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="gap-2"><Edit2 className="w-4 h-4" /> Editar</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><Plus className="w-4 h-4" /> Novo aporte</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><ArrowRightLeft className="w-4 h-4" /> Resgate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive"><Trash2 className="w-4 h-4" /> Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1">
        <p className="text-xl font-black font-mono-financial">R$ {a.value.toLocaleString('pt-BR')}</p>
        <p className="text-[10px] text-muted-foreground">Início: {format(new Date(a.startDate), "dd/MM/yyyy")}</p>
      </div>
    </div>
  );
}