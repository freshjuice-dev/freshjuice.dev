// postcss.config.js
import nested from "postcss-nested";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import csso from "postcss-csso";

export default {
  plugins: [
    nested(),
    tailwindcss(),
    autoprefixer(),
    ...(process.env.ELEVENTY_ENV === "production" ? [csso()] : []),
  ],
};
