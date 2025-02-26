/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'navy': '#213147',
        'light-blue': '#12AAFF',
        'moon': '#E5E5E5',
        'white': '#FFFFFF',
        
        // Secondary Colors
        'nova-orange': '#FF7700',
        'shift-blue': '#1B4ADD',
        'stylus-pink': '#E3066E',
        'black': '#000000',
      },
    },
  },
  plugins: [],
} 