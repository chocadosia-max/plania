import { Link } from "react-router-dom";
import { useTheme, themeConfig, ThemeName } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";

const Themes = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto flex items-center justify-between h-14 px-6">
          <span className="text-lg font-bold text-foreground">
            Plan<span className="text-primary">IA</span>
          </span>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Voltar ao dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-2">Personalizar tema</h1>
        <p className="text-muted-foreground mb-10">Escolha o visual que combina com você. A mudança é instantânea.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          {(Object.entries(themeConfig) as [ThemeName, typeof themeConfig[ThemeName]][]).map(([key, t]) => {
            const isActive = theme === key;
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`relative text-left glass-card rounded-xl p-5 transition-all duration-300 hover:border-primary/40 active:scale-[0.98] ${
                  isActive ? "border-primary ring-2 ring-primary/20" : ""
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
                <div className="flex gap-2 mb-3">
                  {t.colors.map((c, i) => (
                    <div key={i} className="w-6 h-6 rounded-full border border-border/50" style={{ background: c }} />
                  ))}
                </div>
                <h3 className="font-semibold text-foreground">{t.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Themes;
