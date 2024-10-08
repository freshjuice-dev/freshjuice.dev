import slugify from "slugify";

export default {
  tags: ["posts"],
  layout: "post",
  permalink: function({page}) {
    return `/blog/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
