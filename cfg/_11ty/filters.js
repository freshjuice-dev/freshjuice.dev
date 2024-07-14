/**
 * Add Eleventy filters here
 * https://www.11ty.dev/docs/filters/
 */
import {DateTime} from "luxon";

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

  getPostYears: (collection) => {
    let years = new Set();
    for (let item of collection) {
      years.add(item.date.getFullYear());
    }
    return Array.from(years);
  },

  postsByYear: (collection, year) => {
    return collection.filter((item) => item.date.getFullYear() === year);
  },

  consoleLog: (dataObject) => {
    console.log(dataObject);
    return dataObject;
  }

};
