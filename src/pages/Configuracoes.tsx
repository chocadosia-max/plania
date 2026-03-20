import { useState, useRef } from "react";
import { useTheme, themeConfig, ThemeName } from "@/contexts/ThemeContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Check, Plus, Trash2, Download, Upload, User, Palette, Bell, Database,
  DollarSign, Pencil, X, ShoppingCart, Car, Pizza, Heart, Gamepad2, BookOpen,
  Home, Briefcase, Plane, Gift, Save,
} from "lucide-react";
import { toast } from "sonner";

/* ─── mini dashboard preview ─── */
function ThemePreview({ colors }: { colors: string[] }) {
  return (
    <div className="w-full aspect-[16/10] rounded-lg overflow-hidden border border-border/30 relative" style={{ background: colors[2] || colors[0] }}>
      {/* sidebar */}
      <div className="absolute left-0 top-0 bottom-0 w-[22%] flex flex-col gap-1 p-1.5" style={{ background: `${colors[0]}22` }}>
        <div className="w-full h-1.5 rounded-full" style={{ background: colors[0], opacity: 0.6 }} />
        <div className="w-3/4 h-1 rounded-full bg-current opacity-20" />
        <div className="w-3/4 h-1 rounded-full bg-current opacity-20" />
        <div className="w-3/4 h-1 rounded-full bg-current opacity-20" />
      </div>
      {/* content */}
      <div className="absolute left-[26%] top-2 right-2 space-y-1.5">
        <div className="flex gap-1">
          {[colors[0], colors[1], colors[0], colors[1]].map((c, i) => (
            <div key={i} className="flex-1 h-5 rounded" style={{ background: c, opacity: 0.25 }} />
          ))}
        </div>
        <div className="flex gap-1">
          <div className="flex-[2] h-8 rounded" style={{ background: colors[0], opacity: 0.15 }} />
          <div className="flex-1 h-8 rounded" style={{ background: colors[1], opacity: 0.15 }} />
        </div>
        <div className="h-6 rounded" style={{ background: colors[0], opacity: 0.1 }} />
      </div>
    </div>
  );
}

/* ─── category icons map ─── */
const categoryIcons: Record<string, any> = {
  "🛒": ShoppingCart, "🚗": Car, "🍕": Pizza, "💊": Heart,
  "🎮": Gamepad2, "📚": BookOpen, "🏠": Home, "💼": Briefcase,
  "✈️": Plane, "🎁": Gift,
};

const defaultCategories = [
  { name: "Mercado", icon: "🛒" },
  { name: "Transporte", icon: "🚗" },
  { name: "Alimentação", icon: "🍕" },
  { name: "Saúde", icon: "💊" },
  { name: "Lazer", icon: "🎮" },
  { name: "Educação", icon: "📚" },
  { name: "Moradia", icon: "🏠" },
  { name: "Trabalho", icon: "💼" },
];

