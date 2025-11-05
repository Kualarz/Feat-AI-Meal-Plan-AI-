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
      colors: {
        // Background colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        // Card colors
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",

        // Border color
        border: "hsl(var(--border))",

        // Primary colors (buttons, links, accents)
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",

        // Muted/secondary colors
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",

        // Success, warning, error colors
        success: "hsl(var(--success))",
        "success-foreground": "hsl(var(--success-foreground))",
        warning: "hsl(var(--warning))",
        "warning-foreground": "hsl(var(--warning-foreground))",
        destructive: "hsl(var(--destructive))",
        "destructive-foreground": "hsl(var(--destructive-foreground))",
      },
    },
  },
  plugins: [],
};
export default config;
