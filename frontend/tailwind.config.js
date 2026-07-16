/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {
      colors: {
        background: "#FFFAF4",
        primary: "#7B1826",
        "primary-hover": "#651320",
        accent: "#15665A",
        text: "#221A16",
        muted: "#F2ECE5",
        border: "#E3D8CD",
        "logo-dark": "#682032",
        "logo-rose": "#CC7183",
        "logo-blush": "#EEBFBF",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Fredoka", "serif"],
      },
    },
  },
  plugins: [],
};
