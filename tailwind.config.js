/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mayflower: {
          burgundy: '#4A1525',
          gold: '#D4AF37',
          warmWhite: '#FAFAF7',
          charcoal: '#1A1A1A',
          cream: '#F4EBE1',
        },
      },
    },
  },
  plugins: [],
};
