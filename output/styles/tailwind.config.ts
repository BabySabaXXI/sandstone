import type { Config } from "tailwindcss";

/**
 * Sandstone Tailwind Configuration
 * ================================
 * 
 * This configuration extends Tailwind with custom design tokens
 * specific to the Sandstone application.
 * 
 * Key Features:
 * - Custom color palette (sand, peach, sage)
 * - Semantic color tokens
 * - Custom animations and transitions
 * - Responsive breakpoints
 * - Typography scale
 */

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    /* ========================================
       CONTAINER CONFIGURATION
       ======================================== */
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },

    /* ========================================
       BREAKPOINTS (Mobile-first)
       ======================================== */
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },

    extend: {
      /* ========================================
         COLORS
         ======================================== */
      colors: {
        // SHADCN/UI theme colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Primary colors
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        // Secondary colors
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        // Destructive colors
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        // Muted colors
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        // Accent colors
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        // Card colors
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Popover colors
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        // Sand palette (warm neutrals)
        sand: {
          50: "hsl(var(--sand-50))",
          100: "hsl(var(--sand-100))",
          200: "hsl(var(--sand-200))",
          300: "hsl(var(--sand-300))",
          400: "hsl(var(--sand-400))",
          500: "hsl(var(--sand-500))",
          600: "hsl(var(--sand-600))",
          700: "hsl(var(--sand-700))",
          800: "hsl(var(--sand-800))",
          900: "hsl(var(--sand-900))",
        },

        // Peach palette (primary accent)
        peach: {
          50: "hsl(var(--peach-50))",
          100: "hsl(var(--peach-100))",
          200: "hsl(var(--peach-200))",
          300: "hsl(var(--peach-300))",
          400: "hsl(var(--peach-400))",
          500: "hsl(var(--peach-500))",
          600: "hsl(var(--peach-600))",
          700: "hsl(var(--peach-700))",
          800: "hsl(var(--peach-800))",
          900: "hsl(var(--peach-900))",
        },

        // Sage palette (secondary accent)
        sage: {
          50: "hsl(var(--sage-50))",
          100: "hsl(var(--sage-100))",
          200: "hsl(var(--sage-200))",
          300: "hsl(var(--sage-300))",
          400: "hsl(var(--sage-400))",
          500: "hsl(var(--sage-500))",
          600: "hsl(var(--sage-600))",
          700: "hsl(var(--sage-700))",
          800: "hsl(var(--sage-800))",
          900: "hsl(var(--sage-900))",
        },

        // Blue palette (info accent)
        blue: {
          50: "hsl(var(--blue-50))",
          100: "hsl(var(--blue-100))",
          200: "hsl(var(--blue-200))",
          300: "hsl(var(--blue-300))",
          400: "hsl(var(--blue-400))",
          500: "hsl(var(--blue-500))",
          600: "hsl(var(--blue-600))",
          700: "hsl(var(--blue-700))",
          800: "hsl(var(--blue-800))",
          900: "hsl(var(--blue-900))",
        },

        // Status colors
        success: {
          DEFAULT: "hsl(var(--success-500))",
          50: "hsl(var(--success-50))",
          100: "hsl(var(--success-100))",
          200: "hsl(var(--success-200))",
          300: "hsl(var(--success-300))",
          400: "hsl(var(--success-400))",
          500: "hsl(var(--success-500))",
          600: "hsl(var(--success-600))",
          700: "hsl(var(--success-700))",
          800: "hsl(var(--success-800))",
          900: "hsl(var(--success-900))",
        },

        warning: {
          DEFAULT: "hsl(var(--warning-500))",
          50: "hsl(var(--warning-50))",
          100: "hsl(var(--warning-100))",
          200: "hsl(var(--warning-200))",
          300: "hsl(var(--warning-300))",
          400: "hsl(var(--warning-400))",
          500: "hsl(var(--warning-500))",
          600: "hsl(var(--warning-600))",
          700: "hsl(var(--warning-700))",
          800: "hsl(var(--warning-800))",
          900: "hsl(var(--warning-900))",
        },

        error: {
          DEFAULT: "hsl(var(--error-500))",
          50: "hsl(var(--error-50))",
          100: "hsl(var(--error-100))",
          200: "hsl(var(--error-200))",
          300: "hsl(var(--error-300))",
          400: "hsl(var(--error-400))",
          500: "hsl(var(--error-500))",
          600: "hsl(var(--error-600))",
          700: "hsl(var(--error-700))",
          800: "hsl(var(--error-800))",
          900: "hsl(var(--error-900))",
        },
      },

      /* ========================================
         BORDER RADIUS
         ======================================== */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },

      /* ========================================
         TYPOGRAPHY
         ======================================== */
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      fontSize: {
        // Display sizes
        "display-4xl": ["3.5rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-3xl": ["3rem", { lineHeight: "1.1", fontWeight: "700" }],
        "display-2xl": ["2.5rem", { lineHeight: "1.15", fontWeight: "600" }],
        "display-xl": ["2rem", { lineHeight: "1.2", fontWeight: "600" }],

        // Heading sizes
        h1: ["1.875rem", { lineHeight: "1.25", fontWeight: "600" }],
        h2: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.35", fontWeight: "500" }],
        h4: ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
        h5: ["1rem", { lineHeight: "1.45", fontWeight: "500" }],
        h6: ["0.875rem", { lineHeight: "1.5", fontWeight: "500" }],

        // Body sizes
        "body-xl": ["1.125rem", { lineHeight: "1.7" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.65" }],
        body: ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.9375rem", { lineHeight: "1.55" }],
        "body-xs": ["0.875rem", { lineHeight: "1.5" }],

        // Caption & label sizes
        caption: ["0.8125rem", { lineHeight: "1.4" }],
        "caption-sm": ["0.75rem", { lineHeight: "1.35" }],
        label: ["0.75rem", { lineHeight: "1.3", fontWeight: "500" }],
        overline: ["0.6875rem", { lineHeight: "1.25", fontWeight: "500", letterSpacing: "0.05em" }],
      },

      /* ========================================
         SPACING
         ======================================== */
      spacing: {
        // Add missing spacing values
        "4.5": "1.125rem",
        "5.5": "1.375rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "17": "4.25rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
        "34": "8.5rem",
        "38": "9.5rem",
        "42": "10.5rem",
        "44": "11rem",
        "46": "11.5rem",
        "50": "12.5rem",
        "52": "13rem",
        "54": "13.5rem",
        "56": "14rem",
        "58": "14.5rem",
        "60": "15rem",
        "62": "15.5rem",
        "64": "16rem",
        "68": "17rem",
        "72": "18rem",
        "76": "19rem",
        "80": "20rem",
        "88": "22rem",
        "96": "24rem",
        "104": "26rem",
        "112": "28rem",
        "120": "30rem",
        "128": "32rem",
      },

      /* ========================================
         BOX SHADOW
         ======================================== */
      boxShadow: {
        soft: "var(--shadow-sm)",
        "soft-md": "var(--shadow-md)",
        "soft-lg": "var(--shadow-lg)",
        "soft-xl": "var(--shadow-xl)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        dropdown: "var(--shadow-dropdown)",
        modal: "var(--shadow-modal)",
      },

      /* ========================================
         TRANSITIONS
         ======================================== */
      transitionTimingFunction: {
        "out-expo": "var(--ease-out-expo)",
        "out-back": "var(--ease-out-back)",
        spring: "var(--ease-spring)",
        bounce: "var(--ease-bounce)",
      },

      transitionDuration: {
        instant: "100ms",
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
        slower: "500ms",
      },

      /* ========================================
         ANIMATIONS
         ======================================== */
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },

      animation: {
        "fade-in": "fade-in var(--duration-normal) var(--ease-out-expo) forwards",
        "fade-in-up": "fade-in-up var(--duration-slow) var(--ease-out-expo) forwards",
        "fade-in-down": "fade-in-down var(--duration-slow) var(--ease-out-expo) forwards",
        "scale-in": "scale-in var(--duration-normal) var(--ease-out-back) forwards",
        "slide-up": "slide-up var(--duration-slow) var(--ease-out-expo) forwards",
        "slide-down": "slide-down var(--duration-slow) var(--ease-out-expo) forwards",
        "slide-in-right": "slide-in-right var(--duration-slow) var(--ease-out-expo) forwards",
        "slide-in-left": "slide-in-left var(--duration-slow) var(--ease-out-expo) forwards",
        shimmer: "shimmer 1.5s linear infinite",
        pulse: "pulse 2s var(--ease-default) infinite",
        bounce: "bounce 1s var(--ease-out-expo) infinite",
        spin: "spin 1s linear infinite",
      },

      /* ========================================
         Z-INDEX
         ======================================== */
      zIndex: {
        dropdown: "100",
        sticky: "200",
        fixed: "300",
        "modal-backdrop": "400",
        modal: "500",
        popover: "600",
        tooltip: "700",
        toast: "800",
      },

      /* ========================================
         MAX WIDTH
         ======================================== */
      maxWidth: {
        "container-narrow": "768px",
        "container-default": "1024px",
        "container-wide": "1280px",
        "container-full": "1440px",
      },
    },
  },

  /* ========================================
     PLUGINS
     ======================================== */
  plugins: [
    require("tailwindcss-animate"),
    
    // Custom plugin for additional utilities
    function({ addUtilities }: { addUtilities: Function }) {
      addUtilities({
        // GPU acceleration
        ".gpu-accelerated": {
          transform: "translateZ(0)",
          "backface-visibility": "hidden",
          perspective: "1000px",
        },
        
        // Text balance
        ".text-balance": {
          "text-wrap": "balance",
        },
        
        // Line clamp utilities
        ".line-clamp-1": {
          display: "-webkit-box",
          "-webkit-line-clamp": "1",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
        },
        ".line-clamp-2": {
          display: "-webkit-box",
          "-webkit-line-clamp": "2",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
        },
        ".line-clamp-3": {
          display: "-webkit-box",
          "-webkit-line-clamp": "3",
          "-webkit-box-orient": "vertical",
          overflow: "hidden",
        },
        
        // Touch targets
        ".touch-target": {
          "min-width": "44px",
          "min-height": "44px",
        },
        
        // Scrollbar utilities
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
};

export default config;
