import slugify from "slugify";

export default {
  suffix: " | FreshJuice DEV Docs",
  tags: ["dev-docs"],
  layout: "dev-docs",
  permalink: function ({ page }) {
    return `/developer-edition/docs/${slugify(page.fileSlug, { lower: true })}/`;
  },
};
