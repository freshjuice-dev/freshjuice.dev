import slugify from "slugify";

export default {
  tags: ["tools"],
  layout: "page",
  permalink: function({page}) {
    return `/tools/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
