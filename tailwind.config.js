const glob = require('glob');
const path = require('path');

const contentFiles = glob.sync('./src/**/*.{js,ts,jsx,tsx,mdx}', { cwd: __dirname, absolute: true });

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: contentFiles,
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#111827',
        primary: '#FFFFFF',
        secondary: '#E2E8F0',
        muted: '#94A3B8',
        accent: '#60A5FA',
        gold: '#FACC15',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass-card': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      }
    },
  },
  plugins: [],
}
