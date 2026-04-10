import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nike: {
          black: '#111111',
          orange: '#FF6900',
          gray: '#757575',
          light: '#F5F5F5',
        },
        signal: {
          positive: '#22c55e',
          neutral: '#94a3b8',
          negative: '#ef4444',
          warning: '#f59e0b',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}

export default config
