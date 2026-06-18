import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#C41230', dark: '#9e0e26', light: '#e8192e' },
        gold: { DEFAULT: '#D4AC0D', light: '#f0c90e', dark: '#a8870a' },
        dark: '#1A1A1A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Barlow Condensed', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp .5s ease-out',
        'fade-in': 'fadeIn .3s ease-out',
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'none' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
export default config;
