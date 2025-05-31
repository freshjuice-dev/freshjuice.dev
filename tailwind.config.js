import plugin from "tailwindcss/plugin.js";
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
      sans: [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Noto Sans",
        "Helvetica",
        "Arial",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
      ],
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
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "bg-gradient": (angle) => ({
            "background-image": `linear-gradient(${angle}, var(--tw-gradient-stops))`,
          }),
        },
        {
          // values from config and defaults you wish to use most
          values: Object.assign(
            theme("bgGradientDeg", {}), // name of config key. Must be unique
            {
              10: "10deg", // bg-gradient-10
              15: "15deg",
              20: "20deg",
              25: "25deg",
              30: "30deg",
              45: "45deg",
              60: "60deg",
              90: "90deg",
              120: "120deg",
              135: "135deg",
            },
          ),
        },
      );
    }),
  ],
};
