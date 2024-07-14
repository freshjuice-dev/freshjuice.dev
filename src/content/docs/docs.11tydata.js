import slugify from "slugify";

export default {
  tags: ["docs"],
  layout: "docs.njk",
  permalink: function({page}) {
    return `/docs/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
