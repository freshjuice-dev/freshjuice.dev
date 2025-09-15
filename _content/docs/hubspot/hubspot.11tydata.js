import slugify from "slugify";

export default {
  permalink: function ({ page }) {
    return `/docs/hubspot/${slugify(page.fileSlug, { lower: true })}/`;
  },
};
