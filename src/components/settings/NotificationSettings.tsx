"use client";

import React, { useState } from 'react';
import { Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export function NotificationSettings() {
  const [alertOverspend, setAlertOverspend] = useState(true);
  const [weeklyReminder, setWeeklyReminder] = useState(true);
  const [monthlyInsight, setMonthlyInsight] = useState(true);
  const [goalDeadline, setGoalDeadline] = useState(false);

  const items = [
    { label: "Alerta quando gasto passar de 80%", desc: "Receba aviso antes de estourar", checked: alertOverspend, set: setAlertOverspend },
    { label: "Lembrete semanal de lançamentos", desc: "Toda segunda, um toque amigável", checked: weeklyReminder, set: setWeeklyReminder },
    { label: "Insight mensal da IA", desc: "Resumo inteligente todo dia 1°", checked: monthlyInsight, set: setMonthlyInsight },
    { label: "Aviso de meta próxima do prazo", desc: "Quando faltam 7 dias pro deadline", checked: goalDeadline, set: setGoalDeadline },
  ];

  return (
    <section className="space-y-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "320ms" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Bell className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
      </div>

      <div className="glass-card rounded-xl p-6 space-y-5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch checked={item.checked} onCheckedChange={item.set} />
          </div>
        ))}
      </div>
    </section>
  );
}