/**
 * Add Eleventy passthrough copy here
 * Copy the contents of the `public` folder to the output folder
 * For example, `./public/css/` ends up in `_site/css/`
 * https://www.11ty.dev/docs/languages/markdown/#optional-amend-the-library-instance
 */

export default {

  static: (eleventyConfig) => {
    eleventyConfig.addPassthroughCopy({
      "_static/": "/"
    });
  }

}
