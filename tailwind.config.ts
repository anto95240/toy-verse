import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'btn-add': '#4A90E2',
        'btn-choix': '#F2994A',
        'baground-detail': '#f2f2f2',
        'btn-edit': '#75AE25',
        'btn-delete': '#F81B1B',
      },
    },
  },
  plugins: [],
} satisfies Config;
