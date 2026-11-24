import type { Config } from "tailwindcss";

/* OpSauce palette — sampled from the reference moodboard:
   terracotta #C94B3C · butter #F0D98D · lagoon teal #76AFC0
   Grounded in warm paper (light) and deep teal ink (dark). */
const terracotta = {
  50: "#fdf3f0",
  100: "#fbe4de",
  200: "#f5c7bc",
  300: "#eda394",
  400: "#df7662",
  500: "#c94b3c",
  600: "#b24032",
  700: "#91342a",
  800: "#742e27",
  900: "#5d2b25",
  950: "#33130f",
};

const teal = {
  50: "#f1f7f8",
  100: "#dfedf0",
  200: "#c3dde3",
  300: "#9bc7d2",
  400: "#76afc0",
  500: "#5995a7",
  600: "#477884",
  700: "#3b626b",
  800: "#345057",
  900: "#2c4348",
  950: "#18292d",
};

const sand = {
  50: "#fefbf0",
  100: "#fcf3d9",
  200: "#f7e7b5",
  300: "#f0d98d",
  400: "#e5c46b",
  500: "#c9a44e",
  600: "#a6833b",
  700: "#816630",
  800: "#6b552d",
  900: "#5b492b",
  950: "#362a18",
};

const ink = {
  50: "#f8f9f7",
  100: "#ecf0ed",
  200: "#d7deda",
  300: "#b4c2bd",
  400: "#8aa09b",
  500: "#66817c",
  600: "#4b6662",
  700: "#3a5050",
  800: "#273a3b",
  900: "#172527",
  950: "#0e191b",
};

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1240px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
        },
        brand: terracotta,
        terracotta,
        teal,
        sand,
        ink,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 10px)",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(70, 48, 30, 0.04), 0 3px 10px -4px rgba(70, 48, 30, 0.08)",
        card: "0 2px 4px -2px rgba(70, 48, 30, 0.06), 0 12px 28px -16px rgba(23, 37, 39, 0.22)",
        elevated:
          "0 28px 56px -24px rgba(23, 37, 39, 0.32), 0 8px 18px -10px rgba(70, 48, 30, 0.18)",
        glow: "0 0 0 1px rgba(201, 75, 60, 0.14), 0 16px 40px -14px rgba(201, 75, 60, 0.38)",
        teal: "0 0 0 1px rgba(89, 149, 167, 0.16), 0 14px 36px -16px rgba(89, 149, 167, 0.42)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #c94b3c 0%, #b24032 55%, #91342a 100%)",
        "teal-gradient":
          "linear-gradient(135deg, #8fc3d0 0%, #5995a7 100%)",
        "sand-gradient":
          "linear-gradient(135deg, #f7e7b5 0%, #e5c46b 100%)",
        "brand-radial":
          "radial-gradient(125% 125% at 0% 0%, #3c231e 0%, #1a2527 48%, #0d1719 100%)",
        "ink-radial":
          "radial-gradient(120% 120% at 0% 0%, #1d3739 0%, #111e20 52%, #0d1719 100%)",
        "grid-faint":
          "linear-gradient(to right, rgba(89,149,167,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(89,149,167,0.09) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "spin-slow": {
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 2s infinite",
        "spin-slow": "spin-slow 1.4s linear infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
