"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { FileText, Upload, Loader2, CheckCircle2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CSVFlowProps {
  onNext: (data: any[]) => void;
}

export function CSVFlow({ onNext }: CSVFlowProps) {
  const [loading, setLoading] = useState(false);

  const detectBank = (headers: string[]) => {
    const headerStr = headers.join(',').toLowerCase();
    if (headerStr.includes('data,valor,identificador,descrição')) return 'Nubank';
    if (headerStr.includes('data lançamento,histórico,valor')) return 'Itaú';
    if (headerStr.includes('data,descrição do lançamento,valor (r$),natureza')) return 'Bradesco';
    if (headerStr.includes('data,histórico,documento,valor')) return 'Banco do Brasil';
    return null;
  };

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
        
        if (data.length > 0) {
          const headers = Object.keys(data[0] as object);
          const bank = detectBank(headers);
          if (bank) {
            toast.success(`Detectamos que este arquivo parece ser um extrato do ${bank}. ✅`);
          }
        }

        setLoading(false);
        onNext(data);
      } catch (err) {
        setLoading(false);
        toast.error("Erro ao ler o arquivo CSV.");
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
    <div className="max-w-xl mx-auto space-y-8 animate-reveal">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative h-[280px] rounded-[2.5rem] border-4 border-dashed transition-all duration-500 flex flex-col items-center justify-center text-center p-8 cursor-pointer group",
          isDragActive 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border hover:border-primary/40 hover:bg-primary/5"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="relative mb-6">
          <FileText className={cn(
            "w-16 h-16 text-muted-foreground relative transition-transform duration-700",
            isDragActive ? "scale-125 text-primary" : "group-hover:scale-110 group-hover:-translate-y-2"
          )} />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-lg font-bold">
            <Loader2 className="w-5 h-5 animate-spin" /> Lendo extrato...
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Arraste seu extrato CSV aqui</h3>
            <p className="text-sm text-muted-foreground">Compatível com Nubank, Itaú, Bradesco e outros</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {['Nubank', 'Itaú', 'Bradesco', 'Inter'].map((bank) => (
          <div key={bank} className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/40">
            <Landmark className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">{bank}</span>
          </div>
        ))}
      </div>
    </div>
  );
}