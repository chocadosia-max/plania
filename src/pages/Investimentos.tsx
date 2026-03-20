"use client";

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Plus, RefreshCw, Wallet, 
  Trophy, Calendar, PieChart, List, BarChart3, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  Coins, Landmark, Building2, Bitcoin, ShieldCheck, Briefcase,
  Edit2, Trash2, ArrowRightLeft, CheckCircle2, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/* --- TYPES --- */
interface Asset {
  id: number;
  name: string;
  type: 'Renda Fixa' | 'Ações' | 'FII' | 'Cripto' | 'Tesouro' | 'Fundo';
  value: number;
  yield: number;
  yieldPct: number;
  composition: number;
  startDate: string;
  contribution: number;
  redeemed?: boolean;
  redeemDate?: string;
}

/* --- DATA --- */
const initialAssets: Asset[] = [
  { id: 1, name: "CDB Banco Inter 102%", type: 'Renda Fixa', value: 12400, yield: 843, yieldPct: 7.3, composition: 26, startDate: '2024-01-10', contribution: 11557 },
  { id: 2, name: "Petrobras (PETR4)", type: 'Ações', value: 8500, yield: 1250, yieldPct: 17.2, composition: 18, startDate: '2024-03-15', contribution: 7250 },
  { id: 3, name: "HGLG11", type: 'FII', value: 6200, yield: 480, yieldPct: 8.4, composition: 13, startDate: '2024-05-20', contribution: 5720 },
];

export default function Investimentos() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [activeTab, setActiveTab] = useState("ativos");

  const filteredAssets = useMemo(() => {
    if (activeTab === "ativos") return assets.filter(a => !a.redeemed);
    if (activeTab === "encerrados") return assets.filter(a => a.redeemed);
    return assets;
  }, [assets, activeTab]);

  const handleRedeem = (id: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, redeemed: true, redeemDate: new Date().toISOString() } : a));
    toast.success("✅ Investimento marcado como resgatado");
  };

  const handleDelete = (id: number) => {
    const asset = assets.find(a => a.id === id);
    setAssets(prev => prev.filter(a => a.id !== id));
    toast.error(`🗑️ Investimento ${asset?.name} excluído`, {
      action: { label: "Desfazer →", onClick: () => setAssets(prev => [...prev, asset!]) }
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-reveal">
        <div className="space-y-1">
          <h1 className="text-4xl font-black font-sora text-foreground tracking-tight">Investimentos</h1>
          <p className="text-sm text-muted-foreground">Seu patrimônio investido em tempo real</p>
        </div>
        <Button className="gap-2 rounded-xl bg-primary shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> Novo investimento</Button>
      </div>

      {/* TABS */}
      <Tabs defaultValue="ativos" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="ativos" className="rounded-lg px-8">Ativos</TabsTrigger>
          <TabsTrigger value="encerrados" className="rounded-lg px-8">Encerrados</TabsTrigger>
          <TabsTrigger value="todos" className="rounded-lg px-8">Todos</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredAssets.map((a, i) => (
            <AssetCard key={a.id} asset={a} delay={i * 80} onRedeem={() => handleRedeem(a.id)} onDelete={() => handleDelete(a.id)} />
          ))}
        </div>
      </Tabs>
    </div>
  );
}

function AssetCard({ asset: a, delay, onRedeem, onDelete }: any) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [keepInHistory, setKeepInHistory] = useState(true);

  return (
    <div className={cn("glass-card rounded-2xl p-5 space-y-4 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group relative animate-reveal", a.redeemed && "opacity-60 grayscale")} style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"><TrendingUp className="w-5 h-5" /></div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{a.name}</h4>
            {a.redeemed ? <Badge variant="secondary" className="text-[8px] uppercase">Encerrado em {format(new Date(a.redeemDate), "dd/MM/yy")}</Badge> : <Badge variant="outline" className="text-[8px] uppercase">{a.type}</Badge>}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="gap-2"><Edit2 className="w-4 h-4" /> Editar investimento</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><Plus className="w-4 h-4" /> Registrar novo aporte</DropdownMenuItem>
            <DropdownMenuItem className="gap-2"><ArrowRightLeft className="w-4 h-4" /> Resgate parcial</DropdownMenuItem>
            {!a.redeemed && <DropdownMenuItem className="gap-2 text-green-500 focus:text-green-500" onClick={onRedeem}><CheckCircle2 className="w-4 h-4" /> Marcar como resgatado</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => setIsDeleteModalOpen(true)}><Trash2 className="w-4 h-4" /> Excluir investimento</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-1">
        <p className="text-xl font-black font-mono-financial">R$ {a.value.toLocaleString('pt-BR')}</p>
        <p className="text-xs font-bold text-green-500">+{a.yieldPct}% (R$ {a.yield})</p>
      </div>

      {/* DELETE MODAL */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4"><TrendingUp className="w-8 h-8 text-destructive" /></div>
            <DialogTitle className="text-xl font-bold">Excluir {a.name}?</DialogTitle>
          </DialogHeader>
          <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
            <p className="font-bold text-foreground">Você perderá o registro de:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• R$ {a.contribution.toLocaleString('pt-BR')} em aportes</li>
              <li>• R$ {a.yield.toLocaleString('pt-BR')} em rendimentos</li>
              <li>• Histórico desde {format(new Date(a.startDate), "MMMM yyyy", { locale: ptBR })}</li>
            </ul>
          </div>
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5"><Label className="text-sm font-bold">Manter no histórico</Label><p className="text-xs text-muted-foreground">Recomendado: marca como encerrado sem apagar.</p></div>
            <Switch checked={keepInHistory} onCheckedChange={setKeepInHistory} />
          </div>
          <DialogFooter className="sm:justify-center gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => { if (keepInHistory) onRedeem(); else onDelete(); setIsDeleteModalOpen(false); }}>Excluir mesmo assim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}