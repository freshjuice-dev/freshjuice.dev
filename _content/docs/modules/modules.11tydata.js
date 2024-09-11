import slugify from "slugify";

export default {
  permalink: function({page}) {
    return `/docs/modules/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
