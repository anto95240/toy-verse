import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- 1. Anciennes couleurs (Legacy) ---
        // On les garde pour ne pas casser l'existant
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)", 
        "bg-second": "var(--bg-secondary)",
        "text-prim": "var(--text-primary)",
        "text-second": "var(--text-secondary)",
        "btn-add": "#4A90E2",
        "btn-choix": "#F2994A",
        "btn-edit": "#75AE25",
        "btn-delete": "#F81B1B",
        "shadow-detail": "var(--btn-retour)",
        "btn-retour": "var(--btn-retour)",
        
        // --- 2. Nouveau Design System (Shadcn UI / HSL) ---
        // Ces définitions permettent d'utiliser les classes comme 'bg-background', 'text-primary', 'border-border'
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Ajout des radius pour les coins arrondis cohérents
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
export default config