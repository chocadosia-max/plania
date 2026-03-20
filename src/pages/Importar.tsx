"use client";

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Globe, 
  ClipboardList, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck
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
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

type ImportSource = 'excel' | 'google' | 'notion' | 'csv' | 'other' | null;
type ImportStep = 'source' | 'upload' | 'adapting';

export default function Importar() {
  const [step, setStep] = useState<ImportStep>('source');
  const [source, setSource] = useState<ImportSource>(null);
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const { importData, transactions } = usePlanIA();
  const navigate = useNavigate();

  const handleSourceSelect = (src: ImportSource) => {
    setSource(src);
    setStep('upload');
  };

  const handleDataLoaded = (data: any[]) => {
    setPendingData(data);
    if (transactions.length > 0) {
      setShowConflictModal(true);
    } else {
      setStep('adapting');
    }
  };

  const handleAdaptationComplete = () => {
    if (pendingData) {
      importData(pendingData, 'replace');
      navigate('/dashboard');
      toast.success("Sistema adaptado com sucesso! 🚀");
    }
  };

  const handleConflictChoice = (mode: 'add' | 'replace') => {
    setShowConflictModal(false);
    if (pendingData) {
      importData(pendingData, mode);
      setStep('adapting');
    }
  };

  const handleBack = () => {
    if (step === 'upload') setStep('source');
  };

  if (step === 'adapting') {
    return <AutoAdaptationLoading onComplete={() => navigate('/dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-12 animate-reveal">
        <div className="flex items-center gap-4">
          {step !== 'source' && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              {step === 'source' ? "De onde vêm seus dados?" : "Importar Planilha"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {step === 'source' 
                ? "Escolha a origem da sua planilha e traga todo seu histórico para o PlanIA"
                : `Fluxo de importação via ${source?.toUpperCase()}`}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        {step === 'source' && <SourceSelection onSelect={handleSourceSelect} />}
        {step === 'upload' && (
          <>
            {source === 'excel' && <ExcelFlow onNext={handleDataLoaded} />}
            {source === 'google' && <GoogleSheetsFlow onNext={handleDataLoaded} />}
            {source === 'notion' && <NotionFlow onNext={handleDataLoaded} />}
            {source === 'csv' && <CSVFlow onNext={handleDataLoaded} />}
          </>
        )}
      </div>

      <div className="mt-16 flex items-center justify-center gap-2 text-muted-foreground text-xs animate-reveal" style={{ animationDelay: '400ms' }}>
        <ShieldCheck className="w-4 h-4 text-green-500" />
        <span>Seus dados são processados localmente. Nada é enviado para nossos servidores.</span>
      </div>

      {/* Conflict Modal */}
      <Dialog open={showConflictModal} onOpenChange={setShowConflictModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detectamos dados existentes</DialogTitle>
            <DialogDescription>
              Você já possui transações no PlanIA. Como deseja prosseguir com a nova importação?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button variant="outline" className="justify-start h-auto p-4 text-left" onClick={() => handleConflictChoice('add')}>
              <div>
                <p className="font-bold">Adicionar apenas novas</p>
                <p className="text-xs text-muted-foreground">Recomendado. Mantém seus dados atuais e adiciona o que for novo.</p>
              </div>
            </Button>
            <Button variant="destructive" className="justify-start h-auto p-4 text-left" onClick={() => handleConflictChoice('replace')}>
              <div>
                <p className="font-bold">Substituir tudo</p>
                <p className="text-xs text-muted-foreground">Cuidado! Apaga todos os dados atuais e substitui pelo novo arquivo.</p>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConflictModal(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SourceSelection({ onSelect }: { onSelect: (src: ImportSource) => void }) {
  const sources = [
    { id: 'excel', title: 'Microsoft Excel', desc: 'Arquivos .xlsx ou .xls', icon: FileSpreadsheet, badge: 'Mais popular', color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'google', title: 'Google Sheets', desc: 'Cole o link da planilha', icon: Globe, badge: 'Gratuito e fácil', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'notion', title: 'Notion', desc: 'Exporte e importe seu database', icon: ClipboardList, badge: 'Para organizados', color: 'text-foreground', bg: 'bg-muted' },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-6">
      {sources.map((s, i) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id as ImportSource)}
          className="group relative flex flex-col items-center text-center p-8 rounded-3xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 active:scale-[0.98] animate-reveal"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {s.badge && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
              {s.badge}
            </span>
          )}
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3", s.bg, s.color)}>
            <s.icon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold mb-1">{s.title}</h3>
          <p className="text-xs text-muted-foreground">{s.desc}</p>
        </button>
      ))}
    </div>
  );
}