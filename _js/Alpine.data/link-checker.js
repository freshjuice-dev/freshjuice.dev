/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags, allowHttpUrl } from "../modules/_sanitize";

// Link Checker – scans pages and categorizes found links
// API: https://api.freshjuice.dev/link-checker
// Expected response example:
// {
//   "internal_links": ["https://example.com/about"],
//   "external_links": ["https://other.com/"],
//   "nofollow_links": ["mailto:hello@example.com", "https://ads.example/ad"],
//   "non_http_links": {
//     "mailto": ["mailto:hello@example.com"],
//     "tel": ["tel:+1234567"],
//     "javascript": ["javascript:void(0)"],
//     "data": ["data:image/png;base64,..."],
//     "ftp": ["ftp://ftp.example.com/file"]
//   }
// }

document.addEventListener("alpine:init", () => {
  Alpine.data("LinkChecker", () => ({
    urls: "",
    result: [], // array of per-URL results
    errorMessage: "",
    openIndex: -2,
    state: "idle", // idle, loading, success, error

    checkUrl(url) {
      url = stripTags(url);
      return allowHttpUrl(url);
    },

    setRefUTMs(link) {
      try {
        const url = new URL(link);
        const params = url.searchParams;
        params.set("utm_source", "freshjuice.dev");
        params.set("utm_medium", "tool");
        params.set("utm_campaign", "link-checker");
        url.search = params.toString();
        return url.toString();
      } catch (e) {
        return link; // if it's a non-URL like mailto:, tel:, etc.
      }
    },

    normalizeResult(data) {
      // Some backends might have typos; normalize keys robustly.
      const internal = data.internal_links || data.inetrnal_links || [];
      const external = data.external_links || data.extrnal_links || [];
      const nofollow = data.nofollow_links || [];
      const nonHttp = data.non_http_links || {};

      // Ensure arrays and object shapes
      const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
      const safeObj = (v) => (v && typeof v === "object" ? v : {});

      return {
        internal_links: toArray(internal),
        external_links: toArray(external),
        nofollow_links: toArray(nofollow),
        non_http_links: safeObj(nonHttp),
      };
    },

    async checkLinks(event) {
      event.preventDefault();

      this.result = [];
      this.errorMessage = "";

      const seen = new Set();
      const checkList = this.urls.split("\n").reduce((list, raw) => {
        const cleanedLink = this.checkUrl(raw);
        if (
          cleanedLink &&
          cleanedLink.trim() !== "" &&
          !seen.has(cleanedLink)
        ) {
          seen.add(cleanedLink);
          list.push(cleanedLink);
        }
        return list;
      }, []);

      if (checkList.length === 0) {
        this.errorMessage = "Please enter at least one URL.";
        return;
      }

      debugLog("Link Checker: start");

      this.result = checkList.map((link) => ({
        url: link,
        status: "loading",
        data: {
          internal_links: [],
          external_links: [],
          nofollow_links: [],
          non_http_links: {},
        },
      }));

      this.state = "loading";

      let i = 0;
      for (let link of checkList) {
        try {
          const response = await fetch(
            "https://api.freshjuice.dev/link-checker",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ targetUrl: link }),
            },
          );

          debugLog(`Link Checker: ${link} → ${response.status}`);

          if (response.status !== 200) {
            this.result[i] = {
              url: link,
              status: "error",
              data: {
                internal_links: [],
                external_links: [],
                nofollow_links: [],
                non_http_links: {},
              },
            };
          } else {
            const data = await response.json();
            this.result[i] = {
              url: link,
              status: "success",
              data: this.normalizeResult(data || {}),
            };
          }
        } catch (err) {
          this.result[i] = {
            url: link,
            status: "error",
            data: {
              internal_links: [],
              external_links: [],
              nofollow_links: [],
              non_http_links: {},
            },
          };
        }
        i++;
      }

      this.state = "success";

      // Do not auto-reset to idle to avoid clearing visible results
    },

    reset() {
      this.urls = "";
      this.result = [];
      this.errorMessage = "";
      this.openIndex = -2;
      this.state = "idle";
    },

    get showResults() {
      return Array.isArray(this.result) && this.result.length > 0;
    },

    init() {
      debugLog("Link Checker initialized");
    },
  }));
});
