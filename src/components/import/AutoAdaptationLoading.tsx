"use client";

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const steps = [
  "Lendo sua planilha...",
  "Identificando categorias...",
  "Calculando orçamentos...",
  "Definindo seu perfil...",
  "Criando metas sugeridas...",
  "Preparando seu dashboard..."
];

const messages = [
  "Encontramos centenas de transações 📊",
  "Identificamos categorias únicas 🏷️",
  "Analisando seus maiores gastos 🍕",
  "Calculando médias dos últimos meses...",
  "Detectando padrões de renda 💼",
  "Quase lá! Preparando tudo para você..."
];

export function AutoAdaptationLoading({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 800);
          return 100;
        }
        const next = prev + 0.5;
        const step = Math.floor((next / 100) * steps.length);
        if (step !== currentStep && step < steps.length) {
          setCurrentStep(step);
        }
        return next;
      });
    }, 30);

    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, [currentStep, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Partículas de fundo */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md space-y-12 relative z-10">
        {/* Logo Pulsante */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter">
            Plan<span className="text-primary">IA</span>
          </h1>
        </div>

        {/* Barra de Progresso e Etapas */}
        <div className="space-y-6">
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex items-center gap-3 transition-all duration-500",
                  i < currentStep ? "text-green-500 opacity-100" : 
                  i === currentStep ? "text-primary opacity-100 scale-105 font-bold" : 
                  "text-muted-foreground opacity-40"
                )}
              >
                {i < currentStep ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : i === currentStep ? (
                  <Loader2 className="w-5 h-5 shrink-0 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-current shrink-0" />
                )}
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Progress value={progress} className="h-2 bg-muted" />
            <div className="h-6 overflow-hidden relative">
              {messages.map((msg, i) => (
                <p
                  key={i}
                  className={cn(
                    "absolute inset-0 text-center text-xs text-muted-foreground transition-all duration-500",
                    i === messageIndex ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                >
                  {msg}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}