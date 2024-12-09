import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import aspectRatio from '@tailwindcss/aspect-ratio'
import plugin from 'tailwindcss/plugin.js'
import defaultColors from "tailwindcss/colors.js";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./_content/**/*.{md,njk}",
    "./_js/**/*.js",
    "./_css/**/*.css",
    "./_includes/**/*.njk",
    "./_layouts/*.njk",
    "./_11ty/**/*.js",
  ],
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Noto Sans", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji"],
      mono: ["PT Mono", "Roboto Mono", "JetBrains Mono", "monospace"],
      //mono: ["ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "Liberation Mono", "monospace"],
    },
    screens: {
      xxs: "360px",
      xs: "490px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      xxl: "1536px",
      navSwap: "768px",
    },
    aspectRatio: {
      auto: "auto",
      box: "1",
      landscape: "4/3",
      portrait: "3/4",
      video: "16/9",
      opengraph: "1200/630",
    },
    extend: {
      colors: {
        cursor: defaultColors.white,
        terminal: defaultColors.black,
        zinc: { DEFAULT: defaultColors.zinc[500] },
        neutral: { DEFAULT: defaultColors.neutral[500] },
        stone: { DEFAULT: defaultColors.stone[500] },
        red: { DEFAULT: defaultColors.red[500] },
        orange: { DEFAULT: defaultColors.orange[500] },
        amber: { DEFAULT: defaultColors.amber[500] },
        yellow: { DEFAULT: defaultColors.yellow[500] },
        lime: { DEFAULT: defaultColors.lime[500] },
        green: { DEFAULT: defaultColors.green[500] },
        emerald: { DEFAULT: defaultColors.emerald[500] },
        teal: { DEFAULT: defaultColors.teal[500] },
        cyan: { DEFAULT: defaultColors.cyan[500] },
        sky: { DEFAULT: defaultColors.sky[500] },
        blue: { DEFAULT: defaultColors.blue[500] },
        indigo: { DEFAULT: defaultColors.indigo[500] },
        violet: { DEFAULT: defaultColors.violet[500] },
        purple: { DEFAULT: defaultColors.purple[500] },
        fuchsia: { DEFAULT: defaultColors.fuchsia[500] },
        pink: { DEFAULT: defaultColors.pink[500] },
        rose: { DEFAULT: defaultColors.rose[500] },
      },
      zIndex: {
        60: 60,
        70: 70,
        80: 80,
        90: 90,
        100: 100,
      }
    },
  },
  plugins: [
    typography,
    forms,
    aspectRatio,
    ({ addComponents, theme }) => {
      addComponents({
        ".prose": {
          "--tw-prose-links": "#dc2626",
          "--tw-prose-caption": "#282828",
        },
        ".dark .prose": {
          "--tw-prose-body": "#d4d4d4",
          "--tw-prose-headings": "#d4d4d4",
          "--tw-prose-lead": "#d4d4d4",
          "--tw-prose-links": "#ef4444",
          "--tw-prose-bold": "#d4d4d4",
          "--tw-prose-counters": "#d4d4d4",
          "--tw-prose-bullets": "#d4d4d4",
          "--tw-prose-hr": "#f3f4f61a",
          "--tw-prose-quotes": "#111827",
          "--tw-prose-quote-borders": "#e5e7eb",
          "--tw-prose-captions": "#c5c5c5",
          "--tw-prose-kbd": "#111827",
          "--tw-prose-kbd-shadows": "17 24 39",
          "--tw-prose-code": "#d4d4d4",
          "--tw-prose-pre-code": "#e5e7eb",
          "--tw-prose-pre-bg": "#1f2937",
          "--tw-prose-th-borders": "#f3f4f61a",
          "--tw-prose-td-borders": "#f3f4f61a",
          "--tw-prose-invert-body": "#d1d5db",
          "--tw-prose-invert-headings": "#fff",
          "--tw-prose-invert-lead": "#9ca3af",
          "--tw-prose-invert-links": "#fff",
          "--tw-prose-invert-bold": "#fff",
          "--tw-prose-invert-counters": "#9ca3af",
          "--tw-prose-invert-bullets": "#4b5563",
          "--tw-prose-invert-hr": "#374151",
          "--tw-prose-invert-quotes": "#f3f4f6",
          "--tw-prose-invert-quote-borders": "#374151",
          "--tw-prose-invert-captions": "#9ca3af",
          "--tw-prose-invert-kbd": "#fff",
          "--tw-prose-invert-kbd-shadows": "255 255 255",
          "--tw-prose-invert-code": "#fff",
          "--tw-prose-invert-pre-code": "#d1d5db",
          "--tw-prose-invert-pre-bg": "rgb(0 0 0 / 50%)",
          "--tw-prose-invert-th-borders": "#4b5563",
          "--tw-prose-invert-td-borders": "#374151",
        },
        '.prose :where(a):not(:where([class~="not-prose"], [class~="not-prose"] *))': {
          "@apply no-underline hover:underline": {},
        },
        "code:where(:not([class]))::before, code:where(:not([class]))::after": {
          "@apply !content-none": {},
        },
        '.prose :where(code):not(:where([class~="not-prose"], [class~="not-prose"] *))': {
          "@apply font-mono": {},
        },
        'code[class*="language-"], pre[class*="language-"]': {
          "@apply font-mono": {},
        },
        '.prose table:not([class]) th, .prose table:not([class]) td': {
          "@apply px-4": {},
        },
        '.prose table:not([class]) tbody > tr:nth-child(odd), .prose table.striped tbody > tr:nth-child(odd)': {
          "@apply bg-neutral-100 dark:bg-neutral-800/40": {},
        },
        '.prose table-saw table:not([class]) tr': {
          "@apply mb-0": {},
        }
      });
    },
    plugin(function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'bg-gradient': (angle) => ({
            'background-image': `linear-gradient(${angle}, var(--tw-gradient-stops))`,
          }),
        },
        {
          // values from config and defaults you wish to use most
          values: Object.assign(
            theme('bgGradientDeg', {}), // name of config key. Must be unique
            {
              10: '10deg', // bg-gradient-10
              15: '15deg',
              20: '20deg',
              25: '25deg',
              30: '30deg',
              45: '45deg',
              60: '60deg',
              90: '90deg',
              120: '120deg',
              135: '135deg',
            }
          )
        }
      )
    })
  ],
}

