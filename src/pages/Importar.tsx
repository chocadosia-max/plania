"use client";

import React, { useState } from 'react';
import { 
  FileSpreadsheet, Globe, ClipboardList, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExcelFlow } from "@/components/import/ExcelFlow";
import { AutoAdaptationLoading } from "@/components/import/AutoAdaptationLoading";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { useNavigate } from 'react-router-dom';
import { processarPlanilhaEspecializada } from "@/lib/import-engine";

export default function Importar() {
  const [step, setStep] = useState<'source' | 'upload' | 'analysis' | 'adapting'>('source');
  const [pendingData, setPendingData] = useState<any>(null);
  const { importData } = usePlanIA();
  const navigate = useNavigate();

  const handleDataLoaded = async (file: File) => {
    const data = await processarPlanilhaEspecializada(file);
    setPendingData(data);
    setStep('analysis');
  };

  const handleConfirm = () => {
    setStep('adapting');
  };

  const handleAdaptationComplete = () => {
    if (pendingData) {
      importData(pendingData);
      navigate('/dashboard');
    }
  };

  if (step === 'adapting') {
    return <AutoAdaptationLoading onComplete={handleAdaptationComplete} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12 animate-reveal">
        <div className="flex items-center gap-4">
          {step !== 'source' && (
            <Button variant="ghost" size="icon" onClick={() => setStep('source')} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tight">Importar Planilha 2026</h1>
            <p className="text-muted-foreground text-sm">Sincronização ultra-precisa com sua estrutura</p>
          </div>
        </div>
      </div>

      {step === 'source' && (
        <div className="max-w-md mx-auto">
          <button onClick={() => setStep('upload')} className="w-full group flex flex-col items-center text-center p-12 rounded-3xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all">
            <div className="w-20 h-20 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6">
              <FileSpreadsheet className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">Selecionar FINANÇAS_2026.xlsx</h3>
            <p className="text-sm text-muted-foreground">O PlanIA lerá todas as abas mensais, dívidas e alunos.</p>
          </button>
        </div>
      )}

      {step === 'upload' && (
        <div className="animate-reveal">
          <ExcelFlow onNext={(data) => handleDataLoaded(data as any)} />
        </div>
      )}

      {step === 'analysis' && pendingData && (
        <div className="max-w-2xl mx-auto space-y-8 animate-reveal">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-black">Planilha Analisada!</h2>
            <p className="text-muted-foreground">Confira a validação dos totais mensais:</p>
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-3">
            {pendingData.validacao.slice(0, 4).map((v, i) => {
              const diff = Math.abs(v.saldo - v.planilha.saldo);
              const isOk = diff < 1;
              return (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    {isOk ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                    <span className="font-bold text-sm">{v.mes}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-muted-foreground">Saldo Calculado</p>
                    <p className={cn("text-sm font-black", isOk ? "text-foreground" : "text-amber-500")}>
                      R$ {v.saldo.toLocaleString('pt-BR')}
                    </p>
                    {!isOk && <p className="text-[8px] text-amber-500">Planilha: R$ {v.planilha.saldo.toLocaleString('pt-BR')}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl" onClick={handleConfirm}>
            Confirmar e Sincronizar 🚀
          </Button>
        </div>
      )}
    </div>
  );
}