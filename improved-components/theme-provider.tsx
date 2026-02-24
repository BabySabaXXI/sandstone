"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";

// =============================================================================
// TYPES
// =============================================================================

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
  systemTheme: "dark" | "light" | undefined;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const THEME_COLORS = {
  dark: "#1A1A1A",
  light: "#F5F5F0",
} as const;

// =============================================================================
// CONTEXT
// =============================================================================

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(storageKey: string): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(storageKey) as Theme | null;
  } catch {
    return null;
  }
}

function applyTheme(
  theme: "dark" | "light",
  disableTransition: boolean
): void {
  const root = document.documentElement;

  // Disable transitions temporarily if needed
  if (disableTransition) {
    const css = document.createElement("style");
    css.textContent =
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
    css.appendChild(document.createTextNode(""));
    document.head.appendChild(css);

    requestAnimationFrame(() => {
      document.head.removeChild(css);
    });
  }

  root.classList.remove("light", "dark");
  root.classList.add(theme);

  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", THEME_COLORS[theme]);
  }
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export const ThemeProvider = memo(function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "sandstone-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // State
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [systemTheme, setSystemTheme] = useState<"dark" | "light" | undefined>(
    undefined
  );
  const [mounted, setMounted] = useState(false);

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  useEffect(() => {
    const stored = getStoredTheme(storageKey);
    if (stored) {
      setThemeState(stored);
    }
    setSystemTheme(getSystemTheme());
    setMounted(true);
  }, [storageKey]);

  // =============================================================================
  // THEME APPLICATION
  // =============================================================================

  useEffect(() => {
    if (!mounted) return;

    let resolved: "dark" | "light";
    if (theme === "system" && enableSystem) {
      resolved = getSystemTheme();
    } else {
      resolved = theme as "dark" | "light";
    }

    setResolvedTheme(resolved);
    applyTheme(resolved, disableTransitionOnChange);
  }, [theme, mounted, enableSystem, disableTransitionOnChange]);

  // =============================================================================
  // SYSTEM THEME LISTENER
  // =============================================================================

  useEffect(() => {
    if (!enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);
      setResolvedTheme(newSystemTheme);
      applyTheme(newSystemTheme, disableTransitionOnChange);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, disableTransitionOnChange]);

  // =============================================================================
  // SET THEME CALLBACK
  // =============================================================================

  const setTheme = useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // Ignore localStorage errors (e.g., in private mode)
      }
      setThemeState(newTheme);
    },
    [storageKey]
  );

  // =============================================================================
  // CONTEXT VALUE (MEMOIZED)
  // =============================================================================

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
    }),
    [theme, setTheme, resolvedTheme, systemTheme]
  );

  // =============================================================================
  // RENDER
  // =============================================================================

  // Prevent flash by rendering children only when mounted
  // This ensures the theme is correctly applied before first paint
  if (!mounted) {
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('${storageKey}') || '${defaultTheme}';
                  var resolved = theme === 'system' 
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : theme;
                  document.documentElement.classList.add(resolved);
                } catch(e) {}
              })()
            `,
          }}
        />
        <div style={{ visibility: "hidden" }}>{children}</div>
      </>
    );
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
});

// =============================================================================
// HOOK
// =============================================================================

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Optional: Selector hooks for better performance
export function useResolvedTheme(): "dark" | "light" {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useResolvedTheme must be used within a ThemeProvider");
  }
  return context.resolvedTheme;
}

export function useSetTheme(): (theme: Theme) => void {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useSetTheme must be used within a ThemeProvider");
  }
  return context.setTheme;
}
