"use client";

import React from 'react';
import { Sparkles, TrendingDown, CheckCircle2, Lightbulb, Target, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const insights = [
  { icon: TrendingDown, title: "Gastos com delivery subiram 34%", desc: "Restaurantes e iFood somaram R$ 450 a mais que a média dos últimos 3 meses.", impact: "Atenção", color: "text-red-400", bg: "bg-red-400/10" },
  { icon: CheckCircle2, title: "Você não estourou nenhum limite", desc: "Parabéns! Todas as categorias ficaram dentro do orçamento planejado para março.", impact: "Positivo", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Lightbulb, title: "Reduzir R$200 em lazer", desc: "Se fizer esse ajuste, sua taxa de economia sobe para 42% e você antecipa sua meta.", impact: "Dica", color: "text-primary", bg: "bg-primary/10" },
  { icon: Target, title: "Meta de viagem em abril", desc: "No ritmo atual de aportes, você completará os R$ 8.000 na primeira semana de abril.", impact: "Alto impacto", color: "text-amber-500", bg: "bg-amber-500/10" },
  { icon: TrendingDown, title: "Economia em transporte", desc: "Seu gasto com Uber caiu 15% este mês. O uso do transporte público rendeu R$ 120.", impact: "Positivo", color: "text-green-500", bg: "bg-green-500/10" },
  { icon: Lightbulb, title: "Assinaturas esquecidas", desc: "Detectamos 2 serviços que você não utiliza há 60 dias. Cancelar poupa R$ 54/mês.", impact: "Dica", color: "text-primary", bg: "bg-primary/10" },
];

export function AIInsightsSection() {
  return (
    <div 
      className="relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/40 via-border to-secondary/40"
      style={{ animation: "reveal 0.8s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "1000ms" }}
    >
      <div className="bg-card rounded-[15px] p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">🤖 O que a IA encontrou neste período</h2>
            <p className="text-xs text-muted-foreground">Análise automática baseada nos seus padrões de consumo</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((ins, i) => (
            <div 
              key={i} 
              className="glass-card rounded-xl p-4 border border-border/40 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", ins.bg, ins.color)}>
                  <ins.icon className="w-4 h-4" />
                </div>
                <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", ins.bg, ins.color)}>
                  {ins.impact}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground leading-tight mb-1.5">{ins.title}</h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{ins.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Ver detalhes <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}