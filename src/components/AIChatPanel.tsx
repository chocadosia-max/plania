import { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, X, Send, Trash2, TrendingDown, TrendingUp, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* ─── types ─── */
interface Message {
  id: number;
  role: "ai" | "user";
  text: string;
  cards?: InsightCard[];
  streaming?: boolean;
}

interface InsightCard {
  icon: "down" | "up" | "target";
  title: string;
  body: string;
  color: string;
}

/* ─── simulated AI responses ─── */
const aiResponses: Record<string, string> = {
  "Como estão meus gastos esse mês?":
    "Seus gastos de março estão em R$ 3.497 — 3,1% menor que fevereiro 📉 Alimentação e transporte são os maiores vilões. Quer ver o detalhamento?",
  "Quando vou bater minha meta?":
    "No ritmo atual, você atinge sua meta de R$ 20k em julho! 🎯 Se cortar R$ 200/mês em lazer, antecipa pra junho.",
  "Onde estou gastando mais?":
    "Moradia lidera com R$ 2.800 (50% dos gastos), seguida por alimentação com R$ 1.200. Transporte surpreendeu: subiu 22% esse mês 🚗",
  "Me dá um conselho financeiro":
    "Dica de ouro 💡: sua economia de 37,5% do salário tá ótima! Considere investir R$ 1.000/mês em renda fixa pra fazer esse dinheiro render.",
  "Crie um plano para economizar R$500":
    "Plano pra economizar R$ 500/mês:\n• Alimentação fora: reduzir de 4x pra 2x/semana (–R$ 180)\n• Uber → transporte público 2x/semana (–R$ 130)\n• Revisar assinaturas não usadas (–R$ 90)\n• Compras planejadas no mercado (–R$ 100)",
};

const defaultResponse =
  "Analisei seus dados e tenho boas sugestões! Seus padrões mostram oportunidades de economia em transporte e alimentação fora. Quer que eu detalhe?";

/* ─── insight cards for welcome message ─── */
const monthNames = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function getWelcomeInsights(): InsightCard[] {
  return [
    {
      icon: "down",
      title: "Gastos caíram 3,1%",
      body: "Parabéns! Seus gastos em março ficaram abaixo de fevereiro.",
      color: "text-green-500",
    },
    {
      icon: "up",
      title: "Alimentação +18%",
      body: "Restaurantes e delivery subiram. Considere cozinhar mais em casa.",
      color: "text-red-400",
    },
    {
      icon: "target",
      title: "Meta: 72% concluída",
      body: "Sua meta de R$ 20k está a R$ 3.680 de distância. Quase lá!",
      color: "text-primary",
    },
  ];
}

function getWelcomeMessage(): Message {
  const month = monthNames[new Date().getMonth()];
  return {
    id: 1,
    role: "ai",
    text: `Olá Mariana! 👋 Analisei suas finanças de ${month}.\n\nAqui estão 3 coisas importantes para você saber hoje:`,
    cards: getWelcomeInsights(),
  };
}

/* ─── suggested chips ─── */
const suggestedQuestions = [
  "Como estão meus gastos esse mês?",
  "Quando vou bater minha meta?",
  "Onde estou gastando mais?",
  "Me dá um conselho financeiro",
  "Crie um plano para economizar R$500",
];

/* ─── localStorage helpers ─── */
const STORAGE_KEY = "plania-chat-history";
const MAX_MESSAGES = 20;

function loadMessages(): Message[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as Message[];
      return parsed.slice(-MAX_MESSAGES);
    }
  } catch {}
  return [getWelcomeMessage()];
}

