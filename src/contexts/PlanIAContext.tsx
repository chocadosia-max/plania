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
  clearAllData: () => void;
}

const PlanIAContext = createContext<PlanIAContextType | undefined>(undefined);

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) { return fallback; }
};

const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

export const PlanIAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<any[]>(() => safeParse("plania_transacoes", []));
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
    if (!saved) return null;
    const date = new Date(saved);
    return isValidDate(date) ? date : null;
  });

  useEffect(() => {
    const dataToSave = {
      plania_transacoes: transactions,
      plania_metas: goals,
      plania_orcamentos: budgets,
      plania_investimentos: investments,
      plania_dividas: dividas,
      plania_clientes: clientes,
      plania_tabs: dynamicTabs,
      "plania-last-sync": isValidDate(lastSync) ? lastSync?.toISOString() : null
    };

    Object.entries(dataToSave).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });
  }, [transactions, goals, budgets, investments, dividas, clientes, dynamicTabs, lastSync]);

  const sync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTransactions(safeParse("plania_transacoes", []));
    setDividas(safeParse("plania_dividas", []));
    setClientes(safeParse("plania_clientes", []));
    setLastSync(new Date());
    setIsSyncing(false);
    toast.success("Dados sincronizados! ✨");
  };

  const importData = (data: any) => {
    setIsSyncing(true);
    
    const rawTrans = data.transacoes || data.transactions || [];
    const normalized = rawTrans.map((t: any, i: number) => ({
      id: t.id || `imp_${Date.now()}_${i}`,
      descricao: t.descricao || t.description || "Sem nome",
      valor: parseFloat(String(t.valor || t.value || 0)),
      tipo: t.tipo || (parseFloat(String(t.valor || 0)) > 0 ? 'receita' : 'gasto'),
      categoria: t.categoria || t.category || "Outros",
      data: t.data || t.date || new Date().toLocaleDateString('pt-BR'),
      mes: t.mes,
      ano: t.ano || 2026,
      dadosOriginais: t.dadosOriginais
    }));

    setTransactions(normalized);
    setDividas(data.dividas || []);
    setClientes(data.clientes || []);
    
    const newTabs: DynamicTab[] = [];
    if (data.dividas?.length > 0) {
      newTabs.push({ id: 'dividas', label: 'Dívidas', icon: '💳', path: '/dashboard/dividas', isNew: true });
    }
    if (data.clientes?.length > 0) {
      newTabs.push({ id: 'clientes', label: 'Clientes', icon: '👥', path: '/dashboard/clientes', isNew: true });
    }
    setDynamicTabs(newTabs);

    // Persistência imediata para evitar race conditions
    localStorage.setItem("plania_transacoes", JSON.stringify(normalized));
    localStorage.setItem("plania_dividas", JSON.stringify(data.dividas || []));
    localStorage.setItem("plania_clientes", JSON.stringify(data.clientes || []));
    localStorage.setItem("plania_tabs", JSON.stringify(newTabs));

    const income = normalized.filter(t => t.tipo === 'receita').reduce((s, t) => s + Math.abs(t.valor), 0);
    const expenses = normalized.filter(t => t.tipo === 'gasto').reduce((s, t) => s + Math.abs(t.valor), 0);
    
    localStorage.setItem("plania-adapted-summary", JSON.stringify({
      count: normalized.length,
      income: income / 6,
      expenses: expenses / 6,
      savings: (income - expenses) / 6
    }));

    if (data.clientes?.length > 0) {
      localStorage.setItem("plania-user-type", "freelancer");
    }

    setLastSync(new Date());
    setIsSyncing(false);
    window.dispatchEvent(new Event("profile-updated"));
    toast.success(`Sucesso! ${normalized.length} transações importadas.`);
  };

  const clearAllData = () => {
    setTransactions([]);
    setGoals([]);
    setBudgets([]);
    setInvestments([]);
    setDividas([]);
    setClientes([]);
    setDynamicTabs([]);
    setLastSync(null);
    localStorage.clear();
    toast.info("Todos os dados foram removidos.");
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
      setViewType, setSelectedDate, sync, importData, 
      addTransaction, deleteTransaction, addGoal, deleteGoal, addBudget, deleteBudget, 
      getBudgetSpent, clearAllData
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