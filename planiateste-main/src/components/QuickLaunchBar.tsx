import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Camera, TrendingUp, TrendingDown } from "lucide-react";

export function QuickLaunchBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 glass-card border-t border-border/30">
      <div className="flex items-center justify-center gap-3 px-4 py-3 max-w-lg mx-auto">
        <Link to="/dashboard/transacoes?tipo=receita">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all duration-200 active:scale-[0.96] text-sm font-medium">
            <Plus className="w-4 h-4" />
            Receita
          </button>
        </Link>
        <Link to="/dashboard/transacoes?tipo=gasto">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-all duration-200 active:scale-[0.96] text-sm font-medium">
            <Plus className="w-4 h-4" />
            Gasto
          </button>
        </Link>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-200 active:scale-[0.96] text-sm font-medium">
          <Camera className="w-4 h-4" />
          Escanear cupom
        </button>
      </div>
    </div>
  );
}
