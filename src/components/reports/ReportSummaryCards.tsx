"use client";

import React from 'react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, Wallet, Target, Calendar, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue: string;
  positive?: boolean;
  color: string;
  delay: number;
}

function SummaryCard({ icon: Icon, label, value, subValue, positive, color, delay }: SummaryCardProps) {
  return (
    <div 
      className="glass-card rounded-xl p-4 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 group"
      style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-colors", color)}>
          <Icon className="w-5 h-5" />
        </div>
        {positive !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            positive ? "bg-green-500/10 text-green-500" : "bg-red-400/10 text-red-400"
          )}>
            {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {subValue}
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <h3 className="text-xl font-bold font-mono-financial text-foreground mt-0.5">{value}</h3>
        {positive === undefined && <p className="text-[10px] text-muted-foreground mt-1">{subValue}</p>}
      </div>
    </div>
  );
}

export function ReportSummaryCards() {
  const cards = [
    { icon: TrendingUp, label: "Total Receitas", value: "R$ 8.400", subValue: "+12% vs anterior", positive: true, color: "bg-green-500/15 text-green-500", delay: 0 },
    { icon: TrendingDown, label: "Total Gastos", value: "R$ 5.230", subValue: "-8% vs anterior", positive: true, color: "bg-red-400/15 text-red-400", delay: 100 },
    { icon: Wallet, label: "Saldo Período", value: "R$ 3.170", subValue: "↑ positivo", positive: true, color: "bg-primary/15 text-primary", delay: 200 },
    { icon: Target, label: "Maior Gasto", value: "R$ 890", subValue: "Aluguel", color: "bg-destructive/15 text-destructive", delay: 300 },
    { icon: Calendar, label: "Melhor Mês", value: "Fevereiro", subValue: "R$ 1.200 de saldo", color: "bg-amber-500/15 text-amber-500", delay: 400 },
    { icon: Percent, label: "Taxa de Economia", value: "37.7%", subValue: "+5% vs anterior", positive: true, color: "bg-blue-500/15 text-blue-500", delay: 500 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, i) => (
        <SummaryCard key={i} {...card} />
      ))}
    </div>
  );
}