"use client";

import React, { useState } from 'react';
import { 
  FileSpreadsheet, Globe, ClipboardList, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExcelFlow } from "@/components/import/ExcelFlow";
import { GoogleSheetsFlow } from "@/components/import/GoogleSheetsFlow";
import { NotionFlow } from "@/components/import/NotionFlow";
import { CSVFlow } from "@/components/import/CSVFlow";
import { AutoAdaptationLoading } from "@/components/import/AutoAdaptationLoading";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { useNavigate } from 'react-router-dom';
import { analisarPlanilha, AnalysisResult } from "@/lib/analyzer";

type ImportSource = 'excel' | 'google' | 'notion' | 'csv' | null;
type ImportStep = 'source' | 'upload' | 'analysis' | 'adapting';

export default function Importar() {
  const [step, setStep] = useState<ImportStep>('source');
  const [source, setSource] = useState<ImportSource>(null);
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { importData, setAnalysis } = usePlanIA();
  const navigate = useNavigate();

  const handleSourceSelect = (src: ImportSource) => {
    setSource(src);
    setStep('upload');
  };

  const handleDataLoaded = (data: any[]) => {
    const result = analisarPlanilha(data);
    setPendingData(data);
    setAnalysisResult(result);
    setAnalysis(result);
    setStep('analysis');
  };

  const handleConfirm = () => {
    setStep('adapting');
  };

  const handleAdaptationComplete = () => {
    if (pendingData) {
      importData(pendingData, 'replace');
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
            <h1 className="text-3xl font-black tracking-tight">
              {step === 'source' ? "De onde vêm seus dados?" : step === 'analysis' ? "Análise da Planilha" : "Importar Planilha"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === 'source' ? "Escolha a origem e traga seu histórico" : "O PlanIA está pronto para se adaptar"}
            </p>
          </div>
        </div>
      </div>

      {step === 'source' && <SourceSelection onSelect={handleSourceSelect} />}
      {step === 'upload' && (
        <div className="animate-reveal">
          {source === 'excel' && <ExcelFlow onNext={handleDataLoaded} />}
          {source === 'google' && <GoogleSheetsFlow onNext={handleDataLoaded} />}
          {source === 'notion' && <NotionFlow onNext={handleDataLoaded} />}
          {source === 'csv' && <CSVFlow onNext={handleDataLoaded} />}
        </div>
      )}
      {step === 'analysis' && analysisResult && (
        <AnalysisSummary result={analysisResult} onConfirm={handleConfirm} />
      )}

      <div className="mt-16 flex items-center justify-center gap-2 text-muted-foreground text-xs">
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span>Processamento local e seguro. Seus dados não saem do seu navegador.</span>
      </div>
    </div>
  );
}

function SourceSelection({ onSelect }: { onSelect: (src: ImportSource) => void }) {
  const sources = [
    { id: 'excel', title: 'Microsoft Excel', desc: 'Arquivos .xlsx ou .xls', icon: FileSpreadsheet, color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'google', title: 'Google Sheets', desc: 'Cole o link da planilha', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'notion', title: 'Notion', desc: 'Exporte e importe seu database', icon: ClipboardList, color: 'text-foreground', bg: 'bg-muted' },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {sources.map((s, i) => (
        <button key={s.id} onClick={() => onSelect(s.id as ImportSource)} className="group flex flex-col items-center text-center p-8 rounded-3xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6", s.bg, s.color)}>
            <s.icon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-1">{s.title}</h3>
          <p className="text-xs text-muted-foreground">{s.desc}</p>
        </button>
      ))}
    </div>
  );
}

function AnalysisSummary({ result, onConfirm }: { result: AnalysisResult, onConfirm: () => void }) {
  const items = [
    { show: result.temTransacoes, label: `${result.contagem.transacoes} transações`, target: "Aba Transações" },
    { show: result.temMetas, label: `${result.contagem.metas} metas`, target: "Aba Metas" },
    { show: result.temOrcamentos, label: `${result.contagem.orcamentos} orçamentos`, target: "Aba Orçamentos" },
    { show: result.temInvestimentos, label: `${result.contagem.investimentos} investimentos`, target: "Aba Investimentos" },
    { show: result.temDividas, label: `${result.contagem.dividas} dívidas`, target: "Nova aba: Dívidas", isNew: true },
    { show: result.temEstoque, label: `${result.contagem.estoque} produtos`, target: "Nova aba: Estoque", isNew: true },
    { show: result.temClientes, label: `${result.contagem.clientes} clientes`, target: "Nova aba: Clientes", isNew: true },
    { show: result.temDRE, label: "DRE Completo", target: "Nova aba: DRE", isNew: true },
  ].filter(i => i.show);

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-reveal">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-2xl font-black">Analisamos sua planilha!</h2>
        <p className="text-muted-foreground">Aqui está o que vamos criar para você:</p>
      </div>

      <div className="glass-card rounded-3xl p-6 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="font-bold text-sm">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{item.target}</span>
              {item.isNew && <span className="bg-green-500 text-[8px] text-white font-black px-2 py-0.5 rounded-full animate-pulse">NOVO</span>}
            </div>
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl" onClick={onConfirm}>
        Criar tudo automaticamente 🚀
      </Button>
    </div>
  );
}