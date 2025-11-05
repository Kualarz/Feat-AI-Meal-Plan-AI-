# Feast AI - CSS Variable Dark Mode System

## Overview

This app uses a **class-based dark mode system** with CSS variables for complete control over light and dark themes. The `dark` class on `<html>` toggles between light and dark modes, and all colors are defined as HSL CSS variables.

## Architecture

### 1. **Tailwind Configuration** (`tailwind.config.ts`)
- `darkMode: 'class'` enables class-based dark mode
- All colors map to CSS variables using `hsl(var(--color-name))`
- No hardcoded Tailwind color values

### 2. **CSS Variables** (`app/globals.css`)

#### Light Mode (`:root`)
```css
/* Background & Text */
--background: 0 0% 100%;           /* White */
--foreground: 222.2 47.4% 11.2%;   /* Dark slate */

/* Cards */
--card: 0 0% 100%;                 /* White */
--card-foreground: 222.2 47.4% 11.2%; /* Dark slate */

/* Borders */
--border: 214.3 31.8% 91.4%;       /* Light grey */

/* Secondary */
--muted: 210 40% 96.1%;            /* Light grey */
--muted-foreground: 215.4 16.3% 46.9%; /* Medium grey */

/* Primary (Emerald) */
--primary: 134 61.2% 41.2%;        /* Emerald green */
--primary-foreground: 0 0% 100%;   /* White */

/* Status Colors */
--success: 142 72% 29%;            /* Green */
--warning: 38 92% 50%;             /* Amber */
--destructive: 0 84.2% 60.2%;      /* Red */
```

#### Dark Mode (`.dark`)
```css
/* Background & Text */
--background: 222.2 84% 4.9%;      /* Dark slate */
--foreground: 210 40% 98%;         /* Off-white */

/* Cards */
--card: 222.2 84% 4.9%;            /* Dark slate */
--card-foreground: 210 40% 98%;    /* Off-white */

/* Borders */
--border: 217.2 32.6% 17.5%;       /* Dark grey */

/* Secondary */
--muted: 217.2 32.6% 17.5%;        /* Dark grey */
--muted-foreground: 215 20.2% 65.1%; /* Light grey */

/* Primary (Brighter Emerald) */
--primary: 134 65% 50%;            /* Brighter emerald */
--primary-foreground: 0 0% 100%;   /* White */

/* Status Colors (Brighter) */
--success: 142 76% 36%;
--warning: 38 92% 56%;
--destructive: 0 86% 66%;
```

### 3. **Theme Provider** (`components/ThemeProvider.tsx`)

Manages theme state and DOM updates:
- Reads saved theme from `localStorage`
- Falls back to system preference (`prefers-color-scheme`)
- Applies/removes `dark` class on `<html>`
- Provides `useTheme()` hook with `{ theme, toggleTheme, mounted }`

```tsx
const { theme, toggleTheme, mounted } = useTheme();

if (!mounted) return null; // Avoid hydration mismatch
```

## Using the Theme System

### In Components

Replace hardcoded colors with Tailwind classes using CSS variables:

**Before:**
```tsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  <button className="bg-emerald-500 hover:bg-emerald-600 text-white">
    Click me
  </button>
</div>
```

**After:**
```tsx
<div className="bg-card text-card-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click me
  </button>
</div>
```

### Available Color Tokens

| Token | Purpose | Light | Dark |
|-------|---------|-------|------|
| `bg-background` / `text-background` | Page background | White | Dark slate |
| `text-foreground` | Primary text | Dark slate | Off-white |
| `bg-card` | Cards, modals | White | Dark slate |
| `text-card-foreground` | Card text | Dark slate | Off-white |
| `border-border` | Borders | Light grey | Dark grey |
| `bg-primary` | Buttons, links, accents | Emerald | Bright emerald |
| `text-primary-foreground` | Text on primary | White | White |
| `bg-muted` | Secondary backgrounds | Light grey | Dark grey |
| `text-muted-foreground` | Secondary text | Medium grey | Light grey |
| `bg-success` | Success states | Green | Bright green |
| `bg-warning` | Warning states | Amber | Bright amber |
| `bg-destructive` | Error/delete states | Red | Bright red |

## Component Examples

### Button
```tsx
<Button variant="primary">
  bg-primary text-primary-foreground
</Button>
```

### Card
```tsx
<Card>
  <div className="text-foreground">
    bg-card border-border
  </div>
</Card>
```

### Input
```tsx
<Input
  className="border-border bg-background text-foreground"
  placeholder="text-muted-foreground"
/>
```

### Navbar
```tsx
<nav className="bg-card border-b border-border">
  <button
    onClick={toggleTheme}
    className="bg-muted text-foreground hover:bg-muted/80"
  >
    Toggle Theme
  </button>
</nav>
```

## Adding New Colors

To add a new color (e.g., `--info`):

1. **Update `tailwind.config.ts`:**
```tsx
colors: {
  info: "hsl(var(--info))",
  "info-foreground": "hsl(var(--info-foreground))",
}
```

2. **Update `app/globals.css`:**
```css
:root {
  --info: 210 100% 50%;
  --info-foreground: 0 0% 100%;
}

.dark {
  --info: 210 100% 60%;
  --info-foreground: 0 0% 100%;
}
```

3. **Use in components:**
```tsx
<div className="bg-info text-info-foreground">
  Info message
</div>
```

## Testing

### Light Mode
- Should show: White backgrounds, dark text
- Primary button: Emerald green (#26a86c)

### Dark Mode
- Should show: Dark slate backgrounds, light text
- Primary button: Brighter emerald (#4db380)
- All text should be readable with sufficient contrast

### No Flash on Load
- Theme should apply immediately on page load
- No white flash when loading in dark mode (handled by `ThemeProvider`)

## HSL Color Format

All colors use HSL (Hue, Saturation, Lightness):
- **Hue**: 0-360 degrees
- **Saturation**: 0-100%
- **Lightness**: 0-100%

Example: `--primary: 134 61.2% 41.2%;` = Emerald green
- Hue: 134° (green range)
- Saturation: 61.2% (moderately saturated)
- Lightness: 41.2% (medium brightness)

## Browser Support

✅ All modern browsers support:
- CSS variables (custom properties)
- `prefers-color-scheme` media query
- HSL colors

## Troubleshooting

### Colors not changing in dark mode?
- Ensure `<html suppressHydrationWarning>` is set in layout
- Check that `.dark` class is being added to `<html>`
- Verify Tailwind is processing the `dark:` variants

### Flash of wrong theme?
- ThemeProvider handles this with `useEffect` + `mounted` check
- Ensure theme is applied before `<body>` renders

### Custom colors not working?
- Verify CSS variables are defined in both `:root` and `.dark`
- Check that color tokens are added to `tailwind.config.ts`
- Use `text-` prefix for text colors, `bg-` for backgrounds
