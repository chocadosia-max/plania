"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { ClipboardList, Upload, Loader2, CheckCircle2, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NotionFlowProps {
  onNext: (data: any[]) => void;
}

export function NotionFlow({ onNext }: NotionFlowProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const workbook = XLSX.read(csvText, { type: 'string' });
        const sheetName = workbook.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        setLoading(false);
        toast.success("Dados do Notion carregados! 📋");
        onNext(data);
      } catch (err) {
        setLoading(false);
        toast.error("Erro ao ler o arquivo CSV do Notion.");
      }
    };

    reader.readAsText(file);
  }, [onNext]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-reveal">
      {/* Tutorial */}
      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { step: 1, title: "Abra seu Database", desc: "No Notion, abra sua tabela de finanças e clique nos '...' no canto superior direito." },
          { step: 2, title: "Exportar para CSV", desc: "Clique em 'Exportar', escolha o formato 'CSV' e clique no botão de exportar." },
          { step: 3, title: "Upload do Arquivo", desc: "Arraste o arquivo .csv gerado para a área abaixo para processarmos." }
        ].map((s) => (
          <div key={s.step} className="glass-card rounded-2xl p-6 space-y-4 border-border/40">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
              {s.step}
            </div>
            <h4 className="font-bold text-sm">{s.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Upload Area */}
      <div 
        {...getRootProps()} 
        className={cn(
          "relative h-[220px] rounded-[2rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center p-8 cursor-pointer group",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="relative mb-4">
          <ClipboardList className={cn(
            "w-12 h-12 text-muted-foreground relative transition-transform duration-700",
            isDragActive ? "scale-125 text-primary" : "group-hover:scale-110 group-hover:text-primary"
          )} />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-lg font-bold">
            <Loader2 className="w-5 h-5 animate-spin" /> Processando Notion...
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1">Arraste seu CSV do Notion aqui</h3>
            <p className="text-xs text-muted-foreground">ou clique para selecionar</p>
          </>
        )}
      </div>

      {/* Notion Tip */}
      <div className="bg-primary/5 rounded-2xl p-6 flex items-start gap-4 border border-primary/20">
        <Lightbulb className="w-6 h-6 text-primary shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-primary">Dica Especial para Notion</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O Notion exporta com colunas personalizadas como "Quanto gastei" ou "O que comprei". 
            Nossa IA vai identificar automaticamente quais são suas colunas de data, valor e descrição — mesmo com nomes diferentes do padrão.
          </p>
        </div>
      </div>
    </div>
  );
}