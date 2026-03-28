import type { Config } from "tailwindcss";

const config: Config = {
  // Use the `class` strategy so adding the `dark` class to <html>
  // toggles dark mode styles. ThemeProvider adds/removes this class.
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Righteous", "cursive"],
        body: ["Inter", "Carlito", "sans-serif"],
      },
      colors: {
        // Brand Identity System
        brand: {
          green: "#22C55E",    // Fresh Green (Navigation & Headers)
          orange: "#FF6B00",   // Feast Orange (Primary Action)
          eggshell: "#FDFCF8", // Surface Background
          black: "#1A1A1A",    // Near Black (Text & Dark Surfaces)
          "green-tint": "#DCFCE7", // Success/Savings Feedback
          "orange-tint": "#FFF1E6", // Selection/Hover Layer
        },
        
        // Semantic mapping to CSS variables
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        destructive: "hsl(var(--destructive))",
      },
      borderRadius: {
        "large-card": "24px",
        pill: "999px",
        input: "16px",
        small: "8px",
      },
      spacing: {
        '8pt-1': '4px',
        '8pt-2': '8px',
        '8pt-3': '12px',
        '8pt-4': '16px',
        '8pt-5': '24px',
        '8pt-6': '32px',
        '8pt-7': '48px',
      },
    },
  },
  plugins: [],
};
export default config;
