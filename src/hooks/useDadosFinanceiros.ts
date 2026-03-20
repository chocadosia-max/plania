"use client";

import { useState, useEffect } from "react";

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
  const [dados, setDados] = useState<DadosFinanceiros>({
    transacoes: [],
    todasTransacoes: [],
    receitas: 0,
    gastos: 0,
    saldo: 0,
    economia: 0,
    porCategoria: {},
    porMes: {},
    totalTransacoes: 0
  });

  useEffect(() => {
    try {
      // Tenta TODAS as chaves possíveis onde os dados podem estar
      const chaves = [
        "plania_transacoes",
        "transacoes",
        "plania_import",
        "financas_dados"
      ];

      let todasTransacoes: any[] = [];

      for (const chave of chaves) {
        const item = localStorage.getItem(chave);
        if (item) {
          const parsed = JSON.parse(item);
          // Se for o objeto de importação especializada, extrai as transações
          if (parsed && parsed.transacoes && Array.isArray(parsed.transacoes)) {
            todasTransacoes = parsed.transacoes;
            console.log("✅ Dados encontrados em (objeto import):", chave, "Total:", todasTransacoes.length);
            break;
          }
          // Se for um array direto
          if (Array.isArray(parsed) && parsed.length > 0) {
            todasTransacoes = parsed;
            console.log("✅ Dados encontrados em (array):", chave, "Total:", parsed.length);
            break;
          }
        }
      }

      // Se não achou em nenhuma chave, tenta dados mensais separados (padrão da planilha 2026)
      if (todasTransacoes.length === 0) {
        const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        meses.forEach(mes => {
          const chave = `plania_${mes}26`;
          const item = localStorage.getItem(chave);
          if (item) {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) {
              todasTransacoes.push(...parsed);
            }
          }
        });
        if (todasTransacoes.length > 0) {
          console.log("✅ Dados encontrados em chaves mensais. Total:", todasTransacoes.length);
        }
      }

      // Filtra por período se informado
      let filtradas = todasTransacoes;
      if (periodo) {
        filtradas = todasTransacoes.filter(t => {
          if (!t.data) return false;
          try {
            let mes, ano;
            if (typeof t.data === 'string' && t.data.includes("/")) {
              const p = t.data.split("/");
              mes = parseInt(p[1]) - 1;
              ano = parseInt(p[2]);
            } else {
              const d = new Date(t.data);
              mes = d.getMonth();
              ano = d.getFullYear();
            }
            
            if (periodo.tipo === "mes") {
              return mes === periodo.mes && ano === periodo.ano;
            }
            return ano === periodo.ano;
          } catch { return true; }
        });
      }

      // Calcula totais
      const receitas = filtradas
        .filter(t => 
          t.tipo === "receita" || 
          t.tipo === "entrada" || 
          (t.valor && Number(t.valor) > 0 && t.tipo !== "gasto" && t.tipo !== "despesa")
        )
        .reduce((s, t) => s + Math.abs(Number(t.valor) || 0), 0);

      const gastos = filtradas
        .filter(t => 
          t.tipo === "gasto" || 
          t.tipo === "despesa" || 
          t.tipo === "fixo" || 
          t.tipo === "variavel"
        )
        .reduce((s, t) => s + Math.abs(Number(t.valor) || 0), 0);

      const saldo = receitas - gastos;
      const economia = receitas > 0 ? ((saldo / receitas) * 100) : 0;

      // Agrupa por categoria (apenas gastos)
      const porCategoria = filtradas
        .filter(t => t.tipo !== "receita" && t.tipo !== "entrada")
        .reduce((acc: Record<string, number>, t) => {
          const cat = t.categoria || "Outros";
          if (!acc[cat]) acc[cat] = 0;
          acc[cat] += Math.abs(Number(t.valor) || 0);
          return acc;
        }, {});

      // Agrupa por mês para gráficos
      const porMes: Record<string, { receitas: number; gastos: number }> = {};
      const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      
      todasTransacoes.forEach(t => {
        let mesNome = "?";
        try {
          if (typeof t.data === 'string' && t.data.includes("/")) {
            const p = t.data.split("/");
            mesNome = mesesNomes[parseInt(p[1]) - 1] || "?";
          } else if (t.data) {
            const d = new Date(t.data);
            mesNome = mesesNomes[d.getMonth()] || "?";
          }
        } catch {}

        if (mesNome !== "?") {
          if (!porMes[mesNome]) porMes[mesNome] = { receitas: 0, gastos: 0 };
          if (t.tipo === "receita" || t.tipo === "entrada") {
            porMes[mesNome].receitas += Math.abs(Number(t.valor) || 0);
          } else {
            porMes[mesNome].gastos += Math.abs(Number(t.valor) || 0);
          }
        }
      });

      setDados({
        transacoes: filtradas,
        todasTransacoes,
        receitas,
        gastos,
        saldo,
        economia: parseFloat(economia.toFixed(1)),
        porCategoria,
        porMes,
        totalTransacoes: filtradas.length
      });

    } catch (e) {
      console.error("❌ Erro ao carregar dados financeiros:", e);
    }
  }, [periodo?.mes, periodo?.ano, periodo?.tipo]);

  return dados;
}