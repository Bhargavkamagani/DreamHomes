/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef5f0',
          100: '#d6e8dd',
          200: '#aecfbb',
          300: '#7fb295',
          400: '#4f9270',
          500: '#2e7d4f',
          600: '#1f6440',
          700: '#184e33',
          800: '#123d28',
          900: '#0d2e1e',
          950: '#071c12',
        },
        neon: {
          DEFAULT: '#34d17a',
          soft: '#5fe39a',
        },
        gold: {
          DEFAULT: '#c9a227',
          soft: '#e3c25c',
        },
        cream: {
          DEFAULT: '#f7f4ec',
          deep: '#efe9da',
        },
        graphite: '#2b2b2b',
        warm: '#f08a3c',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(18, 61, 40, 0.18)',
        card: '0 8px 30px -8px rgba(18, 61, 40, 0.15)',
        float: '0 20px 60px -15px rgba(18, 61, 40, 0.30)',
        glow: '0 0 40px -8px rgba(52, 209, 122, 0.45)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(52,209,122,0.45)' },
          '70%': { boxShadow: '0 0 0 14px rgba(52,209,122,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(52,209,122,0)' },
        },
        flowDash: {
          to: { strokeDashoffset: '-1000' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        floatySlow: 'floaty 9s ease-in-out infinite',
        pulseRing: 'pulseRing 2.4s ease-out infinite',
        flowDash: 'flowDash 18s linear infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
}
