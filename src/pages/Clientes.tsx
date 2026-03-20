import { useState, useEffect } from "react"

// Funções utilitárias para tratar os dados da planilha
function extrairValorDoNome(nome, valorCampo) {
  if (valorCampo && Number(valorCampo) > 0) {
    return Number(valorCampo)
  }
  if (nome) {
    const match = nome.match(/R\$\s*(\d+(?:[.,]\d+)?)/i)
    if (match) {
      return parseFloat(match[1].replace(",", "."))
    }
  }
  return 0
}

function limparNome(nome) {
  return (nome || "")
    .replace(/\s*\(R\$\d+\)\s*/gi, "")
    .trim()
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [filtro, setFiltro] = useState("todos")
  const [alunoSelecionado, setAluno] = useState(null)

  useEffect(() => {
    try {
      const salvos = localStorage.getItem("plania_clientes")
      let dadosParaProcessar = []

      if (salvos) {
        const parsed = JSON.parse(salvos)
        if (Array.isArray(parsed) && parsed.length > 0) {
          dadosParaProcessar = parsed
        }
      }

      if (dadosParaProcessar.length === 0) {
        // Dados padrão caso não existam no storage
        dadosParaProcessar = [
          { id: 1, nome: "Raísa Nogueira Medeiros (R$350)", instrumento: "Russo", valor: 0, status: "ativo", pagamentos: { mar: "18/02/2026" } },
          { id: 2, nome: "Beatriz Martins (R$350)", instrumento: "Russo", valor: 0, status: "ativo", pagamentos: { fev: "05/02/2026" } },
          { id: 3, nome: "Miguel Campos (R$350)", instrumento: "Russo", valor: 0, status: "ativo", pagamentos: { jan: "03/01/2026", fev: "05/02/2026", mar: "02/03/2026" } },
          { id: 4, nome: "Luiz Fernando Rosa (R$350)", instrumento: "Russo", valor: 0, status: "ativo", pagamentos: { fev: "05/02/2026", mar: "09/03/2026" } },
          { id: 5, nome: "Heloisa Caumo (R$350)", instrumento: "Russo", valor: 0, status: "ativo", pagamentos: { fev: "28/01/2026" } },
          { id: 6, nome: "Izamara (R$350)", instrumento: "Russo", valor: 0, status: "ativo", pagamentos: { fev: "29/01/2026", mar: "25/02/2026" } },
          { id: 7, nome: "Sofia (R$350)", instrumento: "Russo", valor: 0, status: "ativo", pagamentos: { mar: "26/02/2026" } },
          { id: 8, nome: "Daniel Araújo (R$360)", instrumento: "Violino", valor: 0, status: "ativo", pagamentos: { mar: "27/02/2026" } },
          { id: 9, nome: "Sofia (R$360)", instrumento: "Violino", valor: 0, status: "ativo", pagamentos: { fev: "15/02/2026" } },
        ]
      }

      // Processa os dados para garantir que valores e nomes estejam limpos
      const processados = dadosParaProcessar.map(c => ({
        ...c,
        valorReal: extrairValorDoNome(c.nome, c.valor),
        nomeLimpo: limparNome(c.nome)
      }))

      setClientes(processados)
      localStorage.setItem("plania_clientes", JSON.stringify(processados))
      
    } catch (e) {
      console.error("Erro clientes:", e)
      setClientes([])
    }
  }, [])

  const lista = Array.isArray(clientes) ? clientes : []
  const filtrados = filtro === "todos" 
    ? lista 
    : lista.filter(c => (c.instrumento || "").toLowerCase() === filtro.toLowerCase())

  const totalMensal = lista.reduce((s, c) => s + (c.valorReal || 0), 0)
  const totalRusso = lista.filter(c => c.instrumento === "Russo").reduce((s, c) => s + (c.valorReal || 0), 0)
  const totalViolino = lista.filter(c => c.instrumento === "Violino").reduce((s, c) => s + (c.valorReal || 0), 0)

  return (
    <div style={{ padding: 24, color: "#F0F4FF", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: "bold", margin: 0 }}>Alunos</h1>
          <p style={{ color: "#7B8DB0", margin: "4px 0 0", fontSize: 14 }}>Russo e Violino</p>
        </div>
        <button style={{ background: "#6366F1", color: "white", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>
          + Novo aluno
        </button>
      </div>

      {/* Cards resumo */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Total mensal", valor: totalMensal, cor: "#6366F1" },
          { label: "Aulas de Russo", valor: totalRusso, cor: "#22D3EE" },
          { label: "Aulas de Violino", valor: totalViolino, cor: "#F472B6" }
        ].map((card, i) => (
          <div key={i} style={{ background: "#0F1629", border: `1px solid ${card.cor}30`, borderRadius: 12, padding: 20 }}>
            <p style={{ color: "#7B8DB0", fontSize: 12, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 1 }}>{card.label}</p>
            <p style={{ color: card.cor, fontSize: 24, fontWeight: "bold", fontFamily: "monospace", margin: 0 }}>
              R$ {card.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["todos", "Russo", "Violino"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              background: filtro === f ? "#6366F1" : "#0F1629",
              color: filtro === f ? "white" : "#7B8DB0",
              border: filtro === f ? "none" : "1px solid #1E2D4D",
              padding: "8px 18px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 13
            }}
          >
            {f === "todos" ? "Todos" : f}
          </button>
        ))}
      </div>

      {/* Lista de alunos */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtrados.map(cliente => {
          const mesesPagos = Object.values(cliente.pagamentos || {}).filter(v => v !== null && v !== "").length
          return (
            <div 
              key={cliente.id}
              onClick={() => setAluno(cliente)}
              style={{
                background: "#0F1629",
                border: "1px solid #1E2D4D",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 200ms"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: cliente.instrumento === "Russo" ? "rgba(34,211,238,0.15)" : "rgba(244,114,182,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  border: cliente.instrumento === "Russo" ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(244,114,182,0.3)"
                }}>
                  {cliente.instrumento === "Russo" ? "🗣️" : "🎻"}
                </div>
                <div>
                  <p style={{ color: "#F0F4FF", fontWeight: "bold", margin: 0, fontSize: 15 }}>{cliente.nomeLimpo}</p>
                  <p style={{ color: "#7B8DB0", fontSize: 13, margin: "3px 0 0" }}>
                    {cliente.instrumento} · {mesesPagos} pagamento{mesesPagos !== 1 ? "s" : ""} em dia
                  </p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: "#34D399", fontWeight: "bold", fontFamily: "monospace", fontSize: 16, margin: 0 }}>
                  R$ {cliente.valorReal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal de Detalhe */}
      {alunoSelecionado && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 20
        }}
          onClick={e => e.target === e.currentTarget && setAluno(null)}
        >
          <div style={{
            background: "#0F1629", border: "1px solid #2D4070", borderRadius: 20, padding: 28,
            width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", position: "relative"
          }}>
            <button onClick={() => setAluno(null)} style={{
              position: "absolute", top: 16, right: 16, background: "#1E2D4D", border: "none",
              borderRadius: "50%", width: 32, height: 32, color: "#7B8DB0", cursor: "pointer", fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>×</button>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: alunoSelecionado.instrumento === "Russo" ? "rgba(34,211,238,0.15)" : "rgba(244,114,182,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                border: alunoSelecionado.instrumento === "Russo" ? "2px solid rgba(34,211,238,0.4)" : "2px solid rgba(244,114,182,0.4)"
              }}>
                {alunoSelecionado.instrumento === "Russo" ? "🗣️" : "🎻"}
              </div>
              <div>
                <h2 style={{ color: "#F0F4FF", fontSize: 20, fontWeight: "bold", margin: 0 }}>{alunoSelecionado.nomeLimpo}</h2>
                <p style={{ color: "#7B8DB0", margin: "4px 0 0", fontSize: 14 }}>Aulas de {alunoSelecionado.instrumento}</p>
              </div>
            </div>

            {(() => {
              const pags = alunoSelecionado.pagamentos || {}
              const valorMes = alunoSelecionado.valorReal
              const mesesPagos = Object.values(pags).filter(v => v !== null && v !== "").length
              const totalRecebido = valorMes * mesesPagos

              return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
                  {[
                    { label: "Mensalidade", valor: `R$ ${valorMes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, cor: "#6366F1" },
                    { label: "Meses pagos", valor: `${mesesPagos} meses`, cor: "#34D399" },
                    { label: "Total recebido", valor: `R$ ${totalRecebido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, cor: "#22D3EE" }
                  ].map((item, i) => (
                    <div key={i} style={{ background: "#162040", border: `1px solid ${item.cor}30`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                      <p style={{ color: "#7B8DB0", fontSize: 11, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: 0.8 }}>{item.label}</p>
                      <p style={{ color: item.cor, fontWeight: "bold", fontFamily: "monospace", fontSize: 14, margin: 0 }}>{item.valor}</p>
                    </div>
                  ))}
                </div>
              )
            })()}

            <p style={{ color: "#7B8DB0", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 12px" }}>Histórico de pagamentos 2026</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {[
                ["jan", "Janeiro"], ["fev", "Fevereiro"], ["mar", "Março"], ["abr", "Abril"],
                ["mai", "Maio"], ["jun", "Junho"], ["jul", "Julho"], ["ago", "Agosto"],
                ["set", "Setembro"], ["out", "Outubro"], ["nov", "Novembro"], ["dez", "Dezembro"]
              ].map(([chave, label]) => {
                const dataPag = (alunoSelecionado.pagamentos || {})[chave]
                const pago = dataPag !== null && dataPag !== undefined && dataPag !== ""
                return (
                  <div key={chave} style={{
                    background: pago ? "rgba(52,211,153,0.08)" : "#162040",
                    border: `1px solid ${pago ? "rgba(52,211,153,0.3)" : "#1E2D4D"}`,
                    borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{pago ? "✅" : "⏳"}</span>
                      <span style={{ color: pago ? "#F0F4FF" : "#7B8DB0", fontSize: 13, fontWeight: pago ? "bold" : "normal" }}>{label}</span>
                    </div>
                    <span style={{ color: pago ? "#34D399" : "#3D4F6E", fontSize: 12, fontFamily: "monospace" }}>
                      {pago ? (typeof dataPag === "string" && dataPag.includes("/") ? dataPag : new Date(dataPag).toLocaleDateString("pt-BR")) : "Não pago"}
                    </span>
                  </div>
                )
              })}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button style={{ flex: 1, background: "#34D399", color: "#080B14", border: "none", padding: 12, borderRadius: 10, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}>
                ✅ Registrar pagamento
              </button>
              <button style={{ flex: 1, background: "#162040", color: "#7B8DB0", border: "1px solid #1E2D4D", padding: 12, borderRadius: 10, cursor: "pointer", fontSize: 14 }}>
                ✏️ Editar aluno
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}