function saveMessages(msgs: Message[]) {
  const toSave = msgs.filter((m) => !m.streaming).slice(-MAX_MESSAGES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

/* ─── typing indicator ─── */
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground/50"
            style={{
              animation: "pulse-soft 1.2s ease-in-out infinite",
              animationDelay: `${i * 200}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── insight card component ─── */
function InsightCardUI({ card }: { card: InsightCard }) {
  const icons = { down: TrendingDown, up: TrendingUp, target: Target };
  const Icon = icons[card.icon];
  return (
    <div className="glass-card rounded-lg p-3 mt-2 hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start gap-2.5">
        <div className={`mt-0.5 ${card.color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground">{card.title}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{card.body}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── streaming text hook ─── */
function useStreamingText(text: string, active: boolean, speed = 25) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      setDone(true);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, active, speed]);

  return { displayed, done };
}

/* ─── AI message bubble ─── */
function AIBubble({ msg }: { msg: Message }) {
  const { displayed, done } = useStreamingText(msg.text, !!msg.streaming, 20);
  const text = msg.streaming ? displayed : msg.text;

  return (
    <div className="flex justify-start" style={{ animation: "reveal 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div className="max-w-[85%]">
        <div className="bg-muted text-foreground rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed whitespace-pre-line break-words">
          {text}
          {msg.streaming && !done && <span className="inline-block w-0.5 h-4 bg-foreground/60 ml-0.5 animate-[pulse-soft_0.8s_ease-in-out_infinite]" />}
        </div>
        {msg.cards && (done || !msg.streaming) && (
          <div className="space-y-1.5 mt-1">
            {msg.cards.map((c, i) => (
              <div key={i} style={{ animation: "reveal 0.4s cubic-bezier(0.16,1,0.3,1) both", animationDelay: `${(i + 1) * 150}ms` }}>
                <InsightCardUI card={c} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── main component ─── */
export function AIChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => loadMessages());
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [closing, setClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Save to localStorage
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Listen for auto-adaptation success
  useEffect(() => {
    const handleImportSuccess = () => {
      const summaryStr = localStorage.getItem("plania-adapted-summary");
      const profile = localStorage.getItem("plania-user-type");
      if (!summaryStr) return;
      
      const summary = JSON.parse(summaryStr);
      const aiMsg: Message = {
        id: Date.now(),
        role: "ai",
        text: `Olá! 👋 Analisei sua planilha completa.\nAqui está o que encontrei:\n\n📊 ${summary.count} transações analisadas\n💰 Renda média mensal: R$ ${summary.income.toLocaleString('pt-BR')}\n💸 Gasto médio mensal: R$ ${summary.expenses.toLocaleString('pt-BR')}\n💚 Economia média: R$ ${summary.savings.toLocaleString('pt-BR')}/mês\n\nDetectei que você tem o perfil ${profile?.toUpperCase()}, então ativei as ferramentas corretas para você. ✅\n\nComece explorando seu dashboard — tudo já está configurado! 🚀`,
        streaming: true
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setOpen(true); // Abre o chat para mostrar a mensagem
    };

    window.addEventListener("profile-updated", handleImportSuccess);
    return () => window.removeEventListener("profile-updated", handleImportSuccess);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 300);
  };

  const simulateAIResponse = useCallback((userText: string) => {
    setIsTyping(true);
    const responseText = aiResponses[userText] || defaultResponse;
    const typingDelay = 800 + Math.random() * 600;

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: Message = { id: Date.now() + 1, role: "ai", text: responseText, streaming: true };
      setMessages((m) => [...m, aiMsg]);
      // After streaming finishes, mark as not streaming
      const streamDuration = responseText.length * 20 + 200;
      setTimeout(() => {
        setMessages((m) => m.map((msg) => (msg.id === aiMsg.id ? { ...msg, streaming: false } : msg)));
      }, streamDuration);
    }, typingDelay);
  }, []);

  const send = (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: msgText };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    simulateAIResponse(msgText);
  };

  const clearConversation = () => {
    const welcome = getWelcomeMessage();
    setMessages([welcome]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const showSuggestions = messages.length <= 2 && !isTyping;

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-6 h-6 animate-[pulse-soft_2.5s_ease-in-out_infinite]" />
        </button>
      )}

      {/* Backdrop on mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={handleClose}
        />
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed top-0 right-0 z-50 w-full sm:w-[420px] h-full glass-card shadow-2xl flex flex-col border-l border-border/30 overflow-hidden",
            closing ? "animate-panel-out" : "animate-panel-in"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">PlanIA · Assistente Financeiro</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse-soft_2s_ease-in-out_infinite]" />
                  <span className="text-[10px] text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-9 w-9">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scroll-smooth">
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end" style={{ animation: "reveal 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed break-words">
                    {msg.text}
                  </div>
                </div>
              ) : (
                <AIBubble key={msg.id} msg={msg} />
              )
            )}
            {isTyping && <TypingIndicator />}
          </div>

          {/* Suggested questions */}
          {showSuggestions && (
            <div className="px-6 pb-3 shrink-0">
              <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-widest font-bold">Sugestões</p>
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="whitespace-nowrap shrink-0 text-[11px] px-4 py-2 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 active:scale-[0.96]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input + footer */}
          <div className="border-t border-border/30 p-4 space-y-3 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pergunte algo sobre suas finanças..."
                className="flex-1 h-11 rounded-2xl bg-muted/50 border-none text-sm px-4 focus-visible:ring-primary/30"
                disabled={isTyping}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="h-11 w-11 rounded-full shrink-0 shadow-lg shadow-primary/20" 
                disabled={isTyping || !input.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <div className="flex justify-center">
              <button
                onClick={clearConversation}
                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <Trash2 className="w-3 h-3" />
                Limpar conversa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}