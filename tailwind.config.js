/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'whop-dark': '#111111',           // Fond de page noir profond
        'whop-card': '#111111',            // Fond des cartes 
        'whop-border': 'rgba(255, 255, 255, 0.05)', // Bordure ultra subtile
        'whop-hover': '#1a1a1a',           // Hover
        'whop-active': 'rgba(63, 63, 70, 0.5)',    // Onglet actif sidebar
        'whop-gold': '#d4a853',            // Bouton doré
        'whop-gold-border': 'rgba(212, 168, 83, 0.3)', // Bordure dorée
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
