/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'sage': {
          DEFAULT: '#889f8b',
          dark: '#5a6f5c',
          light: '#b6c6b8'
        },
        'sand': {
          50: '#fcfaf8',
          100: '#f9f5f0',
          200: '#f3e8dd',
          300: '#ead4c3',
        },
        'charcoal': {
          DEFAULT: '#2c3539',
          muted: '#5e6a71'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      }
    }
  },
  plugins: []
}
