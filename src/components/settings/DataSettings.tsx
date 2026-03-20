"use client";

import React from 'react';
import { Database, Download, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export function DataSettings() {
  const handleExportExcel = () => toast.success("Exportação Excel iniciada! 📊");
  const handleExportPDF = () => toast.success("Relatório PDF gerado! 📄");
  const handleImportCSV = () => toast.success("Extrato importado com sucesso! ✅");
  const handleClearData = () => {
    localStorage.clear();
    toast.success("Todos os dados foram limpos.");
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <section className="space-y-5 pb-10" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "400ms" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Database className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Dados</h2>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <Button variant="outline" className="gap-2 justify-start" onClick={handleExportExcel}>
            <Download className="w-4 h-4" /> Exportar Excel
          </Button>
          <Button variant="outline" className="gap-2 justify-start" onClick={handleExportPDF}>
            <Download className="w-4 h-4" /> Exportar PDF
          </Button>
          <Button variant="outline" className="gap-2 justify-start" onClick={handleImportCSV}>
            <Upload className="w-4 h-4" /> Importar CSV
          </Button>
        </div>

        <Separator />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="w-4 h-4" /> Limpar todos os dados
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso vai apagar todas as transações, metas, conquistas e configurações. Essa ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sim, apagar tudo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}