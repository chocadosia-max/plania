"use client";

import * as XLSX from 'xlsx';

// 1. Varredura Total da Planilha
export async function varrerPlanilha(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer);
  
  const todasAbas: Record<string, any> = {};
  
  workbook.SheetNames.forEach(nomeAba => {
    const aba = workbook.Sheets[nomeAba];
    
    todasAbas[nomeAba] = {
      comCabecalho: XLSX.utils.sheet_to_json(aba, { header: 1 }),
      raw: XLSX.utils.sheet_to_json(aba, { raw: false, defval: "" })
    };
  });
  
  console.log("=== VARREDURA DA PLANILHA ===");
  console.log("Abas encontradas:", workbook.SheetNames);
  
  Object.entries(todasAbas).forEach(([nome, dados]) => {
    console.log(`\nAba: ${nome}`);
    console.log("Primeiras 3 linhas:", dados.comCabecalho.slice(0, 3));
    console.log("Colunas detectadas:", Object.keys(dados.raw[0] || {}));
  });
  
  return todasAbas;
}

// 2. Detectar Colunas Reais
export function detectarColunas(linhas: any[]) {
  if (!linhas || linhas.length === 0) return null;
  
  const cabecalho = Object.keys(linhas[0] || {}).map(c => c.toString().toLowerCase().trim());
  console.log("Colunas reais encontradas:", cabecalho);
  
  const mapa = {
    data: cabecalho.find(c => c.includes("data") || c.includes("date") || c.includes("dia") || c.includes("quando") || c.includes("dt") || c.includes("vencimento")),
    descricao: cabecalho.find(c => c.includes("descri") || c.includes("histor") || c.includes("nome") || c.includes("titulo") || c.includes("lancamento") || c.includes("item") || c.includes("produto") || c.includes("o que") || c.includes("memo") || c.includes("detail")),
    valor: cabecalho.find(c => c.includes("valor") || c.includes("value") || c.includes("amount") || c.includes("preco") || c.includes("preço") || c.includes("total") || c.includes("quantia") || c.includes("quanto") || c.includes("r$") || c.includes("reais")),
    tipo: cabecalho.find(c => c.includes("tipo") || c.includes("type") || c.includes("natureza") || c.includes("operacao") || c.includes("moviment") || c.includes("entrada") || c.includes("saida") || c.includes("debito") || c.includes("credito")),
    categoria: cabecalho.find(c => c.includes("categ") || c.includes("tag") || c.includes("grupo") || c.includes("class") || c.includes("setor"))
  };
  
  console.log("Mapeamento detectado pela IA:", mapa);
  return mapa;
}

// 3. Formatar Datas (Suporta Serial Excel, ISO e DD/MM/YYYY)
export function formatarData(dataRaw: any) {
  if (!dataRaw) return new Date().toLocaleDateString("pt-BR");
  
  try {
    const str = dataRaw.toString().trim();
    
    // Formato DD/MM/YYYY
    if (str.includes("/")) {
      const partes = str.split("/");
      if (partes[2]?.length === 4) return str;
    }
    
    // Número serial do Excel
    if (!isNaN(Number(str)) && Number(str) > 30000) {
      const date = XLSX.SSF.parse_date_code(Number(str));
      return `${String(date.d).padStart(2, "0")}/${String(date.m).padStart(2, "0")}/${date.y}`;
    }
    
    // Formato ISO ou similar
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
    
    return str;
  } catch {
    return new Date().toLocaleDateString("pt-BR");
  }
}

// 4. Detectar Categoria por Descrição (Fallback)
function detectarCategoria(desc: string) {
  const d = desc.toLowerCase();
  if (d.includes("ifood") || d.includes("restaurante") || d.includes("pizza")) return "Alimentação";
  if (d.includes("uber") || d.includes("99") || d.includes("posto") || d.includes("combustivel")) return "Transporte";
  if (d.includes("mercado") || d.includes("extra") || d.includes("carrefour")) return "Mercado";
  if (d.includes("aluguel") || d.includes("condominio")) return "Moradia";
  if (d.includes("netflix") || d.includes("spotify") || d.includes("steam")) return "Lazer";
  return "Outros";
}

// 5. Extrair Dados Reais
export function extrairDados(linhas: any[], mapa: any) {
  return linhas
    .filter(linha => Object.values(linha).some(v => v !== "" && v !== null && v !== undefined))
    .map((linha, index) => {
      const getByColunaReal = (campo: string) => {
        const nomeColuna = mapa[campo];
        if (!nomeColuna) return null;
        
        // Busca case-insensitive no objeto da linha
        const chaveReal = Object.keys(linha).find(k => k.toLowerCase().trim() === nomeColuna.toLowerCase().trim());
        return chaveReal ? linha[chaveReal] : null;
      };
      
      const descRaw = getByColunaReal("descricao");
      const valorRaw = getByColunaReal("valor");
      const dataRaw = getByColunaReal("data");
      const tipoRaw = getByColunaReal("tipo");
      const catRaw = getByColunaReal("categoria");
      
      // Limpeza de valor (Trata R$, pontos e vírgulas)
      let valorLimpo = 0;
      if (valorRaw) {
        const vStr = valorRaw.toString().replace("R$", "").trim();
        // Se tem vírgula e ponto, remove o ponto (milhar) e troca vírgula por ponto (decimal)
        if (vStr.includes(",") && vStr.includes(".")) {
          valorLimpo = parseFloat(vStr.replace(/\./g, "").replace(",", "."));
        } else {
          valorLimpo = parseFloat(vStr.replace(",", "."));
        }
      }
      
      const tipoDetectado = tipoRaw
        ? (tipoRaw.toString().toLowerCase().includes("recei") || 
           tipoRaw.toString().toLowerCase().includes("credi") || 
           tipoRaw.toString().toLowerCase().includes("entra") ? "receita" : "gasto")
        : (valorLimpo >= 0 ? "receita" : "gasto");
      
      return {
        id: `import_${Date.now()}_${index}`,
        descricao: descRaw ? descRaw.toString().trim() : "Sem descrição",
        valor: Math.abs(valorLimpo || 0),
        tipo: tipoDetectado,
        categoria: catRaw ? catRaw.toString().trim() : detectarCategoria(descRaw?.toString() || ""),
        data: formatarData(dataRaw),
        origem: "importado"
      };
    })
    .filter(t => t.descricao !== "Sem descrição" || t.valor > 0);
}