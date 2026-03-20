"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center space-y-6 bg-[#080B14] text-[#F0F4FF] animate-reveal">
          <div className="text-6xl">⚠️</div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Algo deu errado aqui</h2>
            <p className="text-[#7B8DB0] max-w-md mx-auto">
              Não se preocupe, seus dados estão salvos. Ocorreu um erro inesperado nesta página.
            </p>
          </div>
          <Button 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = "/dashboard";
            }} 
            className="bg-[#6366F1] hover:bg-[#6366F1]/90 text-white px-8 py-6 rounded-xl text-base font-bold gap-2"
          >
            ← Voltar para o Dashboard
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}