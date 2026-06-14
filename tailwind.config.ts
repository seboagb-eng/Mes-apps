import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette PILOT : bleu de confiance + vert FCFA
        primary: {
          DEFAULT: "#0B5FFF",
          dark: "#0A4FD1",
          light: "#E6EFFF",
        },
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
