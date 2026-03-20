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
  setViewType: (type: 'month' | 'year') => void;
  setSelectedDate: (date: Date) => void;
  importData: (data: any) => void;
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
    return item ? JSON.parse(item) : fallback;
  } catch (e) { return fallback; }
};

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

  useEffect(() => {
    localStorage.setItem("plania_transacoes", JSON.stringify(transactions));
    localStorage.setItem("plania_metas", JSON.stringify(goals));
    localStorage.setItem("plania_orcamentos", JSON.stringify(budgets));
    localStorage.setItem("plania_investimentos", JSON.stringify(investments));
    localStorage.setItem("plania_dividas", JSON.stringify(dividas));
    localStorage.setItem("plania_clientes", JSON.stringify(clientes));
    localStorage.setItem("plania_tabs", JSON.stringify(dynamicTabs));
  }, [transactions, goals, budgets, investments, dividas, clientes, dynamicTabs]);

  const importData = (data: any) => {
    setTransactions(data.transacoes || []);
    setDividas(data.dividas || []);
    setClientes(data.clientes || []);
    
    const newTabs: DynamicTab[] = [];
    if (data.dividas?.length > 0) newTabs.push({ id: 'dividas', label: 'Dívidas', icon: '💳', path: '/dashboard/dividas', isNew: true });
    if (data.clientes?.length > 0) newTabs.push({ id: 'clientes', label: 'Clientes', icon: '👥', path: '/dashboard/clientes', isNew: true });
    
    setDynamicTabs(newTabs);
    toast.success("Planilha importada com sucesso! 🚀");
  };

  const addTransaction = (t: any) => setTransactions(prev => [{ ...t, id: Date.now().toString() }, ...prev]);
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const addGoal = (g: any) => setGoals(prev => [{ ...g, id: Date.now().toString() }, ...prev]);
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const addBudget = (b: any) => setBudgets(prev => [{ ...b, id: Date.now().toString() }, ...prev]);
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));

  const getBudgetSpent = (cat: string) => {
    return Math.abs(transactions
      .filter(t => t.categoria === cat && t.tipo === 'gasto')
      .reduce((acc, t) => acc + (Number(t.valor) || 0), 0));
  };

  return (
    <PlanIAContext.Provider value={{ 
      transactions, goals, budgets, investments, dividas, clientes, dynamicTabs,
      viewType, selectedDate, setViewType, setSelectedDate,
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