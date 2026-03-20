"use client";

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Globe, 
  ClipboardList, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExcelFlow } from "@/components/import/ExcelFlow";
import { GoogleSheetsFlow } from "@/components/import/GoogleSheetsFlow";
import { NotionFlow } from "@/components/import/NotionFlow";
import { CSVFlow } from "@/components/import/CSVFlow";
import { MappingStep } from "@/components/import/MappingStep";
import { CategorizationStep } from "@/components/import/CategorizationStep";
import { ConfirmationStep } from "@/components/import/ConfirmationStep";

type ImportSource = 'excel' | 'google' | 'notion' | 'csv' | 'other' | null;
type ImportStep = 'source' | 'upload' | 'mapping' | 'categorization' | 'confirmation';

export default function Importar() {
  const [step, setStep] = useState<ImportStep>('source');
  const [source, setSource] = useState<ImportSource>(null);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [mappedData, setMappedData] = useState<any[]>([]);

  const handleSourceSelect = (src: ImportSource) => {
    setSource(src);
    setStep('upload');
  };

  const handleBack = () => {
    if (step === 'upload') setStep('source');
    else if (step === 'mapping') setStep('upload');
    else if (step === 'categorization') setStep('mapping');
    else if (step === 'confirmation') setStep('categorization');
  };

  const renderStep = () => {
    switch (step) {
      case 'source':
        return <SourceSelection onSelect={handleSourceSelect} />;
      case 'upload':
        if (source === 'excel') return <ExcelFlow onNext={(data) => { setImportedData(data); setStep('mapping'); }} />;
        if (source === 'google') return <GoogleSheetsFlow onNext={(data) => { setImportedData(data); setStep('mapping'); }} />;
        if (source === 'notion') return <NotionFlow onNext={(data) => { setImportedData(data); setStep('mapping'); }} />;
        if (source === 'csv') return <CSVFlow onNext={(data) => { setImportedData(data); setStep('mapping'); }} />;
        return null;
      case 'mapping':
        return <MappingStep data={importedData} onNext={(data) => { setMappedData(data); setStep('categorization'); }} />;
      case 'categorization':
        return <CategorizationStep data={mappedData} onNext={(data) => { setMappedData(data); setStep('confirmation'); }} />;
      case 'confirmation':
        return <ConfirmationStep data={mappedData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 max-w-5xl mx-auto">
      {/* Header */}
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
        
        {step !== 'source' && (
          <div className="hidden sm:flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i} 
                className={cn(
                  "w-8 h-1.5 rounded-full transition-all duration-500",
                  i <= ['upload', 'mapping', 'categorization', 'confirmation'].indexOf(step) + 1 
                    ? "bg-primary" 
                    : "bg-muted"
                )} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative">
        {renderStep()}
      </div>

      {/* Security Note */}
      {step === 'source' && (
        <div className="mt-16 flex items-center justify-center gap-2 text-muted-foreground text-xs animate-reveal" style={{ animationDelay: '400ms' }}>
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Seus dados são processados localmente. Nada é enviado para nossos servidores.</span>
        </div>
      )}
    </div>
  );
}

function SourceSelection({ onSelect }: { onSelect: (src: ImportSource) => void }) {
  const sources = [
    { id: 'excel', title: 'Microsoft Excel', desc: 'Arquivos .xlsx ou .xls', icon: FileSpreadsheet, badge: 'Mais popular', color: 'text-green-500', bg: 'bg-green-500/10' },
    { id: 'google', title: 'Google Sheets', desc: 'Cole o link da planilha', icon: Globe, badge: 'Gratuito e fácil', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'notion', title: 'Notion', desc: 'Exporte e importe seu database', icon: ClipboardList, badge: 'Para organizados', color: 'text-foreground', bg: 'bg-muted' },
  ];

  const secondary = [
    { id: 'csv', title: 'CSV / Extrato', icon: FileText },
    { id: 'other', title: 'Outro formato', icon: FileSpreadsheet },
  ];

  return (
    <div className="space-y-8">
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
            <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold">
                Selecionar <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-reveal" style={{ animationDelay: '300ms' }}>
        {secondary.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id as ImportSource)}
            className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <s.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold">{s.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}