/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,scss}',
  ],
  important: true,
  theme: {
    extend: {
      colors: {
        /* ── BeatFlow / Rekordbox palette ── */
        bf: {
          bg:       '#07080f',
          surface:  '#0d0f1e',
          elevated: '#141728',
          border:   'rgba(255,255,255,0.08)',

          red:      '#ff2d4b',
          'red-dim':'rgba(255,45,75,0.18)',
          orange:   '#ff6b1a',
          'orange-dim':'rgba(255,107,26,0.18)',
          amber:    '#ffab00',

          cyan:     '#00d4ff',
          'cyan-dim':'rgba(0,212,255,0.15)',

          white:    '#f0f4ff',
          muted:    '#8892a4',
          faint:    '#3d4557',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Open Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'wave-red-orange': 'linear-gradient(90deg, #ff2d4b 0%, #ff6b1a 60%, #ffab00 100%)',
        'wave-cyan':       'linear-gradient(90deg, #00d4ff 0%, #2dd4bf 100%)',
        'hero-rekordbox':  'radial-gradient(ellipse at 15% 85%, rgba(255,45,75,.28), transparent 48%), radial-gradient(ellipse at 85% 15%, rgba(255,107,26,.22), transparent 48%), radial-gradient(ellipse at 50% 50%, rgba(0,212,255,.06), transparent 70%), #07080f',
      },
      boxShadow: {
        'red-glow':    '0 0 20px rgba(255,45,75,.45)',
        'orange-glow': '0 0 20px rgba(255,107,26,.4)',
        'cyan-glow':   '0 0 16px rgba(0,212,255,.35)',
      },
      animation: {
        'wave-pulse': 'wavePulse 2s ease-in-out infinite',
      },
      keyframes: {
        wavePulse: {
          '0%, 100%': { transform: 'scaleY(1)', opacity: '1' },
          '50%':      { transform: 'scaleY(1.6)', opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};

