/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /**
         * Color Hunt palette: https://colorhunt.co/palette/fe7743efeeea273f4f000000
         * #FE7743 · #EFEEEA · #273F4F · #000000
         */
        cream: '#EFEEEA',
        charcoal: '#273F4F',
        ink: '#000000',
        /** Nested panels / tables on charcoal */
        elevated: '#324d62',
        /** Deep strips (table headers, insets) */
        surface: '#1a2832',
        /** Primary accent (kept as `neon` so existing components pick it up) */
        neon: '#FE7743',
        neonDim: '#e5652e',
        /** Legacy alias — same as cream */
        crmBg: '#EFEEEA',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel:
          '0 0 0 1px rgba(239,238,234,0.1), 0 24px 48px -12px rgba(0,0,0,0.55)',
        'panel-sm':
          '0 0 0 1px rgba(239,238,234,0.08), 0 12px 24px -8px rgba(0,0,0,0.42)',
        glow: '0 0 48px -12px rgba(254,119,67,0.3)',
      },
      backgroundImage: {
        'mesh-ink':
          'radial-gradient(ellipse 90% 65% at 50% -25%, rgba(254,119,67,0.14), transparent 55%), radial-gradient(ellipse 70% 55% at 100% 0%, rgba(39,63,79,0.55), transparent 50%)',
      },
    },
  },
  plugins: [],
};
