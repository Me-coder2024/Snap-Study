import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      colors: {
        primary: "#7B5CF0",
        secondary: "#FF5C5C",
        accent: "#FFD166",
        dark: "#0A0A14",
        card: "#13131F",
        card2: "#1C1C2E",
        muted: "#8884A8",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "bounce-dot": {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%": { transform: "scale(1)" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(10deg)" },
        },
        "spin-badge": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.5s ease forwards",
        float: "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 10s linear infinite",
        "bounce-dot": "bounce-dot 1.4s infinite ease-in-out both",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        "spin-badge": "spin-badge 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
