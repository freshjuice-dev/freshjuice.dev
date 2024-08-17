import slugify from "slugify";

export default {
  tags: ["docs"],
  layout: "docs",
  permalink: function({page}) {
    return `/docs/modules/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
