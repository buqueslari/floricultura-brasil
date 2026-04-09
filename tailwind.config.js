/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#ed0707',
        secondary: '#10B981',
        promo: '#DC2626',
        discount: '#FCD34D',
      },
    },
  },
  plugins: [],
}

