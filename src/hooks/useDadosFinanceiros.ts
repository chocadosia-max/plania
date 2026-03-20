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
      let todasTransacoes: any[] = [];

      // 1. TENTA plania-data PRIMEIRO (onde os dados realmente estão)
      const planiaDataRaw = localStorage.getItem("plania-data");
      if (planiaDataRaw) {
        const obj = JSON.parse(planiaDataRaw);
        
        if (obj && typeof obj === 'object') {
          // Pode estar em obj.transacoes, obj.transactions ou obj.lancamentos
          if (Array.isArray(obj.transacoes) && obj.transacoes.length > 0) {
            todasTransacoes = obj.transacoes;
            console.log("✅ Lido de plania-data.transacoes:", todasTransacoes.length);
          } else if (Array.isArray(obj.transactions) && obj.transactions.length > 0) {
            todasTransacoes = obj.transactions;
            console.log("✅ Lido de plania-data.transactions:", todasTransacoes.length);
          } else if (Array.isArray(obj.lancamentos) && obj.lancamentos.length > 0) {
            todasTransacoes = obj.lancamentos;
          } else if (Array.isArray(obj) && obj.length > 0) {
            todasTransacoes = obj;
          } else {
            // Pega a primeira chave que for array
            for (const [k, v] of Object.entries(obj)) {
              if (Array.isArray(v) && v.length > 0) {
                console.log(`✅ Lido de plania-data.${k}:`, v.length);
                todasTransacoes = v;
                break;
              }
            }
          }
        }
      }

      // 2. Se não achou no plania-data, tenta outras chaves
      if (todasTransacoes.length === 0) {
        const chaves = ["plania_transacoes", "transacoes", "plania_lancamentos", "financas"];
        for (const chave of chaves) {
          const item = localStorage.getItem(chave);
          if (item) {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed) && parsed.length > 0) {
              todasTransacoes = parsed;
              console.log(`✅ Lido de ${chave}:`, parsed.length);
              break;
            }
          }
        }
      }

      if (todasTransacoes.length === 0) {
        console.warn("⚠️ Nenhuma transação encontrada");
        return;
      }

      // 3. Normaliza cada transação para garantir que os campos existem
      const normalizadas = todasTransacoes.map(t => {
        const valorBruto = parseFloat(t.valor || t.value || t.amount || 0);
        return {
          id: t.id || t._id || Math.random().toString(36).substr(2, 9),
          descricao: t.descricao || t.description || t.nome || t.name || t.historico || "Sem descrição",
          valor: Math.abs(valorBruto),
          tipo: t.tipo || t.type || t.subtipo || (valorBruto > 0 ? "receita" : "gasto"),
          categoria: t.categoria || t.category || t.cat || "Outros",
          data: t.data || t.date || t.createdAt || "",
          mes: t.mes !== undefined ? t.mes : null,
          ano: t.ano || 2026
        };
      });

      // 4. Filtra por período
      let filtradas = normalizadas;
      if (periodo) {
        filtradas = normalizadas.filter(t => {
          try {
            // Usa campo mes direto se existir
            if (t.mes !== null && t.mes !== undefined) {
              if (periodo.tipo === "mes") {
                return t.mes === periodo.mes && t.ano === periodo.ano;
              }
              return t.ano === periodo.ano;
            }
            
            // Senão parseia a data
            if (t.data && typeof t.data === 'string' && t.data.includes("/")) {
              const p = t.data.split("/");
              const mes = parseInt(p[1]) - 1;
              const ano = parseInt(p[2]);
              if (periodo.tipo === "mes") {
                return mes === periodo.mes && ano === periodo.ano;
              }
              return ano === periodo.ano;
            }
            return true;
          } catch { return true; }
        });
      }

      // 5. Calcula totais
      const receitas = filtradas
        .filter(t => t.tipo === "receita" || t.tipo === "entrada")
        .reduce((s, t) => s + t.valor, 0);

      const gastos = filtradas
        .filter(t => t.tipo === "gasto" || t.tipo === "despesa" || t.tipo === "fixo" || t.tipo === "variavel")
        .reduce((s, t) => s + t.valor, 0);

      const saldo = receitas - gastos;
      const economia = receitas > 0 ? parseFloat(((saldo / receitas) * 100).toFixed(1)) : 0;

      const porCategoria = filtradas
        .filter(t => t.tipo !== "receita" && t.tipo !== "entrada")
        .reduce((acc: Record<string, number>, t) => {
          const cat = t.categoria || "Outros";
          acc[cat] = (acc[cat] || 0) + t.valor;
          return acc;
        }, {});

      // Agrupa por mês para gráficos
      const porMes: Record<string, { receitas: number; gastos: number }> = {};
      const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
      
      normalizadas.forEach(t => {
        let mesNome = "?";
        try {
          if (t.mes !== null && t.mes !== undefined) {
            mesNome = mesesNomes[t.mes] || "?";
          } else if (typeof t.data === 'string' && t.data.includes("/")) {
            const p = t.data.split("/");
            mesNome = mesesNomes[parseInt(p[1]) - 1] || "?";
          }
        } catch {}

        if (mesNome !== "?") {
          if (!porMes[mesNome]) porMes[mesNome] = { receitas: 0, gastos: 0 };
          if (t.tipo === "receita" || t.tipo === "entrada") {
            porMes[mesNome].receitas += t.valor;
          } else {
            porMes[mesNome].gastos += t.valor;
          }
        }
      });

      setDados({
        transacoes: filtradas,
        todasTransacoes: normalizadas,
        receitas,
        gastos,
        saldo,
        economia,
        porCategoria,
        porMes,
        totalTransacoes: filtradas.length
      });

      // Sincroniza as chaves
      localStorage.setItem("plania_transacoes", JSON.stringify(normalizadas));

    } catch (e) {
      console.error("❌ Erro no hook useDadosFinanceiros:", e);
    }
  }, [periodo?.mes, periodo?.ano, periodo?.tipo]);

  return dados;
}