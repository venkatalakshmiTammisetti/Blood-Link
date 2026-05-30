/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E53935',
          dark: '#C62828',
          light: '#FFEBEE',
        },
      },
    },
  },
  plugins: [],
};
