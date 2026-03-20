"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDadosFinanceiros, Periodo } from "@/hooks/useDadosFinanceiros";

// Components específicos de relatórios
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { EvolutionChart } from "@/components/reports/EvolutionChart";
import { CategoryCharts } from "@/components/reports/CategoryCharts";
import { ComparisonChart } from "@/components/reports/ComparisonChart";
import { AIInsightsSection } from "@/components/reports/AIInsightsSection";
import { ExportFooter } from "@/components/reports/ExportFooter";

const periods = [
  { id: 'mes', label: 'Este mês' },
  { id: 'ano', label: 'Este ano' },
];

const Relatorios = () => {
  const [activePeriod, setActivePeriod] = useState<'mes' | 'ano'>('mes');
  const [selectedDate] = useState(new Date());

  const periodo: Periodo = {
    tipo: activePeriod,
    mes: selectedDate.getMonth(),
    ano: selectedDate.getFullYear()
  };

  const dados = useDadosFinanceiros(periodo);

  const handleExport = (type: string) => {
    if (type === 'PDF') window.print();
    else toast.success(`Exportando relatório em ${type}... 🚀`);
  };

  // Adaptação dos dados para os componentes existentes
  const reportData = {
    receitas: dados.receitas,
    gastos: dados.gastos,
    saldo: dados.saldo,
    porCategoria: dados.porCategoria,
    totalTransacoes: dados.totalTransacoes,
    taxaEconomia: dados.economia,
    maiorGasto: dados.transacoes
      .filter(t => t.tipo !== "receita" && t.tipo !== "entrada")
      .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))[0]
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-reveal">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
              {activePeriod === 'mes' ? 'Mensal' : 'Anual'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Análise baseada em {dados.totalTransacoes} transações reais</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex p-1 bg-muted/50 rounded-xl border border-border/40">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePeriod(p.id as 'mes' | 'ano')}
                className={cn(
                  "px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all",
                  activePeriod === p.id 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[11px] font-bold" onClick={() => handleExport('Excel')}>
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-[11px] font-bold" onClick={() => handleExport('PDF')}>
              <FileText className="w-3.5 h-3.5 text-red-400" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-[11px] font-bold" onClick={() => handleExport('Compartilhar')}>
              <Share2 className="w-3.5 h-3.5 text-primary" /> Compartilhar
            </Button>
          </div>
        </div>
      </div>

      <ReportSummaryCards data={reportData} />
      <EvolutionChart />
      <CategoryCharts />
      <ComparisonChart />
      <AIInsightsSection />
      <ExportFooter />
    </div>
  );
};

export default Relatorios;