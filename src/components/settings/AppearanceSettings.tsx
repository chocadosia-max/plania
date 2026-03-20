"use client";

import React, { useState } from 'react';
import { Palette, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, themeConfig, ThemeName } from "@/contexts/ThemeContext";
import { ThemePreview } from "./ThemePreview";
import { CustomThemeDialog } from "./CustomThemeDialog";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [showCustomTheme, setShowCustomTheme] = useState(false);

  return (
    <section className="space-y-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "80ms" }}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Palette className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Deixe do seu jeito</h2>
          <p className="text-xs text-muted-foreground">Escolha um tema ou crie o seu próprio</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.entries(themeConfig) as [ThemeName, typeof themeConfig[ThemeName]][]).map(([key, t]) => {
          const isActive = theme === key;
          return (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`relative text-left glass-card rounded-xl p-4 transition-all duration-400 hover:border-primary/40 active:scale-[0.97] ${
                isActive ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10" : ""
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                  <Check className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <ThemePreview colors={t.colors} />
              <h3 className="font-semibold text-foreground text-sm mt-3">{t.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            </button>
          );
        })}
      </div>

      <Button variant="outline" className="gap-2" onClick={() => setShowCustomTheme(true)}>
        <Plus className="w-4 h-4" /> Criar meu tema +
      </Button>

      <CustomThemeDialog open={showCustomTheme} onOpenChange={setShowCustomTheme} />
    </section>
  );
}