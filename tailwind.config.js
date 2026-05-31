/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  safelist: [
    // Green
    'text-green-primary','bg-green-primary','border-green-primary',
    'text-green-dark','bg-green-dark',
    'text-green-subtle','bg-green-subtle',
    'bg-green-subtle/10','bg-green-subtle/20',
    'border-green-primary/30','border-green-primary/20',
    'ring-green-primary/30',
    'hover:border-green-primary/30',
    // Gold
    'text-gold-primary','bg-gold-primary','border-gold-primary',
    'text-gold-dark','bg-gold-dark',
    'text-gold-subtle','bg-gold-subtle',
    'bg-gold-subtle/10',
    'border-gold-primary/50','border-gold-primary/40',
    // Beige
    'bg-beige-primary','bg-beige-dark','bg-beige-border',
    'border-beige-border','border-beige-border/50',
    'text-beige-primary',
  ],
  theme: {
    extend: {
      colors: {
        green: {
          primary: '#1e5a10',
          dark:    '#163d0b',
          light:   '#2d7a1a',
          subtle:  '#e8f5e2',
        },
        gold: {
          primary: '#c9a84c',
          dark:    '#a8872e',
          light:   '#e0c470',
          subtle:  '#fdf8ec',
        },
        beige: {
          primary: '#f8f4ee',
          dark:    '#ede7db',
          border:  '#d8cfc3',
        },
      },
      fontFamily: {
        tajawal: ['Tajawal', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
