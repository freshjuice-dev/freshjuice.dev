import slugify from "slugify";

export default {
  layout: "base",
  suffix: " | FreshJuice Tools",
  icon: "code",
  tags: ["tools"],
  permalink: function({page}) {
    return `/tools/${ slugify(page.fileSlug, { lower: true }) }/`
  }
};
