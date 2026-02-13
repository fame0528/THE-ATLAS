import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Design System Tokens - THE ATLAS Dark Theme
        background: {
          primary: "#0a0a0a",      // Main background
          secondary: "#111111",    // Cards/panels
          tertiary: "#1a1a1a",    // Inputs, nested elements
          hover: "#262626",       // Hover states
        },
        foreground: {
          primary: "#ededed",     // Main text
          secondary: "#a1a1aa",   // Muted text
          tertiary: "#71717a",    // Disabled/secondary
        },
        accent: {
          blue: {
            50: "#dbeafe",
            100: "#bfdbfe",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
          },
          green: {
            50: "#dcfce7",
            100: "#bbf7d0",
            500: "#22c55e",
            600: "#16a34a",
            700: "#15803d",
            800: "#166534",
            900: "#14532d",
          },
          yellow: {
            50: "#fef9c3",
            100: "#fef08a",
            500: "#eab308",
            600: "#ca8a04",
            700: "#a16207",
            800: "#854d0e",
            900: "#713f12",
          },
          red: {
            50: "#fee2e2",
            100: "#fecaca",
            500: "#ef4444",
            600: "#dc2626",
            700: "#b91c1c",
            800: "#991b1b",
            900: "#7f1d1d",
          },
          purple: {
            50: "#f3e8ff",
            100: "#e9d5ff",
            500: "#a855f7",
            600: "#9333ea",
            700: "#7e22ce",
            800: "#6b21a8",
            900: "#581c87",
          },
          orange: {
            50: "#ffedd5",
            100: "#fed7aa",
            500: "#f97316",
            600: "#ea580c",
            700: "#c2410c",
            800: "#9a3412",
            900: "#7c2d12",
          },
        },
        border: {
          DEFAULT: "#27272a",
          light: "#3f3f46",
          dark: "#18181b",
        },
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        'xs': '0.75rem',    // 12px
        'sm': '0.875rem',   // 14px
        'md': '1rem',       // 16px
        'lg': '1.125rem',   // 18px
        'xl': '1.25rem',    // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],    // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],  // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      },
      borderRadius: {
        'xl': '0.75rem',   // 12px
        '2xl': '1rem',     // 16px
      },
      boxShadow: {
        'glow': '0 0 15px rgba(59, 130, 246, 0.5)',
        'glow-lg': '0 0 25px rgba(59, 130, 246, 0.6)',
      },
    },
  },
  plugins: [],
};

export default config;