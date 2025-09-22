import slugify from "slugify";

export default {
  tags: ["authors"],
  layout: "author",
  permalink: function ({ page }) {
    return `/authors/${slugify(page.fileSlug, { lower: true })}/`;
  },
};
