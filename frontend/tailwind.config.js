/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: '#0064FF',
          blueDark: '#0050CC',
          gray: '#4E5968',
          lightGray: '#8B95A1',
          bgGray: '#F4F5F7',
        }
      }
    },
  },
  plugins: [],
}
