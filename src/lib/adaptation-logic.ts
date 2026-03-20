"use client";

import { format, parseISO, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

/* --- CONFIGURAÇÃO DE CATEGORIZAÇÃO --- */
const CATEGORY_MAPPING: Record<string, string[]> = {
  "Mercado": ["mercado", "supermercado", "hortifruti", "pao de acucar", "carrefour", "extra", "atacadao", "assai", "prezunic"],
  "Transporte": ["uber", "99", "cabify", "onibus", "metro", "combustivel", "posto", "shell", "ipiranga", "br mania"],
  "Alimentação": ["ifood", "restaurante", "lanchonete", "pizza", "mcdonalds", "burger", "subway", "habib", "spoleto"],
  "Streaming": ["netflix", "spotify", "amazon prime", "disney", "hbo", "youtube premium", "deezer", "apple music"],
  "Saúde": ["farmacia", "drogaria", "drogasil", "ultrafarma", "medico", "consulta", "laboratorio", "exame", "clinica"],
  "Educação": ["udemy", "coursera", "escola", "faculdade", "curso", "livro", "amazon kindle", "alura"],
  "Moradia": ["aluguel", "condominio", "agua", "luz", "energia", "gas", "internet", "claro", "vivo", "tim", "net"],
  "Receita": ["salario", "pagamento", "transferencia recebida", "pix recebido", "freelance", "deposito", "rendimento"]
};

export interface AdaptedData {
  transactions: any[];
  categories: string[];
  budgets: any[];
  profile: string;
  goals: any[];
  summary: {
    count: number;
    income: number;
    expenses: number;
    savings: number;
  };
}

export function adaptData(rawData: any[]): AdaptedData {
  // 1. Normalizar e Categorizar Transações
  const transactions = rawData.map((row, index) => {
    const desc = String(row.desc || "").toLowerCase();
    const value = parseFloat(String(row.value || "0").replace(',', '.'));
    let cat = "Outros";

    for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
      if (keywords.some(k => desc.includes(k))) {
        cat = category;
        break;
      }
    }

    return {
      id: index,
      desc: row.desc || "Transação sem nome",
      value: value,
      cat: cat,
      date: row.date || new Date().toISOString().split('T')[0],
      type: value > 0 || cat === "Receita" ? 'receita' : 'gasto'
    };
  });

  const categories = Array.from(new Set(transactions.map(t => t.cat)));

  // 2. Calcular Orçamentos (Média + 10%)
  const budgets = categories
    .filter(c => c !== "Receita" && c !== "Outros")
    .map(cat => {
      const catTransactions = transactions.filter(t => t.cat === cat && t.type === 'gasto');
      const totalSpent = Math.abs(catTransactions.reduce((acc, t) => acc + t.value, 0));
      // Simulação de média: como não temos meses reais garantidos, usamos o total / 3 como estimativa
      const media = totalSpent / 3; 
      const limit = Math.ceil((media * 1.10) / 50) * 50; // Arredonda para múltiplo de 50

      return {
        id: Math.random(),
        cat,
        limit: limit || 500,
        spent: Math.abs(transactions.filter(t => t.cat === cat && t.type === 'gasto').reduce((acc, t) => acc + t.value, 0)) / 12, // Estimativa mensal
        color: `hsl(var(--chart-${(Math.floor(Math.random() * 5) + 1)}))`
      };
    });

  // 3. Detectar Perfil
  const revenues = transactions.filter(t => t.type === 'receita');
  const revenueValues = revenues.map(r => Math.abs(r.value));
  const uniqueSources = new Set(revenues.map(r => r.desc.toLowerCase())).size;
  
  let profile = "pessoal";
  if (uniqueSources > 2) profile = "freelancer";
  if (revenues.some(r => r.desc.toLowerCase().includes("nf") || r.desc.toLowerCase().includes("cnpj"))) profile = "empresario";

  // 4. Sugerir Metas
  const avgMonthlyExpense = Math.abs(transactions.filter(t => t.type === 'gasto').reduce((acc, t) => acc + t.value, 0)) / 6;
  const goals = [
    {
      id: 1,
      name: "Reserva de Emergência 🛡️",
      target: Math.round(avgMonthlyExpense * 6),
      current: Math.round(avgMonthlyExpense * 1.5),
      deadline: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      emoji: "🛡️"
    }
  ];

  // 5. Resumo
  const totalIncome = revenues.reduce((acc, t) => acc + Math.abs(t.value), 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.type === 'gasto').reduce((acc, t) => acc + t.value, 0));

  return {
    transactions,
    categories,
    budgets,
    profile,
    goals,
    summary: {
      count: transactions.length,
      income: totalIncome / 6, // Média mensal estimada
      expenses: totalExpenses / 6,
      savings: (totalIncome - totalExpenses) / 6
    }
  };
}