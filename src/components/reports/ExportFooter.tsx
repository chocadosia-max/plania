"use client";

import React, { useState } from 'react';
import { FileText, Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export function ExportFooter() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  const handleGenerate = () => {
    setStatus('loading');
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStatus('done'), 500);
          setTimeout(() => { setStatus('idle'); setProgress(0); }, 4000);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div 
      className="glass-card rounded-2xl p-8 border-primary/20 bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6"
      style={{ animation: "reveal 0.8s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "1200ms" }}
    >
      <div className="flex items-center gap-5 text-center md:text-left">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Gerar relatório completo personalizado</h3>
          <p className="text-sm text-muted-foreground mt-1">Exporta todos os dados com análise da IA em PDF bonito e pronto para impressão.</p>
        </div>
      </div>

      <div className="w-full md:w-auto min-w-[240px] space-y-3">
        {status === 'idle' && (
          <Button onClick={handleGenerate} size="lg" className="w-full gap-2 text-base font-bold shadow-lg shadow-primary/20">
            Gerar PDF Completo <Download className="w-5 h-5" />
          </Button>
        )}
        
        {status === 'loading' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Preparando seu relatório...
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {status === 'done' && (
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-green-500/10 text-green-500 font-bold animate-check-bounce">
            <CheckCircle2 className="w-5 h-5" /> Relatório pronto! Download iniciado.
          </div>
        )}
      </div>
    </div>
  );
}