import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeSettings {
  theme: Theme;
  backgroundImage: string | null;
}

interface ThemeContextValue extends ThemeSettings {
  setTheme: (theme: Theme) => void;
  setBackgroundImage: (image: string | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedBackground = localStorage.getItem("backgroundImage");
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
  }, []);

  useEffect(() => {
    // Apply theme class to document
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    // Apply background image
    const body = document.body;
    if (backgroundImage) {
      body.style.backgroundImage = `url(${backgroundImage})`;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
      body.style.backgroundAttachment = "fixed";
      localStorage.setItem("backgroundImage", backgroundImage);
    } else {
      body.style.backgroundImage = "";
      body.style.backgroundSize = "";
      body.style.backgroundPosition = "";
      body.style.backgroundAttachment = "";
      localStorage.removeItem("backgroundImage");
    }
  }, [backgroundImage]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleSetBackgroundImage = (image: string | null) => {
    setBackgroundImage(image);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        backgroundImage,
        setTheme: handleSetTheme,
        setBackgroundImage: handleSetBackgroundImage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}