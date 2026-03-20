"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { toast } from "sonner";

/* --- TYPES --- */
export interface Transaction {
  id: string;
  desc: string;
  value: number;
  cat: string;
  date: string;
  type: 'receita' | 'gasto';
  origin: 'importado' | 'manual';
}

export interface Budget {
  id: string;
  cat: string;
  limit: number;
  spent: number;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  emoji: string;
  target: number;
  current: number;
  deadline: string;
  type: 'poupanca' | 'reducao';
  archived?: boolean;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  startDate: string;
}

interface PlanIAContextType {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  investments: Investment[];
  profile: 'pessoal' | 'freelancer' | 'empresario';
  isSyncing: boolean;
  lastSync: Date | null;
  importData: (data: any[], mode: 'add' | 'replace') => void;
  addTransaction: (t: Omit<Transaction, 'id' | 'origin'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
}

const PlanIAContext = createContext<PlanIAContextType | undefined>(undefined);

/* --- CONSTANTS & HELPERS --- */
const CATEGORY_MAPPING: Record<string, string[]> = {
  "Mercado": ["mercado", "supermercado", "hortifruti", "pao de acucar", "carrefour", "extra", "atacadao", "assai"],
  "Transporte": ["uber", "99", "cabify", "onibus", "metro", "combustivel", "posto", "shell", "ipiranga"],
  "Alimentação": ["ifood", "restaurante", "lanchonete", "pizza", "mcdonalds", "burger", "subway"],
  "Streaming": ["netflix", "spotify", "amazon prime", "disney", "hbo", "youtube premium"],
  "Saúde": ["farmacia", "drogaria", "drogasil", "ultrafarma", "medico", "consulta", "clinica"],
  "Educação": ["udemy", "coursera", "escola", "faculdade", "curso", "livro", "alura"],
  "Moradia": ["aluguel", "condominio", "agua", "luz", "energia", "gas", "internet", "claro", "vivo"],
  "Investimento": ["tesouro", "cdb", "lci", "lca", "fundo", "acao", "fii", "etf", "cripto", "poupanca"]
};

const INVESTMENT_PATTERNS = ["tesouro", "cdb", "lci", "lca", "fundo", "acao", "fii", "etf", "cripto", "poupanca"];

export const PlanIAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profile, setProfile] = useState<'pessoal' | 'freelancer' | 'empresario'>('pessoal');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('plania-data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setTransactions(parsed.transactions || []);
      setProfile(parsed.profile || 'pessoal');
      if (parsed.lastSync) setLastSync(new Date(parsed.lastSync));
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('plania-data', JSON.stringify({ transactions, profile, lastSync }));
  }, [transactions, profile, lastSync]);

  /* --- AUTO-ADAPTATION ENGINE --- */
  
  const budgets = useMemo(() => {
    const categories = Array.from(new Set(transactions.map(t => t.cat)));
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');

    return categories
      .filter(c => c !== "Receita" && c !== "Investimento")
      .map(cat => {
        const catTransactions = transactions.filter(t => t.cat === cat && t.type === 'gasto');
        
        // Calculate Limit: Average of last 3 months + 10%
        const monthlyTotals: Record<string, number> = {};
        catTransactions.forEach(t => {
          const m = t.date.substring(0, 7);
          monthlyTotals[m] = (monthlyTotals[m] || 0) + Math.abs(t.value);
        });
        
        const values = Object.values(monthlyTotals);
        const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        const limit = Math.ceil((avg * 1.1) / 50) * 50 || 500;

        // Current Spent
        const spent = catTransactions
          .filter(t => t.date.startsWith(currentMonth))
          .reduce((acc, t) => acc + Math.abs(t.value), 0);

        return {
          id: `budget-${cat}`,
          cat,
          limit,
          spent,
          color: `hsl(var(--chart-${(Math.floor(Math.random() * 5) + 1)}))`
        };
      });
  }, [transactions]);

  const goals = useMemo(() => {
    if (transactions.length === 0) return [];
    
    const expenses = transactions.filter(t => t.type === 'gasto');
    const totalExp = Math.abs(expenses.reduce((acc, t) => acc + t.value, 0));
    const avgMonthlyExp = totalExp / 6 || 3000;

    const generatedGoals: Goal[] = [
      {
        id: 'goal-emergency',
        name: "Reserva de Emergência 🛡️",
        emoji: "🛡️",
        target: Math.round(avgMonthlyExp * 6),
        current: Math.round(avgMonthlyExp * 0.5),
        deadline: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        type: 'poupanca'
      }
    ];

    // Contextual Goals
    const hasTravel = transactions.some(t => t.desc.toLowerCase().includes('viagem') || t.desc.toLowerCase().includes('passagem'));
    if (hasTravel) {
      generatedGoals.push({
        id: 'goal-travel',
        name: "Fundo de Viagem ✈️",
        emoji: "✈️",
        target: 5000,
        current: 0,
        deadline: format(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        type: 'poupanca'
      });
    }

    return generatedGoals;
  }, [transactions]);

  const investments = useMemo(() => {
    const invTransactions = transactions.filter(t => 
      INVESTMENT_PATTERNS.some(p => t.desc.toLowerCase().includes(p)) || t.cat === "Investimento"
    );

    const grouped: Record<string, Investment> = {};
    invTransactions.forEach(t => {
      if (!grouped[t.desc]) {
        grouped[t.desc] = {
          id: `inv-${t.desc}`,
          name: t.desc,
          type: t.desc.toLowerCase().includes('cripto') ? 'Cripto' : 'Renda Fixa',
          value: 0,
          startDate: t.date
        };
      }
      grouped[t.desc].value += Math.abs(t.value);
      if (new Date(t.date) < new Date(grouped[t.desc].startDate)) {
        grouped[t.desc].startDate = t.date;
      }
    });

    return Object.values(grouped);
  }, [transactions]);

  /* --- ACTIONS --- */

  const importData = (rawData: any[], mode: 'add' | 'replace') => {
    setIsSyncing(true);
    
    const processed = rawData.map((row, index) => {
      const desc = String(row.desc || "").trim();
      const value = parseFloat(String(row.value || "0").replace(',', '.'));
      let cat = row.cat || "Outros";

      if (!row.cat) {
        for (const [category, keywords] of Object.entries(CATEGORY_MAPPING)) {
          if (keywords.some(k => desc.toLowerCase().includes(k))) {
            cat = category;
            break;
          }
        }
      }

      return {
        id: `imp-${Date.now()}-${index}`,
        desc,
        value,
        cat,
        date: row.date || new Date().toISOString().split('T')[0],
        type: value > 0 || cat === "Receita" ? 'receita' : 'gasto',
        origin: 'importado' as const
      };
    });

    if (mode === 'replace') {
      setTransactions(processed);
    } else {
      // Deduplication logic: date + value + desc
      setTransactions(prev => {
        const existingKeys = new Set(prev.map(t => `${t.date}-${t.value}-${t.desc}`));
        const newOnes = processed.filter(t => !existingKeys.has(`${t.date}-${t.value}-${t.desc}`));
        return [...newOnes, ...prev];
      });
    }

    // Detect Profile
    const uniqueSources = new Set(processed.filter(t => t.type === 'receita').map(t => t.desc.toLowerCase())).size;
    if (uniqueSources > 2) setProfile('freelancer');
    else if (processed.some(t => t.desc.toLowerCase().includes('cnpj') || t.desc.toLowerCase().includes('nf'))) setProfile('empresario');
    else setProfile('pessoal');

    setLastSync(new Date());
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const addTransaction = (t: Omit<Transaction, 'id' | 'origin'>) => {
    setIsSyncing(true);
    const newT: Transaction = {
      ...t,
      id: `man-${Date.now()}`,
      origin: 'manual'
    };
    setTransactions(prev => [newT, ...prev]);
    setLastSync(new Date());
    setTimeout(() => setIsSyncing(false), 500);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <PlanIAContext.Provider value={{ 
      transactions, budgets, goals, investments, profile, 
      isSyncing, lastSync, importData, addTransaction, 
      deleteTransaction, updateTransaction 
    }}>
      {children}
    </PlanIAContext.Provider>
  );
};

export const usePlanIA = () => {
  const context = useContext(PlanIAContext);
  if (!context) throw new Error('usePlanIA must be used within a PlanIAProvider');
  return context;
};