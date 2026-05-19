const glob = require('glob');
const path = require('path');

// Resolve all files manually to bypass Tailwind's glob failing on directory names with spaces
const contentFiles = glob.sync('./src/**/*.{js,ts,jsx,tsx,mdx}', { cwd: __dirname, absolute: true });

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: contentFiles,
  theme: {
    extend: {},
  },
  plugins: [],
}
