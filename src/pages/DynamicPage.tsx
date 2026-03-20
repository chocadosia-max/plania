"use client";

import React from 'react';
import { useParams } from 'react-router-dom';
import { usePlanIA } from "@/contexts/PlanIAContext";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DynamicPage() {
  const { id } = useParams();
  const { analysis } = usePlanIA();
  
  const data = analysis?.dadosMapeados[id || ""] || [];
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  const getTitle = () => {
    switch(id) {
      case 'dividas': return { label: "Dívidas e Parcelas", icon: "💳", color: "text-red-400" };
      case 'estoque': return { label: "Controle de Estoque", icon: "📦", color: "text-amber-500" };
      case 'clientes': return { label: "Gestão de Clientes", icon: "👥", color: "text-blue-500" };
      case 'dre': return { label: "DRE - Demonstrativo", icon: "📋", color: "text-emerald-500" };
      default: return { label: id?.toUpperCase(), icon: "✨", color: "text-primary" };
    }
  };

  const titleInfo = getTitle();

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-reveal">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-3xl shadow-sm", titleInfo.color.replace('text-', 'bg-') + '/10')}>
            {titleInfo.icon}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{titleInfo.label}</h1>
            <p className="text-sm text-muted-foreground">Gerado automaticamente com base na sua planilha</p>
          </div>
        </div>
        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-none font-bold">
          Sincronizado
        </Badge>
      </div>

      {/* Resumo Inteligente */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="glass-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{data.length}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Geral</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-lg font-bold">Saudável</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-none bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-primary">Insight da IA</CardTitle>
          </CardHeader>
          <CardContent className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-1" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Detectamos padrões consistentes nestes dados. Use o assistente para projeções.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Dinâmica */}
      <div className="glass-card rounded-3xl overflow-hidden border-border/40">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map(col => (
                <TableHead key={col} className="text-[10px] font-black uppercase tracking-widest">{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/20 transition-colors">
                {columns.map(col => (
                  <TableCell key={col} className="text-sm font-medium">
                    {formatValue(row[col])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatValue(val: any) {
  if (typeof val === 'number') {
    if (val > 1000) return `R$ ${val.toLocaleString('pt-BR')}`;
    return val;
  }
  if (typeof val === 'string' && val.includes('-')) {
    // Tentar detectar data
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }
  return String(val);
}