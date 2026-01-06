/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../backend/templates/**/*.html",
    "../backend/marketplace/templates/**/*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
