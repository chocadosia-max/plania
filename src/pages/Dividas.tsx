import { useState, useEffect } from "react"

export default function DividasPage() {

  const [dividas, setDividas] = useState([])

  useEffect(() => {
    try {
      const salvas = localStorage.getItem(
        "plania_dividas"
      )
      if (salvas) {
        const parsed = JSON.parse(salvas)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDividas(parsed)
          return
        }
      }

      // Dados reais da planilha
      const dadosPlanilha = [
        {
          id: 1,
          credor: "PicPay",
          valorTotal: 36461.16,
          pagamentos: {
            jan: 5480.41,
            fev: 5831.82,
            mar: 5510.77,
            abr: 0, mai: 0, jun: 0,
            jul: 0, ago: 0, set: 0,
            out: 0, nov: 0, dez: 0
          },
          faltando: 19638.16,
          cor: "#F97316",
          icone: "💳"
        },
        {
          id: 2,
          credor: "NuBank",
          valorTotal: 21151.18,
          pagamentos: {
            jan: 6353.52,
            fev: 7717.63,
            mar: 5109.02,
            abr: 0, mai: 0, jun: 0,
            jul: 0, ago: 0, set: 0,
            out: 0, nov: 0, dez: 0
          },
          faltando: 1971.01,
          cor: "#8B5CF6",
          icone: "🟣"
        },
        {
          id: 3,
          credor: "Empréstimo",
          valorTotal: 5816.10,
          pagamentos: {
            jan: 0, fev: 0,
            mar: 572.24,
            abr: 0, mai: 0, jun: 0,
            jul: 0, ago: 0, set: 0,
            out: 0, nov: 0, dez: 0
          },
          faltando: 5234.49,
          cor: "#EF4444",
          icone: "🏦"
        },
        {
          id: 4,
          credor: "Renner",
          valorTotal: 1445.55,
          pagamentos: {
            jan: 0,
            fev: 132.50,
            mar: 289.11,
            abr: 0, mai: 0, jun: 0,
            jul: 0, ago: 0, set: 0,
            out: 0, nov: 0, dez: 0
          },
          faltando: 1023.94,
          cor: "#F472B6",
          icone: "🛍️"
        },
        {
          id: 5,
          credor: "Bradesco",
          valorTotal: 649.50,
          pagamentos: {
            jan: 47.00,
            fev: 132.50,
            mar: 47.00,
            abr: 47.00,
            mai: 47.00,
            jun: 47.00,
            jul: 47.00,
            ago: 47.00,
            set: 47.00,
            out: 47.00,
            nov: 47.00,
            dez: 47.00
          },
          faltando: 0,
          cor: "#22D3EE",
          icone: "🏛️"
        },
      ]

      setDividas(dadosPlanilha)
      localStorage.setItem(
        "plania_dividas",
        JSON.stringify(dadosPlanilha)
      )

    } catch (e) {
      console.error("Erro dívidas:", e)
      setDividas([])
    }
  }, [])

  const lista = Array.isArray(dividas)
    ? dividas : []

  const totalDevido = lista.reduce(
    (s, d) => s + (Number(d.valorTotal)||0), 0
  )
  const totalPago = lista.reduce((s, d) => {
    const pags = d.pagamentos || {}
    return s + Object.values(pags)
      .reduce((a,b) => a + (Number(b)||0), 0)
  }, 0)
  const totalFaltando = lista.reduce(
    (s, d) => s + (Number(d.faltando)||0), 0
  )

  const meses = [
    "jan","fev","mar","abr","mai","jun",
    "jul","ago","set","out","nov","dez"
  ]
  const mesesLabel = [
    "Jan","Fev","Mar","Abr","Mai","Jun",
    "Jul","Ago","Set","Out","Nov","Dez"
  ]

  return (
    <div style={{
      padding: 24,
      color: "#F0F4FF",
      minHeight: "100vh"
    }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 28,
          fontWeight: "bold",
          margin: 0
        }}>
          Dívidas
        </h1>
        <p style={{
          color: "#7B8DB0",
          margin: "4px 0 0",
          fontSize: 14
        }}>
          Controle de pagamentos 2026
        </p>
      </div>

      {/* Cards resumo */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: 16,
        marginBottom: 28
      }}>
        {[
          {
            label: "Total devido",
            valor: totalDevido,
            cor: "#EF4444",
            icone: "💸"
          },
          {
            label: "Total pago",
            valor: totalPago,
            cor: "#34D399",
            icone: "✅"
          },
          {
            label: "Ainda faltando",
            valor: totalFaltando,
            cor: "#F97316",
            icone: "⏳"
          }
        ].map((card, i) => (
          <div key={i} style={{
            background: "#0F1629",
            border: `1px solid ${card.cor}30`,
            borderTop: `3px solid ${card.cor}`,
            borderRadius: 12,
            padding: 20
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start"
            }}>
              <p style={{
                color: "#7B8DB0",
                fontSize: 12,
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: 1
              }}>
                {card.label}
              </p>
              <span style={{ fontSize: 18 }}>
                {card.icone}
              </span>
            </div>
            <p style={{
              color: card.cor,
              fontSize: 22,
              fontWeight: "bold",
              fontFamily: "monospace",
              margin: "8px 0 0"
            }}>
              R$ {Number(card.valor||0)
                .toLocaleString("pt-BR",{
                  minimumFractionDigits: 2
                })}
            </p>
          </div>
        ))}
      </div>

      {/* Cards de cada dívida */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 16
      }}>
        {lista.map(divida => {
          const d = divida || {}
          const pags = d.pagamentos || {}
          const totalPagoDivida =
            Object.values(pags)
              .reduce((a,b)=>a+(Number(b)||0),0)
          const percentPago =
            d.valorTotal > 0
              ? Math.min(
                  (totalPagoDivida /
                    d.valorTotal) * 100,
                  100
                )
              : 0

          return (
            <div key={d.id||Math.random()}
              style={{
                background: "#0F1629",
                border: "1px solid #1E2D4D",
                borderLeft:
                  `4px solid ${d.cor||"#6366F1"}`,
                borderRadius: 14,
                padding: 20
              }}
            >
              {/* Linha superior */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10
                }}>
                  <span style={{ fontSize: 22 }}>
                    {d.icone || "💳"}
                  </span>
                  <div>
                    <p style={{
                      color: "#F0F4FF",
                      fontWeight: "bold",
                      fontSize: 16,
                      margin: 0
                    }}>
                      {d.credor || "Credor"}
                    </p>
                    <p style={{
                      color: "#7B8DB0",
                      fontSize: 12,
                      margin: "2px 0 0"
                    }}>
                      Valor original: R${" "}
                      {Number(d.valorTotal||0)
                        .toLocaleString("pt-BR",{
                          minimumFractionDigits:2
                        })}
                    </p>
                  </div>
                </div>

                <div style={{
                  textAlign: "right"
                }}>
                  <p style={{
                    color: Number(d.faltando)===0
                      ? "#34D399" : "#EF4444",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                    fontSize: 16,
                    margin: 0
                  }}>
                    {Number(d.faltando) === 0
                      ? "✅ Quitado"
                      : `R$ ${Number(d.faltando)
                          .toLocaleString("pt-BR",{
                            minimumFractionDigits:2
                          })} faltando`
                    }
                  </p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div style={{
                background: "#162040",
                borderRadius: 8,
                height: 8,
                marginBottom: 14,
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${percentPago}%`,
                  height: "100%",
                  background: percentPago >= 100
                    ? "#34D399"
                    : d.cor || "#6366F1",
                  borderRadius: 8,
                  transition: "width 800ms ease",
                  boxShadow: `0 0 8px ${
                    d.cor || "#6366F1"}60`
                }} />
              </div>
              <p style={{
                color: "#7B8DB0",
                fontSize: 12,
                margin: "0 0 14px"
              }}>
                {percentPago.toFixed(1)}% pago
                {" "}· R$ {totalPagoDivida
                  .toLocaleString("pt-BR",{
                    minimumFractionDigits:2
                  })} de R$ {Number(d.valorTotal)
                  .toLocaleString("pt-BR",{
                    minimumFractionDigits:2
                  })}
              </p>

              {/* Grid de pagamentos mensais */}
              <div style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(6,1fr)",
                gap: 6
              }}>
                {meses.map((mes, i) => {
                  const val =
                    Number(pags[mes] || 0)
                  const pago = val > 0

                  return (
                    <div key={mes} style={{
                      background: pago
                        ? `${d.cor||"#6366F1"}20`
                        : "#162040",
                      border: `1px solid ${pago
                        ? d.cor||"#6366F1"
                        : "#1E2D4D"}`,
                      borderRadius: 8,
                      padding: "6px 4px",
                      textAlign: "center"
                    }}>
                      <p style={{
                        color: "#7B8DB0",
                        fontSize: 10,
                        margin: 0
                      }}>
                        {mesesLabel[i]}
                      </p>
                      <p style={{
                        color: pago
                          ? d.cor||"#6366F1"
                          : "#3D4F6E",
                        fontSize: 10,
                        fontWeight: "bold",
                        fontFamily: "monospace",
                        margin: "2px 0 0"
                      }}>
                        {pago
                          ? `R$${val
                              .toLocaleString(
                                "pt-BR",{
                                  maximumFractionDigits:0
                                })}`
                          : "—"
                        }
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}