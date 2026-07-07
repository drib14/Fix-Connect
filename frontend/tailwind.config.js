/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        accent: {
          DEFAULT: '#FF6D00',
          light: '#FF9E40',
          dark: '#E65100',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F5',
          dark: '#1A1A2E',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#757575',
          light: '#BDBDBD',
          inverse: '#FFFFFF',
        },
        status: {
          searching: '#FFA726',
          accepted: '#42A5F5',
          enroute: '#7E57C2',
          arrived: '#26A69A',
          inprogress: '#66BB6A',
          completed: '#4CAF50',
          cancelled: '#EF5350',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        heading: ['Inter', 'System'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
