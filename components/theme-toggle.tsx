"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check current theme
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    const root = document.documentElement;
    
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    
    localStorage.setItem("sandstone-theme", newTheme);
    setTheme(newTheme);
  };

  if (!mounted) {
    return (
      <button className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
        "bg-secondary border border-border",
        className
      )}>
        <Sun className="w-4 h-4 text-muted-foreground" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
        "bg-secondary hover:bg-muted border border-border",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-foreground transition-transform duration-200" />
      ) : (
        <Sun className="w-4 h-4 text-foreground transition-transform duration-200" />
      )}
    </button>
  );
}
