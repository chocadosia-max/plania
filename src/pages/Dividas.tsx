"use client";

import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, Calendar, Wallet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { usePlanIA } from "@/contexts/PlanIAContext";
import { cn } from "@/lib/utils";

const mesesLabel = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const mesesChaves = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default function Dividas() {
  const { dividas, addDivida, deleteDivida } = usePlanIA();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    credor: "",
    valorTotal: "",
    icone: "💳",
    cor: "#6366F1",
    pagamentos: mesesChaves.reduce((acc, mes) => ({ ...acc, [mes]: 0 }), {})
  });

  const handleSave = () => {
    if (!form.credor || !form.valorTotal) return;
    
    const valorTotalNum = parseFloat(form.valorTotal);
    const totalPago = Object.values(form.pagamentos).reduce((a: any, b: any) => a + (parseFloat(b) || 0), 0);
    
    addDivida({
      ...form,
      valorTotal: valorTotalNum,
      faltando: Math.max(0, valorTotalNum - totalPago)
    });
    
    setIsModalOpen(false);
    setForm({
      credor: "",
      valorTotal: "",
      icone: "💳",
      cor: "#6366F1",
      pagamentos: mesesChaves.reduce((acc, mes) => ({ ...acc, [mes]: 0 }), {})
    });
  };

  const totalDevido = dividas.reduce((s, d) => s + (Number(d.valorTotal) || 0), 0);
  const totalPago = dividas.reduce((s, d) => {
    const pags = d.pagamentos || {};
    return s + Object.values(pags).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
  }, 0);
  const totalFaltando = Math.max(0, totalDevido - totalPago);

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">Dívidas</h1>
          <p className="text-sm text-muted-foreground">Controle seus parcelamentos e débitos</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Nova dívida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Cadastrar Dívida</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Credor / Nome</Label>
                  <Input placeholder="Ex: NuBank, PicPay" value={form.credor} onChange={(e) => setForm({...form, credor: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Valor Total (R$)</Label>
                  <Input type="number" placeholder="0.00" value={form.valorTotal} onChange={(e) => setForm({...form, valorTotal: e.target.value})} />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Pagamentos já realizados (2026)</Label>
                <div className="grid grid-cols-3 gap-3">
                  {mesesChaves.map((mes, i) => (
                    <div key={mes} className="space-y-1">
                      <Label className="text-[10px]">{mesesLabel[i]}</Label>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        className="h-8 text-xs"
                        value={(form.pagamentos as any)[mes]} 
                        onChange={(e) => setForm({
                          ...form, 
                          pagamentos: { ...form.pagamentos, [mes]: e.target.value }
                        })} 
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={!form.credor || !form.valorTotal}>Salvar Dívida</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border-red-400/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Devido</p>
          <p className="text-2xl font-black text-red-400 font-mono-financial">R$ {totalDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-green-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Pago</p>
          <p className="text-2xl font-black text-green-500 font-mono-financial">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 border-orange-400/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Faltando</p>
          <p className="text-2xl font-black text-orange-400 font-mono-financial">R$ {totalFaltando.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-4">
        {dividas.length === 0 ? (
          <div className="py-20 text-center space-y-4 glass-card rounded-3xl border-dashed">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Nenhuma dívida cadastrada. Comece agora!</p>
          </div>
        ) : (
          dividas.map((d, i) => {
            const pags = d.pagamentos || {};
            const totalPagoDivida = Object.values(pags).reduce((a: any, b: any) => a + (Number(b) || 0), 0);
            const percentPago = d.valorTotal > 0 ? Math.min((totalPagoDivida / d.valorTotal) * 100, 100) : 0;
            const faltando = Math.max(0, d.valorTotal - totalPagoDivida);

            return (
              <div key={d.id || i} className="glass-card rounded-2xl p-6 border-l-4 animate-reveal group" style={{ borderLeftColor: d.cor, animationDelay: `${i * 100}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">{d.icone}</div>
                    <div>
                      <h3 className="font-bold text-lg">{d.credor}</h3>
                      <p className="text-xs text-muted-foreground">Total: R$ {Number(d.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={cn("font-black font-mono-financial", faltando === 0 ? "text-green-500" : "text-red-400")}>
                        {faltando === 0 ? "QUITADO ✓" : `Faltam R$ ${faltando.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteDivida(d.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${percentPago}%`, backgroundColor: d.cor }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                    <span>{percentPago.toFixed(1)}% pago</span>
                    <span>R$ {totalPagoDivida.toLocaleString('pt-BR')} pagos</span>
                  </div>
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mt-6">
                  {mesesChaves.map((mes, idx) => {
                    const valor = Number(pags[mes] || 0);
                    const pago = valor > 0;
                    return (
                      <div key={mes} className={cn(
                        "flex flex-col items-center p-1.5 rounded-lg border text-center transition-all",
                        pago ? "bg-primary/10 border-primary/30" : "bg-muted/30 border-border/40"
                      )}>
                        <span className="text-[8px] font-black uppercase text-muted-foreground">{mesesLabel[idx]}</span>
                        <span className={cn("text-[9px] font-bold font-mono-financial mt-0.5", pago ? "text-primary" : "text-muted-foreground/40")}>
                          {pago ? `R$${Math.round(valor)}` : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}