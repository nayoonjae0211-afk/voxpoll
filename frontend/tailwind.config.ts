import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#09090B",
        surface: "#18181B",
        "surface-2": "#27272A",
        border: "#3F3F46",
        text: {
          DEFAULT: "#FAFAFA",
          muted: "#A1A1AA",
          subtle: "#71717A",
        },
        accent: {
          DEFAULT: "#06B6D4",
          hover: "#0891B2",
          soft: "rgba(6, 182, 212, 0.10)",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        display: ["2.5rem", { lineHeight: "3rem", fontWeight: "700" }],
        h1: ["1.75rem", { lineHeight: "2.25rem", fontWeight: "700" }],
        h2: ["1.375rem", { lineHeight: "1.875rem", fontWeight: "600" }],
        h3: ["1.125rem", { lineHeight: "1.625rem", fontWeight: "600" }],
        body: ["0.9375rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        caption: ["0.75rem", { lineHeight: "1rem", fontWeight: "500" }],
      },
      borderRadius: {
        lg: "0.625rem",
        xl: "0.875rem",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 200ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
