"use client";

import React from 'react';
import { Separator } from "@/components/ui/separator";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { FinancialSettings } from "@/components/settings/FinancialSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { DataSettings } from "@/components/settings/DataSettings";

const Configuracoes = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-10">
      <div style={{ animation: "reveal 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalize sua experiência no PlanIA</p>
      </div>

      <AppearanceSettings />
      <Separator />
      <ProfileSettings />
      <Separator />
      <FinancialSettings />
      <Separator />
      <NotificationSettings />
      <Separator />
      <DataSettings />
    </div>
  );
};

export default Configuracoes;