const Configuracoes = () => {
  const { theme, setTheme } = useTheme();

  // Custom theme modal
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [customPrimary, setCustomPrimary] = useState("#7c3aed");
  const [customBg, setCustomBg] = useState("#1e1b4b");
  const [customAccent, setCustomAccent] = useState("#ec4899");
  const [customDark, setCustomDark] = useState(true);

  // Profile
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [name, setName] = useState("Usuário PlanIA");
  const [email, setEmail] = useState("usuario@plania.com");
  const [profession, setProfession] = useState("Desenvolvedor");
  const [profileType, setProfileType] = useState("pessoal");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial
  const [currency, setCurrency] = useState("BRL");
  const [closingDay, setClosingDay] = useState("1");
  const [salary, setSalary] = useState("5600");
  const [categories, setCategories] = useState(defaultCategories);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🎁");

  // Notifications
  const [alertOverspend, setAlertOverspend] = useState(true);
  const [weeklyReminder, setWeeklyReminder] = useState(true);
  const [monthlyInsight, setMonthlyInsight] = useState(true);
  const [goalDeadline, setGoalDeadline] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfilePhoto(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    toast.success("Perfil atualizado com sucesso! ✨");
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories((prev) => [...prev, { name: newCatName, icon: newCatIcon }]);
    setNewCatName("");
    toast.success("Categoria adicionada!");
  };

  const removeCategory = (idx: number) => {
    setCategories((prev) => prev.filter((_, i) => i !== idx));
    toast("Categoria removida");
  };

  const handleExportExcel = () => toast.success("Exportação Excel iniciada! 📊");
  const handleExportPDF = () => toast.success("Relatório PDF gerado! 📄");
  const handleImportCSV = () => toast.success("Extrato importado com sucesso! ✅");
  const handleClearData = () => {
    localStorage.clear();
    toast.success("Todos os dados foram limpos.");
    window.location.reload();
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-10">
        <div style={{ animation: "reveal 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">Personalize sua experiência no PlanIA</p>
        </div>

        {/* ═══ APARÊNCIA ═══ */}
        <section className="space-y-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "80ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Deixe do seu jeito</h2>
              <p className="text-xs text-muted-foreground">Escolha um tema ou crie o seu próprio</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(themeConfig) as [ThemeName, typeof themeConfig[ThemeName]][]).map(([key, t]) => {
              const isActive = theme === key;
              return (
                <button
                  key={key}
                  onClick={() => setTheme(key)}
                  className={`relative text-left glass-card rounded-xl p-4 transition-all duration-400 hover:border-primary/40 active:scale-[0.97] ${
                    isActive ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10" : ""
                  }`}
                >
                  {isActive && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-10">
                      <Check className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <ThemePreview colors={t.colors} />
                  <h3 className="font-semibold text-foreground text-sm mt-3">{t.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </button>
              );
            })}
          </div>

          <Button variant="outline" className="gap-2" onClick={() => setShowCustomTheme(true)}>
            <Plus className="w-4 h-4" /> Criar meu tema +
          </Button>
        </section>

        <Separator />

        {/* ═══ PERFIL ═══ */}
        <section className="space-y-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "160ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Perfil</h2>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-6">
            {/* Photo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="relative w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden group"
              >
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <User className="w-7 h-7 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Pencil className="w-4 h-4 text-white" />
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Foto de perfil</p>
                <p className="text-xs text-muted-foreground">Clique para alterar</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Profissão</Label>
                <Input value={profession} onChange={(e) => setProfession(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tipo de perfil</Label>
                <Select value={profileType} onValueChange={setProfileType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pessoal">👤 Pessoal</SelectItem>
                    <SelectItem value="freelancer">💻 Freelancer</SelectItem>
                    <SelectItem value="empresario">🏢 Empresário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="w-4 h-4" /> Salvar perfil
              </Button>
            </div>
          </div>
        </section>

        <Separator />

        {/* ═══ FINANCEIRA ═══ */}
        <section className="space-y-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "240ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Financeiro</h2>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Moeda</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">R$ Real</SelectItem>
                    <SelectItem value="USD">US$ Dólar</SelectItem>
                    <SelectItem value="EUR">€ Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dia de fechamento</Label>
                <Select value={closingDay} onValueChange={setClosingDay}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>Dia {i + 1}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Renda mensal esperada</Label>
                <Input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="5600" />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Categorias personalizadas</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40 text-sm group"
                  >
                    <span>{cat.icon}</span>
                    <span className="text-foreground">{cat.name}</span>
                    <button
                      onClick={() => removeCategory(idx)}
                      className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-end">
                <div className="space-y-1 flex-1">
                  <Input
                    placeholder="Nome da categoria"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCategory()}
                  />
                </div>
                <Select value={newCatIcon} onValueChange={setNewCatIcon}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(categoryIcons).map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addCategory} className="gap-1">
                  <Plus className="w-3.5 h-3.5" /> Adicionar
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* ═══ NOTIFICAÇÕES ═══ */}
        <section className="space-y-5" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "320ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Notificações</h2>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-5">
            {[
              { label: "Alerta quando gasto passar de 80%", desc: "Receba aviso antes de estourar", checked: alertOverspend, set: setAlertOverspend },
              { label: "Lembrete semanal de lançamentos", desc: "Toda segunda, um toque amigável", checked: weeklyReminder, set: setWeeklyReminder },
              { label: "Insight mensal da IA", desc: "Resumo inteligente todo dia 1°", checked: monthlyInsight, set: setMonthlyInsight },
              { label: "Aviso de meta próxima do prazo", desc: "Quando faltam 7 dias pro deadline", checked: goalDeadline, set: setGoalDeadline },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={item.checked} onCheckedChange={item.set} />
              </div>
            ))}
          </div>
        </section>

        <Separator />

        {/* ═══ DADOS ═══ */}
        <section className="space-y-5 pb-10" style={{ animation: "reveal 0.6s cubic-bezier(0.16,1,0.3,1) both", animationDelay: "400ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Dados</h2>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              <Button variant="outline" className="gap-2 justify-start" onClick={handleExportExcel}>
                <Download className="w-4 h-4" /> Exportar Excel
              </Button>
              <Button variant="outline" className="gap-2 justify-start" onClick={handleExportPDF}>
                <Download className="w-4 h-4" /> Exportar PDF
              </Button>
              <Button variant="outline" className="gap-2 justify-start" onClick={handleImportCSV}>
                <Upload className="w-4 h-4" /> Importar CSV
              </Button>
            </div>

            <Separator />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" /> Limpar todos os dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Isso vai apagar todas as transações, metas, conquistas e configurações. Essa ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Sim, apagar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>

      {/* ═══ MODAL: TEMA PERSONALIZADO ═══ */}
      <Dialog open={showCustomTheme} onOpenChange={setShowCustomTheme}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Criar tema personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Live preview */}
            <div
              className="rounded-xl p-4 border border-border/40 transition-all duration-300"
              style={{ background: customBg }}
            >
              <div className="flex gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg" style={{ background: customPrimary, opacity: 0.2 }} />
                <div className="flex-1">
                  <div className="h-2 w-24 rounded-full mb-1.5" style={{ background: customDark ? "#fff" : "#000", opacity: 0.8 }} />
                  <div className="h-1.5 w-16 rounded-full" style={{ background: customDark ? "#fff" : "#000", opacity: 0.3 }} />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-10 rounded-lg" style={{ background: customPrimary, opacity: 0.2 }} />
                <div className="flex-1 h-10 rounded-lg" style={{ background: customAccent, opacity: 0.2 }} />
              </div>
              <div className="mt-2 h-6 rounded-lg flex items-center justify-center" style={{ background: customPrimary }}>
                <span className="text-xs font-medium" style={{ color: customDark ? "#fff" : "#000" }}>Preview do botão</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Cor primária</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                  <Input value={customPrimary} onChange={(e) => setCustomPrimary(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Cor de fundo</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                  <Input value={customBg} onChange={(e) => setCustomBg(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Cor de destaque</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
                  <Input value={customAccent} onChange={(e) => setCustomAccent(e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Modo</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch checked={customDark} onCheckedChange={setCustomDark} />
                  <span className="text-sm text-muted-foreground">{customDark ? "Escuro" : "Claro"}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomTheme(false)}>Cancelar</Button>
            <Button onClick={() => { setShowCustomTheme(false); toast.success("Tema personalizado salvo! 🎨"); }}>
              Salvar meu tema
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Configuracoes;