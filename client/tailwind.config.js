/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // new pink-purple brand palette (replaces old teal/blue tokens)
        brand: {
          50: '#fff6fb',
          100: '#fde8f7',
          200: '#f9d0ef',
          300: '#f7a8f0',
          400: '#f47be8',
          500: '#e54be0',
          600: '#c13ccf',
          700: '#8f2aa6',
          800: '#6b1f80',
          900: '#4b1758',
        },
        accent: {
          50: '#fff3ff',
          100: '#fde6ff',
          200: '#f7ccff',
          300: '#e9a8ff',
          400: '#d07bff',
          500: '#b85bff'
        },
        health: {
          critical: '#EF4444',
          urgent: '#F59E0B',
          moderate: '#F97316',
          routine: '#10B981',
          normal: '#059669',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        // pink -> purple brand gradient used across hero and banners
        'health-gradient': 'linear-gradient(135deg, #ffd3ea 0%, #e54be0 45%, #6b1f80 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(107, 31, 128, 0.12)',
        'glass-light': '0 4px 16px 0 rgba(255, 255, 255, 0.1)',
        'health': '0 10px 25px -3px rgba(213, 93, 214, 0.12), 0 4px 6px -2px rgba(184, 91, 255, 0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
} 