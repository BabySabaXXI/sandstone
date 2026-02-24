"use client";

import { useTheme, type Theme } from "./theme-provider";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface ThemeToggleProps {
  /** Visual style variant */
  variant?: "default" | "minimal" | "segmented" | "switch";
  /** Size of the toggle */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Show labels alongside icons */
  showLabels?: boolean;
  /** Callback when theme changes */
  onThemeChange?: (theme: Theme) => void;
}

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

// =============================================================================
// ICONS
// =============================================================================

const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const MonitorIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </svg>
);

// =============================================================================
// THEME OPTIONS
// =============================================================================

const THEME_OPTIONS: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    icon: <SunIcon className="w-4 h-4" />,
    ariaLabel: "Switch to light theme",
  },
  {
    value: "dark",
    label: "Dark",
    icon: <MoonIcon className="w-4 h-4" />,
    ariaLabel: "Switch to dark theme",
  },
  {
    value: "system",
    label: "System",
    icon: <MonitorIcon className="w-4 h-4" />,
    ariaLabel: "Use system theme preference",
  },
];

// =============================================================================
// SIZE CONFIGURATIONS
// =============================================================================

const SIZE_CONFIGS = {
  sm: {
    button: "h-8 w-8",
    icon: "w-4 h-4",
    segmented: "h-8",
    switch: "w-10 h-5",
    switchThumb: "w-4 h-4",
  },
  md: {
    button: "h-10 w-10",
    icon: "w-5 h-5",
    segmented: "h-10",
    switch: "w-12 h-6",
    switchThumb: "w-5 h-5",
  },
  lg: {
    button: "h-12 w-12",
    icon: "w-6 h-6",
    segmented: "h-12",
    switch: "w-14 h-7",
    switchThumb: "w-6 h-6",
  },
};

// =============================================================================
// DEFAULT TOGGLE (Simple button that cycles themes)
// =============================================================================

function DefaultToggle({
  size = "md",
  className,
  onThemeChange,
}: Omit<ThemeToggleProps, "variant" | "showLabels">) {
  const { theme, setTheme, resolvedTheme, isDark } = useTheme();
  const sizes = SIZE_CONFIGS[size];

  const handleClick = () => {
    const newTheme: Theme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-xl border border-border",
        "bg-background hover:bg-muted",
        "text-foreground",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        "hover:scale-105 active:scale-95",
        sizes.button,
        className
      )}
      aria-label={`Current theme: ${theme}. Click to cycle themes.`}
      title={`Theme: ${theme} (click to cycle)`}
    >
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-all duration-300",
          resolvedTheme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
        )}
      >
        <SunIcon className={sizes.icon} />
      </span>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          "transition-all duration-300",
          resolvedTheme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-50"
        )}
      >
        <MoonIcon className={sizes.icon} />
      </span>
    </button>
  );
}

// =============================================================================
// MINIMAL TOGGLE (Just sun/moon without system)
// =============================================================================

function MinimalToggle({
  size = "md",
  className,
  onThemeChange,
}: Omit<ThemeToggleProps, "variant" | "showLabels">) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const sizes = SIZE_CONFIGS[size];
  const isDark = resolvedTheme === "dark";

  const handleClick = () => {
    toggleTheme();
    onThemeChange?.(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center justify-center",
        "rounded-xl",
        "bg-transparent hover:bg-muted",
        "text-foreground",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        "hover:scale-105 active:scale-95",
        sizes.button,
        className
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      <span
        className={cn(
          "transition-all duration-300",
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        )}
      >
        <SunIcon className={sizes.icon} />
      </span>
      <span
        className={cn(
          "absolute transition-all duration-300",
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        )}
      >
        <MoonIcon className={sizes.icon} />
      </span>
    </button>
  );
}

// =============================================================================
// SEGMENTED TOGGLE (All three options visible)
// =============================================================================

function SegmentedToggle({
  size = "md",
  className,
  showLabels = false,
  onThemeChange,
}: Omit<ThemeToggleProps, "variant">) {
  const { theme, setTheme } = useTheme();
  const sizes = SIZE_CONFIGS[size];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center p-1",
        "rounded-xl border border-border",
        "bg-muted",
        sizes.segmented,
        className
      )}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {THEME_OPTIONS.map((option) => {
        const isActive = theme === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => handleThemeChange(option.value)}
            className={cn(
              "relative inline-flex items-center justify-center gap-2",
              "px-3 rounded-lg",
              "text-sm font-medium",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              "h-full"
            )}
            aria-label={option.ariaLabel}
            title={option.label}
          >
            {option.icon}
            {showLabels && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// SWITCH TOGGLE (iOS-style toggle)
// =============================================================================

function SwitchToggle({
  size = "md",
  className,
  onThemeChange,
}: Omit<ThemeToggleProps, "variant" | "showLabels">) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const sizes = SIZE_CONFIGS[size];
  const isDark = resolvedTheme === "dark";

  const handleClick = () => {
    toggleTheme();
    onThemeChange?.(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={handleClick}
      className={cn(
        "relative inline-flex items-center",
        "rounded-full transition-colors duration-300",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        isDark ? "bg-primary" : "bg-sand-300 dark:bg-sand-600",
        sizes.switch,
        className
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span
        className={cn(
          "absolute left-0.5 flex items-center justify-center",
          "rounded-full bg-white shadow-sm",
          "transition-all duration-300 ease-spring",
          sizes.switchThumb,
          isDark ? "translate-x-full" : "translate-x-0"
        )}
      >
        <span
          className={cn(
            "transition-all duration-300",
            isDark ? "opacity-100" : "opacity-0"
          )}
        >
          <MoonIcon className="w-3 h-3 text-sand-800" />
        </span>
        <span
          className={cn(
            "absolute transition-all duration-300",
            isDark ? "opacity-0" : "opacity-100"
          )}
        >
          <SunIcon className="w-3 h-3 text-amber-500" />
        </span>
      </span>
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ThemeToggle({
  variant = "default",
  size = "md",
  className,
  showLabels = false,
  onThemeChange,
}: ThemeToggleProps) {
  switch (variant) {
    case "minimal":
      return <MinimalToggle size={size} className={className} onThemeChange={onThemeChange} />;
    case "segmented":
      return (
        <SegmentedToggle
          size={size}
          className={className}
          showLabels={showLabels}
          onThemeChange={onThemeChange}
        />
      );
    case "switch":
      return <SwitchToggle size={size} className={className} onThemeChange={onThemeChange} />;
    case "default":
    default:
      return <DefaultToggle size={size} className={className} onThemeChange={onThemeChange} />;
  }
}

export default ThemeToggle;
