import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "brand-marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "gallery-marquee": {
          "0%": { transform: "translateY(0%)" },
          "100%": { transform: "translateY(-50%)" },
        },
        "gallery-fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "brand-marquee":
          "brand-marquee var(--marquee-duration,20s) linear infinite",
        "gallery-marquee":
          "gallery-marquee var(--marquee-duration,12000ms) linear infinite",
        "gallery-fade-in": "gallery-fade-in 0.5s linear forwards",
      },
    },
  },
  plugins: [],
} satisfies Config;
