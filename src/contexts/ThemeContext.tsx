import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeName = "aurora" | "floresta" | "oceano" | "por-do-sol" | "minimalista" | "candy";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "aurora",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const themeConfig: Record<ThemeName, { label: string; description: string; colors: string[] }> = {
  aurora: { label: "Aurora", description: "Gradiente roxo, rosa e azul escuro", colors: ["#7c3aed", "#ec4899", "#1e1b4b"] },
  floresta: { label: "Floresta", description: "Verde esmeralda, dourado e bege", colors: ["#059669", "#d97706", "#fef3c7"] },
  oceano: { label: "Oceano", description: "Azul profundo, ciano e branco", colors: ["#1e3a5f", "#06b6d4", "#f0f9ff"] },
  "por-do-sol": { label: "Pôr do Sol", description: "Laranja, coral e amarelo suave", colors: ["#ea580c", "#f87171", "#fef08a"] },
  minimalista: { label: "Minimalista", description: "Preto, branco e verde limão", colors: ["#0a0a0a", "#fafafa", "#a3e635"] },
  candy: { label: "Candy", description: "Rosa chiclete, lilás e branco", colors: ["#ec4899", "#c084fc", "#fdf2f8"] },
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("plania-theme");
    return (saved as ThemeName) || "aurora";
  });

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("plania-theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
