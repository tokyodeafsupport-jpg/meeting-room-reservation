import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f8fb",
        ink: "#172033",
        line: "#d7dde8",
        muted: "#687386",
        brand: "#1f7a8c",
        accent: "#f2b84b",
        danger: "#c84630",
      },
      boxShadow: {
        panel: "0 18px 45px rgba(24, 35, 54, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
