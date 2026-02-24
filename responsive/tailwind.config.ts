import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Responsive breakpoints - Mobile First Approach
      screens: {
        'xs': '375px',      // Small phones
        'sm': '640px',      // Large phones
        'md': '768px',      // Tablets
        'lg': '1024px',     // Small laptops
        'xl': '1280px',     // Desktops
        '2xl': '1536px',    // Large desktops
        // Custom breakpoints for specific use cases
        'touch': { 'raw': '(hover: none) and (pointer: coarse)' },
        'mouse': { 'raw': '(hover: hover) and (pointer: fine)' },
        'landscape': { 'raw': '(orientation: landscape)' },
        'portrait': { 'raw': '(orientation: portrait)' },
        'short': { 'raw': '(max-height: 600px)' },
        'tall': { 'raw': '(min-height: 800px)' },
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--surface-elevated))",
          hover: "hsl(var(--surface-hover))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent-primary))",
          primary: "hsl(var(--accent-primary))",
          secondary: "hsl(var(--accent-secondary))",
          tertiary: "hsl(var(--accent-tertiary))",
          warm: "hsl(var(--accent-warm))",
          cool: "hsl(var(--accent-cool))",
        },
        manus: {
          sand: "#E8D5C4",
          peach: "#F5E6D3",
          cement: "#F5F5F0",
          charcoal: "#2D2D2D",
          grey: "#5A5A5A",
          "grey-light": "#8A8A8A",
          sage: "#A8C5A8",
          amber: "#E5D4A8",
          rose: "#D4A8A8",
          blue: "#A8C5D4",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        error: "hsl(var(--error))",
        info: "hsl(var(--info))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Touch-friendly larger radius for mobile
        'touch': '1rem',
        'touch-lg': '1.5rem',
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        // Mobile-first font sizes that scale up
        'hero': ['1.75rem', { lineHeight: '1.2', fontWeight: '600' }],      // Mobile
        'hero-sm': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],      // Tablet
        'hero-md': ['2.25rem', { lineHeight: '1.2', fontWeight: '600' }],   // Desktop
        'hero-lg': ['2.5rem', { lineHeight: '1.15', fontWeight: '600' }],   // Large desktop
        
        'h1': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h1-md': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        
        'h2': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h2-md': ['1.375rem', { lineHeight: '1.4', fontWeight: '600' }],
        
        'h3': ['1rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h3-md': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        
        'body': ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }],    // Slightly smaller on mobile
        'body-md': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        
        'small': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'small-md': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        
        'caption': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'caption-md': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        // Touch-friendly spacing
        'touch': '2.75rem',     // Minimum touch target size (44px)
        'touch-sm': '2.25rem',  // Smaller touch target (36px)
        'touch-lg': '3rem',     // Larger touch target (48px)
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      minWidth: {
        'touch': '2.75rem',
        'touch-sm': '2.25rem',
      },
      minHeight: {
        'touch': '2.75rem',
        'touch-sm': '2.25rem',
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08)",
        subtle: "0 1px 2px rgba(0,0,0,0.02)",
        // Mobile-optimized shadows
        'mobile': '0 2px 8px rgba(0,0,0,0.08)',
        'mobile-lg': '0 4px 16px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        "manus-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'touch': '250ms',  // Slightly longer for touch feedback
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
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
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-left": "slide-in-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        'bounce-subtle': 'bounce-subtle 0.3s ease-in-out',
      },
      // Z-index scale for consistent layering
      zIndex: {
        'base': '0',
        'dropdown': '100',
        'sticky': '200',
        'fixed': '300',
        'modal-backdrop': '400',
        'modal': '500',
        'popover': '600',
        'tooltip': '700',
        'toast': '800',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
