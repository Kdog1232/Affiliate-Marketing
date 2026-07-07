import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-geist-sans)', 'Inter', 'sans-serif'] },
      boxShadow: { glow: '0 0 80px rgba(59,130,246,.22)' },
      backgroundImage: { 'radial-blue': 'radial-gradient(circle at top, rgba(59,130,246,.28), transparent 34rem)' },
    },
  },
  plugins: [],
};
export default config;
