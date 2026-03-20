"use client";

import { useMemo } from "react";
import { usePlanIA } from "@/contexts/PlanIAContext";

export interface Periodo {
  tipo: "mes" | "ano";
  mes: number;
  ano: number;
}

export function useDadosFinanceiros(periodo: Periodo | null) {
  const { transactions } = usePlanIA();
  
  return useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        transacoes: [],
        receitas: 0,
        gastos: 0,
        saldo: 0,
        economia: 0,
        porCategoria: {},
        totalTransacoes: 0
      };
    }

    // Filtragem por período
    const filtradas = transactions.filter(t => {
      if (!periodo) return true;
      
      // Se tiver mes/ano explícito (importado)
      if (t.mes !== null && t.mes !== undefined) {
        if (periodo.tipo === "mes") return Number(t.mes) === periodo.mes && Number(t.ano) === periodo.ano;
        return Number(t.ano) === periodo.ano;
      }
      
      // Se for string de data DD/MM/YYYY
      if (typeof t.data === 'string' && t.data.includes("/")) {
        const [d, m, a] = t.data.split("/").map(Number);
        if (periodo.tipo === "mes") return (m - 1) === periodo.mes && a === periodo.ano;
        return a === periodo.ano;
      }
      
      return true;
    });

    const receitas = filtradas
      .filter(t => t.tipo === "receita" || t.tipo === "entrada")
      .reduce((s, t) => s + Math.abs(t.valor), 0);

    const gastos = filtradas
      .filter(t => t.tipo === "gasto" || t.tipo === "despesa" || t.tipo === "fixo" || t.tipo === "variavel")
      .reduce((s, t) => s + Math.abs(t.valor), 0);

    const saldo = receitas - gastos;
    const economia = receitas > 0 ? parseFloat(((saldo / receitas) * 100).toFixed(1)) : 0;

    const porCategoria = filtradas
      .filter(t => t.tipo !== "receita" && t.tipo !== "entrada")
      .reduce((acc: Record<string, number>, t) => {
        const cat = t.categoria || "Outros";
        acc[cat] = (acc[cat] || 0) + Math.abs(t.valor);
        return acc;
      }, {});

    return {
      transacoes: filtradas,
      receitas,
      gastos,
      saldo,
      economia,
      porCategoria,
      totalTransacoes: filtradas.length
    };
  }, [transactions, periodo?.mes, periodo?.ano, periodo?.tipo]);
}