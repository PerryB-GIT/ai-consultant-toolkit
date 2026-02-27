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
          DEFAULT: "#c97c4b",
          dark: "#e8a87c",
          muted: "rgba(201,124,75,0.15)",
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
