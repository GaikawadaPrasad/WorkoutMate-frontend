/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F19',
          card: '#151D30',
          border: '#1E293B',
          text: '#F8FAFC'
        },
        brand: {
          primary: '#10B981', // Emerald
          secondary: '#3B82F6', // Blue
          accent: '#F59E0B' // Amber
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
