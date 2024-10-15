import slugify from "slugify";

export default {
  tags: ["templates"],
  permalink: function({page}) {
    return `/docs/templates/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
