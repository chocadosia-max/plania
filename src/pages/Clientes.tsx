import { useState, useEffect } from "react"

export default function ClientesPage() {

  const [clientes, setClientes] = useState([])
  const [filtro, setFiltro] = useState("todos")

  useEffect(() => {
    try {
      // Tenta carregar do localStorage
      const salvos = localStorage.getItem(
        "plania_clientes"
      )
      if (salvos) {
        const parsed = JSON.parse(salvos)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setClientes(parsed)
          return
        }
      }
      
      // Se não tiver no storage ou estiver vazio,
      // usa dados padrão da planilha
      const dadosPadrao = [
        // RUSSO
        {
          id: 1,
          nome: "Raísa Nogueira Medeiros",
          instrumento: "Russo",
          valor: 350,
          status: "ativo",
          pagamentos: {
            jan: null,
            fev: null,
            mar: "18/02/2026"
          }
        },
        {
          id: 2,
          nome: "Beatriz Martins",
          instrumento: "Russo",
          valor: 350,
          status: "ativo",
          pagamentos: {
            jan: null,
            fev: "05/02/2026",
            mar: null
          }
        },
        {
          id: 3,
          nome: "Miguel Campos",
          instrumento: "Russo",
          valor: 350,
          status: "ativo",
          pagamentos: {
            jan: "03/01/2026",
            fev: "05/02/2026",
            mar: "02/03/2026"
          }
        },
        {
          id: 4,
          nome: "Luiz Fernando Rosa",
          instrumento: "Russo",
          valor: 350,
          status: "ativo",
          pagamentos: {
            jan: null,
            fev: "05/02/2026",
            mar: "09/03/2026"
          }
        },
        {
          id: 5,
          nome: "Heloisa Caumo",
          instrumento: "Russo",
          valor: 350,
          status: "ativo",
          pagamentos: {
            jan: null,
            fev: "28/01/2026",
            mar: null
          }
        },
        {
          id: 6,
          nome: "Izamara",
          instrumento: "Russo",
          valor: 350,
          status: "ativo",
          pagamentos: {
            jan: null,
            fev: "29/01/2026",
            mar: "25/02/2026"
          }
        },
        {
          id: 7,
          nome: "Sofia",
          instrumento: "Russo",
          valor: 350,
          status: "ativo",
          pagamentos: {
            jan: null,
            fev: null,
            mar: "26/02/2026"
          }
        },
        // VIOLINO
        {
          id: 8,
          nome: "Daniel Araújo",
          instrumento: "Violino",
          valor: 360,
          status: "ativo",
          pagamentos: {
            jan: null,
            fev: null,
            mar: "27/02/2026"
          }
        },
        {
          id: 9,
          nome: "Sofia",
          instrumento: "Violino",
          valor: 360,
          status: "ativo",
          pagamentos: {
            jan: null,
            fev: "15/02/2026",
            mar: null
          }
        },
      ]
      
      setClientes(dadosPadrao)
      localStorage.setItem(
        "plania_clientes",
        JSON.stringify(dadosPadrao)
      )
      
    } catch (e) {
      console.error("Erro clientes:", e)
      setClientes([])
    }
  }, [])

  // Proteção contra dados inválidos
  const lista = Array.isArray(clientes)
    ? clientes : []

  const filtrados = filtro === "todos"
    ? lista
    : lista.filter(c =>
        (c.instrumento || "")
          .toLowerCase() ===
        filtro.toLowerCase()
      )

  // Totais
  const totalMensal = lista.reduce(
    (s, c) => s + (Number(c.valor) || 0), 0
  )
  const totalRusso = lista
    .filter(c => c.instrumento === "Russo")
    .reduce((s,c) => s + (Number(c.valor)||0),0)
  const totalViolino = lista
    .filter(c => c.instrumento === "Violino")
    .reduce((s,c) => s + (Number(c.valor)||0),0)

  return (
    <div style={{
      padding: 24,
      color: "#F0F4FF",
      minHeight: "100vh"
    }}>

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: "bold",
            margin: 0
          }}>
            Alunos
          </h1>
          <p style={{
            color: "#7B8DB0",
            margin: "4px 0 0",
            fontSize: 14
          }}>
            Russo e Violino
          </p>
        </div>
        <button style={{
          background: "#6366F1",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold"
        }}>
          + Novo aluno
        </button>
      </div>

      {/* Cards resumo */}
      <div style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(3, 1fr)",
        gap: 16,
        marginBottom: 24
      }}>
        {[
          {
            label: "Total mensal",
            valor: totalMensal,
            cor: "#6366F1"
          },
          {
            label: "Aulas de Russo",
            valor: totalRusso,
            cor: "#22D3EE"
          },
          {
            label: "Aulas de Violino",
            valor: totalViolino,
            cor: "#F472B6"
          }
        ].map((card, i) => (
          <div key={i} style={{
            background: "#0F1629",
            border: `1px solid ${card.cor}30`,
            borderRadius: 12,
            padding: 20
          }}>
            <p style={{
              color: "#7B8DB0",
              fontSize: 12,
              margin: "0 0 8px",
              textTransform: "uppercase",
              letterSpacing: 1
            }}>
              {card.label}
            </p>
            <p style={{
              color: card.cor,
              fontSize: 24,
              fontWeight: "bold",
              fontFamily: "monospace",
              margin: 0
            }}>
              R$ {card.valor
                .toLocaleString("pt-BR", {
                  minimumFractionDigits: 2
                })}
            </p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{
        display: "flex",
        gap: 8,
        marginBottom: 20
      }}>
        {["todos","Russo","Violino"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              background: filtro === f
                ? "#6366F1" : "#0F1629",
              color: filtro === f
                ? "white" : "#7B8DB0",
              border: filtro === f
                ? "none"
                : "1px solid #1E2D4D",
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
      {filtrados.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "#7B8DB0"
        }}>
          <div style={{ fontSize: 48 }}>
            👥
          </div>
          <p style={{ marginTop: 16 }}>
            Nenhum aluno encontrado.
          </p>
        </div>
      ) : (
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: 10
        }}>
          {filtrados.map(cliente => {
            const c = cliente || {}
            const pags = c.pagamentos || {}
            const mesesPagos = Object.values(
              pags
            ).filter(v => v !== null).length
            
            return (
              <div key={c.id || Math.random()}
                style={{
                  background: "#0F1629",
                  border: "1px solid #1E2D4D",
                  borderRadius: 14,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 200ms"
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: "50%",
                    background:
                      c.instrumento === "Russo"
                      ? "rgba(34,211,238,0.15)"
                      : "rgba(244,114,182,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    border:
                      c.instrumento === "Russo"
                      ? "1px solid rgba(34,211,238,0.3)"
                      : "1px solid rgba(244,114,182,0.3)"
                  }}>
                    {c.instrumento === "Russo"
                      ? "🗣️" : "🎻"}
                  </div>

                  <div>
                    <p style={{
                      color: "#F0F4FF",
                      fontWeight: "bold",
                      margin: 0,
                      fontSize: 15
                    }}>
                      {c.nome || "Sem nome"}
                    </p>
                    <p style={{
                      color: "#7B8DB0",
                      fontSize: 13,
                      margin: "3px 0 0"
                    }}>
                      {c.instrumento || ""} ·{" "}
                      {mesesPagos} pagamento
                      {mesesPagos !== 1
                        ? "s" : ""} em dia
                    </p>
                  </div>
                </div>

                {/* Valor */}
                <div style={{
                  textAlign: "right"
                }}>
                  <p style={{
                    color: "#34D399",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                    fontSize: 16,
                    margin: 0
                  }}>
                    R$ {Number(c.valor || 0)
                      .toLocaleString("pt-BR",{
                        minimumFractionDigits:2
                      })}
                    /mês
                  </p>
                  <p style={{
                    color: "#7B8DB0",
                    fontSize: 12,
                    margin: "3px 0 0"
                  }}>
                    R$ {(
                      Number(c.valor || 0) *
                      mesesPagos
                    ).toLocaleString("pt-BR",{
                      minimumFractionDigits:2
                    })} recebido
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}