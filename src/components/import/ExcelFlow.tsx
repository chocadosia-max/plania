"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExcelFlowProps {
  onNext: (file: File) => void;
}

export function ExcelFlow({ onNext }: ExcelFlowProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    // Apenas passamos o arquivo para o Importar.tsx processar com o motor especializado
    onNext(file);
  }, [onNext]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-reveal">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative h-[280px] rounded-[2.5rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center p-8 cursor-pointer group",
          isDragActive 
            ? "border-green-500 bg-green-500/5 scale-[1.02]" 
            : "border-border hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <FileSpreadsheet className={cn(
            "w-16 h-16 text-green-500 relative transition-transform duration-700",
            isDragActive ? "scale-125 rotate-12" : "group-hover:scale-110 group-hover:-translate-y-2"
          )} />
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Preparando leitura...
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Arraste seu arquivo Excel aqui</h3>
            <p className="text-sm text-muted-foreground">ou clique para selecionar (.xlsx, .xls)</p>
            <div className="mt-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Varredura Especializada</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Estrutura 2026</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-muted/30 rounded-2xl p-6 flex items-start gap-4 border border-border/40">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold">Motor de Precisão Ativado</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O PlanIA agora utiliza o motor de leitura segmentada para identificar Gastos Fixos, Variáveis e Entradas conforme a estrutura da sua planilha.
          </p>
        </div>
      </div>
    </div>
  );
}