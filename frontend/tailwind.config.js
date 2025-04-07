/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{astro,js,jsx,ts,tsx,html}',
    ],
    theme: {
      extend: {
        animation: {
          'fade-up': 'fadeUp 0.6s ease-out forwards',
          'fade-in': 'fadeIn 0.8s ease-out forwards',
        },
        keyframes: {
          fadeUp: {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
          fadeIn: {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 },
          },
        },
      },      
    },
    plugins: [],
  }
