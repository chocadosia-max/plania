"use client";

import * as XLSX from 'xlsx';

const MAPA_MESES: Record<string, { mes: number, ano: number }> = {
  'JAN26': { mes: 0, ano: 2026 }, 'FEV26': { mes: 1, ano: 2026 }, 'MAR26': { mes: 2, ano: 2026 },
  'ABR26': { mes: 3, ano: 2026 }, 'MAI26': { mes: 4, ano: 2026 }, 'JUN26': { mes: 5, ano: 2026 },
  'JUL26': { mes: 6, ano: 2026 }, 'AGO26': { mes: 7, ano: 2026 }, 'SET26': { mes: 8, ano: 2026 },
  'OUT26': { mes: 9, ano: 2026 }, 'NOV26': { mes: 10, ano: 2026 }, 'DEZ26': { mes: 11, ano: 2026 },
};

export async function processarPlanilhaEspecializada(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  
  const resultado = {
    transacoes: [] as any[],
    dividas: [] as any[],
    clientes: [] as any[],
    receitasAnuais: [] as any[],
    validacao: [] as any[]
  };

  workbook.SheetNames.forEach(nomeAba => {
    const sheet = workbook.Sheets[nomeAba];
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    // 1. ABAS MENSAIS (JAN26 - DEZ26)
    if (MAPA_MESES[nomeAba]) {
      const periodo = MAPA_MESES[nomeAba];
      
      // Validação da Linha 1 (Totais)
      const totalGastosPlanilha = parseFloat(rows[0]?.[3]) || 0;
      const saldoPlanilha = parseFloat(rows[0]?.[15]) || 0;

      const transacoesAba = [];
      
      // Pula cabeçalhos (começa na linha 5 / índice 4)
      rows.slice(4).forEach((row, i) => {
        // --- GASTO FIXO (B-G) ---
        const nomeFixo = row[1];
        const valorFixo = parseFloat(row[6]);
        if (nomeFixo && valorFixo > 0) {
          const dia = parseInt(row[3]) || 1;
          transacoesAba.push({
            id: `fixo_${nomeAba}_${i}`,
            descricao: String(nomeFixo).trim(),
            valor: valorFixo,
            tipo: 'gasto',
            subtipo: 'fixo',
            categoria: row[5] || 'Outros',
            formaPagamento: row[4] || '',
            pago: row[2] === true || String(row[2]).toLowerCase() === 'true',
            data: `${String(dia).padStart(2, '0')}/${String(periodo.mes + 1).padStart(2, '0')}/${periodo.ano}`,
            dadosOriginais: row
          });
        }

        // --- GASTO VARIÁVEL (I-M) ---
        const nomeVar = row[8];
        const valorVar = parseFloat(row[12]);
        if (nomeVar && valorVar > 0) {
          let dataFmt = `01/${String(periodo.mes + 1).padStart(2, '0')}/${periodo.ano}`;
          if (row[9] instanceof Date) {
            dataFmt = `${String(row[9].getDate()).padStart(2, '0')}/${String(row[9].getMonth() + 1).padStart(2, '0')}/${row[9].getFullYear()}`;
          }
          transacoesAba.push({
            id: `var_${nomeAba}_${i}`,
            descricao: String(nomeVar).trim(),
            valor: valorVar,
            tipo: 'gasto',
            subtipo: 'variavel',
            categoria: row[11] || 'Outros',
            formaPagamento: row[10] || '',
            pago: true,
            data: dataFmt,
            dadosOriginais: row
          });
        }

        // --- RECEITA (O-P) ---
        const labelRec = row[14];
        const valorRec = parseFloat(row[15]);
        const labelsIgnorar = ['variável', 'variavel', 'entradas', 'salário', 'salario'];
        if (labelRec && valorRec > 0 && !labelsIgnorar.includes(String(labelRec).toLowerCase())) {
          transacoesAba.push({
            id: `rec_${nomeAba}_${i}`,
            descricao: String(labelRec).trim(),
            valor: valorRec,
            tipo: 'receita',
            categoria: 'Receita',
            data: `01/${String(periodo.mes + 1).padStart(2, '0')}/${periodo.ano}`,
            dadosOriginais: row
          });
        }
      });

      resultado.transacoes.push(...transacoesAba);
      
      // Cálculo de validação
      const recCalc = transacoesAba.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
      const gasCalc = transacoesAba.filter(t => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0);
      resultado.validacao.push({
        mes: nomeAba,
        receita: recCalc,
        gastos: gasCalc,
        saldo: recCalc - gasCalc,
        planilha: { gastos: totalGastosPlanilha, saldo: saldoPlanilha }
      });
    }

    // 2. ABA DÍVIDAS
    if (nomeAba === 'DÍVIDAS') {
      rows.slice(1).forEach((row, i) => {
        if (row[1] && row[2]) {
          resultado.dividas.push({
            id: `div_${i}`,
            credor: row[1],
            valorTotal: parseFloat(row[2]),
            pagamentos: row.slice(3, 15).map(v => parseFloat(v) || 0),
            saldoRestante: parseFloat(row[row.length - 1]) || 0
          });
        }
      });
    }

    // 3. ABAS RUSSO / VIOLINO
    if (nomeAba === 'RUSSO' || nomeAba === 'VIOLINO') {
      rows.slice(1).forEach((row, i) => {
        if (row[0]) {
          resultado.clientes.push({
            id: `${nomeAba.toLowerCase()}_${i}`,
            nome: row[0],
            instrumento: nomeAba === 'RUSSO' ? 'Russo' : 'Violino',
            pagamentos: row.slice(1, 13).map(v => parseFloat(v) || 0),
            totalAno: row.slice(1, 13).reduce((s, v) => s + (parseFloat(v) || 0), 0)
          });
        }
      });
    }
  });

  return resultado;
}