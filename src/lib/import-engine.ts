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
  
  return todasAbas;
}

// 2. Detectar Colunas Reais
export function detectarColunas(linhas: any[]) {
  if (!linhas || linhas.length === 0) return null;
  
  const cabecalho = Object.keys(linhas[0] || {}).map(c => c.toString().toLowerCase().trim());
  
  return {
    data: cabecalho.find(c => c.includes("data") || c.includes("date") || c.includes("dia") || c.includes("quando") || c.includes("dt")),
    descricao: cabecalho.find(c => c.includes("descri") || c.includes("histor") || c.includes("nome") || c.includes("titulo") || c.includes("lancamento") || c.includes("item") || c.includes("produto") || c.includes("o que") || c.includes("memo") || c.includes("detail")),
    valor: cabecalho.find(c => c.includes("valor") || c.includes("value") || c.includes("amount") || c.includes("preco") || c.includes("preço") || c.includes("total") || c.includes("quantia") || c.includes("quanto") || c.includes("r$") || c.includes("reais")),
    tipo: cabecalho.find(c => c.includes("tipo") || c.includes("type") || c.includes("natureza") || c.includes("operacao") || c.includes("moviment") || c.includes("entrada") || c.includes("saida")),
    categoria: cabecalho.find(c => c.includes("categ") || c.includes("tag") || c.includes("grupo") || c.includes("class") || c.includes("setor"))
  };
}

// 3. Encontrar Descrição Real (Lógica de Fallback Profundo)
function encontrarDescricao(linha: any, mapa: any) {
  // 1. Tenta pelo mapeamento detectado
  if (mapa.descricao && linha[mapa.descricao]) {
    return linha[mapa.descricao].toString().trim();
  }
  
  // 2. Tenta TODOS os nomes possíveis (Case-insensitive e sem acentos)
  const nomesDescricao = [
    "descricao", "descrição", "description", "historico", "histórico", "memo",
    "detalhe", "detalhes", "detail", "nome", "titulo", "título", "label",
    "lancamento", "lançamento", "extrato", "informacao", "informação", "info",
    "complemento", "obs", "observacao", "item", "produto", "servico",
    "estabelecimento", "local", "o que", "onde", "para que"
  ];
  
  const chavesLinha = Object.keys(linha);
  for (const nome of nomesDescricao) {
    const chave = chavesLinha.find(k => {
      const kNorm = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const nNorm = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return kNorm.includes(nNorm);
    });
    if (chave && linha[chave] && linha[chave].toString().trim() !== "") {
      return linha[chave].toString().trim();
    }
  }
  
  // 3. Se nada funcionar, pega a primeira coluna que NÃO é data nem valor
  for (const chave of chavesLinha) {
    const val = linha[chave]?.toString() || "";
    const ehData = /\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(val) || /\d{4}[\/\-]\d{2}[\/\-]\d{2}/.test(val);
    const ehNumero = !isNaN(parseFloat(val.replace("R$", "").replace(".", "").replace(",", ".").trim()));
    
    if (!ehData && !ehNumero && val.trim() !== "" && val.length > 2) {
      return val.trim();
    }
  }
  
  // 4. Último recurso: concatena todos os valores não numéricos
  const textos = Object.entries(linha)
    .filter(([k, v]) => {
      const val = v?.toString() || "";
      const ehNum = !isNaN(parseFloat(val.replace("R$", "").replace(".", "").replace(",", ".").trim()));
      return !ehNum && val.trim() !== "" && val.length > 1;
    })
    .map(([k, v]) => v!.toString().trim())
    .join(" | ");
  
  return textos || null;
}

// 4. Formatar Datas
export function formatarData(dataRaw: any) {
  if (!dataRaw) return new Date().toLocaleDateString("pt-BR");
  try {
    const str = dataRaw.toString().trim();
    if (str.includes("/")) {
      const partes = str.split("/");
      if (partes[2]?.length === 4) return str;
    }
    if (!isNaN(Number(str)) && Number(str) > 30000) {
      const date = XLSX.SSF.parse_date_code(Number(str));
      return `${String(date.d).padStart(2, "0")}/${String(date.m).padStart(2, "0")}/${date.y}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d.toLocaleDateString("pt-BR");
    return str;
  } catch {
    return new Date().toLocaleDateString("pt-BR");
  }
}

// 5. Extrair Dados Reais
export function extrairDados(linhas: any[], mapa: any) {
  // Salva dados brutos para debug
  localStorage.setItem("plania_import_raw", JSON.stringify(linhas.slice(0, 10)));

  return linhas
    .filter(linha => Object.values(linha).some(v => v !== "" && v !== null && v !== undefined))
    .map((linha, index) => {
      const descricaoReal = encontrarDescricao(linha, mapa);
      
      const getByColunaReal = (campo: string) => {
        const nomeColuna = mapa[campo];
        if (!nomeColuna) return null;
        const chaveReal = Object.keys(linha).find(k => k.toLowerCase().trim() === nomeColuna.toLowerCase().trim());
        return chaveReal ? linha[chaveReal] : null;
      };
      
      const valorRaw = getByColunaReal("valor");
      const dataRaw = getByColunaReal("data");
      const tipoRaw = getByColunaReal("tipo");
      const catRaw = getByColunaReal("categoria");
      
      let valorLimpo = 0;
      if (valorRaw) {
        const vStr = valorRaw.toString().replace("R$", "").trim();
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
        id: `imp_${Date.now()}_${index}`,
        descricao: descricaoReal || "—",
        valor: Math.abs(valorLimpo || 0),
        tipo: tipoDetectado,
        categoria: catRaw ? catRaw.toString().trim() : "Outros",
        data: formatarData(dataRaw),
        origem: "importado"
      };
    })
    .filter(t => t.descricao !== "—" || t.valor > 0);
}