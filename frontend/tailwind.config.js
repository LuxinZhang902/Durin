/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0B0F19',
        'dark-surface': '#151B2B',
        'dark-card': '#1A2235',
        'dark-border': '#252D3F',
        'accent-blue': '#4F7CFF',
        'accent-purple': '#9D5CFF',
        'accent-cyan': '#00D4FF',
        'risk-low': '#00E5A0',
        'risk-medium': '#FFB84D',
        'risk-high': '#FF5757',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow-blue': '0 0 20px rgba(79, 124, 255, 0.3)',
        'glow-purple': '0 0 20px rgba(157, 92, 255, 0.3)',
      }
    },
  },
  plugins: [],
}
