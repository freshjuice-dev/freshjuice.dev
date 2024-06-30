import slugify from "slugify";

export default {
  tags: ["posts"],
  layout: "post.njk",
  permalink: function({page}) {
    return `/blog/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
