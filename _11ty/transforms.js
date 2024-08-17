// import { generate as criticalGenerate } from 'critical';
import { minify as minifyHTML } from "html-minifier";

export default {
  //
  // critical: async function (content, outputPath) {
  //   if (
  //     process.env.ELEVENTY_ENV === "production" &&
  //     outputPath && outputPath.endsWith(".html")
  //   ) {
  //     try {
  //       const { html } = await criticalGenerate({
  //         base: `_site/`,
  //         html: content,
  //         inline: true,
  //         extract: true,
  //         // height: 1980,
  //         // width: 1920,
  //         dimensions: [
  //           {
  //             height: 896,
  //             width: 414,
  //           },
  //           {
  //             height: 1900,
  //             width: 1920,
  //           },
  //         ]
  //       });
  //       return html;
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   }
  //   return content;
  // },

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
