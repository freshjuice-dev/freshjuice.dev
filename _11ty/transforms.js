// import { generate as criticalGenerate } from 'critical';
import { minify as minifyHTML } from "html-minifier-terser";
import * as cheerio from 'cheerio';

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

  externalLinks: function (content, outputPath) {
    if (outputPath && outputPath.endsWith(".html")) {
      const $ = cheerio.load(content);
      // if link starts with http and not contains the domain name kandji.io add target="_blank" ignore if target is set also bypass any other attributes
      $("a[href^='http']").each((i, el) => {
        // add to url search param utm_source=freshjuice
        const href = $(el).attr("href");
        const url = new URL(href);
        url.searchParams.set("utm_source", "freshjuice.dev");
        $(el).attr("href", url.toString());
      });
      content = $.html();
    }
    return content;
  },

  minifyHTML: function (content, outputPath) {
    if (process.env.ELEVENTY_ENV === "production" && outputPath) {
      if ( outputPath.endsWith(".json") ) {
        return JSON.stringify(JSON.parse(content));
      }
      if ( outputPath.endsWith(".html") || outputPath.endsWith(".xml") ) {
        return minifyHTML(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          conservativeCollapse: true,
          minifyJS: true,
          minifyCSS: true,
          noNewlinesBeforeTagClose: true,
          keepClosingSlash: true,
          processScripts: ["application/ld+json"],
        });
      }
    }
    return content;
  },

}
