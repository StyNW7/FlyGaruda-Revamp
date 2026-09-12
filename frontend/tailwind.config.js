/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0C265D',
          'navy-deep': '#071A44',
          blue: '#1179B7',
          'blue-light': '#E8F2FA',
          turquoise: '#008295',
          'turquoise-light': '#029AA4',
          'turquoise-soft': '#E3F4F5',
          gold: '#C9A24B',
          'gold-soft': '#FBF5E6',
        },
        ink: {
          DEFAULT: '#0F1F3D',
          soft: '#3E4C66',
          muted: '#6B7690',
          faint: '#9AA3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          off: '#F6F8FB',
          soft: '#EEF2F7',
          line: '#E3E8F0',
        },
        success: { DEFAULT: '#1B8A5A', soft: '#E6F5EE' },
        warning: { DEFAULT: '#B7791F', soft: '#FDF3E1' },
        error: { DEFAULT: '#C43D3D', soft: '#FCE9E9' },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 31, 61, 0.04), 0 4px 16px rgba(15, 31, 61, 0.05)',
        float: '0 8px 30px rgba(15, 31, 61, 0.12)',
        nav: '0 -4px 20px rgba(15, 31, 61, 0.06)',
        sheet: '0 -12px 40px rgba(15, 31, 61, 0.18)',
      },
      borderRadius: {
        xl2: '1.25rem',
        xl3: '1.75rem',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        'check-pop': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '70%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out both',
        'fade-up': 'fade-up 0.35s ease-out both',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.32, 0.72, 0, 1) both',
        'scale-in': 'scale-in 0.22s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
        'check-pop': 'check-pop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both',
      },
    },
  },
  plugins: [],
}
