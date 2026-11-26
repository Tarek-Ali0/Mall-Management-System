/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        valict: {
          navy: '#0A192F',
          darkBlue: '#1E293B',
          cyan: '#06B6D4',
          accent: '#0EA5E9',
        }
      }
    },
  },
  plugins: [],
};
