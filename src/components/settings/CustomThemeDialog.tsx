"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CustomThemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomThemeDialog({ open, onOpenChange }: CustomThemeDialogProps) {
  const [customPrimary, setCustomPrimary] = useState("#7c3aed");
  const [customBg, setCustomBg] = useState("#1e1b4b");
  const [customAccent, setCustomAccent] = useState("#ec4899");
  const [customDark, setCustomDark] = useState(true);

  const handleSave = () => {
    onOpenChange(false);
    toast.success("Tema personalizado salvo! 🎨");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar tema personalizado</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="rounded-xl p-4 border border-border/40 transition-all duration-300" style={{ background: customBg }}>
            <div className="flex gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg" style={{ background: customPrimary, opacity: 0.2 }} />
              <div className="flex-1">
                <div className="h-2 w-24 rounded-full mb-1.5" style={{ background: customDark ? "#fff" : "#000", opacity: 0.8 }} />
                <div className="h-1.5 w-16 rounded-full" style={{ background: customDark ? "#fff" : "#000", opacity: 0.3 }} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 rounded-lg" style={{ background: customPrimary, opacity: 0.2 }} />
              <div className="flex-1 h-10 rounded-lg" style={{ background: customAccent, opacity: 0.2 }} />
            </div>
            <div className="mt-2 h-6 rounded-lg flex items-center justify-center" style={{ background: customPrimary }}>
              <span className="text-xs font-medium" style={{ color: customDark ? "#fff" : "#000" }}>Preview do botão</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Cor primária</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                <Input value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Cor de fundo</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                <Input value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Cor de destaque</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                <Input value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Modo</Label>
              <div className="flex items-center gap-3 h-10">
                <Switch checked={customDark} onCheckedChange={setCustomDark} />
                <span className="text-sm text-muted-foreground">{customDark ? "Escuro" : "Claro"}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar meu tema</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}