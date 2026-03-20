"use client";

import React, { useState } from 'react';
import { DollarSign, Plus, X, ShoppingCart, Car, Pizza, Heart, Gamepad2, BookOpen, Home, Briefcase, Plane, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const categoryIcons: Record<string, any> = {
  "🛒": ShoppingCart, "🚗": Car, "🍕": Pizza, "💊": Heart,
  "🎮": Gamepad2, "📚": BookOpen, "🏠": Home, "💼": Briefcase,
  "✈️": Plane, "🎁": Gift,
};

const defaultCategories = [
  { name: "Mercado", icon: "🛒" },
  { name: "Transporte", icon: "🚗" },
  { name: "Alimentação", icon: "🍕" },
  { name: "Saúde", icon: "💊" },
  { name: "Lazer", icon: "🎮" },
  { name: "Educação", icon: "📚" },
  { name: "Moradia", icon: "🏠" },
  { name: "Trabalho", icon: "💼" },
];

export function FinancialSettings() {
  const [currency, setCurrency] = useState("BRL");
  const [closingDay, setClosingDay] = useState("1");
  const [salary, setSalary] = useState("5600");
  const [categories, setCategories] = useState(defaultCategories);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🎁");

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories((prev) => [...prev, { name: newCatName, icon: newCatIcon }]);
    setNewCatName("");
    toast.success("Categoria adicionada!");
  };

  const removeCategory = (idx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
    toast("Categoria removida");
  };

  return (
    <section className="space-y-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "240ms" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Financeiro</h2>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Moeda</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">R$ Real</SelectItem>
                <SelectItem value="USD">US$ Dólar</SelectItem>
                <SelectItem value="EUR">€ Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dia de fechamento</Label>
            <Select value={closingDay} onValueChange={setClosingDay}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>Dia {i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Renda mensal esperada</Label>
            <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="5600" />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Categorias personalizadas</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40 text-sm group">
                <span>{cat.icon}</span>
                <span className="text-foreground">{cat.name}</span>
                <button onClick={() => removeCategory(idx)} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-1">
              <Input placeholder="Nome da categoria" value={newCatName} onChange={(e) => setNewCatName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCategory()} />
            </div>
            <Select value={newCatIcon} onValueChange={setNewCatIcon}>
              <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.keys(categoryIcons).map((icon) => (
                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={addCategory} className="gap-1">
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}