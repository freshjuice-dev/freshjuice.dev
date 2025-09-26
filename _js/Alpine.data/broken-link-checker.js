/* global Alpine */
import debugLog from "../modules/_debugLog";
import { stripTags, allowHttpUrl } from "../modules/_sanitize";

document.addEventListener("alpine:init", () => {
  Alpine.data("BrokenLinkChecker", () => ({
    urls: "",
    result: [],
    isChecking: false,
    buttonLabel: "Check Links",
    openIndex: -2,
    state: "idle", // idle, checking, success, error
    isValidUrl(url) {
      let strippedUrl = stripTags(url);
      return allowHttpUrl(strippedUrl);
    },

    async checkLinks(event) {
      debugLog("Checking links");
      event.preventDefault();

      if (!this.urls.trim()) {
        alert("Please enter at least one URL.");
        return;
      }

      this.result = [];

      const checkList = this.urls
        .split("\n")
        .filter((link) => link.trim() !== "");

      checkList.forEach((link) => {
        if (!this.isValidUrl(link)) {
          throw new Error("Invalid URL format");
        } else {
          this.result.push({ url: link, status: "loading", data: {} });
        }
      });

      this.state = "loading";
      let i = 0;
      let link = "";
      try {
        for (link of checkList) {
          const response = await fetch(
            "https://api.freshjuice.dev/broken-link-checker",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ targetUrl: link }),
            },
          );

          const responseData = await response.json();

          this.result[i] = { url: link, status: "success", data: responseData };
          this.state = "success";
          i++;
        }
      } catch (error) {
        this.result[i] = { url: link, status: "error", data: {} };
        this.state = "error";
      }
    },
    init() {
      debugLog("Broken Link Checker initialized");
    },
  }));
});
