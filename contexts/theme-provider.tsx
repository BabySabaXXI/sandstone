"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  ReactNode,
} from "react";

// =============================================================================
// Types
// =============================================================================

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeContextState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  themes: Theme[];
}

// =============================================================================
// Constants
// =============================================================================

const THEME_TRANSITION_CLASS = "theme-transition";
const THEMES: Theme[] = ["light", "dark", "system"];

// =============================================================================
// Context
// =============================================================================

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get the system theme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Get initial theme from localStorage or default
 */
function getInitialTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme;
  
  try {
    const stored = localStorage.getItem(storageKey) as Theme;
    if (stored && THEMES.includes(stored)) {
      return stored;
    }
  } catch (e) {
    // localStorage not available
  }
  
  return defaultTheme;
}

// =============================================================================
// Provider Component
// =============================================================================

function ThemeProviderComponent({
  children,
  defaultTheme = "system",
  storageKey = "sandstone-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // State
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // =============================================================================
  // Theme Application
  // =============================================================================

  const applyTheme = useCallback((newTheme: ResolvedTheme) => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    
    // Remove old theme classes
    root.classList.remove("light", "dark");
    
    // Add new theme class
    root.classList.add(newTheme);
    
    // Update color scheme
    root.style.colorScheme = newTheme;
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        newTheme === "dark" ? "#1A1A1A" : "#F5F5F0"
      );
    }
  }, []);

  // =============================================================================
  // Theme Resolution
  // =============================================================================

  const resolveTheme = useCallback((t: Theme): ResolvedTheme => {
    if (t === "system") {
      return systemTheme;
    }
    return t;
  }, [systemTheme]);

  // =============================================================================
  // Set Theme Handler
  // =============================================================================

  const setTheme = useCallback((newTheme: Theme) => {
    if (!THEMES.includes(newTheme)) return;
    
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch (e) {
      // localStorage not available
    }
    
    setThemeState(newTheme);
  }, [storageKey]);

  // =============================================================================
  // Effects
  // =============================================================================

  // Initialize theme from localStorage
  useEffect(() => {
    const initialTheme = getInitialTheme(storageKey, defaultTheme);
    setThemeState(initialTheme);
    setSystemTheme(getSystemTheme());
    setMounted(true);
  }, [storageKey, defaultTheme]);

  // Apply theme when it changes
  useEffect(() => {
    if (!mounted) return;

    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [theme, mounted, resolveTheme, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemTheme = e.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);
      
      if (theme === "system") {
        setResolvedTheme(newSystemTheme);
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, applyTheme]);

  // Handle transition disabling
  useEffect(() => {
    if (!disableTransitionOnChange || typeof window === "undefined") return;

    const root = document.documentElement;
    
    const disableTransitions = () => {
      root.classList.add(THEME_TRANSITION_CLASS);
      const styles = document.createElement("style");
      styles.innerHTML = `
        .${THEME_TRANSITION_CLASS} *,
        .${THEME_TRANSITION_CLASS} *::before,
        .${THEME_TRANSITION_CLASS} *::after {
          transition: none !important;
        }
      `;
      styles.id = "theme-transition-style";
      document.head.appendChild(styles);
    };

    const enableTransitions = () => {
      root.classList.remove(THEME_TRANSITION_CLASS);
      const styleElement = document.getElementById("theme-transition-style");
      if (styleElement) {
        styleElement.remove();
      }
    };

    disableTransitions();
    const timeout = setTimeout(enableTransitions, 0);

    return () => {
      clearTimeout(timeout);
      enableTransitions();
    };
  }, [theme, disableTransitionOnChange]);

  // =============================================================================
  // Memoized Value
  // =============================================================================

  const value = useMemo<ThemeContextState>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      themes: THEMES,
    }),
    [theme, setTheme, resolvedTheme, systemTheme]
  );

  // =============================================================================
  // Render
  // =============================================================================

  // Prevent flash by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('${storageKey}') || '${defaultTheme}';
                  var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  var resolved = theme === 'system' ? systemTheme : theme;
                  document.documentElement.classList.add(resolved);
                  document.documentElement.style.colorScheme = resolved;
                } catch (e) {}
              })();
            `,
          }}
        />
        <div style={{ visibility: "hidden" }}>{children}</div>
      </>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Memoize the provider to prevent unnecessary re-renders
export const ThemeProvider = memo(ThemeProviderComponent);
ThemeProvider.displayName = "ThemeProvider";

// =============================================================================
// Hook
// =============================================================================

export function useTheme(): ThemeContextState {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// =============================================================================
// Selector Hooks for Fine-Grained Subscriptions
// =============================================================================

/**
 * Hook to get only the resolved theme (light/dark)
 * Use this instead of useTheme() when you only need the resolved theme
 */
export function useResolvedTheme(): ResolvedTheme {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useResolvedTheme must be used within a ThemeProvider");
  }
  return context.resolvedTheme;
}

/**
 * Hook to check if the current theme is dark
 * Use this for conditional dark mode styling
 */
export function useIsDarkMode(): boolean {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useIsDarkMode must be used within a ThemeProvider");
  }
  return context.resolvedTheme === "dark";
}

/**
 * Hook to get only the setTheme function
 * Use this when you only need to change the theme
 */
export function useSetTheme(): (theme: Theme) => void {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useSetTheme must be used within a ThemeProvider");
  }
  return context.setTheme;
}

export default ThemeContext;
