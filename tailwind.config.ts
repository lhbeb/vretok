import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A', // Deep Obsidian Black - main brand color
        secondary: '#E11D48', // Electric Rose / Sculpt Coral - activewear accent
        accent: '#F43F5E', // Vibrant Rose accent
        cream: '#F8FAFC', // Crisp studio white surface
        'brand-dark': '#0F172A', // Deep Obsidian
        'brand-sage': '#E11D48', // Active Rose accent
        'brand-cream': '#F8FAFC', // Studio White
        text: '#0F172A', // Obsidian text / dark neutral
        'text-gray': '#64748B', // Muted slate text
        'bg-light': '#F8FAFC', // Clean light background
        'border-gray': '#E2E8F0', // Clean architectural border
        'nav-gray': '#0F172A', // Navigation bar obsidian
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        heading: ['var(--font-dm-sans)', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    // line-clamp plugin removed; included by default in Tailwind 3.3+
  ],
}
export default config 