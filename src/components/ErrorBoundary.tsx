"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-6 animate-reveal">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Ops! Algo deu errado</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ocorreu um erro inesperado nesta página. Nossa equipe técnica já foi notificada.
            </p>
            {this.state.error && (
              <pre className="mt-4 p-4 bg-muted rounded-lg text-xs text-left overflow-auto max-w-lg mx-auto border border-border/50 font-mono">
                {this.state.error.message}
              </pre>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button 
              onClick={() => window.location.reload()} 
              variant="default"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Recarregar página
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2">
                <Home className="w-4 h-4" /> Voltar ao Início
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}