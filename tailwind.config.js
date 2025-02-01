/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f6ff",
          100: "#e5efff",
          200: "#cddfff",
          300: "#b4cfff",
          400: "#96b4ff",
          500: "#779BF4",
          600: "#1a365d",
          700: "#0f172a",
          800: "#0d1424",
          900: "#0a0f1a",
        },
        secondary: {
          50: "#fdf8f6",
          100: "#f2e8e5",
          200: "#eaddd7",
          300: "#e0cec7",
          400: "#d2bab0",
          500: "#bfa094",
          600: "#a18072",
          700: "#977669",
          800: "#846358",
          900: "#43302b",
        },
        background: {
          cream: "#FAF9F6",
          beige: "#F5F5DC",
          light: "#FFFFFF",
          dark: "#1a1a1a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
      },
      boxShadow: {
        "soft-sm": "0 2px 4px 0 rgba(0,0,0,0.05)",
        "soft-md": "0 4px 6px -1px rgba(0,0,0,0.07)",
        "soft-lg": "0 10px 15px -3px rgba(0,0,0,0.07)",
        "soft-xl": "0 20px 25px -5px rgba(0,0,0,0.07)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
