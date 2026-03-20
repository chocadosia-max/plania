"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const data = [
  { cat: 'Moradia', atual: 1800, anterior: 1400 },
  { cat: 'Alimentação', atual: 850, anterior: 700 },
  { cat: 'Transporte', atual: 380, anterior: 300 },
  { cat: 'Lazer', atual: 270, anterior: 200 },
  { cat: 'Saúde', atual: 120, anterior: 150 },
  { cat: 'Outros', atual: 200, anterior: 250 },
];

export function ComparisonChart() {
  return (
    <div className="glass-card rounded-xl p-6" style={{ animation: "reveal 0.7s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "900ms" }}>
      <h3 className="text-sm font-bold text-foreground mb-6">Este período vs Período Anterior</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="cat" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: 11, paddingBottom: 20 }} />
            <Bar 
              name="Período Anterior" 
              dataKey="anterior" 
              fill="hsl(var(--muted-foreground))" 
              fillOpacity={0.3} 
              radius={[4, 4, 0, 0]} 
              animationDuration={1200}
              animationEasing="cubic-bezier(0.34, 1.56, 0.64, 1)"
            />
            <Bar 
              name="Período Atual" 
              dataKey="atual" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1200}
              animationBegin={200}
              animationEasing="cubic-bezier(0.34, 1.56, 0.64, 1)"
            >
              {data.map((entry, index) => {
                const diff = ((entry.atual - entry.anterior) / entry.anterior) * 100;
                const color = diff > 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Diff Badges */}
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {data.map((d, i) => {
          const diff = ((d.atual - d.anterior) / d.anterior) * 100;
          const isBetter = diff < 0; // Para gastos, menor é melhor
          return (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground mb-1">{d.cat}</span>
              <div className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                isBetter ? "bg-green-500/10 text-green-500" : "bg-red-400/10 text-red-400"
              )}>
                {diff > 0 ? '+' : ''}{diff.toFixed(0)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}