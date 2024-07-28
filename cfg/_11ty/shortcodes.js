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

  authorSignature: (eleventyConfig) => {
    eleventyConfig.addShortcode("authorSignature", function authorSignatureShortcode(author) {
      try {
        const authorsCollection = this.ctx?.collections?.authors;
        const authorData = authorsCollection.find((item) => {
          return item.fileSlug === author;
        }).data;
        return authorData.signature || "";
      } catch (error) {
        return "";
      }
    })
  },

  ogImageSource: (eleventyConfig) => {
    eleventyConfig.addShortcode("ogImageSource", function ogImageSourceShortcode({url}) {
      url = url ? slugify(url.replace(/\//g, " "), slugifyOptions).trim() : 'default';
      return `/img/og/${url||"default"}.png`;
    });
  },

  collectionsToJSON: (eleventyConfig) => {
    eleventyConfig.addShortcode("collectionsToJSON", function collectionJsonShortcode(blogs, docs, authors, pages) {
      let returnJson = {
        docs: [],
        blogs: [],
        authors: [],
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

      authors.forEach((author) => {
        returnJson.authors.push({
          title: author.data.title,
          collection: "authors",
          role: author.data.role,
          email: author.data.email,
          slug: slugify(author.url.replace(/\//g, " "), slugifyOptions)
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
