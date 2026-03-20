"use client";

import * as XLSX from 'xlsx';

const MAPA_MESES: Record<string, { mes: number, ano: number }> = {
  'JAN26': { mes: 0, ano: 2026 }, 'FEV26': { mes: 1, ano: 2026 }, 'MAR26': { mes: 2, ano: 2026 },
  'ABR26': { mes: 3, ano: 2026 }, 'MAI26': { mes: 4, ano: 2026 }, 'JUN26': { mes: 5, ano: 2026 },
  'JUL26': { mes: 6, ano: 2026 }, 'AGO26': { mes: 7, ano: 2026 }, 'SET26': { mes: 8, ano: 2026 },
  'OUT26': { mes: 9, ano: 2026 }, 'NOV26': { mes: 10, ano: 2026 }, 'DEZ26': { mes: 11, ano: 2026 },
};

// Função auxiliar para converter qualquer formato de moeda/texto em número puro
function parseMoeda(val: any): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === 'number') return val;
  
  try {
    // Remove R$, espaços e pontos de milhar, troca vírgula por ponto
    const limpo = String(val)
      .replace(/R\$/g, '')
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    
    const num = parseFloat(limpo);
    return isNaN(num) ? 0 : num;
  } catch (e) {
    return 0;
  }
}

export async function processarPlanilhaEspecializada(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { cellDates: true });
  
  const resultado = {
    transacoes: [] as any[],
    dividas: [] as any[],
    clientes: [] as any[],
    validacao: [] as any[]
  };

  workbook.SheetNames.forEach(nomeAba => {
    const sheet = workbook.Sheets[nomeAba];
    // header: 1 retorna um array de arrays (linhas e colunas)
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

    if (MAPA_MESES[nomeAba]) {
      const periodo = MAPA_MESES[nomeAba];
      
      // Validação da Linha 1 (Totais da Planilha)
      const totalGastosPlanilha = parseMoeda(rows[0]?.[3]);
      const saldoPlanilha = parseMoeda(rows[0]?.[15]);

      const transacoesAba = [];
      
      // Varredura das linhas de dados (começando da linha 5)
      rows.slice(4).forEach((row, i) => {
        if (!row) return;

        // --- GASTO FIXO (Colunas B a G) ---
        const nomeFixo = row[1];
        const valorFixo = parseMoeda(row[6]);
        if (nomeFixo && valorFixo > 0) {
          const dia = parseInt(row[3]) || 1;
          transacoesAba.push({
            id: `fixo_${nomeAba}_${i}`,
            descricao: String(nomeFixo).trim(),
            valor: valorFixo,
            tipo: 'gasto',
            subtipo: 'fixo',
            categoria: row[5] || 'Fixo',
            data: `${String(dia).padStart(2, '0')}/${String(periodo.mes + 1).padStart(2, '0')}/${periodo.ano}`,
            mes: periodo.mes,
            ano: periodo.ano
          });
        }

        // --- GASTO VARIÁVEL (Colunas I a M) ---
        const nomeVar = row[8];
        const valorVar = parseMoeda(row[12]);
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
            categoria: row[11] || 'Variável',
            data: dataFmt,
            mes: periodo.mes,
            ano: periodo.ano
          });
        }

        // --- RECEITA (Colunas O a P) ---
        const labelRec = row[14];
        const valorRec = parseMoeda(row[15]);
        const labelsIgnorar = ['variável', 'variavel', 'entradas', 'salário', 'salario', 'total'];
        
        if (labelRec && valorRec > 0 && !labelsIgnorar.includes(String(labelRec).toLowerCase())) {
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

      resultado.transacoes.push(...transacoesAba);
      
      // Cálculo de validação para a tela de análise
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
        if (row && row[1] && row[2]) {
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

    // 3. ABAS DE ALUNOS (RUSSO / VIOLINO)
    if (nomeAba === 'RUSSO' || nomeAba === 'VIOLINO') {
      rows.slice(1).forEach((row, i) => {
        if (row && row[0]) {
          resultado.clientes.push({
            id: `${nomeAba.toLowerCase()}_${i}`,
            nome: row[0],
            instrumento: nomeAba === 'RUSSO' ? 'Russo' : 'Violino',
            pagamentos: row.slice(1, 13).map(v => parseMoeda(v)),
            totalAno: row.slice(1, 13).reduce((s, v) => s + parseMoeda(v), 0)
          });
        }
      });
    }
  });

  return resultado;
}