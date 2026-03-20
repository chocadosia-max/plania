"use client";

import React from 'react';
import { usePlanIA } from "@/contexts/PlanIAContext";
import { Users, Music, Languages, CheckCircle2, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Clientes() {
  const { clientes } = usePlanIA();

  const russo = clientes.filter(c => c.instrumento === 'Russo');
  const violino = clientes.filter(c => c.instrumento === 'Violino');

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-10 animate-reveal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Gestão de Alunos</h1>
          <p className="text-sm text-muted-foreground">Acompanhamento de aulas e pagamentos</p>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-6 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-[10px] font-black uppercase text-blue-500">Russo</p>
            <p className="text-xl font-black">{russo.length} alunos</p>
          </div>
          <div className="text-center px-6 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-[10px] font-black uppercase text-purple-500">Violino</p>
            <p className="text-xl font-black">{violino.length} alunos</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Languages className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold">Alunos de Russo</h2>
        </div>
        <div className="glass-card rounded-3xl overflow-hidden border-border/40">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px] text-[10px] font-black uppercase">Nome do Aluno</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-center">Status Pagamento</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase">Total no Ano</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {russo.map((c, i) => (
                <TableRow key={i} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-bold">{c.nome}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      {c.pagamentos.map((p, idx) => (
                        <div key={idx} className={cn(
                          "w-2 h-2 rounded-full",
                          p > 0 ? "bg-green-500" : "bg-muted"
                        )} title={`Mês ${idx + 1}: R$ ${p}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono-financial font-bold">R$ {c.totalAno.toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Music className="w-6 h-6 text-purple-500" />
          <h2 className="text-xl font-bold">Alunos de Violino</h2>
        </div>
        <div className="glass-card rounded-3xl overflow-hidden border-border/40">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px] text-[10px] font-black uppercase">Nome do Aluno</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-center">Status Pagamento</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase">Total no Ano</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {violino.map((c, i) => (
                <TableRow key={i} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-bold">{c.nome}</TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      {c.pagamentos.map((p, idx) => (
                        <div key={idx} className={cn(
                          "w-2 h-2 rounded-full",
                          p > 0 ? "bg-green-500" : "bg-muted"
                        )} title={`Mês ${idx + 1}: R$ ${p}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono-financial font-bold">R$ {c.totalAno.toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}