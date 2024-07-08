import typography from '@tailwindcss/typography'
import forms from '@tailwindcss/forms'
import aspectRatio from '@tailwindcss/aspect-ratio'
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,njk,md,vue}",
    "./cfg/_11ty/**/*.js"
  ],
  darkMode: "class",
  theme: {
    screens: {
      xs: "360px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    aspectRatio: {
      auto: "auto",
      box: "1",
      landscape: "4/3",
      portrait: "3/4",
      video: "16/9",
    },
    extend: {
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
          "--tw-prose-th-borders": "#d1d5db",
          "--tw-prose-td-borders": "#e5e7eb",
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

