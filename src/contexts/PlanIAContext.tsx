"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

export interface DynamicTab {
  id: string;
  label: string;
  icon: string;
  path: string;
  isNew: boolean;
}

interface PlanIAContextType {
  transactions: any[];
  goals: any[];
  budgets: any[];
  investments: any[];
  dividas: any[];
  clientes: any[];
  dynamicTabs: DynamicTab[];
  viewType: 'month' | 'year';
  selectedDate: Date;
  isSyncing: boolean;
  lastSync: Date | null;
  setViewType: (type: 'month' | 'year') => void;
  setSelectedDate: (date: Date) => void;
  importData: (data: any) => void;
  sync: () => Promise<void>;
  addTransaction: (t: any) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (g: any) => void;
  deleteGoal: (id: string) => void;
  addBudget: (b: any) => void;
  deleteBudget: (id: string) => void;
  getBudgetSpent: (cat: string) => number;
}

const PlanIAContext = createContext<PlanIAContextType | undefined>(undefined);

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return parsed || fallback;
  } catch (e) { return fallback; }
};

const getInitialTransactions = () => {
  const pTransacoes = safeParse("plania_transacoes", []);
  const pData = safeParse("plania-data", null);
  if (Array.isArray(pTransacoes) && pTransacoes.length > 0) return pTransacoes;
  if (pData) {
    if (Array.isArray(pData.transacoes)) return pData.transacoes;
    if (Array.isArray(pData.transactions)) return pData.transactions;
    if (Array.isArray(pData)) return pData;
  }
  return [];
};

export const PlanIAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<any[]>(() => getInitialTransactions());
  const [goals, setGoals] = useState<any[]>(() => safeParse("plania_metas", []));
  const [budgets, setBudgets] = useState<any[]>(() => safeParse("plania_orcamentos", []));
  const [investments, setInvestments] = useState<any[]>(() => safeParse("plania_investimentos", []));
  const [dividas, setDividas] = useState<any[]>(() => safeParse("plania_dividas", []));
  const [clientes, setClientes] = useState<any[]>(() => safeParse("plania_clientes", []));
  const [dynamicTabs, setDynamicTabs] = useState<DynamicTab[]>(() => safeParse("plania_tabs", []));
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(() => {
    const saved = localStorage.getItem("plania-last-sync");
    return saved ? new Date(saved) : new Date();
  });

  useEffect(() => {
    localStorage.setItem("plania_transacoes", JSON.stringify(transactions));
    const currentData = safeParse("plania-data", {});
    localStorage.setItem("plania-data", JSON.stringify({
      ...currentData,
      transacoes: transactions,
      ultimaAtualizacao: new Date().toISOString()
    }));
    localStorage.setItem("plania_metas", JSON.stringify(goals));
    localStorage.setItem("plania_orcamentos", JSON.stringify(budgets));
    localStorage.setItem("plania_investimentos", JSON.stringify(investments));
    localStorage.setItem("plania_dividas", JSON.stringify(dividas));
    localStorage.setItem("plania_clientes", JSON.stringify(clientes));
    localStorage.setItem("plania_tabs", JSON.stringify(dynamicTabs));
  }, [transactions, goals, budgets, investments, dividas, clientes, dynamicTabs]);

  const sync = async () => {
    setIsSyncing(true);
    // Simula um pequeno delay de processamento da IA
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const freshTransactions = getInitialTransactions();
    setTransactions(freshTransactions);
    setGoals(safeParse("plania_metas", []));
    setBudgets(safeParse("plania_orcamentos", []));
    setInvestments(safeParse("plania_investimentos", []));
    setDividas(safeParse("plania_dividas", []));
    setClientes(safeParse("plania_clientes", []));
    
    const now = new Date();
    setLastSync(now);
    localStorage.setItem("plania-last-sync", now.toISOString());
    setIsSyncing(false);
    toast.success("Dados sincronizados com sucesso! 🔄");
  };

  const importData = (data: any) => {
    const transacoesProcessadas = data.transacoes || [];
    setTransactions(transacoesProcessadas);
    setDividas(data.dividas || []);
    setClientes(data.clientes || []);
    
    localStorage.setItem("plania_transacoes", JSON.stringify(transacoesProcessadas));
    localStorage.setItem("plania-data", JSON.stringify({
      transacoes: transacoesProcessadas,
      dividas: data.dividas || [],
      clientes: data.clientes || [],
      ultimaAtualizacao: new Date().toISOString()
    }));

    const newTabs: DynamicTab[] = [];
    if (data.dividas?.length > 0) newTabs.push({ id: 'dividas', label: 'Dívidas', icon: '💳', path: '/dashboard/dividas', isNew: true });
    if (data.clientes?.length > 0) newTabs.push({ id: 'clientes', label: 'Clientes', icon: '👥', path: '/dashboard/clientes', isNew: true });
    
    setDynamicTabs(newTabs);
    setLastSync(new Date());
    toast.success(`Importação concluída: ${transacoesProcessadas.length} transações sincronizadas! 🚀`);
  };

  const addTransaction = (t: any) => setTransactions(prev => [{ ...t, id: Date.now().toString() }, ...prev]);
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const addGoal = (g: any) => setGoals(prev => [{ ...g, id: Date.now().toString() }, ...prev]);
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const addBudget = (b: any) => setBudgets(prev => [{ ...b, id: Date.now().toString() }, ...prev]);
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  const getBudgetSpent = (cat: string) => {
    return Math.abs(transactions
      .filter(t => t.categoria === cat && (t.tipo === 'gasto' || t.tipo === 'despesa'))
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0));
  };

  return (
    <PlanIAContext.Provider value={{ 
      transactions, goals, budgets, investments, dividas, clientes, dynamicTabs,
      viewType, selectedDate, isSyncing, lastSync,
      setViewType, setSelectedDate, sync,
      importData, addTransaction, deleteTransaction, addGoal, deleteGoal, addBudget, deleteBudget, getBudgetSpent
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