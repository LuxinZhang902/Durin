/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0a0a0f',
        'dark-surface': '#1a1a24',
        'dark-border': '#2a2a3a',
        'accent-blue': '#3b82f6',
        'accent-purple': '#8b5cf6',
        'risk-low': '#10b981',
        'risk-medium': '#f59e0b',
        'risk-high': '#ef4444',
      }
    },
  },
  plugins: [],
}
