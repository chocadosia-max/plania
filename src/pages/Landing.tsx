import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Palette, Lock, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme, themeConfig, ThemeName } from "@/contexts/ThemeContext";
import dashboardMockup from "@/assets/dashboard-mockup.png";

/* ─── scroll reveal hook ─── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    const el = ref.current;
    if (el) {
      el.querySelectorAll("[data-reveal]").forEach((child) => observer.observe(child));
    }
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── mock dashboard cards for hero ─── */
const mockCards = [
  { label: "Saldo total", value: "R$ 16.320", change: "+8,2%", positive: true },
  { label: "Receita", value: "R$ 5.600", change: "+14,3%", positive: true },
  { label: "Despesas", value: "R$ 3.497", change: "-3,1%", positive: true },
  { label: "Economia", value: "R$ 2.103", change: "+22%", positive: true },
];

/* ─── testimonials ─── */
const testimonials = [
  {
    name: "Camila Ferreira",
    role: "Designer Freelancer",
    text: "Finalmente encontrei uma planilha que eu realmente uso. A IA organiza tudo pra mim e o visual é lindo.",
    initials: "CF",
  },
  {
    name: "Rafael Monteiro",
    role: "Empreendedor",
    text: "Parei de usar 3 apps diferentes. O PlanIA me dá tudo num lugar só, com gráficos que fazem sentido.",
    initials: "RM",
  },
  {
    name: "Juliana Costa",
    role: "Analista de Marketing",
    text: "Os temas são incríveis! Cada vez que abro, me dá vontade de organizar mais minhas finanças.",
    initials: "JC",
  },
  {
    name: "Lucas Andrade",
    role: "Desenvolvedor",
    text: "A interface é tão boa que parece um app premium. Paguei uma vez e nunca mais me preocupei.",
    initials: "LA",
  },
  {
    name: "Beatriz Souza",
    role: "Estudante de Medicina",
    text: "Como estudante, cada real conta. O PlanIA me ajudou a finalmente ter controle real do meu dinheiro.",
    initials: "BS",
  },
];

/* ─── pricing ─── */
const plans = [
  {
    name: "Pessoal",
    price: "47",
    desc: "Para quem quer começar a organizar suas finanças pessoais.",
    features: ["Dashboard completo", "6 temas visuais", "IA para categorizar", "Exportar para PDF"],
    popular: false,
  },
  {
    name: "Completo",
    price: "147",
    desc: "Tudo incluso para controle financeiro profissional e pessoal.",
    features: [
      "Tudo do Freelancer",
      "IA avançada com projeções",
      "Múltiplas contas",
      "Relatórios automáticos",
      "Suporte prioritário",
      "Atualizações vitalícias",
    ],
    popular: true,
  },
  {
    name: "Freelancer",
    price: "67",
    desc: "Ideal para autônomos que precisam separar pessoal e trabalho.",
    features: [
      "Tudo do Pessoal",
      "Controle de projetos",
      "Relatórios por cliente",
      "Categorias personalizadas",
      "Importar extratos",
    ],
    popular: false,
  },
];

