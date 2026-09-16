import type { Config } from 'tailwindcss';

/** globals.css 의 CSS 변수를 그대로 참조한다. 값은 저기 한 곳에만 있다. */
const token = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: token('--c-bg'),
        surface: token('--c-surface'),
        surface2: token('--c-surface-2'),
        track: token('--c-track'),
        thumb: token('--c-thumb'),
        hair: token('--c-hair'),
        line: token('--c-border'),

        fg: token('--c-fg'),
        fg2: token('--c-fg-2'),
        fg3: token('--c-fg-3'),

        accent: token('--c-accent'),
        'accent-soft': token('--c-accent-soft'),

        live: token('--c-live'),
        'live-soft': token('--c-live-soft'),
        win: token('--c-win'),
        'win-soft': token('--c-win-soft'),
        lose: token('--c-lose'),
        'lose-soft': token('--c-lose-soft'),
      },
      borderColor: {
        DEFAULT: token('--c-border'),
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Apple SD Gothic Neo',
          'Pretendard Variable',
          'Pretendard',
          'Segoe UI',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['11px', { lineHeight: '15px' }],
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        thumb: 'var(--shadow-thumb)',
        pop: 'var(--shadow-pop)',
      },
      borderRadius: {
        card: '16px',
        control: '11px',
        chip: '8px',
      },
      maxWidth: {
        shell: '1200px',
      },
    },
  },
  plugins: [],
};

export default config;
