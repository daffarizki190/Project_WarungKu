/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // Luxury clean background
        cream: '#F8FAFC', // slate-50
        'cream-dark': '#F1F5F9', // slate-100
        white: '#FFFFFF',
        // Borders / surface tones
        sand: '#E2E8F0', // slate-200
        'sand-dark': '#CBD5E1', // slate-300
        // Text (Deep emerald/slate)
        ink: '#022C22', // emerald-950 (rich dark)
        clay: '#475569', // slate-600
        // Primary Accent: Emerald
        terracotta: '#059669', // emerald-600
        'terracotta-dark': '#047857', // emerald-700
        'terracotta-light': '#6EE7B7', // emerald-300
        // Functional
        success: '#10B981', // emerald-500
        warning: '#F59E0B', // amber-500
        danger: '#EF4444', // red-500
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-up': 'fadeUp .3s ease both',
        'pop-in': 'popIn .25s cubic-bezier(.34,1.4,.64,1) both',
        'slide-right': 'slideRight .25s ease both',
      },
    },
  },
  plugins: [],
};

