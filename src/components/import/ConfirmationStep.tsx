"use client";

import React from 'react';
import { CheckCircle2, ArrowRight, Wallet, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

interface ConfirmationStepProps {
  data: any[];
}

export function ConfirmationStep({ data }: ConfirmationStepProps) {
  const navigate = useNavigate();
  
  const totalValue = data.reduce((acc, row) => {
    const val = parseFloat(String(row.value).replace(',', '.'));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const handleFinish = () => {
    toast.success(`${data.length} transações importadas com sucesso! 🚀`);
    navigate('/dashboard/transacoes');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-reveal">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-6 animate-check-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black">Quase lá!</h2>
        <p className="text-muted-foreground">Confira o resumo do que estamos prestes a importar.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border-border/40">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Transações</p>
          <p className="text-2xl font-black">{data.length}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-border/40">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Valor Total</p>
          <p className="text-2xl font-black font-mono-financial">R$ {Math.abs(totalValue).toLocaleString('pt-BR')}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-border/40">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Categorias</p>
          <p className="text-2xl font-black">{new Set(data.map(d => d.cat)).size}</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 space-y-4 border-primary/20 bg-primary/5">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-primary shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-bold">Atenção</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao clicar em finalizar, estas transações serão adicionadas ao seu histórico atual. 
              Você poderá editá-las ou excluí-las individualmente na página de Transações.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl" onClick={handleFinish}>
          Finalizar Importação 🚀
        </Button>
        <Button variant="ghost" className="w-full" onClick={() => navigate('/dashboard')}>
          Cancelar e sair
        </Button>
      </div>
    </div>
  );
}