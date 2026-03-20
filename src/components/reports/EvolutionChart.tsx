"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { name: 'Out', receitas: 4200, gastos: 3100, saldo: 1100 },
  { name: 'Nov', receitas: 4800, gastos: 2900, saldo: 1900 },
  { name: 'Dez', receitas: 4500, gastos: 3400, saldo: 1100 },
  { name: 'Jan', receitas: 5200, gastos: 3200, saldo: 2000 },
  { name: 'Fev', receitas: 4900, gastos: 2800, saldo: 2100 },
  { name: 'Mar', receitas: 5600, gastos: 3500, saldo: 2100 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border/50 shadow-xl rounded-lg text-xs">
        <p className="font-bold mb-2 text-foreground">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-blue-400">
              <div className="w-2 h-2 rounded-full bg-blue-400" /> Receitas
            </span>
            <span className="font-mono-financial font-bold">R$ {payload[0].value.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-red-400">
              <div className="w-2 h-2 rounded-full bg-red-400" /> Gastos
            </span>
            <span className="font-mono-financial font-bold">R$ {payload[1].value.toLocaleString('pt-BR')}</span>
          </div>
          <div className="flex items-center justify-between gap-4 pt-1 border-t border-border/30">
            <span className="flex items-center gap-1.5 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary" /> Saldo
            </span>
            <span className="font-mono-financial font-bold">R$ {payload[2].value.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function EvolutionChart() {
  return (
    <div className="glass-card rounded-xl p-6" style={{ animation: "reveal 0.7s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "600ms" }}>
      <h3 className="text-sm font-bold text-foreground mb-6">Evolução Financeira</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              tickFormatter={(v) => `R$ ${v/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area 
              type="monotone" 
              dataKey="receitas" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorReceitas)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="gastos" 
              stroke="#f87171" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#colorGastos)" 
              animationDuration={1500}
              animationBegin={300}
            />
            <Area 
              type="monotone" 
              dataKey="saldo" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3} 
              fill="none" 
              dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
              animationDuration={1500}
              animationBegin={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}