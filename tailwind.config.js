/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        green: { primary: '#1e5a10', dark: '#163d0b', light: '#2d7a1a', subtle: '#e8f5e2' },
        gold:  { primary: '#c9a84c', dark: '#a8872e', light: '#e0c470', subtle: '#fdf8ec' },
        beige: { primary: '#f8f4ee', dark: '#ede7db', border: '#d8cfc3' },
      },
      fontFamily: { tajawal: ['Tajawal', 'sans-serif'] },
    },
  },
  plugins: [],
}
