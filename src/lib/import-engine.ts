"use client";

import * as XLSX from 'xlsx';

const MESES_NOMES = [
  ['JAN', 'JANEIRO'], ['FEV', 'FEVEREIRO'], ['MAR', 'MARCO', 'MARÇO'],
  ['ABR', 'ABRIL'], ['MAI', 'MAIO'], ['JUN', 'JUNHO'],
  ['JUL', 'JULHO'], ['AGO', 'AGOSTO'], ['SET', 'SETEMBRO'],
  ['OUT', 'OUTUBRO'], ['NOV', 'NOVEMBRO'], ['DEZ', 'DEZEMBRO']
];

function identificarMesAno(nome: string) {
  const norm = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  
  for (let i = 0; i < MESES_NOMES.length; i++) {
    if (MESES_NOMES[i].some(v => norm.includes(v))) {
      const numeros = norm.match(/\d+/g);
      let ano = 2026;
      if (numeros) {
        for (const num of numeros) {
          if (num.length === 2 || num.length === 4) {
            const n = parseInt(num);
            if (n === 25 || n === 26 || n === 2025 || n === 2026) {
              ano = n < 100 ? 2000 + n : n;
              break;
            }
          }
        }
      }
      return { mes: i, ano };
    }
  }
  return null;
}

function parseMoeda(val: any): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  if (!str) return 0;
  const clean = str.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const final = parseFloat(clean);
  return isNaN(final) ? 0 : final;
}

export async function processarPlanilhaEspecializada(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true, raw: false });
  
  const resultado = {
    transacoes: [] as any[],
    dividas: [] as any[],
    clientes: [] as any[],
    validacao: [] as any[]
  };

  workbook.SheetNames.forEach(nomeAba => {
    const sheet = workbook.Sheets[nomeAba];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
    const normAba = nomeAba.toUpperCase().trim();
    const periodo = identificarMesAno(normAba);

    if (periodo) {
      const transacoesAba = [];
      
      rows.forEach((row, rowIndex) => {
        if (!row) return;

        row.forEach((cell, colIndex) => {
          const val = String(cell || "").toLowerCase().trim();
          if (val.length < 2) return;

          // Ignora cabeçalhos e palavras de controle
          const palavrasIgnorar = ['tipo', 'descrição', 'valor', 'total', 'saldo', 'entradas', 'saídas', 'vencimento', 'status', 'categoria'];
          if (palavrasIgnorar.some(k => val === k || val.startsWith(k + ' '))) return;

          const valorCandidato = parseMoeda(row[colIndex + 1]) || parseMoeda(row[colIndex + 2]);
          
          if (valorCandidato > 0) {
            // Lógica de detecção de receita baseada em palavras-chave ou posição da coluna (geralmente receitas ficam à direita ou em colunas específicas)
            const keywordsReceita = ['salário', 'receita', 'venda', 'pix recebido', 'transferência recebida', 'rendimento', 'bônus'];
            const isReceita = keywordsReceita.some(k => val.includes(k)) || colIndex > 10;
            
            transacoesAba.push({
              id: `imp_${nomeAba}_${rowIndex}_${colIndex}`,
              descricao: String(cell).trim(),
              valor: isReceita ? valorCandidato : -valorCandidato,
              tipo: isReceita ? 'receita' : 'gasto',
              categoria: isReceita ? 'Receita' : 'Geral',
              data: `01/${String(periodo.mes + 1).padStart(2, '0')}/${periodo.ano}`,
              mes: periodo.mes,
              ano: periodo.ano
            });
          }
        });
      });

      if (transacoesAba.length > 0) {
        resultado.transacoes.push(...transacoesAba);
        const recCalc = transacoesAba.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
        const gasCalc = transacoesAba.filter(t => t.tipo === 'gasto').reduce((s, t) => s + Math.abs(t.valor), 0);
        resultado.validacao.push({ 
          mes: nomeAba, 
          receita: recCalc, 
          gastos: gasCalc, 
          saldo: recCalc - gasCalc,
          planilha: { saldo: recCalc - gasCalc }
        });
      }
    }

    if (normAba.includes('DIVIDA') || normAba.includes('DÍVIDA')) {
      rows.forEach((row, i) => {
        if (row && row.length > 2 && i > 0) {
          const valor = parseMoeda(row[2] || row[1]);
          if (valor > 0) {
            resultado.dividas.push({
              id: `div_${i}`,
              credor: row[1] || row[0],
              valorTotal: valor,
              pagamentos: row.slice(2, 14).map(v => parseMoeda(v)),
              faltando: parseMoeda(row[row.length - 1])
            });
          }
        }
      });
    }

    if (normAba.includes('RUSSO') || normAba.includes('VIOLINO') || normAba.includes('ALUNO')) {
      rows.forEach((row, i) => {
        if (row && row[0] && i > 0 && String(row[0]).length > 3) {
          resultado.clientes.push({
            id: `${nomeAba.toLowerCase()}_${i}`,
            nome: row[0],
            instrumento: normAba.includes('RUSSO') ? 'Russo' : 'Violino',
            pagamentos: row.slice(1, 13).map(v => parseMoeda(v)),
            totalAno: row.slice(1, 13).reduce((s, v) => s + parseMoeda(v), 0)
          });
        }
      });
    }
  });

  return resultado;
}