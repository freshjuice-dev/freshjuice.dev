/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags, allowHttpUrl } from "../modules/_sanitize";
import {
  isAIPlatformUrl,
  AI_PLATFORM_ERROR_MESSAGE,
} from "../modules/_blockedDomains";
import { getFriendlyErrorMessage } from "../modules/_errorMessages";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    urls: "",
    result: [],
    errorMessage: "",
    buttonLabel: "Check Links",
    openIndex: [],
    state: "idle", // idle, loading, success, error
    toggleOpen(key) {
      this.openIndex = this.openIndex.includes(key)
        ? this.openIndex.filter((i) => i !== key)
        : [...this.openIndex, key];
    },
    checkUrl(url) {
      url = stripTags(url);
      return allowHttpUrl(url);
    },

    setRefUTMs(link) {
      const url = new URL(link);
      const params = url.searchParams;

      params.set("utm_source", "freshjuice.dev");
      params.set("utm_medium", "tool");
      params.set("utm_campaign", "broken-link-checker");

      url.search = params.toString();

      return url.toString();
    },

    async checkLinks(event) {
      event.preventDefault();

      this.result = [];
      this.errorMessage = "";

      const blockedUrls = [];
      const checkList = this.urls.split("\n").reduce((list, link) => {
        const cleanedLink = this.checkUrl(link);
        if (cleanedLink && cleanedLink.trim() !== "") {
          // Check for blocked AI platform URLs
          if (isAIPlatformUrl(cleanedLink)) {
            blockedUrls.push(cleanedLink);
          } else {
            list.push(cleanedLink);
          }
        }
        return list;
      }, []);

      // Show error if any AI platform URLs were blocked
      if (blockedUrls.length > 0) {
        this.errorMessage = AI_PLATFORM_ERROR_MESSAGE;
        if (checkList.length === 0) {
          return;
        }
      }

      if (checkList.length === 0) {
        this.errorMessage = "Please enter at least one URL.";
        return;
      }

      debugLog("Checking links");

      this.result = checkList.map((link) => ({
        url: link,
        status: "loading",
        data: {},
        totalBroken: 0,
      }));

      this.state = "loading";
      let i = 0;

      for (let link of checkList) {
        try {
          const response = await fetch(
            "https://api.freshjuice.dev/broken-link-checker",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                targetUrl: link,
              }),
            },
          );

          debugLog(`Checked ${link} - Status: ${response.status}`);

          if (response.status !== 200) {
            this.result[i] = {
              url: link,
              status: "error",
              errorMessage: getFriendlyErrorMessage(response.status),
              data: {},
              totalBroken: 0,
            };
          } else {
            const data = await response.json();
            this.result[i] = {
              url: link,
              status: "success",
              data: data,
              totalBroken: 0,
            };
          }
        } catch (error) {
          this.state = "error";
          this.errorMessage = getFriendlyErrorMessage(null, error?.message);
          this.result[i] = {
            url: link,
            status: "error",
            errorMessage: getFriendlyErrorMessage(null, error?.message),
            data: {},
            totalBroken: -1,
          };
        }

        if (this.result[i].status === "success") {
          this.result[i].totalBroken = Object.keys(this.result[i].data).reduce(
            (count, code) => {
              if (
                (400 <= parseInt(code) && parseInt(code) < 500) ||
                parseInt(code) === 999
              ) {
                return count + this.result[i].data[code].length;
              }

              return count;
            },
            0,
          );
        }

        i++;
      }

      this.state = "success";

      setTimeout(() => {
        this.state = "idle";
      }, 2000);
    },
    init() {
      debugLog("Broken Link Checker initialized");
    },
  }));
});
