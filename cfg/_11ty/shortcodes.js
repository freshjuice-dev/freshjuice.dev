/**
 * Add Eleventy shortcodes here
 * https://www.11ty.dev/docs/shortcodes/
 */
import slugify from "slugify";

const slugifyOptions = {
  lower: true,       // convert to lower case
};

export default {

  year: (eleventyConfig) => {
    eleventyConfig.addShortcode("year", function yearShortcode() {
      return new Date().getFullYear();
    });
  },

  ogImageSource: (eleventyConfig) => {
    eleventyConfig.addShortcode("ogImageSource", function ogImageSourceShortcode({url, inputPath}) {
      url = slugify(url.replace(/\//g, " "), slugifyOptions).trim()
      console.log(url, inputPath)
      return `/img/og/${url||"default"}.png`;
    });
  },

  collectionsToJSON: (eleventyConfig) => {
    eleventyConfig.addShortcode("collectionsToJSON", function collectionJsonShortcode(blogs, docs, pages) {
      let returnJson = {
        docs: [],
        blogs: [],
        pages: [],
      };

      blogs.forEach((blog) => {
        returnJson.blogs.push({
          title: blog.data.title,
          collection: "blogs",
          slug: slugify(blog.url.replace(/\//g, " "), slugifyOptions)
        });
      });

      docs.forEach((doc) => {
        returnJson.docs.push({
          title: doc.data.title,
          collection: "docs",
          slug: slugify(doc.url.replace(/\//g, " "), slugifyOptions)
        });
      });

      pages.forEach((page) => {
        returnJson.pages.push({
          title: page.title,
          collection: "pages",
          slug: slugify(page.permalink.replace(/\//g, " "), slugifyOptions),
        });
      });

      return JSON.stringify(returnJson);
    });
  },
};
