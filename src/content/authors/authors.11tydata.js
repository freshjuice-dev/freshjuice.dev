import slugify from "slugify";

export default {
  tags: ["authors"],
  layout: "authors.njk",
  suffix: " at FreshJuice.Dev",
  permalink: function({page}) {
    return `/authors/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
