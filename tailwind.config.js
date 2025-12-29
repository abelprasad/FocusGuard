/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom FocusGuard colors
        'focus-blue': '#3B82F6',    // Primary brand color - focused state
        'focus-green': '#10B981',   // Positive feedback - good posture, focused
        'focus-red': '#EF4444',     // Alerts - slouching, distracted
      }
    },
  },
  plugins: [],
}
