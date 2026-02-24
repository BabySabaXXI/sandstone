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
// TYPES
// =============================================================================

type Theme = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  /** Duration of theme transition in milliseconds */
  transitionDuration?: number;
}

interface ThemeContextState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  themes: Theme[];
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Check if current theme is dark */
  isDark: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const THEMES: Theme[] = ["light", "dark", "system"];
const THEME_TRANSITION_CLASS = "theme-transition";
const THEME_COLORS = {
  dark: "#0A0A0A",
  light: "#FAFAF8",
} as const;

// =============================================================================
// CONTEXT
// =============================================================================

const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the system theme preference
 */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
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
    // localStorage not available (private mode, etc.)
  }

  return defaultTheme;
}

/**
 * Apply theme to document with optional transition disabling
 */
function applyThemeToDocument(
  theme: ResolvedTheme,
  disableTransition: boolean,
  transitionDuration: number
): void {
  const root = document.documentElement;

  // Disable transitions temporarily if needed
  if (disableTransition) {
    const css = document.createElement("style");
    css.id = "theme-transition-disable";
    css.textContent =
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}";
    document.head.appendChild(css);

    // Force reflow
    void window.getComputedStyle(document.body).opacity;

    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
      const styleElement = document.getElementById("theme-transition-disable");
      if (styleElement) {
        styleElement.remove();
      }
    });
  }

  // Remove old theme classes
  root.classList.remove("light", "dark");

  // Add new theme class
  root.classList.add(theme);

  // Update color scheme
  root.style.colorScheme = theme;

  // Update meta theme-color for mobile browsers
  updateMetaThemeColor(theme);

  // Update data attribute for Tailwind
  root.setAttribute("data-theme", theme);
}

/**
 * Update meta theme-color tag
 */
function updateMetaThemeColor(theme: ResolvedTheme): void {
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", THEME_COLORS[theme]);
  }

  // Also update apple-mobile-web-app-status-bar-style
  const appleStatusBar = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]'
  );
  if (appleStatusBar) {
    appleStatusBar.setAttribute(
      "content",
      theme === "dark" ? "black-translucent" : "default"
    );
  }
}

// =============================================================================
// THEME SCRIPT (for SSR/SSG to prevent flash)
// =============================================================================

/**
 * This script is injected into the HTML to prevent flash of wrong theme.
 * It runs before React hydrates and applies the correct theme immediately.
 */
export function getThemeScript(
  storageKey: string,
  defaultTheme: Theme
): string {
  return `
    (function() {
      function getSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      try {
        var theme = localStorage.getItem('${storageKey}') || '${defaultTheme}';
        var resolved = theme === 'system' ? getSystemTheme() : theme;
        
        document.documentElement.classList.add(resolved);
        document.documentElement.style.colorScheme = resolved;
        document.documentElement.setAttribute('data-theme', resolved);
        
        // Update meta theme-color immediately
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
          meta.setAttribute('content', resolved === 'dark' ? '${THEME_COLORS.dark}' : '${THEME_COLORS.light}');
        }
      } catch (e) {
        // Fallback: add light theme
        document.documentElement.classList.add('light');
      }
    })();
  `;
}

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

function ThemeProviderComponent({
  children,
  defaultTheme = "system",
  storageKey = "sandstone-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
  transitionDuration = 200,
}: ThemeProviderProps) {
  // State
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // =============================================================================
  // THEME RESOLUTION
  // =============================================================================

  const resolveTheme = useCallback(
    (t: Theme): ResolvedTheme => {
      if (t === "system" && enableSystem) {
        return systemTheme;
      }
      return t === "system" ? "light" : t;
    },
    [systemTheme, enableSystem]
  );

  // =============================================================================
  // THEME APPLICATION
  // =============================================================================

  const applyTheme = useCallback(
    (newTheme: ResolvedTheme) => {
      if (typeof window === "undefined") return;
      applyThemeToDocument(newTheme, disableTransitionOnChange, transitionDuration);
    },
    [disableTransitionOnChange, transitionDuration]
  );

  // =============================================================================
  // SET THEME HANDLER
  // =============================================================================

  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (!THEMES.includes(newTheme)) return;

      try {
        localStorage.setItem(storageKey, newTheme);
      } catch (e) {
        // localStorage not available (private mode, etc.)
      }

      setThemeState(newTheme);
    },
    [storageKey]
  );

  // =============================================================================
  // TOGGLE THEME
  // =============================================================================

  const toggleTheme = useCallback(() => {
    const currentResolved = resolveTheme(theme);
    const newTheme: ResolvedTheme = currentResolved === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [theme, resolveTheme, setTheme]);

  // =============================================================================
  // INITIALIZATION EFFECT
  // =============================================================================

  useEffect(() => {
    // Get stored theme
    const initialTheme = getInitialTheme(storageKey, defaultTheme);
    setThemeState(initialTheme);

    // Get system theme
    const sysTheme = getSystemTheme();
    setSystemTheme(sysTheme);

    // Resolve and apply initial theme
    const resolved = initialTheme === "system" ? sysTheme : initialTheme;
    setResolvedTheme(resolved);

    // Mark as mounted
    setMounted(true);
  }, [storageKey, defaultTheme]);

  // =============================================================================
  // THEME CHANGE EFFECT
  // =============================================================================

  useEffect(() => {
    if (!mounted) return;

    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [theme, mounted, resolveTheme, applyTheme]);

  // =============================================================================
  // SYSTEM THEME LISTENER
  // =============================================================================

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

    // Use addEventListener with fallback for older browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // @ts-ignore - fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // @ts-ignore - fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [theme, enableSystem, applyTheme]);

  // =============================================================================
  // STORAGE EVENT LISTENER (sync across tabs)
  // =============================================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue) {
        const newTheme = e.newValue as Theme;
        if (THEMES.includes(newTheme)) {
          setThemeState(newTheme);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  // =============================================================================
  // MEMOIZED VALUE
  // =============================================================================

  const value = useMemo<ThemeContextState>(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      systemTheme,
      themes: THEMES,
      toggleTheme,
      isDark: resolvedTheme === "dark",
    }),
    [theme, setTheme, resolvedTheme, systemTheme, toggleTheme]
  );

  // =============================================================================
  // RENDER
  // =============================================================================

  // Prevent flash by rendering the theme script inline before hydration
  return (
    <>
      {!mounted && (
        <script
          dangerouslySetInnerHTML={{
            __html: getThemeScript(storageKey, defaultTheme),
          }}
        />
      )}
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    </>
  );
}

// Memoize the provider to prevent unnecessary re-renders
export const ThemeProvider = memo(ThemeProviderComponent);
ThemeProvider.displayName = "ThemeProvider";

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Main hook to access theme context
 */
export function useTheme(): ThemeContextState {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

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

/**
 * Hook to toggle between light and dark themes
 */
export function useToggleTheme(): () => void {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useToggleTheme must be used within a ThemeProvider");
  }
  return context.toggleTheme;
}

export default ThemeContext;
