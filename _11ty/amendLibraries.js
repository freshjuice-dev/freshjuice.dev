/**
 * Amend the Eleventy configuration to customize the Markdown library settings.
 * https://www.11ty.dev/docs/languages/markdown/#optional-amend-the-library-instance
 */
import markdownItAnchor from "markdown-it-anchor";

export default {
  // Customize Markdown library settings:
  markdownItAnchor: (eleventyConfig) => {
    eleventyConfig.amendLibrary("md", (mdLib) => {
      mdLib.use(markdownItAnchor, {
        level: [1, 2, 3, 4, 5],
        slugify: (str) => {
          const base = eleventyConfig.getFilter("slugify")(str);
          let cleaned = base.replace(/^[0-9]+(?:[-_\s]+)?/, "");
          cleaned = cleaned.replace(/^[-_\s]+/, "");
          return cleaned || "section";
        },
      });
    });
  },
};
