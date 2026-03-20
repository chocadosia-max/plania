"use client";

import React, { useState } from 'react';
import { Globe, Link as LinkIcon, Loader2, CheckCircle2, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

interface GoogleSheetsFlowProps {
  onNext: (data: any[]) => void;
}

export function GoogleSheetsFlow({ onNext }: GoogleSheetsFlowProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!url.includes("docs.google.com/spreadsheets")) {
      toast.error("Link inválido. Certifique-se de que é um link do Google Sheets.");
      return;
    }

    setLoading(true);
    try {
      // Se o link não for CSV, tentamos converter para o formato de exportação CSV
      let fetchUrl = url;
      if (!url.includes("output=csv")) {
        const idMatch = url.match(/\/d\/(.*?)(\/|$)/);
        if (idMatch) {
          fetchUrl = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
        }
      }

      const response = await fetch(fetchUrl);
      const csvText = await response.text();
      
      const workbook = XLSX.read(csvText, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

      if (data.length === 0) {
        throw new Error("Planilha vazia ou não acessível.");
      }

      toast.success("Dados obtidos com sucesso! 📊");
      onNext(data);
    } catch (err) {
      toast.error("Erro ao acessar a planilha. Verifique se ela está 'Publicada na Web'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 animate-reveal">
      <div className="grid sm:grid-cols-2 gap-8">
        {/* Instructions */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" /> Como obter o link?
          </h3>
          
          <div className="space-y-4">
            {[
              { step: 1, text: "No Google Sheets, vá em Arquivo → Compartilhar → Publicar na web" },
              { step: 2, text: "Selecione o formato 'Valores separados por vírgula (.csv)'" },
              { step: 3, text: "Clique em Publicar e copie o link gerado" }
            ].map((s) => (
              <div key={s.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {s.step}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <p className="text-[10px] text-muted-foreground italic">
              * Prefere não publicar? Baixe como .xlsx e use a opção de Excel.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="glass-card rounded-3xl p-8 space-y-6 border-primary/20">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Globe className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Link da Planilha</Label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                id="url"
                placeholder="https://docs.google.com/spreadsheets/d/..." 
                className="pl-11 h-14 rounded-xl bg-muted/50 border-none focus-visible:ring-primary/30"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl text-lg font-bold gap-2"
            disabled={!url || loading}
            onClick={handleFetch}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Conectando...
              </>
            ) : (
              <>
                Buscar planilha <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span>Conexão segura via HTTPS</span>
          </div>
        </div>
      </div>
    </div>
  );
}