/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {},
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
