import slugify from "slugify";

export default {
  suffix: " | FreshJuice Docs",
  tags: ["docs"],
  layout: "docs",
  permalink: function ({ page }) {
    return `/docs/${slugify(page.fileSlug, { lower: true })}/`;
  },
};
