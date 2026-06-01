/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          gold: '#F5A623',
          'gold-hover': '#FFB94D',
        },
        neutral: {
          'bg': '#F5F5F5',
          'surface': '#FFFFFF',
          'primary': '#1A1A1A',
          'text': '#666666',
          'border': '#E0E0E0',
        },
        sidebar: {
          bg: '#1A1A1A',
          text: '#FFFFFF',
        },
        status: {
          success: '#27AE60',
          warning: '#F5A623',
          danger: '#C0392B',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '13px',
        'lg': '14px',
        'xl': '16px',
        '2xl': '20px',
        '3xl': '32px',
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      borderRadius: {
        DEFAULT: '8px',
      },
    },
  },
  plugins: [],
}
