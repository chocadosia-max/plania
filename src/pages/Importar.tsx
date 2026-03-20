"use client";

import React, { useState } from 'react';
import { 
  FileSpreadsheet, Globe, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, AlertTriangle, Cloud, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExcelFlow } from "@/components/import/ExcelFlow";
import { GoogleSheetsFlow } from "@/components/import/GoogleSheetsFlow";
import { AutoAdaptationLoading } from "@/components/import/AutoAdaptationLoading";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { useNavigate } from 'react-router-dom';
import { processarPlanilhaEspecializada } from "@/lib/import-engine";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Importar() {
  const [step, setStep] = useState<'source' | 'upload-excel' | 'upload-gsheets' | 'analysis' | 'adapting'>('source');
  const [pendingData, setPendingData] = useState<any>(null);
  const { importData, clearAllData } = usePlanIA();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-12 gap-4 animate-reveal">
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

        {step === 'source' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" /> Limpar dados atuais
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resetar tudo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso apagará todas as transações, metas e configurações atuais para você começar do zero.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllData} className="bg-destructive text-white hover:bg-destructive/90">
                  Sim, limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {step === 'source' && (
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <button 
            onClick={() => setStep('upload-excel')} 
            className="group flex flex-col items-center text-center p-10 rounded-3xl border-2 border-border hover:border-green-500/50 hover:bg-green-500/5 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Arquivo Excel</h3>
            <p className="text-xs text-muted-foreground">Upload manual do seu arquivo .xlsx ou .xls</p>
          </button>

          <button 
            onClick={() => setStep('upload-gsheets')} 
            className="group flex flex-col items-center text-center p-10 rounded-3xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold mb-2">Google Sheets</h3>
            <p className="text-xs text-muted-foreground">Sincronize via link direto da nuvem</p>
          </button>
        </div>
      )}

      {step === 'upload-excel' && (
        <div className="animate-reveal">
          <ExcelFlow onNext={(data) => handleDataLoaded(data as any)} />
        </div>
      )}

      {step === 'upload-gsheets' && (
        <div className="animate-reveal">
          <GoogleSheetsFlow onNext={(data) => handleDataLoaded(data as any)} />
        </div>
      )}

      {step === 'analysis' && pendingData && (
        <div className="max-w-2xl mx-auto space-y-8 animate-reveal">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-black">Planilha Analisada!</h2>
            <p className="text-muted-foreground">Confira a validação dos totais mensais detectados:</p>
          </div>

          <div className="glass-card rounded-3xl p-6 space-y-3">
            {pendingData.validacao.length > 0 ? (
              pendingData.validacao.slice(0, 6).map((v: any, i: number) => {
                const diff = Math.abs(v.saldo - v.planilha.saldo);
                const isOk = diff < 1;
                return (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40">
                    <div className="flex items-center gap-3">
                      {isOk ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-amber-500" />}
                      <span className="font-bold text-sm">{v.mes}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">Saldo Calculado</p>
                      <p className={cn("text-sm font-black", isOk ? "text-foreground" : "text-amber-500")}>
                        R$ {v.saldo.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Nenhuma aba mensal (JAN26, FEV26...) foi detectada. Verifique os nomes das abas.
              </div>
            )}
          </div>

          <Button 
            size="lg" 
            className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl" 
            onClick={handleConfirm}
            disabled={pendingData.transacoes.length === 0}
          >
            Confirmar e Sincronizar 🚀
          </Button>
        </div>
      )}
    </div>
  );
}