/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          500: '#FF5500',
          600: '#E04A00',
        },
        cyan: {
          400: '#00D4FF',
        },
        dark: {
          900: '#111111',
          800: '#1E1E1E',
          700: '#2A2A2A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}