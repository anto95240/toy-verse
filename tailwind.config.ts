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
        background: "var(--bg-primary)",
        foreground: "var(--foreground)",
        "btn-add": "#4A90E2",
        "btn-choix": "#F2994A",
        "bg-second": "var(--bg-secondary)",
        "text-prim": "var(--text-primary)",
        "text-second": "var(--text-secondary)",
        "border-color": "var(--border-color)",
        "btn-edit": "#75AE25",
        "btn-delete": "#F81B1B",
        "shadow-detail": "var(--btn-retour)",
        "btn-retour": "var(--btn-retour)",
      },
    },
  },
  plugins: [],
}
export default config
