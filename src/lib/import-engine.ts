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
  // Remove R$, pontos de milhar e troca vírgula por ponto
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
      
      // Varre a aba para encontrar blocos de dados
      rows.forEach((row, rowIndex) => {
        if (!row) return;

        row.forEach((cell, colIndex) => {
          const val = String(cell || "").toLowerCase();
          
          // Detecta se é uma linha de dados (tem valor na coluna seguinte ou próxima)
          const valorCandidato = parseMoeda(row[colIndex + 1]) || parseMoeda(row[colIndex + 2]) || parseMoeda(row[colIndex + 5]);
          
          if (valorCandidato > 0 && val.length > 2) {
            // Ignora palavras de controle
            if (['total', 'saldo', 'entradas', 'saídas', 'descrição', 'valor', 'vencimento'].some(k => val.includes(k))) return;

            const isReceita = val.includes('salário') || val.includes('receita') || val.includes('venda') || colIndex > 12;
            
            transacoesAba.push({
              id: `imp_${nomeAba}_${rowIndex}_${colIndex}`,
              descricao: String(cell).trim(),
              valor: valorCandidato,
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
        const gasCalc = transacoesAba.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0);
        resultado.validacao.push({ 
          mes: nomeAba, 
          receita: recCalc, 
          gastos: gasCalc, 
          saldo: recCalc - gasCalc,
          planilha: { saldo: recCalc - gasCalc } // Fallback se não achar o saldo real
        });
      }
    }

    // Lógica para Dívidas e Clientes (mantida e reforçada)
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