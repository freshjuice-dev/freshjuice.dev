import slugify from "slugify";

export default {
  tags: ["modules"],
  permalink: function({page}) {
    return `/docs/modules/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
