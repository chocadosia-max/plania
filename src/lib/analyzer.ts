"use client";

export type DataType = 
  | "transacoes" | "metas" | "orcamentos" | "investimentos" 
  | "dividas" | "dre" | "fluxo_caixa" | "estoque" | "clientes" | "projetos";

export interface AnalysisResult {
  temTransacoes: boolean;
  temMetas: boolean;
  temOrcamentos: boolean;
  temInvestimentos: boolean;
  temDividas: boolean;
  temDRE: boolean;
  temFluxoCaixa: boolean;
  temEstoque: boolean;
  temClientes: boolean;
  temProjetos: boolean;
  perfil: "pessoal" | "freelancer" | "empresario";
  contagem: Record<string, number>;
  dadosMapeados: Record<string, any[]>;
}

const KEYWORDS: Record<DataType, string[]> = {
  transacoes: ["gasto", "receita", "débito", "crédito", "pagamento", "recebimento", "valor", "data", "descrição"],
  metas: ["objetivo", "meta", "sonho", "planejado", "alvo", "quero", "prazo"],
  orcamentos: ["orçamento", "limite", "planejado", "previsto", "budget", "categoria"],
  investimentos: ["cdb", "tesouro", "ação", "fii", "fundo", "aplicação", "rendimento", "aporte"],
  dividas: ["dívida", "empréstimo", "parcela", "financiamento", "cartão", "deve", "credor"],
  dre: ["faturamento", "cogs", "margem", "lucro", "despesa operacional", "receita bruta"],
  fluxo_caixa: ["projeção", "previsto", "futuro", "próximo mês", "forecast", "entrada", "saída"],
  estoque: ["estoque", "produto", "quantidade", "unidade", "sku", "item", "preço"],
  clientes: ["cliente", "contrato", "proposta", "fechado", "lead", "pipeline", "status"],
  projetos: ["projeto", "tarefa", "entrega", "sprint", "milestone", "prazo", "status"]
};

export function analisarPlanilha(dados: any[]): AnalysisResult {
  const result: AnalysisResult = {
    temTransacoes: false, temMetas: false, temOrcamentos: false, temInvestimentos: false,
    temDividas: false, temDRE: false, temFluxoCaixa: false, temEstoque: false,
    temClientes: false, temProjetos: false,
    perfil: "pessoal",
    contagem: {},
    dadosMapeados: {}
  };

  if (!dados || dados.length === 0) return result;

  const headers = Object.keys(dados[0]).map(h => h.toLowerCase());
  const contentSample = JSON.stringify(dados.slice(0, 10)).toLowerCase();

  // Detecção por palavras-chave
  (Object.keys(KEYWORDS) as DataType[]).forEach(type => {
    const matches = KEYWORDS[type].filter(k => 
      headers.some(h => h.includes(k)) || contentSample.includes(k)
    );
    
    if (matches.length >= 2) {
      const key = `tem${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof AnalysisResult;
      (result as any)[key] = true;
      result.contagem[type] = dados.length;
      result.dadosMapeados[type] = dados;
    }
  });

  // Inferência de Perfil
  if (result.temDRE || result.temEstoque) result.perfil = "empresario";
  else if (result.temClientes || result.temProjetos) result.perfil = "freelancer";

  return result;
}