"use client";

import { useState, useEffect, useMemo } from "react";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { parse, isValid } from "date-fns";

export interface Periodo {
  tipo: "mes" | "ano";
  mes: number;
  ano: number;
}

export interface DadosFinanceiros {
  transacoes: any[];
  todasTransacoes: any[];
  receitas: number;
  gastos: number;
  saldo: number;
  economia: number;
  porCategoria: Record<string, number>;
  porMes: Record<string, { receitas: number; gastos: number }>;
  totalTransacoes: number;
}

export function useDadosFinanceiros(periodo: Periodo | null) {
  const { transactions: rawTransactions } = usePlanIA();
  
  const dados = useMemo(() => {
    if (!rawTransactions || rawTransactions.length === 0) {
      return {
        transacoes: [],
        todasTransacoes: [],
        receitas: 0,
        gastos: 0,
        saldo: 0,
        economia: 0,
        porCategoria: {},
        porMes: {},
        totalTransacoes: 0
      };
    }

    // 1. Normalização robusta
    const normalizadas = rawTransactions.map(t => {
      const valorBruto = parseFloat(String(t.valor || t.value || t.amount || 0).replace(',', '.'));
      return {
        id: t.id || Math.random().toString(36).substr(2, 9),
        descricao: t.descricao || t.description || t.nome || t.name || t.historico || "Sem descrição",
        valor: Math.abs(valorBruto),
        tipo: t.tipo || t.type || (valorBruto > 0 ? "receita" : "gasto"),
        categoria: t.categoria || t.category || t.cat || "Outros",
        data: t.data || t.date || "",
        mes: t.mes !== undefined ? t.mes : null,
        ano: t.ano || 2026
      };
    });

    // 2. Filtragem por período
    let filtradas = normalizadas;
    if (periodo) {
      filtradas = normalizadas.filter(t => {
        try {
          // Prioridade 1: Campo mes/ano direto (vindo do motor de importação)
          if (t.mes !== null && t.mes !== undefined) {
            if (periodo.tipo === "mes") {
              return Number(t.mes) === periodo.mes && Number(t.ano) === periodo.ano;
            }
            return Number(t.ano) === periodo.ano;
          }
          
          // Prioridade 2: Parse de string de data (DD/MM/YYYY)
          if (t.data && typeof t.data === 'string' && t.data.includes("/")) {
            const partes = t.data.split("/");
            const d = parseInt(partes[0]);
            const m = parseInt(partes[1]) - 1;
            const a = parseInt(partes[2]);
            
            if (periodo.tipo === "mes") {
              return m === periodo.mes && a === periodo.ano;
            }
            return a === periodo.ano;
          }
          
          return true;
        } catch (e) {
          return true;
        }
      });
    }

    // 3. Cálculos de Totais
    const receitas = filtradas
      .filter(t => t.tipo === "receita" || t.tipo === "entrada")
      .reduce((s, t) => s + t.valor, 0);

    const gastos = filtradas
      .filter(t => t.tipo === "gasto" || t.tipo === "despesa" || t.tipo === "fixo" || t.tipo === "variavel")
      .reduce((s, t) => s + t.valor, 0);

    const saldo = receitas - gastos;
    const economia = receitas > 0 ? parseFloat(((saldo / receitas) * 100).toFixed(1)) : 0;

    // 4. Agrupamentos
    const porCategoria = filtradas
      .filter(t => t.tipo !== "receita" && t.tipo !== "entrada")
      .reduce((acc: Record<string, number>, t) => {
        const cat = t.categoria || "Outros";
        acc[cat] = (acc[cat] || 0) + t.valor;
        return acc;
      }, {});

    const porMes: Record<string, { receitas: number; gastos: number }> = {};
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    normalizadas.forEach(t => {
      let mIdx = -1;
      if (t.mes !== null && t.mes !== undefined) mIdx = Number(t.mes);
      else if (t.data && typeof t.data === 'string' && t.data.includes("/")) {
        mIdx = parseInt(t.data.split("/")[1]) - 1;
      }

      if (mIdx >= 0 && mIdx < 12) {
        const nome = mesesNomes[mIdx];
        if (!porMes[nome]) porMes[nome] = { receitas: 0, gastos: 0 };
        if (t.tipo === "receita" || t.tipo === "entrada") porMes[nome].receitas += t.valor;
        else porMes[nome].gastos += t.valor;
      }
    });

    return {
      transacoes: filtradas,
      todasTransacoes: normalizadas,
      receitas,
      gastos,
      saldo,
      economia,
      porCategoria,
      porMes,
      totalTransacoes: filtradas.length
    };
  }, [rawTransactions, periodo?.mes, periodo?.ano, periodo?.tipo]);

  return dados;
}