"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CategorizationStepProps {
  data: any[];
  onNext: (data: any[]) => void;
}

export function CategorizationStep({ data, onNext }: CategorizationStepProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Analisando descrições...");

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (prev > 30) setStatus("Categorizando transações...");
        if (prev > 70) setStatus("Identificando padrões...");
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    // IA Simulation: Add categories to data
    const categorized = data.map(row => {
      const desc = String(row.desc).toLowerCase();
      let cat = "Outros";
      if (desc.includes("mercado") || desc.includes("extra") || desc.includes("carrefour")) cat = "Mercado";
      else if (desc.includes("uber") || desc.includes("99") || desc.includes("posto")) cat = "Transporte";
      else if (desc.includes("ifood") || desc.includes("restaurante") || desc.includes("pizza")) cat = "Alimentação";
      else if (desc.includes("aluguel") || desc.includes("condominio")) cat = "Moradia";
      return { ...row, cat };
    });
    onNext(categorized);
  };

  return (
    <div className="max-w-xl mx-auto space-y-12 py-12 animate-reveal text-center">
      <div className="relative inline-block">
        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        <div className="relative w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-12 h-12 text-primary animate-bounce" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-black">Categorização com IA</h2>
        <p className="text-muted-foreground">Estamos analisando suas transações para organizar tudo automaticamente.</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-primary">
          <span>{status}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-3 bg-muted" />
      </div>

      {progress === 100 && (
        <div className="animate-check-bounce">
          <div className="flex items-center justify-center gap-2 text-green-500 font-bold mb-8">
            <CheckCircle2 className="w-5 h-5" /> Tudo pronto! Categorizamos {data.length} itens.
          </div>
          <Button size="lg" className="px-12 rounded-2xl h-14 text-lg font-bold gap-2" onClick={handleNext}>
            Ver Resumo <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}