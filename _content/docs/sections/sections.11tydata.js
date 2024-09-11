import slugify from "slugify";

export default {
  permalink: function({page}) {
    return `/docs/sections/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
