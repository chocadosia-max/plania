import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon, Check, Loader2, ChevronDown,
  ShoppingCart, Car, UtensilsCrossed, Pill, Gamepad2,
  GraduationCap, Home, Briefcase, Plane, Gift,
} from "lucide-react";

/* ─── categories ─── */
const categories = [
  { id: "mercado", label: "Mercado", emoji: "🛒", icon: ShoppingCart },
  { id: "transporte", label: "Transporte", emoji: "🚗", icon: Car },
  { id: "alimentacao", label: "Alimentação", emoji: "🍕", icon: UtensilsCrossed },
  { id: "saude", label: "Saúde", emoji: "💊", icon: Pill },
  { id: "lazer", label: "Lazer", emoji: "🎮", icon: Gamepad2 },
  { id: "educacao", label: "Educação", emoji: "📚", icon: GraduationCap },
  { id: "moradia", label: "Moradia", emoji: "🏠", icon: Home },
  { id: "trabalho", label: "Trabalho", emoji: "💼", icon: Briefcase },
  { id: "viagem", label: "Viagem", emoji: "✈️", icon: Plane },
  { id: "outros", label: "Outros", emoji: "🎁", icon: Gift },
];

/* ─── previous descriptions for autocomplete ─── */
const previousDescriptions = [
  "Salário", "Aluguel", "Supermercado", "Freelance", "Conta de luz",
  "Restaurante", "Uber", "Spotify", "Academia", "Game Pass",
  "Mercado Livre", "Farmácia", "Combustível", "Netflix", "Internet",
];

/* ─── save states ─── */
type SaveState = "idle" | "saving" | "saved";

export default function Transacoes() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("tipo") === "receita" ? "receita" : searchParams.get("tipo") === "gasto" ? "gasto" : "gasto";

  const [type, setType] = useState<"receita" | "gasto">(initialType);
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [selectedBounce, setSelectedBounce] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [flyAway, setFlyAway] = useState(false);
  const descRef = useRef<HTMLInputElement>(null);

  const isReceita = type === "receita";

  // Filter suggestions
  const filteredSuggestions = useMemo(() => {
    if (!description) return [];
    return previousDescriptions.filter(
      (s) => s.toLowerCase().includes(description.toLowerCase()) && s.toLowerCase() !== description.toLowerCase()
    ).slice(0, 5);
  }, [description]);

  // Category selection with bounce
  const selectCategory = (id: string) => {
    setCategory(id);
    setSelectedBounce(id);
    setTimeout(() => setSelectedBounce(""), 400);
  };

  // Format value as currency
  const displayValue = useMemo(() => {
    const num = parseFloat(value.replace(/\D/g, "")) / 100;
    if (!value || isNaN(num)) return "0,00";
    return num.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
  }, [value]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setValue(raw);
  };

  // Save handler
  const handleSave = () => {
    if (!value || value === "0") return;
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setFlyAway(true);
      setTimeout(() => {
        // Reset
        setSaveState("idle");
        setValue("");
        setDescription("");
        setCategory("");
        setRecurring(false);
        setNotes("");
        setShowNotes(false);
        setFlyAway(false);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Novo lançamento</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Registre uma receita ou gasto</p>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setType("receita")}
          className={cn(
            "flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97]",
            isReceita
              ? "bg-green-500/15 text-green-500 ring-2 ring-green-500/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          💚 RECEITA
        </button>
        <button
          onClick={() => setType("gasto")}
          className={cn(
            "flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.97]",
            !isReceita
              ? "bg-red-400/15 text-red-400 ring-2 ring-red-400/30"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          ❤️ GASTO
        </button>
      </div>

      {/* Form card */}
      <div
        className={cn(
          "glass-card rounded-2xl p-6 space-y-5 transition-all duration-500 relative overflow-hidden",
          flyAway && "animate-fly-away"
        )}
        style={{
          borderColor: isReceita ? "hsl(142 70% 45% / 0.2)" : "hsl(0 70% 60% / 0.2)",
        }}
      >
        {/* Subtle color indicator top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 transition-colors duration-500"
          style={{ background: isReceita ? "hsl(142 70% 45% / 0.5)" : "hsl(0 70% 60% / 0.5)" }}
        />

        {/* Value input */}
        <div className="text-center py-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Valor</p>
          <div className="flex items-center justify-center gap-1">
            <span className={cn(
              "text-2xl font-bold transition-colors duration-300",
              isReceita ? "text-green-500" : "text-red-400"
            )}>R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={displayValue}
              onChange={handleValueChange}
              placeholder="0,00"
              className={cn(
                "text-5xl font-extrabold font-mono-financial bg-transparent border-none outline-none text-center w-full max-w-[280px] transition-colors duration-300",
                isReceita ? "text-green-500" : "text-red-400",
                "placeholder:text-muted-foreground/30"
              )}
            />
          </div>
        </div>

        {/* Description with autocomplete */}
        <div className="space-y-1.5 relative">
          <Label>Descrição</Label>
          <Input
            ref={descRef}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ex: Supermercado, Salário..."
            className="input-glow"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1 glass-card rounded-lg border border-border/50 shadow-lg overflow-hidden">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => {
                    setDescription(s);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Category grid */}
        <div className="space-y-1.5">
          <Label>Categoria</Label>
          <div className="grid grid-cols-5 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => selectCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-200 active:scale-[0.94]",
                  category === cat.id
                    ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                    : "border-border/50 hover:border-primary/30 bg-card/30",
                  selectedBounce === cat.id && "animate-check-bounce"
                )}
              >
                <span className={cn(
                  "text-xl transition-transform duration-300",
                  category === cat.id && "scale-125"
                )}>{cat.emoji}</span>
                <span className="text-[10px] text-muted-foreground font-medium leading-tight text-center">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date + Recurring row */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "dd 'de' MMMM", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <Switch checked={recurring} onCheckedChange={setRecurring} />
            <span className="text-xs text-muted-foreground whitespace-nowrap">Repetir todo mês</span>
          </div>
        </div>

        {/* Optional notes */}
        {!showNotes ? (
          <button
            onClick={() => setShowNotes(true)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <ChevronDown className="w-3 h-3" />
            Adicionar observação
          </button>
        ) : (
          <div className="space-y-1.5 animate-slide-left">
            <Label>Observação</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nota opcional..."
              className="resize-none h-20 input-glow"
            />
          </div>
        )}

        {/* Save button */}
        <Button
          onClick={handleSave}
          disabled={saveState !== "idle" || !value || value === "0"}
          size="lg"
          className={cn(
            "w-full text-base font-semibold transition-all duration-300 active:scale-[0.97]",
            isReceita
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-400 hover:bg-red-500 text-white",
            saveState === "saved" && "bg-green-500"
          )}
        >
          {saveState === "idle" && (
            <>
              {isReceita ? "Salvar receita" : "Salvar gasto"}
            </>
          )}
          {saveState === "saving" && (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
          {saveState === "saved" && (
            <span className="flex items-center gap-2 animate-check-bounce">
              <Check className="w-5 h-5" />
              Salvo!
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
