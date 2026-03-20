"use client";

import React, { useState } from 'react';
import { Globe, Link as LinkIcon, Loader2, CheckCircle2, HelpCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface GoogleSheetsFlowProps {
  onNext: (file: File) => void;
}

export function GoogleSheetsFlow({ onNext }: GoogleSheetsFlowProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    // Extrai o ID da planilha da URL
    const idMatch = url.match(/\/d\/(.*?)(\/|$)/);
    if (!idMatch) {
      toast.error("Link inválido. Cole a URL da sua planilha do Google.");
      return;
    }

    const spreadsheetId = idMatch[1];
    setLoading(true);

    try {
      // Técnica Moderna: Forçamos o Google a exportar a planilha inteira como XLSX
      // Isso permite que nosso motor leia todas as abas (JAN, FEV, DÍVIDAS) de uma vez
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
      
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error("Não foi possível acessar a planilha. Verifique se ela está compartilhada como 'Qualquer pessoa com o link'.");

      const blob = await response.blob();
      const file = new File([blob], "google-sheets-import.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

      toast.success("Conexão estabelecida! Analisando estrutura... 📊");
      onNext(file);
    } catch (err: any) {
      toast.error(err.message || "Erro ao conectar com o Google Sheets.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-reveal">
      <div className="grid sm:grid-cols-2 gap-8">
        {/* Instruções Modernas */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Sincronização via Nuvem</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { step: 1, text: "Abra sua planilha no Google Sheets" },
              { step: 2, text: "Clique em 'Compartilhar' no canto superior direito" },
              { step: 3, text: "Mude para 'Qualquer pessoa com o link' (Leitor)" },
              { step: 4, text: "Copie a URL do navegador e cole aqui" }
            ].map((s) => (
              <div key={s.step} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {s.step}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
            <p className="text-[10px] text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              O PlanIA lerá automaticamente todas as abas mensais e de dívidas.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="glass-card rounded-3xl p-8 space-y-6 border-primary/20 shadow-2xl shadow-primary/5">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL da Planilha Google</Label>
            <div className="relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                id="url"
                placeholder="https://docs.google.com/spreadsheets/d/..." 
                className="pl-11 h-14 rounded-xl bg-muted/50 border-none focus-visible:ring-primary/30 input-glow"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl text-lg font-black gap-2 shadow-lg shadow-primary/20"
            disabled={!url || loading}
            onClick={handleFetch}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Conectando...
              </>
            ) : (
              <>
                Sincronizar Agora <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span>Acesso seguro via Google API Export</span>
          </div>
        </div>
      </div>
    </div>
  );
}