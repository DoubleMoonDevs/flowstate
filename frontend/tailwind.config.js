/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        mint: "#10b981",
        sand: "#fef3c7",
        rose: "#fb7185",
        sky: "#0ea5e9",
        violet: "#6d28d9",
        lilac: "#c4b5fd",
        plum: "#4c1d95"
      },
      fontFamily: {
        display: ["'Bricolage Grotesque'", "ui-sans-serif", "system-ui"],
        body: ["'Space Grotesk'", "ui-sans-serif", "system-ui"]
      }
    }
  },
  plugins: []
};
