import slugify from "slugify";

export default {
  tags: ["global-modules"],
  permalink: function ({ page }) {
    return `/developer-edition/docs/modules/${slugify(page.fileSlug, { lower: true })}/`;
  },
};
