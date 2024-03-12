import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  prefix: "virtual-",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        wenhei: ['"HYWenHei"', ...defaultTheme.fontFamily.sans],
        barlow: ['"Barlow"', ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {},
      keyframes: {
        hover: {
          "0%": { background: "transparent" },
          "100%": { background: "rgba(156, 163, 175, 0.5)" },
        },
      },
      animation: {
        hover: "hover 0.2s ease-in forwards",
      },
    },
  },
  plugins: [],
};
