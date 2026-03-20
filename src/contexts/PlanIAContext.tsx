"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toast } from "sonner";

export interface Transaction {
  id: string;
  desc: string;
  value: number;
  cat: string;
  date: string;
  type: 'receita' | 'gasto';
  recorrente?: boolean;
}

export interface Goal {
  id: string;
  nome: string;
  emoji: string;
  valorAlvo: number;
  valorAtual: number;
  prazo: string;
  cor: string;
  criadaEm: string;
}

export interface Budget {
  id: string;
  categoria: string;
  emoji: string;
  limite: number;
  cor: string;
  recorrente: boolean;
}

export interface Investment {
  id: string;
  nome: string;
  tipo: string;
  valor: number;
  valorAtual: number;
  dataInicio: string;
  vencimento?: string;
  rentabilidade?: string;
  tipoRent?: string;
  instituicao?: string;
  status: 'ativo' | 'encerrado';
}

interface PlanIAContextType {
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  investments: Investment[];
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  addGoal: (g: Omit<Goal, 'id' | 'criadaEm'>) => void;
  addBudget: (b: Omit<Budget, 'id'>) => void;
  addInvestment: (i: Omit<Investment, 'id' | 'valorAtual' | 'status'>) => void;
  deleteTransaction: (id: string) => void;
  deleteGoal: (id: string) => void;
  deleteBudget: (id: string) => void;
  deleteInvestment: (id: string) => void;
  getBudgetSpent: (category: string) => number;
}

const PlanIAContext = createContext<PlanIAContextType | undefined>(undefined);

export const PlanIAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("plania_transacoes");
    return saved ? JSON.parse(saved) : [];
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("plania_metas");
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("plania_orcamentos");
    return saved ? JSON.parse(saved) : [];
  });

  const [investments, setInvestimentos] = useState<Investment[]>(() => {
    const saved = localStorage.getItem("plania_investimentos");
    return saved ? JSON.parse(saved) : [];
  });

  // Persistência
  useEffect(() => localStorage.setItem("plania_transacoes", JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem("plania_metas", JSON.stringify(goals)), [goals]);
  useEffect(() => localStorage.setItem("plania_orcamentos", JSON.stringify(budgets)), [budgets]);
  useEffect(() => localStorage.setItem("plania_investimentos", JSON.stringify(investments)), [investments]);

  // Lógica de cálculo de gasto atual para orçamentos
  const getBudgetSpent = (category: string) => {
    const now = new Date();
    const mesAtual = now.getMonth();
    const anoAtual = now.getFullYear();

    return transactions
      .filter(t => {
        const d = new Date(t.date);
        return t.cat === category && t.type === 'gasto' && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
      })
      .reduce((sum, t) => sum + Math.abs(t.value), 0);
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const nova = { ...t, id: String(Date.now()) };
    setTransactions(prev => [nova, ...prev]);
    toast.success("✅ Transação adicionada com sucesso!");
  };

  const addGoal = (g: Omit<Goal, 'id' | 'criadaEm'>) => {
    const nova = { ...g, id: String(Date.now()), criadaEm: new Date().toISOString() };
    setGoals(prev => [...prev, nova]);
    toast.success("✅ Meta adicionada com sucesso!");
  };

  const addBudget = (b: Omit<Budget, 'id'>) => {
    const novo = { ...b, id: String(Date.now()) };
    setBudgets(prev => [...prev, novo]);
    toast.success("✅ Orçamento adicionado com sucesso!");
  };

  const addInvestment = (i: Omit<Investment, 'id' | 'valorAtual' | 'status'>) => {
    const novo: Investment = { ...i, id: String(Date.now()), valorAtual: i.valor, status: 'ativo' };
    setInvestimentos(prev => [...prev, novo]);
    toast.success("✅ Investimento adicionado com sucesso!");
  };

  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));
  const deleteInvestment = (id: string) => setInvestimentos(prev => prev.filter(i => i.id !== id));

  return (
    <PlanIAContext.Provider value={{ 
      transactions, goals, budgets, investments, 
      addTransaction, addGoal, addBudget, addInvestment,
      deleteTransaction, deleteGoal, deleteBudget, deleteInvestment,
      getBudgetSpent
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