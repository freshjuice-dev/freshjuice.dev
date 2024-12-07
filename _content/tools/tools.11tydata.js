import slugify from "slugify";

export default {
  layout: "page",
  tags: ["tools"],
  permalink: function({page}) {
    return `/tools/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
