import slugify from "slugify";

export default {
  tags: ["sections"],
  permalink: function({page}) {
    return `/docs/sections/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
