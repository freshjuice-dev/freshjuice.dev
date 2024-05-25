/**
 * Add Eleventy shortcodes here
 * https://www.11ty.dev/docs/shortcodes/
 */

const path = require("path");
const eleventyImage = require("@11ty/eleventy-img");

const relativeToInputPath = (inputPath, relativeFilePath) => {
  let split = inputPath.split("/");
  split.pop();

  let relativePath = path.resolve(split.join(path.sep), relativeFilePath);

  if (relativeFilePath.startsWith("/")) {
    relativePath = path.resolve("./src/assets" + relativeFilePath);
  }

  return relativePath;
};


module.exports = {
  getRelativePath: (eleventyConfig) => {
    const {EleventyRenderPlugin} = require("@11ty/eleventy");

    eleventyConfig.addShortcode(
      'getRelativePath',
      function getRelativePathShortcode(src) {
        return relativeToInputPath(this.page.inputPath, src);
      }
    )
  },

  // Eleventy Image shortcode
  // https://www.11ty.dev/docs/plugins/image/
  image: (eleventyConfig) => {
    eleventyConfig.addAsyncShortcode(
      "image",
      async function imageShortcode(src, alt, widths, classes, sizes) {
        // Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
        // Warning: Avif can be resource-intensive so take care!
        let formats = ["avif", "webp", "auto"];
        let file = relativeToInputPath(this.page.inputPath, src);
        let metadata = await eleventyImage(file, {
          widths: widths || ["auto"],
          formats,
          // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
          outputDir: path.join(eleventyConfig.dir.output, "img"),
        });

        if (!alt || !alt.length) {
          // extract name form filename
          alt = path.basename(src, path.extname(src));
        }

        // TODO loading=eager and fetchpriority=high
        let imageAttributes = {
          alt,
          sizes,
          class: classes
            ? classes + " rounded drop-shadow-lg"
            : "mx-auto rounded drop-shadow-lg",
          loading: "lazy",
          decoding: "async",
        };

        return eleventyImage.generateHTML(metadata, imageAttributes);
      }
    );
  },

  year: (eleventyConfig) => {
    eleventyConfig.addShortcode("year", function yearShortcode() {
      return new Date().getFullYear();
    });
  }
};
