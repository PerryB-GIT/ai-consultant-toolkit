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
        primary: {
          DEFAULT: "#6366f1",
          dark: "#818cf8",
          muted: "rgba(99,102,241,0.15)",
        },
        navy: "#0a1628",
        background: {
          DEFAULT: "#050508",
          card: "#0f0f14",
        },
      },
    },
  },
  plugins: [],
}
export default config
