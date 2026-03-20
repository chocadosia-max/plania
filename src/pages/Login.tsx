import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Check, User, Briefcase, Store, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const phrases = [
  "Seus gastos organizados em 5 minutos",
  "IA que avisa antes de você errar",
  "Design que você vai querer mostrar",
  "Pague uma vez, organize para sempre",
];

const profiles = [
  { id: "pessoal", label: "Pessoal", icon: User, emoji: "👤" },
  { id: "freelancer", label: "Freelancer", icon: Briefcase, emoji: "💼" },
  { id: "empresario", label: "Empresário", icon: Store, emoji: "🏪" },
];

function getPasswordStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Fraca", color: "bg-red-500" };
  if (score <= 2) return { level: 2, label: "Razoável", color: "bg-orange-400" };
  if (score <= 3) return { level: 3, label: "Boa", color: "bg-yellow-400" };
  if (score <= 4) return { level: 4, label: "Forte", color: "bg-green-400" };
  return { level: 5, label: "Excelente", color: "bg-green-500" };
}

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phraseVisible, setPhraseVisible] = useState(true);
  const [formKey, setFormKey] = useState(0);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const navigate = useNavigate();

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [shaking, setShaking] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseVisible(false);
      setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % phrases.length);
        setPhraseVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const emailValid = useMemo(() => isValidEmail(email), [email]);

  const triggerShake = useCallback((field: string) => {
    setShaking((s) => ({ ...s, [field]: true }));
    setTimeout(() => setShaking((s) => ({ ...s, [field]: false })), 500);
  }, []);

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }));
    if (field === "email" && email && !emailValid) triggerShake("email");
    if (field === "name" && isSignUp && !name.trim()) triggerShake("name");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    if (!emailValid) { triggerShake("email"); hasError = true; }
    if (!password) { triggerShake("password"); hasError = true; }
    if (isSignUp && !name.trim()) { triggerShake("name"); hasError = true; }
    setTouched({ email: true, password: true, name: true });
    
    if (hasError) return;

    setLoadingEmail(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              profile_type: profile,
            }
          }
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
      triggerShake("email");
      triggerShake("password");
    } finally {
      setLoadingEmail(false);
    }
  };

  const loginComGoogle = async () => {
    try {
      setLoadingGoogle(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error("Erro ao conectar com Google: " + error.message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setTouched({});
    setFormKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-500">
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 hero-gradient animate-aurora opacity-90" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center max-w-md">
          <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
            Plan<span className="opacity-80">IA</span>
          </h1>
          <div className="h-16 flex items-center justify-center">
            <p
              className="text-xl text-white/90 font-medium transition-all duration-400 ease-out"
              style={{
                opacity: phraseVisible ? 1 : 0,
                transform: phraseVisible ? "translateY(0)" : "translateY(12px)",
                filter: phraseVisible ? "blur(0)" : "blur(3px)",
              }}
            >
              {phrases[phraseIndex]}
            </p>
          </div>
          <div className="flex gap-2 justify-center mt-8">
            {phrases.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  i === phraseIndex ? "bg-white w-5" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>

          <div key={formKey} className={isSignUp ? "animate-slide-left" : "animate-slide-right"}>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {isSignUp ? "Criar conta" : "Bem-vindo de volta"}
            </h2>
            <p className="text-muted-foreground mb-7 text-sm">
              {isSignUp ? "Preencha seus dados para começar" : "Entre na sua conta para continuar"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className={`relative input-glow rounded-lg transition-all ${shaking.name ? "animate-shake" : ""}`}>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className="pr-9 transition-[border-color,box-shadow] duration-200"
                    />
                    {touched.name && name.trim() && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-check-bounce" />
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className={`relative input-glow rounded-lg transition-all ${shaking.email ? "animate-shake" : ""}`}>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className="pr-9 transition-[border-color,box-shadow] duration-200"
                  />
                  {touched.email && email && (
                    emailValid ? (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 animate-check-bounce" />
                    ) : (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-destructive font-medium">Inválido</span>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  {!isSignUp && (
                    <button type="button" className="text-xs text-primary hover:underline">
                      Esqueci minha senha
                    </button>
                  )}
                </div>
                <div className={`relative input-glow rounded-lg transition-all ${shaking.password ? "animate-shake" : ""}`}>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className="pr-9 transition-[border-color,box-shadow] duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {isSignUp && password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.level ? passwordStrength.color : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Força: <span className="font-medium text-foreground">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label>Perfil de uso</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {profiles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setProfile(p.id)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 active:scale-[0.96] ${
                          profile === p.id
                            ? "border-primary bg-primary/10 ring-1 ring-primary/20"
                            : "border-border hover:border-primary/30 bg-card/50"
                        }`}
                      >
                        <span className="text-xl">{p.emoji}</span>
                        <span className="text-xs font-medium text-foreground">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full active:scale-[0.97] transition-transform" size="lg" disabled={loadingEmail}>
                {loadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? "Criar minha conta" : "Entrar")}
              </Button>

              {!isSignUp && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full gap-2 active:scale-[0.97] transition-transform" 
                  size="lg"
                  onClick={loginComGoogle}
                  disabled={loadingGoogle}
                >
                  {loadingGoogle ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Entrar com Google
                    </>
                  )}
                </Button>
              )}
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
              <button onClick={toggleMode} className="text-primary hover:underline font-medium">
                {isSignUp ? "Entrar" : "Criar conta"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;