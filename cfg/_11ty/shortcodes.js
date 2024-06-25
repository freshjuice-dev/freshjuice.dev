/**
 * Add Eleventy shortcodes here
 * https://www.11ty.dev/docs/shortcodes/
 */
export default {

  year: (eleventyConfig) => {
    eleventyConfig.addShortcode("year", function yearShortcode() {
      return new Date().getFullYear();
    });
  }

};
