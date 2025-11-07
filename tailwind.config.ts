import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 18px 45px rgba(59,130,246,.35)",
        glass: "0 18px 50px rgba(15,23,42,.45)"
      },
      borderRadius: {
        "4xl": "2.25rem"
      }
    },
  },
  plugins: [],
};

export default config;
