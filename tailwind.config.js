/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "love-red": "#e63946",
        "love-pink": "#ffb7b2",
        "love-bg": "#fff0f3",
        "deep-red": "#880d1e",
      },
      fontFamily: {
        dancing: ["Dancing Script", "cursive"],
        lora: ["Lora", "serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      animation: {
        heartbeat: "heartbeat 1.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
