import slugify from "slugify";

export default {
  tags: ["sections"],
  permalink: function ({ page }) {
    return `/developer-edition/docs/sections/${slugify(page.fileSlug, { lower: true })}/`;
  },
};
