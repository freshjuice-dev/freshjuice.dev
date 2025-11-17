/**
 * Add Eleventy filters here
 * https://www.11ty.dev/docs/filters/
 */
import { DateTime } from "luxon";
import { image as gravatarImage } from "gravatar-gen";
import slugify from "slugify";
import markdownIt from "markdown-it";

export default {
  titleSinPeriod: (value) => {
    return value.replace(/\.$/, "");
  },

  // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
  readableDate: (dateObj, format, zone) => {
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
      format || "dd LLLL yyyy",
    );
  },

  // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  htmlDateString: (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat(
      "yyyy-LL-dd'T'HH:mm:ssZZ",
    );
  },

  // clean Title
  cleanTitle: (title) => {
    return title.replace(
      /[\p{Extended_Pictographic}\uFE0F\u200D\u{E0020}-\u{E007F}\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}]/gu,
      "",
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
    if (typeof haystack === "undefined" || typeof needle === "undefined")
      return false;
    return haystack.includes(needle);
  },

  filterTagList: (tags) => {
    // all the tags to lowercase
    //tags = tags.map((tag) => tag.toLowerCase());
    // remove duplicates
    tags = [...new Set(tags)];

    tags = (tags || []).filter(
      (tag) =>
        [
          "all",
          "nav",
          "authors",
          "tools",
          "post",
          "posts",
          "doc",
          "docs",
          "featured",
        ].indexOf(tag) === -1,
    );

    tags = [...new Set(tags.map((item) => item.toLowerCase()))].map((item) => {
      return tags.find((originalItem) => originalItem.toLowerCase() === item);
    });

    return tags;
  },

  sortCollection: (collection, key, order = "ASC") => {
    // ASC or DESC
    return collection.sort((a, b) => {
      let aVal = a.data?.[key] || a[key] || "";
      let bVal = b.data?.[key] || b[key] || "";

      // Convert to lowercase for case-insensitive comparison if values are strings
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return order === "ASC" ? -1 : 1;
      if (aVal > bVal) return order === "ASC" ? 1 : -1;
      return 0;
    });
  },

  random: (array) => {
    return array[Math.floor(Math.random() * array.length)];
  },

  getFilteredByTag: (collection, tag) => {
    if (typeof collection === "undefined" || typeof tag === "undefined") {
      return [];
    }
    return collection.filter((item) => {
      const itemTags = ((item || {}).data || {}).tags || [];
      return itemTags.includes(tag);
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
    if (typeof author === "undefined") {
      return [];
    }
    return collection.filter((item) => item.data.author === author);
  },

  getAuthorData: async function (author, property = null) {
    try {
      const authorsCollection = this.ctx?.collections?.authors;
      const authorItem = authorsCollection.find((item) => {
        return item.fileSlug === author;
      });
      const authorData = authorItem.data;

      // Determine if author is a guest by checking if their file is in /guests/ directory
      const isGuest = authorItem.page.inputPath.includes("/guests/");

      const returnData = {
        guest: isGuest,
        name: authorData.title || authorData.name || author,
        email: authorData.email || "",
        role: authorData.role || authorData.position || "Guest Contributor",
        company: authorData.company || "FreshJuice",
        companyUrl: authorData.companyUrl || "/about/",
        url: `/authors/${slugify(author, { lower: true })}/`,
        signature: authorData.signature || "",
        links: authorData.links || {},
        image: await gravatarImage(authorData.email || "", {
          forceDefault: true,
          includeExtention: true,
          size: 128,
        }),
        content: authorData.bio || authorData.page.rawInput.trim() || "",
      };
      if (property) {
        return returnData[property];
      }
      return returnData;
    } catch (error) {
      return {};
    }
  },

  sortAuthors: (
    collection,
    postsCollection = null,
    sortByContribution = false,
  ) => {
    const priorityAuthors = [
      "reatlat", // Founder
      "zapalblizh", // Co-founder
    ];

    // Count posts per author if sorting by contribution
    const postCounts = {};
    if (sortByContribution && postsCollection) {
      postsCollection.forEach((post) => {
        const author = post.data.author;
        if (author) {
          postCounts[author] = (postCounts[author] || 0) + 1;
        }
      });
    }

    return collection.sort((a, b) => {
      const aSlug = a.data.page.fileSlug;
      const bSlug = b.data.page.fileSlug;

      // 1. Priority authors first (in specified order)
      const aPriority = priorityAuthors.indexOf(aSlug);
      const bPriority = priorityAuthors.indexOf(bSlug);

      // Both in priority list - sort by position in array
      if (aPriority !== -1 && bPriority !== -1) {
        return aPriority - bPriority;
      }

      // Only one in priority list - prioritized author comes first
      if (aPriority !== -1) return -1;
      if (bPriority !== -1) return 1;

      // 2. Neither in priority list - core authors before guests
      const aIsGuest = a.page.inputPath.includes("/guests/");
      const bIsGuest = b.page.inputPath.includes("/guests/");

      if (!aIsGuest && bIsGuest) return -1; // Core author before guest
      if (aIsGuest && !bIsGuest) return 1; // Guest after core author

      // 3. Within same group (core or guest), sort by contribution if enabled
      if (sortByContribution && postsCollection) {
        const aCount = postCounts[aSlug] || 0;
        const bCount = postCounts[bSlug] || 0;

        if (aCount !== bCount) {
          return bCount - aCount; // Higher contribution first
        }
      }

      // 4. Maintain stable sort when no other criteria apply
      return 0;
    });
  },

  getGravatarImage: async function (email, size) {
    return await gravatarImage(email || "", {
      forceDefault: true,
      includeExtention: true,
      size: size || 150,
    });
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
  },

  objectToArrayOfValues: (object) => {
    return Object.values(object);
  },

  getDocsMenu: (docsCollection, { url }) => {
    const docsMenu = [
      {
        title: "Getting Started",
        children: [
          { title: "Overview", url: "/developer-edition/docs/" },
          {
            title: "Installation",
            url: "/developer-edition/docs/installation/",
          },
          {
            title: "Customization",
            url: "/developer-edition/docs/customization/",
          },
          {
            title: "Using Tailwind CSS",
            url: "/developer-edition/docs/tailwindcss/",
          },
          {
            title: "Using Alpine.js",
            url: "/developer-edition/docs/alpinejs/",
          },
        ],
      },
      {
        title: "Modules",
        children: [],
      },
      {
        title: "Global Modules",
        children: [],
      },
      {
        title: "Sections",
        children: [],
      },
      {
        title: "Templates",
        children: [],
      },
    ];
    docsCollection.forEach((item) => {
      let title = item.data.title || "";
      if (title.startsWith("Module: ")) {
        title = title.slice(8);
      }
      if (title.startsWith("Global Module: ")) {
        title = title.slice(15);
      }
      if (title.endsWith(" Section")) {
        title = title.slice(0, -8);
      }
      if (title.endsWith(" Template")) {
        title = title.slice(0, -9);
      }
      if (item.data.tags.includes("modules")) {
        docsMenu[1].children.push({
          title: item.data.heading || title,
          url: item.url,
        });
      }
      if (item.data.tags.includes("global-modules")) {
        docsMenu[2].children.push({
          title: item.data.heading || title,
          url: item.url,
        });
      }
      if (item.data.tags.includes("sections")) {
        docsMenu[3].children.push({
          title: item.data.heading || title,
          url: item.url,
        });
      }
      if (item.data.tags.includes("templates")) {
        docsMenu[4].children.push({
          title: item.data.heading || title,
          url: item.url,
        });
      }
    });
    docsMenu.forEach((item) => {
      item.children.forEach((child) => {
        if (child.url === url) {
          item.active = true;
          child.active = true;
        }
      });
    });
    return docsMenu;
  },

  getActiveDocsPage: (docsMenu) => {
    let activePage = {};
    docsMenu.forEach((section) => {
      section.children.forEach((page) => {
        if (page.active) {
          activePage = {
            sectionName: section.title,
            pageName: page.title,
            pageUrl: page.url,
          };
        }
      });
    });
    return activePage;
  },

  setActiveDocsPage: (docsMenu, { url }) => {
    return docsMenu.map((section) => ({
      ...section,
      children: section.children.map((child) => ({
        ...child,
        sectionName: section.title,
        active: child.url === url,
      })),
    }));
  },

  getBreadcrumbsList: ({ url }, title) => {
    const returnArray = [
      {
        name: "Home",
        url: "/",
      },
    ];
    if (/^\/authors\/.+/.test(url)) {
      returnArray.push({
        name: "Authors",
        url: "/authors/",
      });
    }
    if (/^\/tags\/.+/.test(url)) {
      returnArray.push({
        name: "Tags",
        url: "/tags/",
      });
    }
    if (/^\/blog\/.+/.test(url)) {
      returnArray.push({
        name: "Juicy Blog",
        url: "/blog/",
      });
    }
    if (/^\/docs\/.+/.test(url)) {
      returnArray.push({
        name: "Documentation",
        url: "/docs/",
      });
    }
    if (/^\/developer-edition\/docs\/.+/.test(url)) {
      returnArray.push({
        name: "Developer Edition Documentation",
        url: "/developer-edition/docs/",
      });
    }
    if (/^\/tools\/.+/.test(url)) {
      returnArray.push({
        name: "Tools",
        url: "/tools/",
      });
    }
    returnArray.push({
      name: title || "Page",
      url: url,
    });
    return returnArray;
  },

  isSchemaMarkup: (page) => {
    const DISALLOWED_URLS = ["/404.html"];

    return !(
      typeof page.url !== "string" || DISALLOWED_URLS.includes(page.url)
    );
  },

  getTwitterName: (twitterUrl = "") => {
    return twitterUrl
      .replace("https://x.com/", "")
      .replace("https://twitter.com/", "")
      .replace(/\/$/, "");
  },

  jsonify: (object) => {
    return JSON.stringify(object);
  },

  markdownIt: (content) => {
    return markdownIt({
      html: true,
    }).render(content);
  },

  excludeFromCollectionsByTag: (collection, tags = []) => {
    return collection.filter((item) => {
      return !tags.some((tag) => (item.data.tags || []).includes(tag));
    });
  },

  // Normalize text for plain text files (llms.txt, etc.)
  // Converts smart quotes, dashes, and special characters to plain ASCII
  plainText: (text) => {
    if (!text) return "";
    return String(text)
      .replace(
        /[\p{Extended_Pictographic}\uFE0F\u200D\u{E0020}-\u{E007F}\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}]/gu,
        "",
      ) // Remove emojis
      .replace(/\u00A0/g, " ") // NBSP → regular space
      .replace(/\u202F/g, " ") // Narrow no-break space → regular space
      .replace(/&amp;/g, "&") // 1) Decode & first
      .replace(/&#39;/g, "'") // 2) Now this will catch &#39;
      .replace(/&quot;/g, '"') // 3) Other HTML entities
      .replace(/[\u2018\u2019]/g, "'") // Unicode single quotes
      .replace(/[\u201C\u201D]/g, '"') // Unicode double quotes
      .replace(/[—–]/g, "-") // Em dash and en dash
      .replace(/…/g, "...") // Ellipsis
      .replace(/[«»]/g, '"') // Angle quotes
      .replace(/[\u2013\u2014]/g, "-") // Extra Unicode dashes
      .replace(/\u2026/g, "...") // Unicode ellipsis
      .trim();
  },
};
