"use client";

import * as XLSX from 'xlsx';

const MAPA_MESES: Record<string, { mes: number, ano: number }> = {
  'JAN26': { mes: 0, ano: 2026 }, 'FEV26': { mes: 1, ano: 2026 }, 'MAR26': { mes: 2, ano: 2026 },
  'ABR26': { mes: 3, ano: 2026 }, 'MAI26': { mes: 4, ano: 2026 }, 'JUN26': { mes: 5, ano: 2026 },
  'JUL26': { mes: 6, ano: 2026 }, 'AGO26': { mes: 7, ano: 2026 }, 'SET26': { mes: 8, ano: 2026 },
  'OUT26': { mes: 9, ano: 2026 }, 'NOV26': { mes: 10, ano: 2026 }, 'DEZ26': { mes: 11, ano: 2026 },
};

function parseMoeda(val: any): number {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === 'number') return val;
  
  const str = String(val).trim();
  if (!str) return 0;

  // Limpeza agressiva: remove R$, espaços e caracteres não numéricos exceto , e .
  const clean = str.replace(/[R$\s]/g, '');
  
  // Lógica para detectar separador decimal (vírgula vs ponto)
  if (clean.includes(',') && !clean.includes('.')) {
    return parseFloat(clean.replace(',', '.'));
  }
  if (clean.includes(',') && clean.includes('.')) {
    // Formato brasileiro: 1.234,56
    if (clean.indexOf(',') > clean.indexOf('.')) {
      return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    } 
    // Formato americano: 1,234.56
    return parseFloat(clean.replace(/,/g, ''));
  }
  
  const final = parseFloat(clean.replace(',', '.'));
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

    if (MAPA_MESES[nomeAba]) {
      const periodo = MAPA_MESES[nomeAba];
      const transacoesAba = [];
      
      // Captura o saldo da planilha (geralmente na célula P1 ou próxima)
      // Vamos procurar o valor de saldo na primeira linha
      const saldoPlanilha = parseMoeda(rows[0]?.[15] || rows[0]?.[14] || 0);

      // Varredura dinâmica: não confiamos mais apenas no slice(4)
      rows.forEach((row, i) => {
        if (!row || i < 2) return; // Pula apenas o topo extremo

        // --- GASTO FIXO (B a G) ---
        const nomeFixo = row[1];
        const valorFixo = parseMoeda(row[6]);
        if (nomeFixo && valorFixo > 0 && String(nomeFixo).toLowerCase() !== 'descrição') {
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

        // --- GASTO VARIÁVEL (I a M) ---
        const nomeVar = row[8];
        const valorVar = parseMoeda(row[12]);
        if (nomeVar && valorVar > 0 && String(nomeVar).toLowerCase() !== 'descrição') {
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

        // --- RECEITA (O a P) ---
        const labelRec = row[14];
        const valorRec = parseMoeda(row[15]);
        const ignorar = ['variável', 'variavel', 'entradas', 'salário', 'salario', 'total', 'descrição'];
        
        if (labelRec && valorRec > 0 && !ignorar.includes(String(labelRec).toLowerCase())) {
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
        
        resultado.validacao.push({
          mes: nomeAba,
          receita: recCalc,
          gastos: gasCalc,
          saldo: recCalc - gasCalc,
          planilha: { saldo: saldoPlanilha }
        });
      }
    }

    // ABA DÍVIDAS
    if (nomeAba === 'DÍVIDAS') {
      rows.forEach((row, i) => {
        if (row && row[1] && row[2] && i > 0 && String(row[1]).toLowerCase() !== 'credor') {
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

    // ALUNOS
    if (nomeAba === 'RUSSO' || nomeAba === 'VIOLINO') {
      rows.forEach((row, i) => {
        if (row && row[0] && i > 0 && String(row[0]).toLowerCase() !== 'aluno') {
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