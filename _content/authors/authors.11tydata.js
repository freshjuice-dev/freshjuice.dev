import slugify from "slugify";

export default {
  tags: ["authors"],
  layout: "author",
  suffix: " at FreshJuice.Dev",
  permalink: function({page}) {
    return `/authors/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
