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
        level: [1, 2, 3, 4],
        slugify: eleventyConfig.getFilter("slugify"),
      });
    });
  }

};
