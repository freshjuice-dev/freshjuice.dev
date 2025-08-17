import slugify from "slugify";

export default {
  tags: ["templates"],
  permalink: function ({ page }) {
    return `/developer-edition/docs/templates/${slugify(page.fileSlug, { lower: true })}/`;
  },
};
