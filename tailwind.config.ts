import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2fbe9',
          100: '#e2f6cf',
          200: '#c6eda2',
          300: '#a2df6d',
          400: '#7ecd3f',
          500: '#5fb321',
          600: '#14a800',
          700: '#128a00',
          800: '#126d08',
          900: '#125a0d',
          950: '#073300',
        },
        ink: {
          950: '#0a0a0a',
          900: '#171717',
          700: '#404040',
          500: '#737373',
          300: '#a3a3a3',
          100: '#e5e5e5',
          50: '#f5f5f5',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(10, 10, 10, 0.06), 0 8px 24px rgba(10, 10, 10, 0.06)',
        pop: '0 12px 40px rgba(10, 10, 10, 0.14)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      maxWidth: {
        page: '1400px',
      },
    },
  },
  plugins: [],
};

export default config;
