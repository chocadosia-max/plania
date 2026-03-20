"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Treemap } from 'recharts';
import { cn } from "@/lib/utils";

const stackedData = [
  { name: 'Jan', Moradia: 1400, Alimentação: 850, Transporte: 380, Lazer: 280, Outros: 290 },
  { name: 'Fev', Moradia: 1350, Alimentação: 700, Transporte: 300, Lazer: 200, Outros: 250 },
  { name: 'Mar', Moradia: 1800, Alimentação: 850, Transporte: 380, Lazer: 270, Outros: 200 },
];

const treemapData = [
  { name: 'Moradia', size: 2800, fill: 'hsl(var(--chart-1))' },
  { name: 'Alimentação', size: 1200, fill: 'hsl(var(--chart-2))' },
  { name: 'Transporte', size: 650, fill: 'hsl(var(--chart-3))' },
  { name: 'Lazer', size: 480, fill: 'hsl(var(--chart-4))' },
  { name: 'Saúde', size: 320, fill: 'hsl(var(--chart-5))' },
  { name: 'Outros', size: 370, fill: 'hsl(var(--chart-1))' },
];

const colors: Record<string, string> = {
  Moradia: 'hsl(var(--chart-1))',
  Alimentação: 'hsl(var(--chart-2))',
  Transporte: 'hsl(var(--chart-3))',
  Lazer: 'hsl(var(--chart-4))',
  Outros: 'hsl(var(--chart-5))',
};

const CustomizedContent = (props: any) => {
  const { x, y, width, height, name, size } = props;
  if (width < 40 || height < 30) return null;
  return (
    <g>
      <rect 
        x={x} y={y} width={width} height={height} 
        fill={props.fill} stroke="hsl(var(--background))" strokeWidth={2} rx={4}
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
      {width > 60 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={11} fontWeight="bold">
          {name}
        </text>
      )}
    </g>
  );
};

export function CategoryCharts() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Stacked Bar */}
      <div className="glass-card rounded-xl p-6" style={{ animation: "reveal 0.7s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "700ms" }}>
        <h3 className="text-sm font-bold text-foreground mb-4">Gastos por Categoria ao Longo do Tempo</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(colors).map(cat => (
            <button 
              key={cat} 
              onClick={() => toggle(cat)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full border transition-all flex items-center gap-1.5",
                hidden.has(cat) ? "opacity-40 border-border" : "border-border/60 bg-muted/30"
              )}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: colors[cat] }} />
              {cat}
            </button>
          ))}
        </div>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stackedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
              />
              {Object.keys(colors).map((cat, i) => (
                !hidden.has(cat) && (
                  <Bar 
                    key={cat} 
                    dataKey={cat} 
                    stackId="a" 
                    fill={colors[cat]} 
                    radius={i === Object.keys(colors).length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    animationDuration={1000}
                    animationBegin={i * 100}
                  />
                )
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Treemap */}
      <div className="glass-card rounded-xl p-6" style={{ animation: "reveal 0.7s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "800ms" }}>
        <h3 className="text-sm font-bold text-foreground mb-4">Onde Seu Dinheiro Foi</h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="none"
              content={<CustomizedContent />}
              animationDuration={1000}
            >
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const total = treemapData.reduce((acc, curr) => acc + curr.size, 0);
                    const pct = ((data.size / total) * 100).toFixed(1);
                    return (
                      <div className="glass-card p-2 border border-border/50 text-[11px] shadow-xl">
                        <p className="font-bold">{data.name}</p>
                        <p className="text-muted-foreground">R$ {data.size.toLocaleString('pt-BR')} ({pct}%)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </Treemap>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}