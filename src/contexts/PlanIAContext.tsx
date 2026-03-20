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
  deleteTransaction: (id: string) => void;
  deleteGoal: (id: string) => void;
  deleteBudget: (id: string) => void;
  deleteInvestment: (id: string) => void;
}

const PlanIAContext = createContext<PlanIAContextType | undefined>(undefined);

export const PlanIAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<any[]>(() => JSON.parse(localStorage.getItem("plania_transacoes") || "[]"));
  const [goals, setGoals] = useState<any[]>(() => JSON.parse(localStorage.getItem("plania_metas") || "[]"));
  const [budgets, setBudgets] = useState<any[]>(() => JSON.parse(localStorage.getItem("plania_orcamentos") || "[]"));
  const [investments, setInvestments] = useState<any[]>(() => JSON.parse(localStorage.getItem("plania_investimentos") || "[]"));
  const [dynamicTabs, setDynamicTabs] = useState<DynamicTab[]>(() => JSON.parse(localStorage.getItem("plania_tabs") || "[]"));
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
    // Simulação de processamento
    setTimeout(() => {
      if (mode === 'replace') {
        setTransactions(data);
      } else {
        setTransactions(prev => [...data, ...prev]);
      }
      
      // Atualizar abas baseadas na análise
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
      toast.success("Dados importados e sistema adaptado! 🚀");
    }, 1500);
  };

  const deleteTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));
  const deleteBudget = (id: string) => setBudgets(prev => prev.filter(b => b.id !== id));
  const deleteInvestment = (id: string) => setInvestments(prev => prev.filter(i => i.id !== id));

  return (
    <PlanIAContext.Provider value={{ 
      transactions, goals, budgets, investments, dynamicTabs, analysis, isSyncing, lastSync,
      importData, setAnalysis, deleteTransaction, deleteGoal, deleteBudget, deleteInvestment
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