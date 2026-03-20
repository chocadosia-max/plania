"use client";

import React, { useState } from 'react';
import { User, Briefcase, Store, Check, Wallet, Target, Eye, CreditCard, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme, themeConfig, ThemeName } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

/* --- STEP 1: WELCOME --- */
export function WelcomeStep({ onNext, name }: { onNext: () => void; name: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-8 animate-reveal">
      <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl animate-[check-bounce_0.8s_cubic-bezier(0.34,1.56,0.64,1)_both]">
        <Sparkles className="w-12 h-12 text-white" />
      </div>
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          Bem-vindo ao PlanIA, {name}! 🎉
        </h1>
        <p className="text-lg text-white/80 max-w-md mx-auto">
          Vamos configurar tudo em menos de 5 minutos. Prometemos que vale a pena.
        </p>
      </div>
      <div className="pt-4 space-y-4">
        <Button 
          size="lg" 
          onClick={onNext}
          className="bg-white text-primary hover:bg-white/90 text-lg px-10 h-14 rounded-2xl shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          Vamos começar <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <p className="text-sm text-white/60">
          Não precisa ter todos os dados agora. Você pode completar depois.
        </p>
      </div>
    </div>
  );
}

/* --- STEP 2: PROFILES --- */
const profiles = [
  { id: 'pessoal', title: 'Pessoal/Família', desc: 'Gastos pessoais, metas e orçamento familiar', icon: User, color: 'bg-blue-500' },
  { id: 'freelancer', title: 'Freelancer', desc: 'Renda variável, projetos e impostos MEI', icon: Briefcase, color: 'bg-emerald-500' },
  { id: 'empresario', title: 'Empresário', desc: 'Pequeno negócio, fluxo de caixa e DRE', icon: Store, color: 'bg-amber-500' },
];

