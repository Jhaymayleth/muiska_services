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
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
    },
  },
  safelist: [
    "bg-green-100",
    "text-green-700",
    "bg-blue-100",
    "text-blue-700",
    "bg-gray-100",
    "text-gray-700",
    "peer-checked:flex",
    "peer-checked:block",
    "peer-checked:hidden",
  ],
  plugins: [],
};
