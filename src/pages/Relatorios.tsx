"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, FileSpreadsheet, FileText, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDadosFinanceiros, Periodo } from "@/hooks/useDadosFinanceiros";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { format, addMonths, subMonths, addYears, subYears } from "date-fns";
import { ptBR } from "date-fns/locale";

// Components específicos de relatórios
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { EvolutionChart } from "@/components/reports/EvolutionChart";
import { CategoryCharts } from "@/components/reports/CategoryCharts";
import { ComparisonChart } from "@/components/reports/ComparisonChart";
import { AIInsightsSection } from "@/components/reports/AIInsightsSection";
import { ExportFooter } from "@/components/reports/ExportFooter";

const periods = [
  { id: 'mes', label: 'Mês' },
  { id: 'ano', label: 'Anual' },
];

const Relatorios = () => {
  const { selectedDate, setSelectedDate, viewType, setViewType } = usePlanIA();

  const periodo: Periodo = {
    tipo: viewType,
    mes: selectedDate.getMonth(),
    ano: selectedDate.getFullYear()
  };

  const dados = useDadosFinanceiros(periodo);

  const handlePrev = () => setSelectedDate(viewType === 'month' ? subMonths(selectedDate, 1) : subYears(selectedDate, 1));
  const handleNext = () => setSelectedDate(viewType === 'month' ? addMonths(selectedDate, 1) : addYears(selectedDate, 1));

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
              {viewType === 'month' ? 'Mensal' : 'Anual'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Análise baseada em {dados.totalTransacoes} transações no período selecionado</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Seletor de Tipo de Visualização */}
          <div className="flex p-1 bg-muted/50 rounded-xl border border-border/40">
            <button 
              onClick={() => setViewType('month')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", viewType === 'month' ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
            >
              Mês
            </button>
            <button 
              onClick={() => setViewType('year')}
              className={cn("px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all", viewType === 'year' ? "bg-card text-primary shadow-sm" : "text-muted-foreground")}
            >
              Anual
            </button>
          </div>

          {/* Navegador de Datas */}
          <div className="flex items-center gap-3 bg-muted/30 px-3 py-1 rounded-xl border border-border/40">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrev}><ChevronLeft className="w-4 h-4" /></Button>
            <div className="flex flex-col items-center min-w-[120px]">
              <span className="text-sm font-black text-foreground capitalize">
                {viewType === 'month' ? format(selectedDate, "MMMM yyyy", { locale: ptBR }) : format(selectedDate, "yyyy")}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNext}><ChevronRight className="w-4 h-4" /></Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-[11px] font-bold" onClick={() => handleExport('Excel')}>
              <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" /> Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-[11px] font-bold" onClick={() => handleExport('PDF')}>
              <FileText className="w-3.5 h-3.5 text-red-400" /> PDF
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