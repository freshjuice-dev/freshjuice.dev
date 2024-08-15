import { minify as minifyHTML } from "html-minifier";

export default {

  minifyHTML: function (content, outputPath) {
    if (
      process.env.ELEVENTY_ENV === "production" &&
      outputPath &&
      (outputPath.endsWith(".html") || outputPath.endsWith(".xml"))
    ) {
      return minifyHTML(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
    }
    return content;
  },

}
