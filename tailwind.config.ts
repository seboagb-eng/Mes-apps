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
        ink: "#10131A",
        ground: "#F3F4F1",
        surface: "#FFFFFF",
        line: "#D5D7D1",
        divider: "#ECEDE9",
        muted: "#565B66",
        primary: {
          DEFAULT: "#2D2A9E",
          dark: "#1E1B73",
          mid: "#4B47C9",
          light: "#A9A7EC",
          tint: "#E7E6F7",
        },
        success: {
          DEFAULT: "#0F7A4A",
          tint: "#E3F4E8",
        },
        late: {
          DEFAULT: "#E0661F",
          strong: "#B84A0E",
          text: "#8F3708",
          tint: "#FFE8DA",
        },
        watch: {
          text: "#8A5A00",
          tint: "#FFF3D6",
        },
        disabled: "#6B7079",
        danger: "#DC2626",
        /* alias warning → late.text so existing classes compile until Phase 2 */
        warning: "#8F3708",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
