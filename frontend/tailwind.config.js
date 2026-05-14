/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: '#1a1d21',
        ink: '#0c0d0f',
        neon: '#39ff14',
        neonDim: '#2ccf0e',
        surface: '#12151a',
        /** Optional CRM shell tint (marketing / hybrid layouts) */
        crmBg: '#dde4ec',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel:
          '0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px -12px rgba(0,0,0,0.65)',
        'panel-sm':
          '0 0 0 1px rgba(255,255,255,0.05), 0 12px 24px -8px rgba(0,0,0,0.5)',
        glow: '0 0 48px -12px rgba(57,255,20,0.22)',
      },
      backgroundImage: {
        'mesh-ink':
          'radial-gradient(ellipse 90% 65% at 50% -25%, rgba(57,255,20,0.09), transparent 55%), radial-gradient(ellipse 60% 45% at 100% 0%, rgba(56,189,248,0.04), transparent 45%)',
      },
    },
  },
  plugins: [],
};
