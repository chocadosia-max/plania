"use client";

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Download, Share2, FileSpreadsheet, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

// Components
import { ReportSummaryCards } from "@/components/reports/ReportSummaryCards";
import { EvolutionChart } from "@/components/reports/EvolutionChart";
import { CategoryCharts } from "@/components/reports/CategoryCharts";
import { ComparisonChart } from "@/components/reports/ComparisonChart";
import { AIInsightsSection } from "@/components/reports/AIInsightsSection";
import { ExportFooter } from "@/components/reports/ExportFooter";

const periods = [
  { id: 'mes', label: 'Este mês' },
  { id: '3m', label: '3 meses' },
  { id: '6m', label: '6 meses' },
  { id: 'ano', label: 'Este ano' },
  { id: 'custom', label: 'Personalizado' },
];

const Relatorios = () => {
  const [activePeriod, setActivePeriod] = useState('mes');
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>();

  const handleExport = (type: string) => {
    toast.success(`Exportando relatório em ${type}... 🚀`);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6" style={{ animation: "reveal 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                {periods.find(p => p.id === activePeriod)?.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Análise detalhada da sua saúde financeira</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Period Selector */}
            <div className="flex p-1 bg-muted/50 rounded-xl border border-border/40">
              {periods.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePeriod(p.id)}
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

            {/* Custom Date Picker */}
            {activePeriod === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-xs font-bold border-primary/30 text-primary">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        `${format(dateRange.from, "dd/MM")} - ${format(dateRange.to, "dd/MM")}`
                      ) : format(dateRange.from, "dd/MM/yyyy")
                    ) : "Selecionar período"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    initialFocus
                    mode="range"
                    selected={dateRange as any}
                    onSelect={setDateRange as any}
                    numberOfMonths={2}
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Export Buttons */}
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

        {/* SUMMARY CARDS */}
        <ReportSummaryCards />

        {/* EVOLUTION CHART */}
        <EvolutionChart />

        {/* CATEGORY CHARTS (Stacked + Treemap) */}
        <CategoryCharts />

        {/* COMPARISON CHART */}
        <ComparisonChart />

        {/* AI INSIGHTS */}
        <AIInsightsSection />

        {/* EXPORT FOOTER */}
        <ExportFooter />
      </div>
    </DashboardLayout>
  );
};

export default Relatorios;