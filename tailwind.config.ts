import type { Config } from 'tailwindcss';

const withAlpha = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: withAlpha('--color-brand'),
          dark: withAlpha('--color-brand-dark'),
          light: withAlpha('--color-brand-light'),
          subtle: withAlpha('--color-brand-subtle'),
        },
        accent: withAlpha('--color-accent'),
        canvas: withAlpha('--color-canvas'),
        surface: withAlpha('--color-surface'),
        border: withAlpha('--color-border'),
        content: {
          primary: withAlpha('--color-text-primary'),
          secondary: withAlpha('--color-text-secondary'),
          muted: withAlpha('--color-text-muted'),
          inverse: withAlpha('--color-text-inverse'),
        },
        success: withAlpha('--color-success'),
        warning: withAlpha('--color-warning'),
        danger: withAlpha('--color-danger'),
      },
      fontFamily: { sans: ['var(--font-geist-sans)', 'Inter', 'sans-serif'] },
      boxShadow: { glow: '0 0 80px rgb(var(--color-brand-light) / 0.18)' },
      backgroundImage: { 'radial-brand': 'radial-gradient(circle at top, rgb(var(--color-brand-light) / 0.12), transparent 34rem)' },
    },
  },
  plugins: [],
};
export default config;
