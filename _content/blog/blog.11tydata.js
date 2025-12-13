import slugify from "slugify";

export default {
  suffix: " | FreshJuice Blog",
  tags: ["posts"],
  layout: "post",
  partialScripts: ["alpine-data/share-button"],
  permalink: function ({ page }) {
    return `/blog/${slugify(page.fileSlug, { lower: true })}/`;
  },
};
