/** @type {import('tailwindcss').Config} */
module.exports = {
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
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    ({ addComponents, theme }) => {
      addComponents({
        ".prose": {
          "--tw-prose-links": "#dc2626",
        },
        ".dark .prose": {
          "--tw-prose-body": "#d4d4d4",
          "--tw-prose-headings": "#d4d4d4",
          "--tw-prose-lead": "#d4d4d4",
          "--tw-prose-links": "#ef4444",
          "--tw-prose-bold": "#d4d4d4",
          "--tw-prose-counters": "#d4d4d4",
          "--tw-prose-bullets": "#d4d4d4",
          "--tw-prose-hr": "#d4d4d4",
          "--tw-prose-quotes": "#111827",
          "--tw-prose-quote-borders": "#e5e7eb",
          "--tw-prose-captions": "#6b7280",
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
        '#responseJson': {
          "min-height": "91px",
        }
      });
    },
  ],
}

