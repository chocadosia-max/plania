"use client";

import * as XLSX from 'xlsx';

const MESES_NOMES = [
  ['JAN', 'JANEIRO'], ['FEV', 'FEVEREIRO'], ['MAR', 'MARCO', 'MARÇO'],
  ['ABR', 'ABRIL'], ['MAI', 'MAIO'], ['JUN', 'JUNHO'],
  ['JUL', 'JULHO'], ['AGO', 'AGOSTO'], ['SET', 'SETEMBRO'],
  ['OUT', 'OUTUBRO'], ['NOV', 'NOVEMBRO'], ['DEZ', 'DEZEMBRO']
];

function identificarMesAno(nome: string) {
  const norm = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (let i = 0; i < MESES_NOMES.length; i++) {
    if (MESES_NOMES[i].some(v => norm.includes(v))) {
      const numeros = norm.match(/\d+/g);
      let ano = 2026;
      if (numeros) {
        for (const num of numeros) {
          if (num === "25" || num === "26" || num === "2025" || num === "2026") {
            ano = num.length === 2 ? 2000 + parseInt(num) : parseInt(num);
            break;
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
      // Tenta localizar a linha de cabeçalho (geralmente contém 'Descrição' ou 'Valor')
      let headerRowIndex = -1;
      for (let i = 0; i < Math.min(rows.length, 10); i++) {
        const rowStr = JSON.stringify(rows[i]).toLowerCase();
        if (rowStr.includes('descri') || rowStr.includes('valor')) {
          headerRowIndex = i;
          break;
        }
      }

      const startRow = headerRowIndex === -1 ? 2 : headerRowIndex + 1;
      const saldoPlanilha = parseMoeda(rows[headerRowIndex]?.[15] || rows[headerRowIndex]?.[14] || 0);

      rows.forEach((row, i) => {
        if (!row || i < startRow) return;

        // GASTO FIXO (B a G)
        const nomeFixo = row[1];
        const valorFixo = parseMoeda(row[6]);
        if (nomeFixo && valorFixo > 0 && !String(nomeFixo).toLowerCase().includes('total')) {
          transacoesAba.push({
            id: `fixo_${nomeAba}_${i}`,
            descricao: String(nomeFixo).trim(),
            valor: valorFixo,
            tipo: 'gasto',
            categoria: row[5] || 'Fixo',
            data: `${String(row[3] || 1).padStart(2, '0')}/${String(periodo.mes + 1).padStart(2, '0')}/${periodo.ano}`,
            mes: periodo.mes,
            ano: periodo.ano
          });
        }

        // GASTO VARIÁVEL (I a M)
        const nomeVar = row[8];
        const valorVar = parseMoeda(row[12]);
        if (nomeVar && valorVar > 0 && !String(nomeVar).toLowerCase().includes('total')) {
          transacoesAba.push({
            id: `var_${nomeAba}_${i}`,
            descricao: String(nomeVar).trim(),
            valor: valorVar,
            tipo: 'gasto',
            categoria: row[11] || 'Variável',
            data: `01/${String(periodo.mes + 1).padStart(2, '0')}/${periodo.ano}`,
            mes: periodo.mes,
            ano: periodo.ano
          });
        }

        // RECEITA (O a P)
        const labelRec = row[14];
        const valorRec = parseMoeda(row[15]);
        if (labelRec && valorRec > 0 && !['total', 'saldo', 'entradas'].some(k => String(labelRec).toLowerCase().includes(k))) {
          transacoesAba.push({
            id: `rec_${nomeAba}_${i}`,
            descricao: String(labelRec).trim(),
            valor: valorRec,
            tipo: 'receita',
            categoria: 'Receita',
            data: `01/${String(periodo.mes + 1).padStart(2, '0')}/${periodo.ano}`,
            mes: periodo.mes,
            ano: periodo.ano
          });
        }
      });

      if (transacoesAba.length > 0) {
        resultado.transacoes.push(...transacoesAba);
        const recCalc = transacoesAba.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
        const gasCalc = transacoesAba.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0);
        resultado.validacao.push({ mes: nomeAba, receita: recCalc, gastos: gasCalc, saldo: recCalc - gasCalc, planilha: { saldo: saldoPlanilha } });
      }
    }

    if (normAba.includes('DIVIDA')) {
      rows.forEach((row, i) => {
        if (row && row[1] && row[2] && i > 0 && !String(row[1]).toLowerCase().includes('credor')) {
          resultado.dividas.push({
            id: `div_${i}`,
            credor: row[1],
            valorTotal: parseMoeda(row[2]),
            pagamentos: row.slice(3, 15).map(v => parseMoeda(v)),
            faltando: parseMoeda(row[row.length - 1])
          });
        }
      });
    }

    if (normAba.includes('RUSSO') || normAba.includes('VIOLINO')) {
      rows.forEach((row, i) => {
        if (row && row[0] && i > 0 && !['aluno', 'nome'].some(k => String(row[0]).toLowerCase().includes(k))) {
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