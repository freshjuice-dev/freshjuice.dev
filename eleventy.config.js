import dataExtensions from "./_11ty/dataExtensions.js";
import plugins from "./_11ty/plugins.js";
import shortcodes from "./_11ty/shortcodes.js";
import filters from "./_11ty/filters.js";
import passthrough from "./_11ty/passthrough.js";
import watchTargets from "./_11ty/watchTargets.js";
import amendLibraries from "./_11ty/amendLibraries.js";
import transforms from "./_11ty/transforms.js";

export default async function(eleventyConfig) {

  Object.keys(plugins).forEach((pluginName) => {
    plugins[pluginName](eleventyConfig);
  });

  Object.keys(dataExtensions).forEach((dataExtensionName) => {
    dataExtensions[dataExtensionName](eleventyConfig);
  });

  Object.keys(shortcodes).forEach((shortcodeName) => {
    shortcodes[shortcodeName](eleventyConfig);
  });

  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addFilter(filterName, filters[filterName]);
  });

  Object.keys(passthrough).forEach((passthroughName) => {
    passthrough[passthroughName](eleventyConfig);
  });

  Object.keys(watchTargets).forEach((watchTargetName) => {
    eleventyConfig.addWatchTarget(watchTargets[watchTargetName]);
  });

  Object.keys(amendLibraries).forEach((amendLibraryName) => {
    amendLibraries[amendLibraryName](eleventyConfig);
  });

  Object.keys(transforms).forEach((transformName) => {
    eleventyConfig.addTransform(transformName, transforms[transformName]);
  });

  // Add Layouts
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("docs", "docs.njk");
  eleventyConfig.addLayoutAlias("author", "author.njk");
  eleventyConfig.addLayoutAlias("page", "page.njk");
  eleventyConfig.addLayoutAlias("post", "post.njk");
  eleventyConfig.addLayoutAlias("prose", "prose.njk");

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: ["md", "njk"],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: ".", // default: "."
			output: "_site", // default: "_site"
			includes: "_includes", // default: "_includes"
			layouts: "_layouts", // default: "_layouts"
			data: "_data", // default: "_data"
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
