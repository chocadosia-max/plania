"use client";

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Progress } from "@/components/ui/progress";
import { WelcomeStep, ProfileStep, DataStep, ThemeStep, TransactionStep } from "@/components/onboarding/OnboardingSteps";
import { Button } from "@/components/ui/button";
import dashboardMockup from "@/assets/dashboard-mockup.png";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [userName] = useState(() => localStorage.getItem("plania-user-name") || "Mariana");
  const navigate = useNavigate();

  const next = () => setStep(s => s + 1);
  const finish = () => {
    setIsFinished(true);
  };

  if (isFinished) {
    return <CelebrationScreen onGo={() => navigate('/dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-500">
      {/* Progress Bar */}
      {step > 1 && (
        <div className="fixed top-0 left-0 right-0 z-50 p-6 space-y-2 max-w-xl mx-auto">
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Etapa {step} de 5</span>
            <span>{Math.round(((step - 1) / 4) * 100)}%</span>
          </div>
          <Progress value={((step - 1) / 4) * 100} className="h-1.5 bg-muted" />
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {step === 1 && (
            <div className="fixed inset-0 -z-10 hero-gradient animate-aurora" />
          )}
          
          {step === 1 && <WelcomeStep name={userName} onNext={next} />}
          {step === 2 && <ProfileStep onNext={next} />}
          {step === 3 && <DataStep onNext={next} onSkip={next} />}
          {step === 4 && <ThemeStep onNext={next} />}
          {step === 5 && <TransactionStep onFinish={finish} onSkip={finish} />}
        </div>
      </div>
    </div>
  );
}

function CelebrationScreen({ onGo }: { onGo: () => void }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 overflow-hidden relative">
      {/* Confetti Effect (CSS based) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-[confetti-burst_2s_ease-out_both]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#7c3aed', '#ec4899', '#10b981', '#3b82f6'][i % 4],
              animationDelay: `${Math.random() * 2}s`,
              '--x': Math.random(),
            } as any}
          />
        ))}
      </div>

      <div className={cn(
        "w-full max-w-2xl text-center space-y-8 transition-all duration-1000",
        showContent ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"
      )}>
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-foreground tracking-tight">Você está pronto! 🎉</h1>
          <p className="text-xl text-muted-foreground">Sua jornada para a liberdade financeira começa agora.</p>
        </div>

        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative glass-card rounded-2xl overflow-hidden border-primary/20 shadow-2xl">
            <img src={dashboardMockup} alt="Dashboard" className="w-full opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
        </div>

        <Button 
          size="lg" 
          onClick={onGo}
          className="h-16 px-12 rounded-2xl text-xl font-bold shadow-2xl shadow-primary/30 animate-pulse hover:animate-none"
        >
          Ver meu dashboard →
        </Button>
      </div>
    </div>
  );
}