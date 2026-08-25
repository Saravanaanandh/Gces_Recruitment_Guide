/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'book-bg': '#1a1a2e',
        'book-dark': '#0f0f1a',
        'book-spine': '#2d2d4a',
        'control-bg': 'rgba(15, 15, 30, 0.85)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
