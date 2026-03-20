"use client";

import * as XLSX from 'xlsx';

const MESES_NOMES = [
  ['JAN', 'JANEIRO'], ['FEV', 'FEVEREIRO'], ['MAR', 'MARCO', 'MARÇO'],
  ['ABR', 'ABRIL'], ['MAI', 'MAIO'], ['JUN', 'JUNHO'],
  ['JUL', 'JULHO'], ['AGO', 'AGOSTO'], ['SET', 'SETEMBRO'],
  ['OUT', 'OUTUBRO'], ['NOV', 'NOVEMBRO'], ['DEZ', 'DEZEMBRO']
];

function identificarMesAno(nome: string) {
  const norm = nome.toUpperCase().replace(/[\s\/-]/g, '').trim();
  
  for (let i = 0; i < MESES_NOMES.length; i++) {
    const variacoes = MESES_NOMES[i];
    // Verifica se o nome da aba começa com alguma variação do mês
    if (variacoes.some(v => norm.startsWith(v))) {
      // Tenta extrair o ano (ex: 26 ou 2026) do final da string
      const anoMatch = norm.match(/\d{2,4}$/);
      let ano = 2026; // Ano padrão caso não encontre
      if (anoMatch) {
        const val = anoMatch[0];
        ano = val.length === 2 ? 2000 + parseInt(val) : parseInt(val);
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

  const clean = str.replace(/[R$\s]/g, '');
  
  if (clean.includes(',') && !clean.includes('.')) {
    return parseFloat(clean.replace(',', '.'));
  }
  if (clean.includes(',') && clean.includes('.')) {
    if (clean.indexOf(',') > clean.indexOf('.')) {
      return parseFloat(clean.replace(/\./g, '').replace(',', '.'));
    } 
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
    const normAba = nomeAba.toUpperCase().trim();
    
    const periodo = identificarMesAno(normAba);

    if (periodo) {
      const transacoesAba = [];
      const saldoPlanilha = parseMoeda(rows[0]?.[15] || rows[0]?.[14] || 0);

      rows.forEach((row, i) => {
        if (!row || i < 2) return;

        // --- GASTO FIXO (B a G) ---
        const nomeFixo = row[1];
        const valorFixo = parseMoeda(row[6]);
        if (nomeFixo && valorFixo > 0 && !['descrição', 'descricao'].includes(String(nomeFixo).toLowerCase())) {
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
        if (nomeVar && valorVar > 0 && !['descrição', 'descricao'].includes(String(nomeVar).toLowerCase())) {
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
        const ignorar = ['variável', 'variavel', 'entradas', 'salário', 'salario', 'total', 'descrição', 'descricao'];
        
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

    // ABA DÍVIDAS (Flexível com o nome)
    if (normAba.includes('DÍVIDA') || normAba.includes('DIVIDA')) {
      rows.forEach((row, i) => {
        if (row && row[1] && row[2] && i > 0 && !['credor', 'descrição'].includes(String(row[1]).toLowerCase())) {
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

    // ALUNOS (RUSSO / VIOLINO)
    if (normAba.includes('RUSSO') || normAba.includes('VIOLINO')) {
      rows.forEach((row, i) => {
        if (row && row[0] && i > 0 && !['aluno', 'nome'].includes(String(row[0]).toLowerCase())) {
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