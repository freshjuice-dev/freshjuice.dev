import slugify from "slugify";

export default {
  permalink: function({page}) {
    return `/docs/templates/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
