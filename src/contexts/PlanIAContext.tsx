"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { AnalysisResult } from "@/lib/analyzer";

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
  dynamicTabs: DynamicTab[];
  analysis: AnalysisResult | null;
  isSyncing: boolean;
  lastSync: Date | null;
  importData: (data: any[], mode: 'add' | 'replace') => void;
  setAnalysis: (a: AnalysisResult | null) => void;
  addTransaction: (t: any) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (g: any) => void;
  deleteGoal: (id: string) => void;
  addBudget: (b: any) => void;
  deleteBudget: (id: string) => void;
  addInvestment: (i: any) => void;
  deleteInvestment: (id: string) => void;
  getBudgetSpent: (cat: string) => number;
}

const PlanIAContext = createContext<PlanIAContextType | undefined>(undefined);

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    const parsed = JSON.parse(item);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (e) {
    console.error(`Erro ao carregar ${key}:`, e);
    return fallback;
  }
};

export const PlanIAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<any[]>(() => safeParse("plania_transacoes", []));
  const [goals, setGoals] = useState<any[]>(() => safeParse("plania_metas", []));
  const [budgets, setBudgets] = useState<any[]>(() => safeParse("plania_orcamentos", []));
  const [investments, setInvestments] = useState<any[]>(() => safeParse("plania_investimentos", []));
  const [dynamicTabs, setDynamicTabs] = useState<DynamicTab[]>(() => safeParse("plania_tabs", []));
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    localStorage.setItem("plania_transacoes", JSON.stringify(transactions));
    localStorage.setItem("plania_metas", JSON.stringify(goals));
    localStorage.setItem("plania_orcamentos", JSON.stringify(budgets));
    localStorage.setItem("plania_investimentos", JSON.stringify(investments));
    localStorage.setItem("plania_tabs", JSON.stringify(dynamicTabs));
  }, [transactions, goals, budgets, investments, dynamicTabs]);

  const importData = (data: any[], mode: 'add' | 'replace') => {
    setIsSyncing(true);
    setTimeout(() => {
      const cleanData = Array.isArray(data) ? data : [];
      if (mode === 'replace') {
        setTransactions(cleanData);
      } else {
        setTransactions(prev => [...cleanData, ...prev]);
      }
      
      if (analysis) {
        const newTabs: DynamicTab[] = [];
        if (analysis.temDividas) newTabs.push({ id: 'dividas', label: 'Dívidas', icon: '💳', path: '/dashboard/dividas', isNew: true });
        if (analysis.temEstoque) newTabs.push({ id: 'estoque', label: 'Estoque', icon: '📦', path: '/dashboard/estoque', isNew: true });
        if (analysis.temClientes) newTabs.push({ id: 'clientes', label: 'Clientes', icon: '👥', path: '/dashboard/clientes', isNew: true });
        if (analysis.temDRE) newTabs.push({ id: 'dre', label: 'DRE', icon: '📋', path: '/dashboard/dre', isNew: true });
        
        setDynamicTabs(prev => {
          const existingIds = prev.map(t => t.id);
          const filteredNew = newTabs.filter(t => !existingIds.includes(t.id));
          return [...prev, ...filteredNew];
        });
        localStorage.setItem("plania-user-type", analysis.perfil);
      }
      setIsSyncing(false);
      setLastSync(new Date());
      toast.success("Dados importados com sucesso! 🚀");
    }, 1500);
  };

  const addTransaction = (t: any) => setTransactions(prev => [{ ...t, id: Date.now().toString() }, ...prev]);
  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  
  const addGoal = (g: any) => setGoals(prev => [{ ...g, id: Date.now().toString() }, ...prev]);
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  
  const addBudget = (b: any) => setBudgets(prev => [{ ...b, id: Date.now().toString() }, ...prev]);
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));
  
  const addInvestment = (i: any) => setInvestments(prev => [{ ...i, id: Date.now().toString() }, ...prev]);
  const deleteInvestment = (id: string) => setInvestments(prev => prev.filter(i => i.id !== id));

  const getBudgetSpent = (cat: string) => {
    return Math.abs(transactions
      .filter(t => t.cat === cat && t.type === 'gasto')
      .reduce((acc, t) => acc + (Number(t.value) || 0), 0));
  };

  return (
    <PlanIAContext.Provider value={{ 
      transactions, goals, budgets, investments, dynamicTabs, analysis, isSyncing, lastSync,
      importData, setAnalysis, addTransaction, deleteTransaction, addGoal, deleteGoal, 
      addBudget, deleteBudget, addInvestment, deleteInvestment, getBudgetSpent
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