export function ProfileStep({ onNext }: { onNext: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8 animate-slide-left">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Como você quer usar o PlanIA?</h2>
        <p className="text-muted-foreground">Selecione os perfis que mais combinam com você.</p>
      </div>
      <div className="grid gap-4">
        {profiles.map((p) => {
          const isActive = selected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={cn(
                "flex items-center gap-5 p-6 rounded-2xl border-2 text-left transition-all duration-300 active:scale-[0.98]",
                isActive ? "border-primary bg-primary/5 ring-4 ring-primary/10" : "border-border hover:border-primary/30 bg-card"
              )}
            >
              <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center shrink-0", p.color, "text-white shadow-lg")}>
                <p.icon className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-foreground">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </div>
              {isActive && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-check-bounce">
                  <Check className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <Button size="lg" className="w-full h-14 rounded-2xl text-lg" disabled={selected.length === 0} onClick={onNext}>
        Continuar <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
}

/* --- STEP 3: BASIC DATA --- */
const difficulties = [
  { id: 'gastos', label: 'Gastando demais', icon: '😅' },
  { id: 'metas', label: 'Faltam metas claras', icon: '🎯' },
  { id: 'futuro', label: 'Sem visão do futuro', icon: '😵' },
  { id: 'dividas', label: 'Dívidas para quitar', icon: '💸' },
];

export function DataStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [income, setIncome] = useState("");
  const [payday, setPayday] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-slide-left">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Nos conta um pouco sobre suas finanças</h2>
        <p className="text-muted-foreground">Só o básico. Prometo que é rápido.</p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">Qual sua renda mensal aproximada?</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">R$</span>
            <Input 
              type="number" 
              placeholder="5.000" 
              className="pl-12 h-14 text-lg rounded-xl input-glow"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">Não precisa ser exato. Use uma estimativa.</p>
        </div>

        <div className="space-y-3">
          <Label className="text-base">Qual o dia que você recebe?</Label>
          <div className="flex flex-wrap gap-2">
            {[1, 5, 10, 15, 20, 25, 30].map(d => (
              <button
                key={d}
                onClick={() => setPayday(d)}
                className={cn(
                  "w-12 h-12 rounded-xl border-2 font-bold transition-all",
                  payday === d ? "border-primary bg-primary text-white" : "border-border hover:border-primary/40"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base">Qual sua maior dificuldade hoje?</Label>
          <div className="grid grid-cols-2 gap-3">
            {difficulties.map(d => (
              <button
                key={d.id}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-center"
              >
                <span className="text-2xl">{d.icon}</span>
                <span className="text-xs font-medium">{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button size="lg" className="w-full h-14 rounded-2xl text-lg" onClick={onNext}>
          Continuar <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <button onClick={onSkip} className="w-full text-sm text-muted-foreground hover:text-primary transition-colors">
          Pular por agora
        </button>
      </div>
    </div>
  );
}

/* --- STEP 4: THEME --- */
export function ThemeStep({ onNext }: { onNext: () => void }) {
  const { theme, setTheme } = useTheme();
  const [hoveredTheme, setHoveredTheme] = useState<ThemeName | null>(null);

  return (
    <div className="space-y-8 animate-slide-left relative z-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Como vai ser sua interface?</h2>
        <p className="text-muted-foreground">Você pode trocar quando quiser, mas escolha um favorito!</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {(Object.entries(themeConfig) as [ThemeName, typeof themeConfig[ThemeName]][]).map(([key, t]) => {
          const isActive = theme === key;
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              onMouseEnter={() => setHoveredTheme(key)}
              onMouseLeave={() => setHoveredTheme(null)}
              className={cn(
                "relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 active:scale-95",
                isActive ? "border-primary bg-primary/10 ring-4 ring-primary/20" : "border-border hover:border-primary/40 bg-card"
              )}
            >
              <div className="flex gap-1">
                {t.colors.map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border border-white/20" style={{ background: c }} />
                ))}
              </div>
              <span className="text-sm font-bold">{t.label}</span>
              {isActive && <Check className="absolute top-2 right-2 w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </div>

      <Button size="lg" className="w-full h-14 rounded-2xl text-lg" onClick={onNext}>
        Adorei esse, continuar <ArrowRight className="ml-2 w-5 h-5" />
      </Button>

      {/* Fullscreen preview overlay */}
      {hoveredTheme && (
        <div 
          className="fixed inset-0 -z-10 opacity-30 transition-all duration-700 pointer-events-none"
          style={{ background: themeConfig[hoveredTheme].colors[0] }}
        />
      )}
    </div>
  );
}

/* --- STEP 5: FIRST TRANSACTION --- */
export function TransactionStep({ onFinish, onSkip }: { onFinish: () => void; onSkip: () => void }) {
  const [type, setType] = useState<'receita' | 'gasto'>('gasto');
  const [value, setValue] = useState("");

  return (
    <div className="space-y-8 animate-slide-left">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Sua primeira transação em 30s</h2>
        <p className="text-muted-foreground">Quanto foi o último gasto que você lembra?</p>
      </div>

      <div className="glass-card rounded-3xl p-8 space-y-6 border-primary/20">
        <div className="flex p-1 bg-muted rounded-xl">
          <button 
            onClick={() => setType('receita')}
            className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", type === 'receita' ? "bg-green-500 text-white shadow-lg" : "text-muted-foreground")}
          >
            RECEITA
          </button>
          <button 
            onClick={() => setType('gasto')}
            className={cn("flex-1 py-2 rounded-lg text-sm font-bold transition-all", type === 'gasto' ? "bg-red-400 text-white shadow-lg" : "text-muted-foreground")}
          >
            GASTO
          </button>
        </div>

        <div className="text-center space-y-2">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground">Valor</Label>
          <div className="flex items-center justify-center gap-2">
            <span className={cn("text-3xl font-bold", type === 'receita' ? "text-green-500" : "text-red-400")}>R$</span>
            <input 
              type="number" 
              placeholder="0,00"
              className={cn(
                "bg-transparent border-none outline-none text-5xl font-black w-full max-w-[200px] text-center",
                type === 'receita' ? "text-green-500" : "text-red-400"
              )}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {['🛒', '🍕', '🚗', '🎮', '🏠', '💊', '📚', '🎁'].map(emoji => (
            <button key={emoji} className="w-full aspect-square rounded-2xl bg-muted/50 hover:bg-primary/10 hover:border-primary/30 border-2 border-transparent transition-all text-2xl flex items-center justify-center">
              {emoji}
            </button>
          ))}
        </div>

        <Button size="lg" className="w-full h-14 rounded-2xl text-lg shadow-xl" onClick={onFinish}>
          Registrar e entrar no PlanIA 🚀
        </Button>
      </div>

      <button onClick={onSkip} className="w-full text-sm text-muted-foreground hover:text-primary transition-colors">
        Pular e entrar direto →
      </button>
    </div>
  );
}