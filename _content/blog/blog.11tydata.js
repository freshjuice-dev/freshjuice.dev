import slugify from "slugify";

export default {
  suffix: " | FreshJuice Blog",
  tags: ["posts"],
  layout: "post",
  permalink: function({page}) {
    return `/blog/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
