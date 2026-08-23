import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // palette sampled from the logo: #58B5E0 (mark) and #2B2A28 (wordmark).
        // 500 is the exact brand blue. 600/700 are darkened only where text and button fills
        // need AA contrast on white — the brand blue itself is 2.31:1 and fails as a text colour.
        ink: { 950: '#2B2A28', 900: '#1F1E1C', 800: '#3C3A37' },
        porcelain: '#F3F8FC',
        paper: '#FFFFFF',
        line: '#E1EAF2',
        steel: { 600: '#5B6B7A', 400: '#93A3B2' },
        decart: {
          50: '#F2FAFD',
          100: '#E1F3FB',
          300: '#9BD5EE',
          500: '#58B5E0',
          600: '#2E8BB8',
          700: '#24708F',
          800: '#1B5A75',
        },
        cognac: { 500: '#C9822E', 600: '#A96A22' },
        success: '#1E9E5A',
        warning: '#D97E00',
        danger: '#D64541',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },
      fontSize: {
        eyebrow: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.14em' }],
        hero: ['clamp(2.75rem, 7.2vw, 5.75rem)', { lineHeight: '0.96', letterSpacing: '-0.025em' }],
        h1: ['clamp(2.375rem, 5.4vw, 4.25rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        h2: ['clamp(1.875rem, 3.6vw, 3rem)', { lineHeight: '1.06', letterSpacing: '-0.015em' }],
        h3: ['clamp(1.375rem, 2vw, 1.75rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        body: ['1rem', { lineHeight: '1.65' }],
      },
      borderRadius: { card: '24px', btn: '999px', img: '20px' },
      maxWidth: { container: '1200px' },
      boxShadow: {
        card: '0 1px 2px rgb(14 27 40 / .06)',
        lift: '0 8px 24px -12px rgb(14 27 40 / .18)',
        podium: '0 24px 40px -18px rgb(21 101 166 / .28)',
        pop: '0 16px 40px -16px rgb(21 101 166 / .35)',
      },
      spacing: { section: '4rem', 'section-lg': '7rem' },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'none' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        'wa-pulse': {
          '0%,90%,100%': { boxShadow: '0 0 0 0 rgb(37 211 102 / .5)' },
          '45%': { boxShadow: '0 0 0 14px rgb(37 211 102 / 0)' },
        },
        'hex-spin': { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.16,1,.3,1) both',
        marquee: 'marquee 40s linear infinite',
        'wa-pulse': 'wa-pulse 8s ease-out infinite',
        'hex-spin': 'hex-spin 1.1s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
