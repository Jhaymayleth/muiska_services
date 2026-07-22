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
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
        elevated: "0 8px 30px rgba(0,0,0,0.08)",
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
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
