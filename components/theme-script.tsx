/**
 * Theme Script Component
 * 
 * This component injects a script into the HTML head that runs immediately
 * to prevent flash of wrong theme (FOUT) before React hydrates.
 * 
 * Usage: Place this component in your <head> tag in the root layout.
 * 
 * @example
 * ```tsx
 * <head>
 *   <ThemeScript defaultTheme="system" storageKey="sandstone-theme" />
 * </head>
 * ```
 */

import { getThemeScript } from "./theme-provider";

interface ThemeScriptProps {
  /** Default theme to use if no theme is stored */
  defaultTheme?: "dark" | "light" | "system";
  /** localStorage key for theme persistence */
  storageKey?: string;
}

export function ThemeScript({
  defaultTheme = "system",
  storageKey = "sandstone-theme",
}: ThemeScriptProps) {
  return (
    <script
      // This script runs immediately and synchronously
      dangerouslySetInnerHTML={{
        __html: getThemeScript(storageKey, defaultTheme),
      }}
    />
  );
}

export default ThemeScript;
