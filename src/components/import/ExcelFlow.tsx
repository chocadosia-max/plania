"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ExcelFlowProps {
  onNext: (data: any[]) => void;
}

export function ExcelFlow({ onNext }: ExcelFlowProps) {
  const [loading, setLoading] = useState(false);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<{ name: string; rows: number }[]>([]);
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        setWorkbook(wb);
        
        const sheetInfo = wb.SheetNames.map(name => {
          const sheet = wb.Sheets[name];
          const json = XLSX.utils.sheet_to_json(sheet);
          return { name, rows: json.length };
        });
        
        setSheets(sheetInfo);
        setSelectedSheets(sheetInfo.filter(s => s.rows > 0).map(s => s.name));
        setLoading(false);
        toast.success("Planilha lida com sucesso! 📗");
      } catch (err) {
        setLoading(false);
        toast.error("Erro ao ler o arquivo. Verifique se é um Excel válido.");
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleImport = () => {
    if (!workbook) return;
    
    let allData: any[] = [];
    selectedSheets.forEach(name => {
      const sheet = workbook.Sheets[name];
      const json = XLSX.utils.sheet_to_json(sheet);
      allData = [...allData, ...json];
    });

    onNext(allData);
  };

  if (workbook) {
    return (
      <div className="space-y-8 animate-reveal">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Quais abas você quer importar?</h2>
          <p className="text-sm text-muted-foreground">Encontramos {sheets.length} abas no seu arquivo.</p>
        </div>

        <div className="grid gap-3 max-w-md mx-auto">
          {sheets.map((s) => (
            <button
              key={s.name}
              onClick={() => {
                setSelectedSheets(prev => 
                  prev.includes(s.name) ? prev.filter(n => n !== s.name) : [...prev, s.name]
                );
              }}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                selectedSheets.includes(s.name) 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors",
                  selectedSheets.includes(s.name) ? "bg-primary border-primary" : "border-muted-foreground/30"
                )}>
                  {selectedSheets.includes(s.name) && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <span className="font-bold text-sm">{s.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{s.rows} linhas</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button 
            size="lg" 
            className="px-12 rounded-2xl h-14 text-lg font-bold"
            disabled={selectedSheets.length === 0}
            onClick={handleImport}
          >
            Importar selecionadas ({selectedSheets.length})
          </Button>
        </div>
      </div>
    );
  }

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
              <Loader2 className="w-5 h-5 animate-spin" /> Lendo sua planilha...
            </div>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-[shimmer_1.5s_infinite]" style={{ width: '100%' }} />
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-2">Arraste seu arquivo Excel aqui</h3>
            <p className="text-sm text-muted-foreground">ou clique para selecionar (.xlsx, .xls)</p>
            <div className="mt-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Máx 20MB</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Processamento Local</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-muted/30 rounded-2xl p-6 flex items-start gap-4 border border-border/40">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold">Dica de ouro</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Não se preocupe com a ordem das colunas ou nomes. Nossa IA vai identificar automaticamente o que é valor, data e descrição na próxima etapa.
          </p>
        </div>
      </div>
    </div>
  );
}