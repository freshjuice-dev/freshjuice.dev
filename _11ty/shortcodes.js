/**
 * Add Eleventy shortcodes here
 * https://www.11ty.dev/docs/shortcodes/
 */
import slugify from "slugify";
import eleventyImage from "@11ty/eleventy-img";
import path from "path";
import { existsSync } from "fs";

const slugifyOptions = {
  lower: true, // convert to lower case
};

const findYouTubeVideoId = (url) => {
  const regex =
    /(?<=v=)[a-zA-Z0-9-]+(?=&)|(?<=v\/)[^&\n]+(?=\?)|(?<=v=)[^&\n]+|(?<=youtu.be\/|www.youtube.com\/embed\/)[^&\n]+/;
  const matches = url.match(regex);
  return matches ? matches[0] : "";
};

const relativeToInputPath = (inputPath, relativeFilePath) => {
  let split = inputPath.split("/");
  split.pop();

  let relativePath = path.resolve(split.join(path.sep), relativeFilePath);

  if (relativeFilePath.startsWith("/")) {
    relativePath = path.resolve("./_static/img" + relativeFilePath);
  }

  return relativePath;
};

export default {
  image: (eleventyConfig) => {
    eleventyConfig.addAsyncShortcode(
      "image",
      async function (src, alt, widths, classes, sizes, loading) {
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

        let imageAttributes = {
          alt,
          sizes: sizes || "100vw",
          "eleventy:ignore": "",
          class: classes || "",
          loading: loading || "lazy",
          decoding: "async",
        };

        let htmlAttributes = {
          whitespaceMode: "inline",
        };

        return eleventyImage.generateHTML(
          metadata,
          imageAttributes,
          htmlAttributes,
        );
      },
    );
  },

  year: (eleventyConfig) => {
    eleventyConfig.addShortcode("year", function yearShortcode() {
      return new Date().getFullYear();
    });
  },

  authorSignature: (eleventyConfig) => {
    eleventyConfig.addShortcode("authorSignature", function (author) {
      try {
        const authorsCollection = this.ctx?.collections?.authors;
        const authorData = authorsCollection.find((item) => {
          return item.fileSlug === author;
        }).data;
        return authorData.signature || "";
      } catch (error) {
        return "";
      }
    });
  },

  ogImageSource: (eleventyConfig) => {
    eleventyConfig.addAsyncShortcode("ogImageSource", async function ({ url }) {
      url = url
        ? slugify(url.replace(/\//g, " "), slugifyOptions).trim()
        : "default";
      if (!existsSync(`./_static/img/og/${url}.png`)) {
        url = "default";
      }
      return `/img/og/${url || "default"}.png`;
    });
  },

  ogImagesJSON: (eleventyConfig) => {
    eleventyConfig.addShortcode("ogImagesJSON", function (allCollections) {
      let returnJson = [];
      allCollections.forEach((item) => {
        let title = (item.data || {}).title || "";
        if (title === "Tags") {
          title = "Blog tags";
        }
        if (title.startsWith("Tagged ")) {
          title = title.split("Tagged ");
          title[0] = "Blogs tagged with";
          title[1] = "<span>" + title[1].replace(" ", "&nbsp;") + "</span>";
          title = title.join(" ");
        }
        title = title.replace(
          /[\p{Extended_Pictographic}\uFE0F\u200D\u{E0020}-\u{E007F}\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}]/gu,
          "",
        );
        // title = title.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "");
        let url = (item.page || {}).url || "";
        if (title.trim() && url.trim()) {
          let itemCollectionName = "";
          if (item.data.tags && item.data.tags.includes("docs")) {
            itemCollectionName = "docs";
          } else if (item.data.tags && item.data.tags.includes("dev-docs")) {
            itemCollectionName = "devDocs";
          } else if (item.data.tags && item.data.tags.includes("posts")) {
            itemCollectionName = "blogs";
          } else if (item.data.tags && item.data.tags.includes("authors")) {
            itemCollectionName = "authors";
          } else {
            itemCollectionName = "pages";
          }
          if (url === "/") {
            url = "default";
          }
          returnJson.push({
            title: title,
            role: item.data.role || "",
            email: item.data.email || "",
            collection: itemCollectionName,
            slug: slugify(url.replace(/\//g, " "), slugifyOptions),
          });
        }
      });
      return JSON.stringify(returnJson);
    });
  },

  youTube: (eleventyConfig) => {
    eleventyConfig.addShortcode(
      "youTube",
      function (videoId, videoTitle = "YouTube video") {
        if (videoId.startsWith("https://")) {
          videoId = findYouTubeVideoId(videoId);
        }
        return `<lite-youtube x-on:click.stop videoid="${videoId}" class="img" style="background-image: url('https://i.ytimg.com/vi/${videoId}/hqdefault.jpg');"></lite-youtube>`;
      },
    );
  },

  speedlifyJSON: (eleventyConfig) => {
    eleventyConfig.addShortcode("speedlifyJSON", function (collection) {
      const returnObject = {
        core: [],
        tags: [],
        docs: [],
        blogs: [],
      };
      collection.forEach((item) => {
        if (item.outputPath && item.outputPath.endsWith(".html")) {
          const url = `https://freshjuice.dev${item.url}`;
          if (item.url.startsWith("/tags/")) {
            returnObject.tags.push(url);
          } else if (item.data.tags && item.data.tags.includes("docs")) {
            returnObject.docs.push(url);
          } else if (item.data.tags && item.data.tags.includes("posts")) {
            returnObject.blogs.push(url);
          } else {
            returnObject.core.push(url);
          }
        }
      });
      returnObject.core.sort();
      returnObject.docs.sort();
      returnObject.blogs.sort();
      return JSON.stringify(returnObject);
    });
  },
};
