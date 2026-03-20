"use client";

import React from 'react';
import { usePlanIA } from "@/contexts/PlanIAContext";
import { CreditCard, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function Dividas() {
  const { dividas } = usePlanIA();

  const totalDevido = dividas.reduce((s, d) => s + d.valorTotal, 0);
  const totalRestante = dividas.reduce((s, d) => s + d.saldoRestante, 0);
  const totalPago = totalDevido - totalRestante;
  const pctGeral = Math.round((totalPago / totalDevido) * 100) || 0;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-reveal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dívidas e Credores</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de quitação anual</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase text-muted-foreground">Total Restante</p>
          <p className="text-2xl font-black text-red-400 font-mono-financial">R$ {totalRestante.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-8 border-primary/20 bg-primary/5 flex items-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <TrendingDown className="w-8 h-8 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span>Progresso de Quitação Geral</span>
            <span>{pctGeral}% concluído</span>
          </div>
          <Progress value={pctGeral} className="h-3 bg-muted" />
          <p className="text-xs text-muted-foreground">Você já pagou <span className="font-bold text-foreground">R$ {totalPago.toLocaleString('pt-BR')}</span> do total de R$ {totalDevido.toLocaleString('pt-BR')}.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {dividas.map((d, i) => {
          const pago = d.valorTotal - d.saldoRestante;
          const pct = Math.round((pago / d.valorTotal) * 100);
          return (
            <div key={i} className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4 md:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl">💳</div>
                <div>
                  <h3 className="font-bold text-lg">{d.credor}</h3>
                  <p className="text-xs text-muted-foreground">Total: R$ {d.valorTotal.toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span>Progresso</span>
                  <span>R$ {d.saldoRestante.toLocaleString('pt-BR')} restante</span>
                </div>
                <Progress value={pct} className="h-2 bg-muted" />
              </div>
              <div className="md:w-24 text-center">
                <div className={cn(
                  "inline-flex items-center justify-center w-12 h-12 rounded-full border-2",
                  pct === 100 ? "border-green-500 text-green-500" : "border-primary/30 text-primary"
                )}>
                  {pct === 100 ? <CheckCircle2 className="w-6 h-6" /> : <span className="text-xs font-black">{pct}%</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}