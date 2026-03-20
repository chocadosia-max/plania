"use client";

import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface MappingStepProps {
  data: any[];
  onNext: (mappedData: any[]) => void;
}

export function MappingStep({ data, onNext }: MappingStepProps) {
  const headers = Object.keys(data[0] || {});
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // IA Simulation: Auto-detect columns
  useEffect(() => {
    const newMapping: Record<string, string> = {};
    headers.forEach(h => {
      const lower = h.toLowerCase();
      if (lower.includes('data') || lower.includes('quando')) newMapping[h] = 'date';
      else if (lower.includes('valor') || lower.includes('quanto') || lower.includes('preço')) newMapping[h] = 'value';
      else if (lower.includes('desc') || lower.includes('o que') || lower.includes('histórico')) newMapping[h] = 'desc';
      else if (lower.includes('cat') || lower.includes('tipo') || lower.includes('tag')) newMapping[h] = 'cat';
      else newMapping[h] = 'ignore';
    });
    setMapping(newMapping);
  }, [data]);

  const handleNext = () => {
    const mapped = data.map(row => {
      const newRow: any = {};
      Object.entries(mapping).forEach(([original, target]) => {
        if (target !== 'ignore') newRow[target] = row[original];
      });
      return newRow;
    });
    onNext(mapped);
  };

  return (
    <div className="space-y-8 animate-reveal">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Mapeamento Inteligente</h2>
          <p className="text-sm text-muted-foreground">Nossa IA identificou estas colunas. Confirme se está correto.</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border-border/40">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border/40">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Coluna Original</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Exemplo de Dado</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">IA Detectou</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirmar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {headers.map((h) => (
              <tr key={h} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4 font-bold text-sm">{h}</td>
                <td className="px-6 py-4 text-xs text-muted-foreground truncate max-w-[150px]">
                  {String(data[0][h])}
                </td>
                <td className="px-6 py-4">
                  <Select value={mapping[h]} onValueChange={(val) => setMapping(prev => ({ ...prev, [h]: val }))}>
                    <SelectTrigger className="h-9 w-32 text-xs font-bold rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">📅 Data</SelectItem>
                      <SelectItem value="value">💰 Valor</SelectItem>
                      <SelectItem value="desc">📝 Descrição</SelectItem>
                      <SelectItem value="cat">🏷️ Categoria</SelectItem>
                      <SelectItem value="ignore">❌ Ignorar</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-4">
                  {mapping[h] !== 'ignore' ? (
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center pt-4">
        <Button size="lg" className="px-12 rounded-2xl h-14 text-lg font-bold gap-2" onClick={handleNext}>
          Confirmar Mapeamento <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}