"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileSpreadsheet, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { varrerPlanilha, detectarColunas, extrairDados } from "@/lib/import-engine";

interface ExcelFlowProps {
  onNext: (data: any[]) => void;
}

export function ExcelFlow({ onNext }: ExcelFlowProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      // 1. Varredura completa
      const todasAbas = await varrerPlanilha(file);
      
      // 2. Pega a primeira aba com dados
      const nomeAba = Object.keys(todasAbas)[0];
      const linhas = todasAbas[nomeAba].raw;
      
      console.log(`Processando aba: ${nomeAba} com ${linhas.length} linhas`);
      
      // 3. Detecta colunas reais
      const mapa = detectarColunas(linhas);
      
      if (!mapa?.valor && !mapa?.descricao) {
        toast.error("Não encontramos colunas de valor ou descrição. Verifique o arquivo.");
        setLoading(false);
        return;
      }
      
      // 4. Extrai dados reais
      const transacoes = extrairDados(linhas, mapa);
      
      if (transacoes.length === 0) {
        toast.error("Nenhum dado válido encontrado na planilha.");
        setLoading(false);
        return;
      }

      toast.success(`${transacoes.length} transações detectadas com sucesso! 📗`);
      onNext(transacoes);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao processar a planilha. Verifique o formato.");
    } finally {
      setLoading(false);
    }
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
              <Loader2 className="w-5 h-5 animate-spin" /> Fazendo varredura total...
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
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Varredura Inteligente</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-green-500" /> Detecção de Colunas</span>
            </div>
          </>
        )}
      </div>

      <div className="bg-muted/30 rounded-2xl p-6 flex items-start gap-4 border border-border/40">
        <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-bold">Varredura Total Ativada</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Nossa IA agora analisa cada célula da sua planilha para encontrar os dados, não importa o nome das colunas ou o formato das datas.
          </p>
        </div>
      </div>
    </div>
  );
}