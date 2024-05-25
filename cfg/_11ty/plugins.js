/**
 * Add Eleventy plugins here
 * https://www.11ty.dev/docs/plugins/
 */

const plugin = require("eleventy-plugin-speculation-rules");
module.exports = {
  // Drafts support
  DraftsSupport: (eleventyConfig) => {
    const plugin = require("./drafts.js");
    eleventyConfig.addPlugin(plugin);
  },

  // Official plugins
  RSS: (eleventyConfig) => {
    const plugin = require("@11ty/eleventy-plugin-rss");
    eleventyConfig.addPlugin(plugin);
  },

  SyntaxHighlight: (eleventyConfig) => {
    const plugin = require("@11ty/eleventy-plugin-syntaxhighlight");
    eleventyConfig.addPlugin(plugin, {preAttributes: {tabindex: 0}});
  },

  EleventyHtmlBase: (eleventyConfig) => {
    const {EleventyHtmlBasePlugin} = require("@11ty/eleventy");
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  },

  PhosphorIcons: (eleventyConfig) => {
    const plugin = require('eleventy-plugin-phosphoricons');
    eleventyConfig.addPlugin(plugin, {
      class: "phicon",
      size: 32,
      fill: "currentColor"
    });
  },

  SpeculationRules: (eleventyConfig) => {
    const plugin = require('eleventy-plugin-speculation-rules');
    eleventyConfig.addPlugin(plugin);
  },

  // Easily grab an svg image and render the raw svg contents with the ability to add classes
  // Ex: {{ '/src/assets/images/logo.svg' | svgContents("h-8 w-8 text-red-500") | safe }}
  svgContents: function (eleventyConfig) {
    const plugin = require("eleventy-plugin-svg-contents");
    eleventyConfig.addPlugin(plugin);
  }
};
