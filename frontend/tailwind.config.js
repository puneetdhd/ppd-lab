/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        accent: {
          DEFAULT: '#7c3aed',
          light: '#f4f0ff',
          hover: '#6d28d9',
        },
        success: { DEFAULT: '#50cd89', light: '#e8fff3' },
        danger:  { DEFAULT: '#f1416c', light: '#fff5f8' },
        warning: { DEFAULT: '#ffc700', light: '#fff8dd' },
        info:    { DEFAULT: '#009ef7', light: '#f1faff' },
      },
      borderRadius: { xl: '12px', '2xl': '16px' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)',
        md: '0 4px 16px rgba(0,0,0,.08)',
        lg: '0 8px 32px rgba(0,0,0,.12)',
      },
    },
  },
  plugins: [],
};
