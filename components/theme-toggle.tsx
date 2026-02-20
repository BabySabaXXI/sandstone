"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  
  // Avoid hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return placeholder during SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-1 bg-[#F5F5F0] rounded-lg p-1", className)}>
        <div className="p-2 rounded-md">
          <Sun className="w-4 h-4 text-[#8A8A8A]" />
        </div>
        <div className="p-2 rounded-md">
          <Moon className="w-4 h-4 text-[#8A8A8A]" />
        </div>
        <div className="p-2 rounded-md">
          <Monitor className="w-4 h-4 text-[#8A8A8A]" />
        </div>
      </div>
    );
  }

  return <ThemeToggleInner className={className} />;
}

function ThemeToggleInner({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex items-center gap-1 bg-[#F5F5F0] dark:bg-[#252525] rounded-lg p-1", className)}>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === "light"
            ? "bg-white dark:bg-[#3D3D3D] shadow-sm text-[#E8D5C4]"
            : "text-[#8A8A8A] hover:text-[#2D2D2D] dark:hover:text-white"
        )}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === "dark"
            ? "bg-[#3D3D3D] shadow-sm text-[#E8D5C4]"
            : "text-[#8A8A8A] hover:text-[#2D2D2D] dark:hover:text-white"
        )}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "p-2 rounded-md transition-all",
          theme === "system"
            ? "bg-white dark:bg-[#3D3D3D] shadow-sm text-[#E8D5C4]"
            : "text-[#8A8A8A] hover:text-[#2D2D2D] dark:hover:text-white"
        )}
        title="System preference"
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}
