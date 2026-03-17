/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#0f2744', 2: '#1a3a5c', 3: '#0d1e33' },
        gold:  { DEFAULT: '#c8933a', 2: '#e8b96a', pale: '#fdf3e3' },
        green: { DEFAULT: '#2d8c5a', light: '#e8f7ef' },
        sky:   { DEFAULT: '#4a90d9' },
        sub:   { DEFAULT: '#1565c0', bg: '#e3f0ff' },
      },
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(15,39,68,.10)',
        'card-lg': '0 12px 48px rgba(15,39,68,.16)',
        'card-hover': '0 8px 32px rgba(15,39,68,.18)',
      },
      animation: {
        'fade-in': 'fadeIn .22s ease both',
        'slide-up': 'slideUp .24s ease both',
        'notif-in': 'notifIn .26s ease both',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideUp: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        notifIn: { from: { opacity: 0, transform: 'translateX(16px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
      }
    },
  },
  plugins: [],
}
