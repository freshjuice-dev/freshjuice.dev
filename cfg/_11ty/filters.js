/**
 * Add Eleventy filters here
 * https://www.11ty.dev/docs/filters/
 */
import {DateTime} from "luxon";
import { image as gravatarImage } from "gravatar-gen";
import slugify from "slugify";

export default {

  titleSinPeriod: (value) => {
    return value.replace(/\.$/, "");
  },

  // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
  readableDate: (dateObj, format, zone) => {
    return DateTime.fromJSDate(dateObj, {zone: zone || "utc"}).toFormat(
      format || "dd LLLL yyyy"
    );
  },

  // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  htmlDateString: (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: "utc"}).toFormat(
      "yyyy-LL-dd"
    );
  },

  // Get the first `n` elements of a collection.
  head: (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  },

  // Return the smallest number argument
  min: (...numbers) => {
    return Math.min.apply(null, numbers);
  },

  includes: (haystack, needle) => {
    if (typeof haystack === 'undefined' || typeof needle === 'undefined')
      return false;
    return haystack.includes(needle);
  },

  // Return all the tags used in a collection
  getAllTags: (collection) => {
    let tagSet = new Set();
    for (let item of collection) {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    }
    // to lowercase
    tagSet = new Set([...tagSet].map((tag) => tag.toLowerCase()));
    // remove duplicates
    tagSet = new Set([...tagSet]);

    return Array.from(tagSet);
  },

  filterTagList: (tags) => {
    // all the tags to lowercase
    //tags = tags.map((tag) => tag.toLowerCase());
    // remove duplicates
    tags = [...new Set(tags)];

    return (tags || []).filter(
      (tag) =>
        ["all", "nav", "tools", "post", "posts", "doc", "docs", "featured"].indexOf(
          tag
        ) === -1
    );
  },

  sortCollection: (collection, key, order = "ASC") => {
    // console.log(collection);
    // console.log(key)
    return collection.sort((a, b) => {
      a = a[key];
      b = b[key];
      if (a < b) return order === "ASC" ? -1 : 1;
      if (a > b) return order === "ASC" ? 1 : -1;
      return 0;
    });
  },

  getPostYears: (collection) => {
    let years = new Set();
    for (let item of collection) {
      years.add(item.date.getFullYear());
    }
    return Array.from(years);
  },

  getPostsByAuthor: (collection, author) => {
    if (typeof author === 'undefined') {
      return [];
    }
    return collection.filter((item) => item.data.author === author);
  },

  getAuthorData: async function (author) {
    try {
      const authorsCollection = this.ctx?.collections?.authors;
      const authorData =  authorsCollection.find((item) => {
        return item.fileSlug === author;
      }).data;
      return {
        name: authorData.title || authorData.name || author,
        email: authorData.email || "",
        role: authorData.role || "",
        url: `/authors/${slugify(author, { lower: true })}/`,
        signature: authorData.signature || "",
        links: authorData.links || {},
        image: await gravatarImage(authorData.email || "", {size: 150}),
        content: authorData.bio || authorData.page.rawInput.trim() || "",
      };
    } catch (error) {
      return {};
    }
  },

  sortAuthors: (collection) => {
    return collection.sort((a, b) => {
      const aSlug = a.data.page.fileSlug;
      const bSlug = b.data.page.fileSlug;
      if (aSlug === "reatlat") return -1;
      if (bSlug === "reatlat") return 1;
      if (aSlug === "zapalblizh") return -1;
      if (bSlug === "zapalblizh") return 1;
      return 0;
    });
  },

  getGravatarImage: async function (email, size) {
    return await gravatarImage(email || "", {size: size || 150});
  },

  postsByYear: (collection, year) => {
    return collection.filter((item) => item.date.getFullYear() === year);
  },

  split: (str, separator) => {
    return str.split(separator);
  },

  consoleLog: (dataObject) => {
    console.log(dataObject);
    return dataObject;
  }

};