/* ─── component ─── */
const Landing = () => {
  const containerRef = useScrollReveal();
  const { theme, setTheme } = useTheme();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  // Hero entrance animation
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Auto-slide testimonials
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-hidden transition-colors duration-500">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/30">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <span className="text-xl font-bold text-foreground tracking-tight">
            Plan<span className="text-primary">IA</span>
          </span>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 px-6">
        <div className="absolute inset-0 hero-gradient opacity-15" />
        <div className="container mx-auto relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl">
          {/* Left text */}
          <div
            className="transition-all duration-700 ease-out"
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(24px)",
              filter: heroVisible ? "blur(0)" : "blur(4px)",
            }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-[1.1] tracking-tight mb-5" style={{ textWrap: "balance" }}>
              A planilha que finalmente pensa por você
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed" style={{ textWrap: "pretty" }}>
              Design bonito, IA em português e zero fórmula para configurar. Pague uma vez. Use para sempre.
            </p>
            <Link to="/login">
              <Button size="lg" className="gap-2 text-base px-8 active:scale-[0.97] transition-transform">
                Quero organizar minha vida financeira <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Right mockup */}
          <div className="relative">
            {/* Main mockup image */}
            <div
              className="rounded-xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30 transition-all duration-700 ease-out"
              style={{
                opacity: heroVisible ? 1 : 0,
                transform: heroVisible ? "translateY(0)" : "translateY(32px)",
                transitionDelay: "200ms",
              }}
            >
              <img src={dashboardMockup} alt="Dashboard PlanIA" className="w-full" />
            </div>

            {/* Floating stat cards */}
            <div className="absolute -bottom-6 -left-4 right-4 flex gap-2 sm:gap-3">
              {mockCards.map((card, i) => (
                <div
                  key={card.label}
                  className="glass-card rounded-lg p-2 sm:p-3 flex-1 min-w-0 border border-border/40 shadow-lg transition-all duration-700 ease-out"
                  style={{
                    opacity: heroVisible ? 1 : 0,
                    transform: heroVisible ? "translateY(0)" : "translateY(20px)",
                    filter: heroVisible ? "blur(0)" : "blur(4px)",
                    transitionDelay: `${400 + i * 200}ms`,
                  }}
                >
                  <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{card.label}</p>
                  <p className="text-xs sm:text-sm font-bold font-mono-financial text-foreground truncate">{card.value}</p>
                  <p className={`text-[9px] sm:text-[10px] font-medium ${card.positive ? "text-green-500" : "text-red-400"}`}>
                    {card.change}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROVAS / DIFERENCIAIS ─── */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="grid sm:grid-cols-3 gap-6">
            {/* IA que conversa */}
            <div data-reveal className="opacity-0 stagger-1 glass-card rounded-xl p-7 text-center group hover:border-primary/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-primary animate-[pulse-soft_2.5s_ease-in-out_infinite]" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">IA que conversa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pergunte em português. A IA entende, categoriza e sugere ações para suas finanças.
              </p>
            </div>

            {/* Design que impressiona */}
            <div data-reveal className="opacity-0 stagger-2 glass-card rounded-xl p-7 text-center group hover:border-primary/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                <Palette className="w-6 h-6 text-primary group-hover:animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Design que impressiona</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                6 temas visuais elegantes. Gráficos bonitos. Uma interface que dá vontade de usar.
              </p>
            </div>

            {/* Pague uma vez */}
            <div data-reveal className="opacity-0 stagger-3 glass-card rounded-xl p-7 text-center group hover:border-primary/30 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors overflow-hidden">
                <Lock className="w-6 h-6 text-primary transition-transform duration-500 group-hover:translate-y-1 group-hover:scale-110" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Pague uma vez</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sem assinatura, sem surpresas. Um único pagamento e o PlanIA é seu para sempre.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEMAS ─── */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div data-reveal className="opacity-0 text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Do seu jeito, com a sua cara</h2>
            <p className="text-muted-foreground">Mais de 6 estilos visuais para você personalizar</p>
          </div>
          <div data-reveal className="opacity-0 stagger-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(Object.entries(themeConfig) as [ThemeName, typeof themeConfig[ThemeName]][]).map(([key, t]) => {
              const isActive = theme === key;
              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`relative text-left glass-card rounded-xl p-5 transition-all duration-300 hover:border-primary/40 active:scale-[0.97] ${
                    isActive ? "border-primary ring-2 ring-primary/20" : ""
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-3">
                    {t.colors.map((c, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-border/50 shadow-sm" style={{ background: c }} />
                    ))}
                  </div>
                  <h3 className="font-semibold text-foreground text-sm">{t.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── PREÇOS ─── */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div data-reveal className="opacity-0 text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Escolha seu plano</h2>
            <p className="text-muted-foreground">Pagamento único. Sem assinatura. Sem pegadinha.</p>
          </div>
          <div data-reveal className="opacity-0 stagger-1 grid sm:grid-cols-3 gap-5 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98] ${
                  plan.popular ? "border-primary ring-1 ring-primary/20 relative" : ""
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                    Mais Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-sm text-muted-foreground">R$</span>
                  <span className="text-4xl font-extrabold font-mono-financial text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground ml-1">único</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login">
                  <Button className="w-full active:scale-[0.97] transition-transform" variant={plan.popular ? "default" : "outline"} size="lg">
                    Começar agora
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DEPOIMENTOS ─── */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-3xl">
          <div data-reveal className="opacity-0 text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">O que nossos usuários dizem</h2>
            <p className="text-muted-foreground">Milhares de pessoas já transformaram suas finanças</p>
          </div>
          <div
            data-reveal
            className="opacity-0 stagger-1 relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
            >
              {testimonials.map((t, i) => (
                <div key={i} className="w-full flex-shrink-0 px-2">
                  <div className="glass-card rounded-2xl p-8 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4 text-primary font-bold text-lg">
                      {t.initials}
                    </div>
                    <div className="flex gap-0.5 justify-center mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-primary fill-primary" />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed mb-5 italic">"{t.text}"</p>
                    <p className="font-semibold text-foreground text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Dots */}
            <div className="flex gap-2 justify-center mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === currentTestimonial ? "bg-primary w-6" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border/50 py-10 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <span className="text-lg font-bold text-foreground">
                Plan<span className="text-primary">IA</span>
              </span>
              <p className="text-sm text-muted-foreground mt-1">Inteligência financeira ao seu alcance</p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-foreground transition-colors">Contato</a>
              <a href="#" className="hover:text-foreground transition-colors">FAQ</a>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-8">
            © 2026 PlanIA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
